import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for canvas/image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Serve static assets from public directory (robots.txt, sitemap.xml, verification files)
app.use(express.static(path.join(process.cwd(), "public")));

// Explicit route for Google Search Console site verification
app.get("/googlee814d7c05b3fbac6.html", (req, res) => {
  res.type("text/html").send("google-site-verification: googlee814d7c05b3fbac6.html");
});
app.get("/google58edfc436fcfc958.html", (req, res) => {
  res.type("text/html").send("google-site-verification: google58edfc436fcfc958.html");
});
// Generic handler for any Google site verification HTML file
app.get(/^\/google([a-zA-Z0-9_-]+)\.html$/, (req, res) => {
  const filename = req.path.replace(/^\//, "");
  res.type("text/html").send(`google-site-verification: ${filename}`);
});

// Helper to get Gemini Client lazily to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("A chave GEMINI_API_KEY não foi configurada. Por favor, adicione-a em Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Dedicated Real Visits Counter Database (Mixpanel removed, owner visits excluded)
interface VisitLog {
  timestamp: number;
  dateStr: string;
  ipHash: string;
  sessionId: string;
  isOwner?: boolean;
}

interface VisitsStore {
  totalVisits: number;
  excludedOwnerVisits: number;
  ownerIps: string[];
  visits: VisitLog[];
}

const VISITS_FILE = path.join(process.cwd(), "visits_db.json");
let visitsStore: VisitsStore = {
  totalVisits: 0,
  excludedOwnerVisits: 0,
  ownerIps: [],
  visits: []
};

// Simple active sessions cache in memory to prevent duplicate counts within 30 minutes
const activeSessions = new Map<string, number>();

// Helper to hash IP for privacy
function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + "_grapho_visit_salt").digest("hex").slice(0, 16);
}

// Load historical real visits from disk
try {
  if (fs.existsSync(VISITS_FILE)) {
    const raw = fs.readFileSync(VISITS_FILE, "utf-8");
    visitsStore = JSON.parse(raw);
    console.log(`[Visits Server] Loaded visits DB: ${visitsStore.totalVisits} real visits, ${visitsStore.excludedOwnerVisits} excluded owner visits.`);
  } else {
    // Check if there was any historical visit count
    fs.writeFileSync(VISITS_FILE, JSON.stringify(visitsStore, null, 2));
  }
} catch (e) {
  console.error("[Visits Server] Error loading visits database:", e);
}

async function saveVisitsToDisk() {
  try {
    await fs.promises.writeFile(VISITS_FILE, JSON.stringify(visitsStore, null, 2));
  } catch (e) {
    console.error("[Visits Server] Error saving visits to disk:", e);
  }
}

function getVisitsStats() {
  const todayStr = new Date().toISOString().split("T")[0];
  const todayVisits = visitsStore.visits.filter(v => v.dateStr === todayStr && !v.isOwner).length;
  const uniqueIps = new Set(visitsStore.visits.filter(v => !v.isOwner).map(v => v.ipHash));
  const uniqueVisitors = uniqueIps.size;
  const lastVisit = visitsStore.visits.filter(v => !v.isOwner).slice(-1)[0];

  // Count active sessions within the last 5 minutes (excluding owner IPs)
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;
  let activeUsersCount = 0;

  for (const [key, ts] of activeSessions.entries()) {
    if (now - ts <= FIVE_MINUTES) {
      const parts = key.split("_");
      const ipHash = parts[parts.length - 1];
      if (!visitsStore.ownerIps.includes(ipHash)) {
        activeUsersCount++;
      }
    } else {
      activeSessions.delete(key);
    }
  }

  // Active users can never exceed today's visits (if todayVisits is 0, active external users is strictly 0)
  const activeUsers = Math.min(activeUsersCount, todayVisits);

  return {
    totalVisits: visitsStore.totalVisits,
    todayVisits,
    uniqueVisitors: Math.max(uniqueVisitors, visitsStore.totalVisits > 0 ? 1 : 0),
    activeUsers,
    excludedOwnerVisits: visitsStore.excludedOwnerVisits || 0,
    lastVisitTime: lastVisit ? lastVisit.timestamp : undefined
  };
}

