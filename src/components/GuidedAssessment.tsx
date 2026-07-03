import React, { useState } from "react";
import { GuidedAnswers } from "../types";
import { ChevronRight, ChevronLeft, Check, HelpCircle } from "lucide-react";

interface GuidedAssessmentProps {
  onChange: (answers: GuidedAnswers | null) => void;
  language: "es" | "pt" | "en";
}

interface QuestionOption {
  value: string;
  label: string;
  sub: string;
  previewSvg: React.ReactNode;
}

interface Question {
  id: keyof GuidedAnswers;
  title: string;
  description: string;
  options: QuestionOption[];
}

export default function GuidedAssessment({ onChange, language }: GuidedAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<GuidedAnswers>>({});

  const t = {
    es: {
      next: "Siguiente",
      prev: "Atrás",
      finish: "Mapeo Completado",
      step: "Paso",
      of: "de",
      quizCompleted: "¡Características guardadas! Hacé clic en el botón de análisis de abajo.",
      reset: "Reiniciar Cuestionario"
    },
    pt: {
      next: "Avançar",
      prev: "Voltar",
      finish: "Mapeamento Concluído",
      step: "Passo",
      of: "de",
      quizCompleted: "Características salvas! Clique no botão de análise abaixo.",
      reset: "Refazer Questionário"
    },
    en: {
      next: "Next",
      prev: "Back",
      finish: "Mapping Completed",
      step: "Step",
      of: "of",
      quizCompleted: "Characteristics saved! Click the analysis button below.",
      reset: "Reset Questionnaire"
    }
  }[language];

  const questions: Question[] = [
    {
      id: "size",
      title: language === "es"
        ? "Tamaño de las Letras (Dimensión)"
        : language === "pt"
        ? "Tamanho das Letras (Dimensão)"
        : "Letter Size",
      description: language === "es"
        ? "Representa el nivel de autovaloración, ego, introversión/extroversión y capacidad de enfoque."
        : language === "pt"
        ? "Representa o nível de autovalorização, ego, timidez ou ambição do escritor."
        : "Represents self-esteem, focus, extraversion, or introversion.",
      options: [
        {
          value: "pequena",
          label: language === "es" ? "Pequeña (< 2mm)" : language === "pt" ? "Pequena (< 2mm)" : "Small (< 2mm)",
          sub: language === "es"
            ? "Enfoque en el detalle, introversión, alta capacidad de concentración y minuciosidad."
            : language === "pt"
            ? "Foco no detalhe, timidez, introspecção, alta capacidade de concentração."
            : "Detail-oriented, introverted, highly analytical, strong focus.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <path d="M 10 25 C 15 20, 20 20, 25 25 C 28 25, 30 22, 35 25 C 40 25, 43 23, 48 25" strokeWidth="1.5" />
              <text x="55" y="27" className="font-serif text-[9px] fill-slate-500 font-bold" stroke="none">abc</text>
            </svg>
          )
        },
        {
          value: "media",
          label: language === "es" ? "Mediana (2mm a 3mm)" : language === "pt" ? "Média (2mm a 3mm)" : "Medium (2mm - 3mm)",
          sub: language === "es"
            ? "Equilibrio emocional, adaptabilidad, sano sentido de la realidad y adaptabilidad social."
            : language === "pt"
            ? "Equilíbrio emocional, adaptabilidade, realismo e bom senso social."
            : "Emotional balance, adaptability, realism, and good social sense.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <text x="15" y="27" className="font-serif text-xs fill-slate-500" stroke="none">escribir</text>
            </svg>
          )
        },
        {
          value: "grande",
          label: language === "es" ? "Grande (> 3mm)" : language === "pt" ? "Grande (> 3mm)" : "Large (> 3mm)",
          sub: language === "es"
            ? "Extroversión, autoconfianza, deseo de llamar la atención, generosidad o nobleza."
            : language === "pt"
            ? "Extroversão, autoconfiança, desejo de ser notado, generosidade ou orgulho."
            : "Extraversion, confidence, need for attention, and pride/generosity.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <text x="10" y="28" className="font-serif text-lg fill-slate-600 dark:fill-slate-300" stroke="none">GRA</text>
              <text x="55" y="28" className="font-serif text-lg fill-slate-600 dark:fill-slate-300" stroke="none">NDE</text>
            </svg>
          )
        }
      ]
    },
    {
      id: "slant",
      title: language === "es"
        ? "Inclinación de las Letras"
        : language === "pt"
        ? "Inclinação das Letras"
        : "Letter Slant",
      description: language === "es"
        ? "Indica el grado de apertura afectiva hacia los demás, el manejo de emociones y control racional."
        : language === "pt"
        ? "Indica a abertura aos outros, a expressão das emoções e o controle racional."
        : "Indicates emotional expression, sociability, and head vs. heart.",
      options: [
        {
          value: "direita",
          label: language === "es" ? "Inclinada a la Derecha" : language === "pt" ? "Inclinada à Direita" : "Slanted Right",
          sub: language === "es"
            ? "Predominio del corazón, empatía, orientación hacia el futuro y sociabilidad activa."
            : language === "pt"
            ? "Predomínio do coração, empatia, avanço ao futuro, sociabilidade ativa."
            : "Heart-driven, empathetic, future-focused, active sociability.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <text x="15" y="26" className="font-serif text-sm fill-slate-500 italic rotate-[15deg] transform origin-left" stroke="none">grafologia</text>
            </svg>
          )
        },
        {
          value: "vertical",
          label: language === "es" ? "Recta o Vertical" : language === "pt" ? "Reta ou Vertical" : "Vertical / Straight",
          sub: language === "es"
            ? "Autocontrol, lógica, predominio de la razón sobre los sentimientos, objetividad."
            : language === "pt"
            ? "Autocontrol, lógica, razão prevalece sobre sentimento, postura objetiva."
            : "Self-control, logical thinking, objective judgment, emotional stability.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <text x="25" y="26" className="font-serif text-sm fill-slate-500 font-medium" stroke="none">vertical</text>
            </svg>
          )
        },
        {
          value: "esquerda",
          label: language === "es" ? "Inclinada a la Izquierda" : language === "pt" ? "Inclinada à Esquerda" : "Slanted Left",
          sub: language === "es"
            ? "Defensa emocional, prudencia, apego al pasado o introversión reflexiva."
            : language === "pt"
            ? "Defesa emocional, apego ao passado ou à mãe, reserva ou desconfiança."
            : "Emotional defense, reserved, attachment to the past, cautious behavior.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <text x="35" y="26" className="font-serif text-sm fill-slate-500 italic rotate-[-12deg] transform origin-left" stroke="none">pasado</text>
            </svg>
          )
        }
      ]
    },
    {
      id: "baseline",
      title: language === "es"
        ? "Dirección de las Líneas (Línea de Base)"
        : language === "pt"
        ? "Direção das Linhas (Linha Base)"
        : "Baseline Direction",
      description: language === "es"
        ? "Mide el estado de ánimo, optimismo, fatiga, perseverancia y estabilidad psicológica."
        : language === "pt"
        ? "Mede o humor, otimismo, fadiga, resiliência e estabilidade psicológica."
        : "Measures energy, optimism, fatigue, and psychological stability.",
      options: [
        {
          value: "ascendente",
          label: language === "es" ? "Ascendentes (Suben)" : language === "pt" ? "Ascendentes (Sobem)" : "Ascending (Rising)",
          sub: language === "es"
            ? "Optimismo, dinamismo, espíritu de superación, ambición noble y alta vitalidad."
            : language === "pt"
            ? "Otimismo, dinamismo, espírito combativo, ambição de crescimento."
            : "Optimism, high energy, fighting spirit, ambition, and vitality.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 32 L 110 12" strokeDasharray="3 3" className="stroke-indigo-300 dark:stroke-indigo-900" />
              <text x="15" y="32" className="font-serif text-sm fill-indigo-600 dark:fill-indigo-400 rotate-[-10deg] transform origin-left" stroke="none">subiendo...</text>
            </svg>
          )
        },
        {
          value: "retas",
          label: language === "es" ? "Rectas y Firmes" : language === "pt" ? "Retas e Firmes" : "Straight / Horizontal",
          sub: language === "es"
            ? "Equilibrio, perseverancia, control emocional, constancia y disciplina férrea."
            : language === "pt"
            ? "Equilíbrio, persistência, controle de humor e autodisciplina impecável."
            : "Steadfast, self-controlled, steady mood, strong-willed, structured.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 20 L 110 20" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <text x="25" y="19" className="font-serif text-sm fill-slate-500" stroke="none">estabilidade</text>
            </svg>
          )
        },
        {
          value: "descendente",
          label: language === "es" ? "Descendentes (Bajan)" : language === "pt" ? "Descendentes (Descem)" : "Descending (Falling)",
          sub: language === "es"
            ? "Cansancio o fatiga acumulada, tristeza pasajera, desánimo o sensibilidad extrema."
            : language === "pt"
            ? "Tristeza transitória, fadiga acumulada, desânimo ou sensibilidade."
            : "Fatigue, low energy, temporary discouragement, high sensitivity.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-rose-300 dark:stroke-rose-950 fill-none">
              <path d="M 10 12 L 110 32" strokeDasharray="3 3" className="stroke-rose-300 dark:stroke-rose-950" />
              <text x="15" y="14" className="font-serif text-sm fill-rose-600 dark:fill-rose-400 rotate-[10deg] transform origin-left" stroke="none">descendo...</text>
            </svg>
          )
        }
      ]
    },
    {
      id: "pressure",
      title: language === "es" ? "Presión y Calibre" : language === "pt" ? "Pressão e Calibre" : "Pen Pressure",
      description: language === "es"
        ? "Muestra la fuerza vital, resistencia emocional, firmeza de carácter y empuje físico."
        : language === "pt"
        ? "Demonstra a força física, resistência emocional, paixão e libido."
        : "Reveals physical energy, stress resilience, passion, and willpower.",
      options: [
        {
          value: "pesada",
          label: language === "es" ? "Firme o Pesada" : language === "pt" ? "Firme / Pesada" : "Heavy / Firm",
          sub: language === "es"
            ? "Fuerte dinamismo, firmeza de convicciones, gran resistencia y fuerza de voluntad."
            : language === "pt"
            ? "Muita energia vital, firmeza de caráter, forte libido, força física."
            : "Strong vital energy, powerful willpower, determination, material focus.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-800 dark:stroke-slate-200 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <text x="20" y="27" className="font-serif text-base fill-slate-900 dark:fill-slate-100 font-bold" stroke="none">FORTE</text>
            </svg>
          )
        },
        {
          value: "media",
          label: language === "es" ? "Media o Equilibrada" : language === "pt" ? "Média / Balanceada" : "Medium / Balanced",
          sub: language === "es"
            ? "Buen control de impulsos, adaptabilidad fisiológica y energía bien administrada."
            : language === "pt"
            ? "Energia e adaptabilidade equilibradas, controle de impulsos."
            : "Balanced emotional physical force, adaptable nature.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <text x="25" y="26" className="font-serif text-sm fill-slate-500" stroke="none">moderada</text>
            </svg>
          )
        },
        {
          value: "leve",
          label: language === "es" ? "Ligera o Suave" : language === "pt" ? "Leve / Suave" : "Light / Delicate",
          sub: language === "es"
            ? "Gran sensibilidad estética, empatía profunda, naturaleza receptiva, espiritualidad."
            : language === "pt"
            ? "Sensibilidade aguçada, empatia, espiritualidade, menor resistência física."
            : "High sensitivity, emotional receptive nature, spirituality, gentle heart.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-300 dark:stroke-slate-600 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <text x="30" y="25" className="font-serif text-xs fill-slate-300 dark:fill-slate-500 font-light" stroke="none">delicada</text>
            </svg>
          )
        }
      ]
    },
    {
      id: "connections",
      title: language === "es"
        ? "Cohesión y Unión de Letras"
        : language === "pt"
        ? "Coesão / Conexão"
        : "Letter Connections",
      description: language === "es"
        ? "Mide la continuidad de pensamiento, razonamiento lógico, intuición y consistencia mental."
        : language === "pt"
        ? "Mede a lógica de raciocínio, intuição e coesão social."
        : "Measures logic, continuity of thought, and intuition vs. analysis.",
      options: [
        {
          value: "ligada",
          label: language === "es" ? "Ligada (Todo unido)" : language === "pt" ? "Ligada (Sempre unida)" : "Connected (Cursive)",
          sub: language === "es"
            ? "Pensamiento lógico fluido y sin interrupción, constancia mental, asimilación rápida."
            : language === "pt"
            ? "Raciocínio lógico ininterrupto, espírito sistemático, sociabilidade fluida."
            : "Highly logical mind, systematic analysis, fluid social ties.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <path d="M 20 25 C 25 15, 30 15, 35 25 C 40 15, 45 15, 50 25 C 55 15, 60 15, 65 25" strokeWidth="1.5" />
              <text x="70" y="26" className="font-serif text-xs fill-slate-500" stroke="none">unido</text>
            </svg>
          )
        },
        {
          value: "mista",
          label: language === "es" ? "Mixta o Agrupada" : language === "pt" ? "Mista ou Agrupada" : "Mixed (Partially connected)",
          sub: language === "es"
            ? "Excelente equilibrio entre rigor lógico y ráfagas espontáneas de intuición creativa."
            : language === "pt"
            ? "Equilíbrio entre inteligência lógica e insights intuitivos, flexibilidade."
            : "Excellent balance of logical reasoning and intuitive insights.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <text x="25" y="26" className="font-serif text-sm fill-slate-500" stroke="none">mi x to</text>
            </svg>
          )
        },
        {
          value: "desligada",
          label: language === "es" ? "Desligada (Letras separadas)" : language === "pt" ? "Desligada (Letras separadas)" : "Disconnected (Separated)",
          sub: language === "es"
            ? "Mente analítica profunda, fuerte intuición, marcado individualismo y sentido estético original."
            : language === "pt"
            ? "Mente analítica, forte intuição, individualismo, originalidade artística."
            : "Analytical mind, strong individual perspective, artistic intuition.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <path d="M 10 25 L 110 25" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
              <text x="15" y="26" className="font-serif text-sm fill-slate-500 tracking-[0.25em]" stroke="none">sep a ra do</text>
            </svg>
          )
        }
      ]
    },
    {
      id: "spacing",
      title: language === "es" ? "Espacio entre Palabras" : language === "pt" ? "Espaço entre Palavras" : "Word Spacing",
      description: language === "es"
        ? "Muestra cómo gestionas tu privacidad, el respeto a los límites ajenos y la cercanía social."
        : language === "pt"
        ? "Demonstra como o escritor lida com a privacidade, limites e proximidade social."
        : "Shows how the writer handles privacy, social boundaries, and intimacy.",
      options: [
        {
          value: "largo",
          label: language === "es" ? "Ancho o Amplio" : language === "pt" ? "Largo (Amplo)" : "Wide Spacing",
          sub: language === "es"
            ? "Necesidad de espacio individual, reserva prudente, pudor emocional y cautela social."
            : language === "pt"
            ? "Necessidade de espaço e privacidade, reserva intelectual, prudência."
            : "Need for physical/mental space, high privacy, reserve, prudence.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <text x="15" y="26" className="font-serif text-sm fill-slate-500" stroke="none">yo</text>
              <text x="75" y="26" className="font-serif text-sm fill-slate-500" stroke="none">otro</text>
            </svg>
          )
        },
        {
          value: "apertado",
          label: language === "es" ? "Estrecho o Junto" : language === "pt" ? "Aperto / Estreito" : "Tight Spacing",
          sub: language === "es"
            ? "Búsqueda constante de compañía y contacto humano, sociabilidad abierta, temor al aislamiento."
            : language === "pt"
            ? "Busca constante por conexão, medo da solidão, sociabilidade calorosa."
            : "Thirst for connection, warmth, dislike of isolation.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <text x="15" y="26" className="font-serif text-sm fill-slate-500" stroke="none">yo-y-el-otro-juntos</text>
            </svg>
          )
        }
      ]
    },
    {
      id: "margins",
      title: language === "es" ? "Gestión de los Márgenes" : language === "pt" ? "Gestão das Margens" : "Margins Style",
      description: language === "es"
        ? "Revela la actitud hacia el orden, el dinero, el pasado (margen izquierdo) y el futuro (derecho)."
        : language === "pt"
        ? "Revela a relação com o tempo, dinheiro, passado (esquerda) e futuro (direita)."
        : "Reveals attitude towards time, money, the past (left) and future (right).",
      options: [
        {
          value: "organizada",
          label: language === "es" ? "Simétricos y Ordenados" : language === "pt" ? "Simétricas e Ordenadas" : "Symmetrical & Orderly",
          sub: language === "es"
            ? "Excelente autodisciplina, buen control del presupuesto, estabilidad mental y orden."
            : language === "pt"
            ? "Autodisciplina, boa administração financeira e mental, estabilidade."
            : "Strong self-discipline, financial balance, emotional control.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <rect x="15" y="8" width="90" height="25" strokeDasharray="2 2" className="stroke-slate-300" />
              <line x1="20" y1="14" x2="100" y2="14" strokeWidth="1" />
              <line x1="20" y1="20" x2="100" y2="20" strokeWidth="1" />
              <line x1="20" y1="26" x2="100" y2="26" strokeWidth="1" />
            </svg>
          )
        },
        {
          value: "esquerda_estreita",
          label: language === "es" ? "Margen Izquierdo Estrecho" : language === "pt" ? "Margem Esquerda Estreita" : "Narrow Left Margin",
          sub: language === "es"
            ? "Gran apego familiar, lealtad a los orígenes, cautela con los gastos o timidez."
            : language === "pt"
            ? "Grande apego familiar e ao passado, economia/caução financeira."
            : "Strong ties to family/past, financial caution, nostalgic nature.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <rect x="15" y="8" width="90" height="25" strokeDasharray="2 2" className="stroke-slate-300" />
              <line x1="16" y1="14" x2="85" y2="14" strokeWidth="1" />
              <line x1="16" y1="20" x2="80" y2="20" strokeWidth="1" />
              <line x1="16" y1="26" x2="85" y2="26" strokeWidth="1" />
            </svg>
          )
        },
        {
          value: "direita_apertada",
          label: language === "es" ? "Margen Derecho Estrecho/Invasivo" : language === "pt" ? "Margem Direita Estreita/Invasiva" : "Narrow Right Margin",
          sub: language === "es"
            ? "Mucha iniciativa, espíritu intrépido, impaciencia y alta orientación al futuro."
            : language === "pt"
            ? "Iniciativa, coragem, impaciência, atração irracional pelo amanhã."
            : "High initiative, courage, eagerness, pushing towards goals.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <rect x="15" y="8" width="90" height="25" strokeDasharray="2 2" className="stroke-slate-300" />
              <line x1="25" y1="14" x2="104" y2="14" strokeWidth="1" />
              <line x1="30" y1="20" x2="104" y2="20" strokeWidth="1" />
              <line x1="25" y1="26" x2="104" y2="26" strokeWidth="1" />
            </svg>
          )
        }
      ]
    },
    {
      id: "signature",
      title: language === "es"
        ? "Estilo de la Firma"
        : language === "pt"
        ? "Estilo da Assinatura"
        : "Signature Style",
      description: language === "es"
        ? "La firma representa tu 'Yo íntimo' comparado con la imagen profesional o pública del texto."
        : language === "pt"
        ? "A assinatura representa o Eu Interno e a imagem profissional desejada."
        : "The signature represents the Inner Self vs. the public persona.",
      options: [
        {
          value: "legivel_igual_texto",
          label: language === "es" ? "Legible y Similar al Texto" : language === "pt" ? "Legível e Semelhante ao Texto" : "Legible & Matches Text",
          sub: language === "es"
            ? "Transparencia total, autenticidad genuina, coherencia absoluta en la vida pública y privada."
            : language === "pt"
            ? "Transparência total, autenticidade, o que a pessoa mostra é o que é."
            : "High transparency, authenticity, consistency in public/private life.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-slate-600 dark:stroke-slate-300 fill-none">
              <text x="15" y="20" className="font-serif text-sm fill-indigo-600 dark:fill-indigo-400 font-bold" stroke="none">Silva Junior</text>
              <line x1="10" y1="26" x2="110" y2="26" strokeWidth="0.5" className="stroke-slate-300" />
            </svg>
          )
        },
        {
          value: "legivel_diferente_texto",
          label: language === "es" ? "Muy Diferente del Texto Común" : language === "pt" ? "Muito diferente do Texto comum" : "Very Different from Text",
          sub: language === "es"
            ? "Clara separación entre la máscara social/laboral y los verdaderos sentimientos privados."
            : language === "pt"
            ? "Distinção nítida entre o Eu Profissional e a personalidade privada íntima."
            : "Sharp distinction between public persona and intimate private self.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-indigo-600 dark:stroke-indigo-400 fill-none">
              <path d="M 20 28 C 30 15, 35 10, 45 30 C 50 35, 60 15, 80 25 C 90 30, 100 10, 105 15" strokeWidth="2" />
            </svg>
          )
        },
        {
          value: "assinatura_com_traco",
          label: language === "es" ? "Firma Envuelta por Trazos o Rúbricas" : language === "pt" ? "Assinatura Envolta por Traços / Ganchos" : "Encircled / Sublined Signature",
          sub: language === "es"
            ? "Actitud defensiva, instinto de protección, cautela inteligente y autopreservación."
            : language === "pt"
            ? "Defensividade, proteção, inteligência cautelosa, autopreservação."
            : "Defensive shielding, caution, protectiveness, self-preservation.",
          previewSvg: (
            <svg viewBox="0 0 120 40" className="w-full h-10 stroke-indigo-600 dark:stroke-indigo-400 fill-none">
              <text x="35" y="20" className="font-serif text-xs fill-slate-500" stroke="none">Carlos</text>
              <path d="M 15 25 C 25 35, 105 35, 105 25 C 105 15, 15 15, 15 25" strokeWidth="1" />
            </svg>
          )
        }
      ]
    }
  ];

  const currentQuestion = questions[currentStep];

  const selectOption = (val: string) => {
    const updated = { ...answers, [currentQuestion.id]: val };
    setAnswers(updated);

    // If it's the last question, automatically trigger state updates
    if (currentStep === questions.length - 1) {
      onChange(updated as GuidedAnswers);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentStep(0);
    onChange(null);
  };

  const progressPercent = ((currentStep + 1) / questions.length) * 100;
  const isLastStep = currentStep === questions.length - 1;
  const isAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <div className="w-full flex flex-col bg-slate-50/40 dark:bg-slate-900/10 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800" id="guided-assessment-panel">
      {/* Header and Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          {t.step} {currentStep + 1} {t.of} {questions.length}
        </span>
        <span className="text-xs text-slate-500 font-mono">{Math.round(progressPercent)}%</span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Main question slide */}
      <div className="flex flex-col gap-1 min-h-[350px]">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {currentQuestion.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {currentQuestion.description}
            </p>
          </div>
        </div>

        {/* Option cards */}
        <div className="flex flex-col gap-3 mt-4">
          {currentQuestion.options.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => selectOption(opt.value)}
                className={`flex flex-col sm:flex-row items-center gap-4 p-3 border rounded-xl text-left transition-all ${
                  isSelected
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60"
                }`}
              >
                {/* SVG Illustration Container */}
                <div className="w-full sm:w-[130px] h-[50px] bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {opt.previewSvg}
                </div>

                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <span className="p-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {opt.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.prev}
        </button>

        {isLastStep && isAnswered ? (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ {t.quizCompleted}
            </span>
            <button
              type="button"
              onClick={resetQuiz}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
            >
              {t.reset}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isAnswered || isLastStep}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {t.next}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
