import express from "express";
import http from "http";
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

// ============================================================================
// FREEMIUM MONETIZATION & CREDITS ENGINE (3 Free Studies -> Paid / Pro)
// ============================================================================
const FREE_STUDIES_LIMIT = 3;
const MONETIZATION_FILE = path.join(process.cwd(), "monetization_db.json");

interface UserCreditsRecord {
  clientId: string;
  ipHashes: string[];
  freeUsed: number;
  paidCredits: number;
  isProUnlimited: boolean;
  totalStudies: number;
  lastStudyAt?: number;
}

interface ActivationCodeRecord {
  code: string;
  planId: "pack1" | "pack5" | "pro";
  creditsToAdd: number;
  grantsPro: boolean;
  maxUses: number;
  usedCount: number;
  createdAt: number;
  note?: string;
}

interface PaymentSettingsRecord {
  pack1Url: string;
  pack5Url: string;
  proUrl: string;
  pack1Price: string;
  pack5Price: string;
  proPrice: string;
  contactEmail: string;
  whatsappNumber: string;
}

interface MonetizationStore {
  users: Record<string, UserCreditsRecord>;
  ipFreeCounts: Record<string, number>;
  codes: ActivationCodeRecord[];
  creatorPinHash?: string;
  paymentSettings: PaymentSettingsRecord;
  stats: {
    totalAiStudies: number;
    totalPaidUnlocks: number;
  };
}

let monetizationStore: MonetizationStore = {
  users: {},
  ipFreeCounts: {},
  codes: [],
  paymentSettings: {
    pack1Url: "https://paypal.me/margsaft/5",
    pack5Url: "https://mpago.la/21ZzzP7",
    proUrl: "https://paypal.me/margsaft/5",
    pack1Price: "$5 USD",
    pack5Price: "$8.000 Arg",
    proPrice: "$15 USD",
    contactEmail: "gracwiew@gmail.com",
    whatsappNumber: "",
  },
  stats: {
    totalAiStudies: 0,
    totalPaidUnlocks: 0,
  },
};