// 1. Record a real visit (explicitly excluding the owner)
app.post("/api/visits/record", (req, res) => {
  try {
    const { isOwner, sessionId = "anon" } = req.body;
    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const ipHash = hashIp(rawIp);

    // If client explicitly passed a boolean for isOwner, respect it:
    let isKnownOwner = false;
    if (typeof isOwner === "boolean") {
      isKnownOwner = isOwner;
      if (isOwner) {
        if (!visitsStore.ownerIps.includes(ipHash)) {
          visitsStore.ownerIps.push(ipHash);
        }
      } else {
        // Explicitly including visits (testing mode)
        visitsStore.ownerIps = visitsStore.ownerIps.filter(id => id !== ipHash);
      }
    } else {
      isKnownOwner = visitsStore.ownerIps.includes(ipHash);
    }

    if (isKnownOwner) {
      visitsStore.excludedOwnerVisits = (visitsStore.excludedOwnerVisits || 0) + 1;
      saveVisitsToDisk();

      console.log(`[Visits] Owner visit detected from ${ipHash} (Session: ${sessionId}) -> EXCLUDED from counter. Total excluded: ${visitsStore.excludedOwnerVisits}`);

      const stats = getVisitsStats();
      return res.json({
        success: true,
        isOwnerExcluded: true,
        ...stats
      });
    }

    // Regular visitor: deduplicate within 30 minutes
    const now = Date.now();
    const sessionKey = `${sessionId}_${ipHash}`;
    const lastSeen = activeSessions.get(sessionKey);
    const THIRTY_MINUTES = 30 * 60 * 1000;

    let isNewVisit = false;
    if (!lastSeen || now - lastSeen > THIRTY_MINUTES) {
      isNewVisit = true;
      visitsStore.totalVisits = (visitsStore.totalVisits || 0) + 1;

      const todayStr = new Date().toISOString().split("T")[0];
      visitsStore.visits.push({
        timestamp: now,
        dateStr: todayStr,
        ipHash,
        sessionId,
        isOwner: false
      });

      // Keep last 3000 visits
      if (visitsStore.visits.length > 3000) {
        visitsStore.visits.shift();
      }

      saveVisitsToDisk();
      console.log(`[Visits] Real visitor recorded (Total: ${visitsStore.totalVisits}, Today: ${getVisitsStats().todayVisits}, IP: ${ipHash})`);
    }

    activeSessions.set(sessionKey, now);

    const stats = getVisitsStats();
    return res.json({
      success: true,
      isOwnerExcluded: false,
      isNewVisit,
      ...stats
    });
  } catch (err: any) {
    console.error("[Visits Record API Error]", err);
    return res.status(500).json({ error: err.message });
  }
});

// 2. Get real visits stats
app.get("/api/visits", (req, res) => {
  try {
    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const ipHash = hashIp(rawIp);
    const isOwnerQuery = req.query.isOwner === "1" || req.query.isOwner === "true";
    const isKnownOwner = isOwnerQuery || visitsStore.ownerIps.includes(ipHash);
    const sessionId = (req.query.sessionId as string) || "anon";

    if (!isKnownOwner) {
      activeSessions.set(`${sessionId}_${ipHash}`, Date.now());
    }

    const stats = getVisitsStats();
    return res.json({
      ...stats,
      isOwnerExcluded: isKnownOwner
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Toggle owner exclusion for the current client IP
app.post("/api/visits/toggle-owner", (req, res) => {
  try {
    const { exclude } = req.body;
    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const ipHash = hashIp(rawIp);

    if (exclude) {
      if (!visitsStore.ownerIps.includes(ipHash)) {
        visitsStore.ownerIps.push(ipHash);
      }
    } else {
      visitsStore.ownerIps = visitsStore.ownerIps.filter(id => id !== ipHash);
    }
    saveVisitsToDisk();

    const stats = getVisitsStats();
    return res.json({
      success: true,
      isOwnerExcluded: Boolean(exclude),
      ...stats
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Legacy backward-compatibility endpoints (minimal safe stubs)
app.post("/api/metrics/track", (req, res) => res.json({ success: true }));
app.get("/api/metrics/summary", (req, res) => {
  const stats = getVisitsStats();
  return res.json({
    totalVisits: stats.totalVisits,
    totalAnalyses: 0,
    conversionRate: 0,
    totalPdfs: 0,
    trafficData15d: [],
    funnelData: [],
    traitsData: [],
    languageData: []
  });
});

// Serve ads.txt and app-ads.txt for Google AdSense and AdMob crawler authorization
app.get("/ads.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send("google.com, pub-8099027931324700, DIRECT, f08c47fec0942fa0");
});

app.get("/app-ads.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send("google.com, pub-8099027931324700, DIRECT, f08c47fec0942fa0");
});

// REST API endpoint to analyze handwriting
app.post("/api/analyze", async (req, res) => {
  try {    const { image, description, language = "es" } = req.body;

    const ai = getGeminiClient();

    // Base instruction for graphological analysis
    const systemInstruction = `Eres un psicólogo experto en Psicografología Clínica y Peritaje Grafotécnico de alto nivel.
Analiza la caligrafía provista (ya sea una imagen o descripción detallada de los rasgos) para generar un informe psicográfico y grafológico altamente científico, estructurado y empático.
Evita adivina-adivinanzas esotéricas; concéntrate en las correspondencias psicológicas aceptadas en la grafología clásica europea (escuelas alemana y francesa, como Klages, Crepieux-Jamin y Pulver).

Debes escribir TODO el contenido de los valores de texto del JSON (perfil psicológico, nombres de rasgos, observaciones, recomendaciones de carrera, etc.) estrictamente en el idioma solicitado por el usuario: "${language === "pt" ? "Portugués (pt)" : language === "en" ? "Inglés (en)" : "Español (es)"}".

Analiza los siguientes ejes grafológicos:
1. Dimensión/Tamaño (Autoestima, expansividad).
2. Dirección de las Líneas/Alineación (Humor, estabilidad, optimismo/pesimismo).
3. Inclinación (Expresión afectiva, introversión/extroversión, razón vs. emoción).
4. Presión y Calibre (Energía vital, salud, fuerza de voluntad, resistencia).
5. Cohesión/Ligamiento (Continuidad mental, lógica vs. intuición).
6. Forma (Estilo social, estética, originalidad, convencionalismo).
7. Márgenes y Organización (Gestión del tiempo, espacio y finanzas, relación con el pasado/futuro).
8. Firma (El yo íntimo vs. el yo público proyectado).

Sé sumamente profesional y detallado. Devuelve el resultado estrictamente en el esquema JSON solicitado. Asegúrate de rellenar todos los campos con observaciones profundas y coherentes en el idioma indicado.`;

    // Setup structured JSON response schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        temperament: {
          type: Type.OBJECT,
          description: "Distribución de los cuatro temperamentos hipocráticos clásicos en porcentaje (la suma debe ser 100).",
          properties: {
            sanguine: { type: Type.INTEGER, description: "Porcentaje del temperamento Sanguíneo (Comunicativo, dinámico)" },
            choleric: { type: Type.INTEGER, description: "Porcentaje del temperamento Colérico (Líder, impulsivo)" },
            melancholic: { type: Type.INTEGER, description: "Porcentaje del temperamento Melancólico (Analítico, sensible)" },
            phlegmatic: { type: Type.INTEGER, description: "Porcentaje del temperamento Flemático (Calmo, ponderado)" }
          },
          required: ["sanguine", "choleric", "melancholic", "phlegmatic"]
        },
        coreTraits: {
          type: Type.ARRAY,
          description: "Lista de rasgos psicológicos fundamentales evaluados.",
          items: {
            type: Type.OBJECT,
            properties: {
              trait: { type: Type.STRING, description: "Nombre del rasgo (ej: Estabilidad Emocional, Autoconfianza, Foco Intelectual, Energía Vital, Sociabilidad. Traducido al idioma solicitado)" },
              level: { type: Type.INTEGER, description: "Intensidad evaluada de 0 a 100" },
              description: { type: Type.STRING, description: "Explicación en relación a la caligrafía observada en el idioma solicitado" },
              indicator: { type: Type.STRING, description: "Qué rasgo de la escritura reveló esto (ej: 'Presión firme', 'Letras conectadas' traducido al idioma solicitado)" }
            },
            required: ["trait", "level", "description", "indicator"]
          }
        },
        graphologicalObservations: {
          type: Type.ARRAY,
          description: "Observaciones grafológicas detalladas basadas en los ejes de la caligrafía.",
          items: {
            type: Type.OBJECT,
            properties: {
              feature: { type: Type.STRING, description: "Eje analizado (ej: Inclinación, Presión, Dirección de las Líneas, etc. Traducido al idioma solicitado)" },
              observed: { type: Type.STRING, description: "Lo que fue observado en la caligrafía (ej: inclinada a la derecha, líneas ascendentes, presión leve. Traducido al idioma solicitado)" },
              psychologicalMeaning: { type: Type.STRING, description: "El significado psicológico y de personalidad de esta característica específica en el idioma solicitado" }
            },
            required: ["feature", "observed", "psychologicalMeaning"]
          }
        },
        emotionalState: {
          type: Type.OBJECT,
          description: "Estado emocional actual evaluado en porcentaje (0-100).",
          properties: {
            anxiety: { type: Type.INTEGER, description: "Nivel de ansiedad/tensión actual" },
            stress: { type: Type.INTEGER, description: "Nivel de estrés" },
            fatigue: { type: Type.INTEGER, description: "Nivel de cansancio o fatiga física" },
            confidence: { type: Type.INTEGER, description: "Nivel de autoconfianza y seguridad" }
          },
          required: ["anxiety", "stress", "fatigue", "confidence"]
        },
        psychologicalProfile: {
          type: Type.STRING,
          description: "Texto narrativo completo, profundo y profesional con el análisis psicológico de síntesis (2 o más párrafos ricos) en el idioma solicitado."
        },
        strengths: {
          type: Type.ARRAY,
          description: "Lista con 3 a 5 puntos fuertes identificados en la escritura, con insights detallados, en el idioma solicitado.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título del punto fuerte (ej: Fuerte poder de decisión bajo presión, traducido al idioma solicitado)" },
              insight: { type: Type.STRING, description: "Insight psicológico detallado en el idioma solicitado" }
            },
            required: ["title", "insight"]
          }
        },
        challenges: {
          type: Type.ARRAY,
          description: "Lista con 3 a 5 desafíos identificados en la escritura, con insights detallados, en el idioma solicitado.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título del desafío (ej: Tendencia a la impaciencia con los otros, traducido al idioma solicitado)" },
              insight: { type: Type.STRING, description: "Insight de profundidad psicológica en el idioma solicitado" }
            },
            required: ["title", "insight"]
          }
        },
        careerRecommendations: {
          type: Type.ARRAY,
          description: "Lista con 3 a 4 áreas de actuación o estilos de trabajo recomendados en el idioma solicitado.",
          items: { type: Type.STRING }
        }
      },
      required: [
        "temperament",
        "coreTraits",
        "graphologicalObservations",
        "emotionalState",
        "psychologicalProfile",
        "strengths",
        "challenges",
        "careerRecommendations"
      ]
    };

    let contents: any[] = [];

    if (image) {
      // Decode base64 image data
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Formato de imagen inválido. Forneça uma URI Base64 válida." });
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const textPrompt = `Analiza esta caligrafía de acuerdo con las directrices psicofisiológicas y grafológicas más respetadas.
Si el usuario proporcionó alguna observación o contexto adicional, tómalo en cuenta: "${description || "Ningún contexto adicional proporcionado."}".
Idioma del informe completo: ${language === "en" ? "Inglés (en)" : language === "pt" ? "Portugués (pt)" : "Español (es)"}. Asegúrate de responder estrictamente en este idioma.`;

      contents = [imagePart, { text: textPrompt }];
    } else if (description) {
      // Text-only description mode if the user fills a detailed traits quiz
      const textPrompt = `El usuario no envió una imagen, pero proporcionó una descripción detallada de su caligrafía o respondió a un cuestionario estructurado con las siguientes características:
${description}

Con base en estos parámetros técnicos proporcionados, realiza una reconstrucción grafológica teórica precisa y genera el perfil psicológico completo del autor.
Idioma del informe completo: ${language === "en" ? "Inglés (en)" : language === "pt" ? "Portugués (pt)" : "Español (es)"}. Asegúrate de responder estrictamente en este idioma.`;

      contents = [{ text: textPrompt }];
    } else {
      return res.status(400).json({ error: "Por favor, proporcione una imagen de la caligrafía o complete el cuestionario descriptivo." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("O modelo Gemini falhou em retornar um resultado legível.");
    }

    const reportData = JSON.parse(textResult.trim());
    return res.json(reportData);

  } catch (error: any) {
    console.error("Erro na análise grafológica:", error);
    return res.status(500).json({
      error: error.message || "Ocorreu um erro interno ao processar a análise grafológica."
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In development, integrate Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve pre-built static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Psicografologia Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