try {
  if (fs.existsSync(MONETIZATION_FILE)) {
    const raw = fs.readFileSync(MONETIZATION_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    monetizationStore = {
      ...monetizationStore,
      ...parsed,
      paymentSettings: {
        ...monetizationStore.paymentSettings,
        ...(parsed.paymentSettings || {}),
      },
      stats: {
        ...monetizationStore.stats,
        ...(parsed.stats || {}),
      },
    };
  } else {
    monetizationStore.creatorPinHash = hashCreatorPin("1824");
    fs.writeFileSync(MONETIZATION_FILE, JSON.stringify(monetizationStore, null, 2));
  }
} catch (e) {
  console.error("[Monetization Server] Error loading monetization DB:", e);
}

if (!monetizationStore.creatorPinHash) {
  monetizationStore.creatorPinHash = hashCreatorPin("1824");
  saveMonetizationToDisk();
}

async function saveMonetizationToDisk() {
  try {
    await fs.promises.writeFile(MONETIZATION_FILE, JSON.stringify(monetizationStore, null, 2));
  } catch (e) {
    console.error("[Monetization Server] Error saving monetization DB:", e);
  }
}

function hashCreatorPin(pin: string): string {
  return crypto.createHash("sha256").update(pin + "_grapho_creator_salt_v1").digest("hex");
}

function verifyCreatorPin(pin?: string): boolean {
  if (!pin || typeof pin !== "string") return false;
  if (pin === "1824") return true;
  const envPin = process.env.CREATOR_PIN;
  if (envPin) {
    return pin === envPin;
  }
  if (!monetizationStore.creatorPinHash) {
    monetizationStore.creatorPinHash = hashCreatorPin("1824");
  }
  return hashCreatorPin(pin) === monetizationStore.creatorPinHash || pin === "1824";
}

function getOrCreateUserRecord(clientId: string, ipHash: string): UserCreditsRecord {
  const safeId = (clientId || `anon_${ipHash}`).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || `anon_${ipHash}`;
  let record = monetizationStore.users[safeId];
  if (!record) {
    // Prevent trivial incognito spam on the exact same IP after 6 total free studies on that IP
    const ipUsed = monetizationStore.ipFreeCounts[ipHash] || 0;
    const initialFreeUsed = ipUsed >= FREE_STUDIES_LIMIT * 2 ? FREE_STUDIES_LIMIT : 0;
    record = {
      clientId: safeId,
      ipHashes: [ipHash],
      freeUsed: initialFreeUsed,
      paidCredits: 0,
      isProUnlimited: false,
      totalStudies: 0,
    };
    monetizationStore.users[safeId] = record;
  } else if (!record.ipHashes.includes(ipHash)) {
    record.ipHashes.push(ipHash);
  }
  return record;
}

function buildQuotaResponse(record: UserCreditsRecord) {
  const freeUsed = Math.min(record.freeUsed, FREE_STUDIES_LIMIT);
  const freeRemaining = Math.max(0, FREE_STUDIES_LIMIT - freeUsed);
  const hasAccess = record.isProUnlimited || freeRemaining > 0 || record.paidCredits > 0;
  return {
    clientId: record.clientId,
    freeUsed,
    freeLimit: FREE_STUDIES_LIMIT,
    freeRemaining,
    paidCredits: record.paidCredits,
    isProUnlimited: record.isProUnlimited,
    hasAccess,
    totalStudies: record.totalStudies,
    paymentSettings: monetizationStore.paymentSettings,
  };
}

// 1. Get user's current free studies / paid credits quota
app.get("/api/credits", (req, res) => {
  try {
    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const ipHash = hashIp(rawIp);
    const clientId = String(req.query.clientId || "");
    const record = getOrCreateUserRecord(clientId, ipHash);
    saveMonetizationToDisk();
    return res.json(buildQuotaResponse(record));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Redeem a paid activation code or Creator PIN (1824)
app.post("/api/credits/redeem", (req, res) => {
  try {
    const { clientId, code } = req.body || {};
    const rawCode = String(code || "").trim().toUpperCase();
    if (!rawCode) {
      return res.status(400).json({ error: "Ingresá un código de activación válido." });
    }

    // Direct Creator PIN unlock (1824)
    if (rawCode === "1824") {
      const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
      const ipHash = hashIp(rawIp);
      const record = getOrCreateUserRecord(String(clientId || ""), ipHash);
      record.isProUnlimited = true;
      record.paidCredits = Math.max(record.paidCredits, 100);
      saveMonetizationToDisk();
      return res.json({
        success: true,
        planId: "pro",
        creditsAdded: 100,
        grantsPro: true,
        quota: buildQuotaResponse(record),
      });
    }

    const codeEntry = monetizationStore.codes.find((c) => c.code.toUpperCase() === rawCode);
    if (!codeEntry) {
      return res.status(404).json({ error: "Código no encontrado o inválido." });
    }
    if (codeEntry.usedCount >= codeEntry.maxUses) {
      return res.status(400).json({ error: "Este código ya alcanzó su límite de usos." });
    }

    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const ipHash = hashIp(rawIp);
    const record = getOrCreateUserRecord(String(clientId || ""), ipHash);

    if (codeEntry.grantsPro) {
      record.isProUnlimited = true;
    }
    if (codeEntry.creditsToAdd > 0) {
      record.paidCredits += codeEntry.creditsToAdd;
    }

    codeEntry.usedCount += 1;
    monetizationStore.stats.totalPaidUnlocks += 1;
    saveMonetizationToDisk();

    return res.json({
      success: true,
      planId: codeEntry.planId,
      creditsAdded: codeEntry.creditsToAdd,
      grantsPro: codeEntry.grantsPro,
      quota: buildQuotaResponse(record),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Creator / Admin Monetization Management Endpoints
app.get("/api/creator/status", (req, res) => {
  return res.json({
    pinConfigured: Boolean(process.env.CREATOR_PIN || monetizationStore.creatorPinHash),
  });
});

app.post("/api/creator/setup-pin", (req, res) => {
  const { pin } = req.body || {};
  if (process.env.CREATOR_PIN || monetizationStore.creatorPinHash) {
    return res.status(400).json({ error: "El PIN del creador ya está configurado." });
  }
  if (!pin || String(pin).trim().length < 4) {
    return res.status(400).json({ error: "Elegí un PIN de al menos 4 caracteres." });
  }
  monetizationStore.creatorPinHash = hashCreatorPin(String(pin).trim());
  saveMonetizationToDisk();
  return res.json({ success: true });
});

app.post("/api/creator/dashboard", (req, res) => {
  const { pin } = req.body || {};
  if (!verifyCreatorPin(pin)) {
    return res.status(401).json({ error: "PIN de creador incorrecto." });
  }
  return res.json({
    success: true,
    stats: {
      ...monetizationStore.stats,
      totalUsers: Object.keys(monetizationStore.users).length,
      proUsers: Object.values(monetizationStore.users).filter((u) => u.isProUnlimited).length,
    },
    paymentSettings: monetizationStore.paymentSettings,
    codes: [...monetizationStore.codes].sort((a, b) => b.createdAt - a.createdAt),
  });
});

app.post("/api/creator/generate-code", (req, res) => {
  const { pin, planId = "pack5", maxUses = 1, note = "" } = req.body || {};
  if (!verifyCreatorPin(pin)) {
    return res.status(401).json({ error: "PIN de creador incorrecto." });
  }
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  const prefix = planId === "pro" ? "GP-PRO" : planId === "pack1" ? "GP-1" : "GP-5";
  const newCode: ActivationCodeRecord = {
    code: `${prefix}-${suffix}`,
    planId: planId === "pro" || planId === "pack1" ? planId : "pack5",
    creditsToAdd: planId === "pro" ? 0 : planId === "pack1" ? 1 : 5,
    grantsPro: planId === "pro",
    maxUses: Math.max(1, Math.min(1000, Number(maxUses) || 1)),
    usedCount: 0,
    createdAt: Date.now(),
    note: String(note || "").slice(0, 80),
  };
  monetizationStore.codes.push(newCode);
  saveMonetizationToDisk();
  return res.json({
    success: true,
    code: newCode,
    codes: [...monetizationStore.codes].sort((a, b) => b.createdAt - a.createdAt),
  });
});

app.post("/api/creator/delete-code", (req, res) => {
  const { pin, code } = req.body || {};
  if (!verifyCreatorPin(pin)) {
    return res.status(401).json({ error: "PIN de creador incorrecto." });
  }
  monetizationStore.codes = monetizationStore.codes.filter((c) => c.code !== code);
  saveMonetizationToDisk();
  return res.json({
    success: true,
    codes: [...monetizationStore.codes].sort((a, b) => b.createdAt - a.createdAt),
  });
});

app.post("/api/creator/update-settings", (req, res) => {
  const { pin, paymentSettings } = req.body || {};
  if (!verifyCreatorPin(pin)) {
    return res.status(401).json({ error: "PIN de creador incorrecto." });
  }
  if (paymentSettings && typeof paymentSettings === "object") {
    monetizationStore.paymentSettings = {
      pack1Url: String(paymentSettings.pack1Url || monetizationStore.paymentSettings.pack1Url).trim(),
      pack5Url: String(paymentSettings.pack5Url || monetizationStore.paymentSettings.pack5Url).trim(),
      proUrl: String(paymentSettings.proUrl || monetizationStore.paymentSettings.proUrl).trim(),
      pack1Price: String(paymentSettings.pack1Price || monetizationStore.paymentSettings.pack1Price).trim(),
      pack5Price: String(paymentSettings.pack5Price || monetizationStore.paymentSettings.pack5Price).trim(),
      proPrice: String(paymentSettings.proPrice || monetizationStore.paymentSettings.proPrice).trim(),
      contactEmail: String(paymentSettings.contactEmail || monetizationStore.paymentSettings.contactEmail).trim(),
      whatsappNumber: String(paymentSettings.whatsappNumber || "").trim(),
    };
    saveMonetizationToDisk();
  }
  return res.json({ success: true, paymentSettings: monetizationStore.paymentSettings });
});

app.post("/api/creator/reset-quota", (req, res) => {
  const { pin, clientId } = req.body || {};
  if (!verifyCreatorPin(pin)) {
    return res.status(401).json({ error: "PIN de creador incorrecto." });
  }
  const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
  const ipHash = hashIp(rawIp);
  const record = getOrCreateUserRecord(String(clientId || ""), ipHash);
  record.freeUsed = 0;
  monetizationStore.ipFreeCounts[ipHash] = 0;
  saveMonetizationToDisk();
  return res.json({ success: true, quota: buildQuotaResponse(record) });
});

// REST API endpoint to analyze handwriting (enforces 3 free studies, then paid credits / Pro)
app.post("/api/analyze", async (req, res) => {
  try {
    const { image, description, language = "es", clientId = "" } = req.body;
    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const ipHash = hashIp(rawIp);
    const userRecord = getOrCreateUserRecord(String(clientId), ipHash);
    const currentQuota = buildQuotaResponse(userRecord);

    if (!currentQuota.hasAccess) {
      return res.status(402).json({
        error: "Has alcanzado el límite de 3 estudios gratuitos. Desbloqueá más estudios o el Pase Pro para continuar.",
        code: "QUOTA_EXCEEDED",
        quota: currentQuota,
      });
    }

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
      model: "gemini-4-hydrogen",
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

    // Deduct study quota ONLY after a successful AI generation
    if (!userRecord.isProUnlimited) {
      if (userRecord.freeUsed < FREE_STUDIES_LIMIT) {
        userRecord.freeUsed += 1;
        monetizationStore.ipFreeCounts[ipHash] = (monetizationStore.ipFreeCounts[ipHash] || 0) + 1;
      } else if (userRecord.paidCredits > 0) {
        userRecord.paidCredits -= 1;
      }
    }
    userRecord.totalStudies += 1;
    userRecord.lastStudyAt = Date.now();
    monetizationStore.stats.totalAiStudies += 1;
    saveMonetizationToDisk();

    return res.json({
      ...reportData,
      _quota: buildQuotaResponse(userRecord),
    });

  } catch (error: any) {
    console.error("Erro na análise grafológica:", error);
    return res.status(500).json({
      error: error.message || "Ocorreu um erro interno ao processar a análise grafológica."
    });
  }
});

// Serve frontend assets
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    // In development, integrate Vite middleware and attach HMR WebSocket to the main HTTP server
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Explicit SPA fallback for development
    app.use("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api/")) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // In production, serve pre-built static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Psicografologia Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
