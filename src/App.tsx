import { useState, useEffect } from "react";
import { 
  Brain, 
  PenTool, 
  Upload, 
  HelpCircle, 
  Activity, 
  Sparkles, 
  Award, 
  AlertCircle, 
  Compass, 
  BookOpen, 
  Globe, 
  RefreshCw, 
  FileHeart,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Briefcase,
  FileDown,
  Heart,
  Settings,
  DollarSign,
  Eye,
  Code,
  Copy,
  Layout
} from "lucide-react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie,
  Legend
} from "recharts";
import HandwritingCanvas from "./components/HandwritingCanvas";
import ImageUploader from "./components/ImageUploader";
import GuidedAssessment from "./components/GuidedAssessment";
import VibrantBackground from "./components/VibrantBackground";
import { AnalysisReportData, GuidedAnswers } from "./types";
import { generatePDF } from "./lib/pdfGenerator";
import BlogSection from "./components/BlogSection";

// Static mock preset samples for rapid discovery and testing without API key setup
const PRESET_SAMPLES: Record<string, { es: AnalysisReportData; pt: AnalysisReportData; en: AnalysisReportData }> = {
  leader: {
    es: {
      temperament: { sanguine: 20, choleric: 55, melancholic: 10, phlegmatic: 15 },
      coreTraits: [
        { trait: "Liderazgo", level: 90, description: "Fuerte determinación y habilidad natural para coordinar equipos y tomar decisiones difíciles.", indicator: "Firma grande y centralizada, margen derecho fluido." },
        { trait: "Estabilidad Emocional", level: 75, description: "Resiliencia ante adversidades, manteniendo el control en situaciones tensas.", indicator: "Línea base recta y firme con poca variación." },
        { trait: "Enfoque Intelectual", level: 80, description: "Capacidad de abstracción y razonamiento práctico enfocado en resultados rápidos.", indicator: "Letras de tamaño mediano con crestas superiores limpias." },
        { trait: "Sociabilidad", level: 70, description: "Comunicación extrovertida orientada a la influencia y persuasión activa.", indicator: "Escritura ligeramente inclinada hacia la derecha." },
        { trait: "Energía Vital", level: 85, description: "Disposición física y firmeza de propósitos vigorosa en el día a día.", indicator: "Presión del bolígrafo firme y uniforme." }
      ],
      graphologicalObservations: [
        { feature: "Firma", observed: "Más grande que el texto general, con rúbrica inferior firme", psychologicalMeaning: "Fuerte ambición profesional, autoconfianza sólida y necesidad de autoafirmação social." },
        { feature: "Inclinación", observed: "Inclinada hacia la derecha (Dextrógira)", psychologicalMeaning: "Orientación hacia el futuro, búsqueda activa de conexiones y facilidad de expresión emocional." },
        { feature: "Alineación de Líneas", observed: "Ascendente y firme", psychologicalMeaning: "Espíritu emprendedor, optimismo contagioso, entusiasmo y una buena dosis de ambición personal." }
      ],
      emotionalState: { anxiety: 30, stress: 45, fatigue: 25, confidence: 90 },
      psychologicalProfile: "El autor demuestra un perfil psicológico caracterizado por un alto dinamismo, liderazgo innato y una fuerte energía realizadora. Es alguien que busca activamente el protagonismo y no se intimida ante los obstáculos. La firmeza de los trazos sugiere una autodisciplina rígida y consistencia en sus objetivos principales.\n\nSu escritura revela una coordinación excelente entre el pensamiento lógico y el pragmatismo, lo que le permite convertir ideas abstractas en planes operativos eficientes. Presenta una postura extrovertida y asertiva en el entorno laboral, aunque debe vigilar la impaciencia ante ritmos ajenos más lentos.",
      strengths: [
        { title: "Gran poder de decisión bajo presión", insight: "La rigidez controlada de la línea base sugiere que, ante las crisis, priorizas la lógica fría y mantienes una postura resolutiva para actuar sin vacilación." },
        { title: "Espíritu realizador y valentía", insight: "Los trazos ascendentes y firmes revelan una elevada energía motora que busca superar activamente los desafíos, viendo los obstáculos como simples etapas de progreso." },
        { title: "Excelente comunicación e influencia", insight: "La inclinación dextrógira moderada indica facilidad para la conexión interpersonal rápida y capacidad de guiar opiniones con energía entusiasta." },
        { title: "Alta estabilidad emocional", insight: "La uniformidad de la presión y del espaciado demuestra un centro interno estable que amortigua los impactos emocionales externos cotidianos." }
      ],
      challenges: [
        { title: "Tendencia a la impaciencia con los demás", insight: "La velocidad rápida y fluidez de la escritura apuntan a procesos de pensamiento muy acelerados, lo que puede causar irritabilidad cuando otros operan a ritmos más lentos." },
        { title: "Propensión a la sobrecarga por alta ambición", insight: "Las ovales grandes y la firma imponente señalan una autoexigencia inmensa y deseo de expansión, elevando los niveles de estrés debido al acúmulo de responsabilidades." },
        { title: "Riesgo de parecer excesivamente directivo", insight: "Los trazos finales de palabras cortos o angulosos revelan una asertividad aguda que, si no se modera, puede percibirse como rigidez o postura mandona." }
      ],
      careerRecommendations: ["Cargos de Liderazgo Ejecutivo", "Gestión de Proyectos y Startups", "Dirección Comercial o de Ventas", "Consultoría Estratégica"]
    },
    pt: {
      temperament: { sanguine: 20, choleric: 55, melancholic: 10, phlegmatic: 15 },
      coreTraits: [
        { trait: "Liderança", level: 90, description: "Forte determinação e habilidade natural de coordenar equipes e tomar decisões difíceis.", indicator: "Assinatura grande e centralizada, margem direita fluida." },
        { trait: "Estabilidade Emocional", level: 75, description: "Resiliência perante adversidades, mantendo o controle em situações tensas.", indicator: "Linha base reta e firme com pouca variação." },
        { trait: "Foco Intelectual", level: 80, description: "Capacidade de abstração e raciocínio prático focado em resultados rápidos.", indicator: "Letras de tamanho médio com hastes superiores limpas." },
        { trait: "Sociabilidade", level: 70, description: "Comunicação extrovertida direcionada à influência e persuasão ativa.", indicator: "Escrita levemente inclinada para a direita." },
        { trait: "Energia Vital", level: 85, description: "Disposição física e firmeza de propósitos vigorosa no cotidiano.", indicator: "Pressão de caneta firme e uniforme." }
      ],
      graphologicalObservations: [
        { feature: "Assinatura", observed: "Maior que o texto geral, com traço inferior firme", psychologicalMeaning: "Forte ambição profissional, autoconfiança sólida e necessidade de autoafirmação social." },
        { feature: "Inclinação", observed: "Inclinada para a direita (Dextrogira)", psychologicalMeaning: "Orientação para o futuro, busca ativa de conexões e facilidade de expressão emocional." },
        { feature: "Alinhamento das Linhas", observed: "Ascendente e firme", psychologicalMeaning: "Espírito empreendedor, otimismo contagiante, entusiasmo e boa dose de ambição pessoal." }
      ],
      emotionalState: { anxiety: 30, stress: 45, fatigue: 25, confidence: 90 },
      psychologicalProfile: "O autor demonstra um perfil psicológico caracterizado por alto dinamismo, liderança nata e forte energia realizadora. É alguém que busca ativamente o protagonismo e não se intimida diante de obstáculos. A firmeza dos traços sugere autodisciplina rígida e consistência em seus objetivos principais.\n\nSua escrita revela uma coordenação excelente entre pensamento lógico e pragmatismo, permitindo converter ideias abstratas em planos operacionais eficientes. Apresenta uma postura extrovertida e assertiva no ambiente de trabalho, embora precise vigiar a impaciência perante ritmos alheios mais lentos.",
      strengths: [
        { title: "Forte poder de decisão sob pressão", insight: "A rigidez controlada da linha de base sugere que, diante de crises, você prioriza a lógica fria e mantém uma postura resoluta para agir sem hesitação." },
        { title: "Espírito realizador e coragem", insight: "Traços ascendentes e firmes revelam uma energia motora elevada que busca superar desafios ativamente, encarando obstáculos como meras etapas de progresso." },
        { title: "Excelente capacidade de comunicação e influência", insight: "A inclinação dextrogira moderada indica facilidade de conexão interpessoal rápida e capacidade de guiar opiniões com energia entusiasmática." },
        { title: "Alta estabilidade emocional", insight: "A uniformidade da pressão e do espaçamento demonstra um centro interno estável que amortece impactos emocionais externos cotidianos." }
      ],
      challenges: [
        { title: "Tendência à impaciência com os outros", insight: "A velocidade rápida e fluidez da escrita aponta para processos de pensamento muito acelerados, o que pode causar irritabilidade quando os outros operam em ritmos mais calmos." },
        { title: "Propensão à sobrecarga devido a alta ambição", insight: "As ovais grandes e a assinatura imponente sinalizam uma autoexigência imensa e desejo de expansão, elevando os níveis de estresse devido ao acúmulo de responsabilidades." },
        { title: "Risco de parecer excessivamente diretivo em equipes de igual escalão", insight: "Traços finais de palavras curtos ou angulares revelam assertividade aguda que, se não moderada, pode ser percebida como rigidez ou postura mandona." }
      ],
      careerRecommendations: ["Cargos de Liderança Executiva", "Gestão de Projetos e Startups", "Direção Comercial ou de Vendas", "Consultoria Estratégica"]
    },
    en: {
      temperament: { sanguine: 20, choleric: 55, melancholic: 10, phlegmatic: 15 },
      coreTraits: [
        { trait: "Leadership", level: 90, description: "Strong determination and natural ability to coordinate teams and make tough decisions.", indicator: "Large and centered signature, fluid right margin." },
        { trait: "Emotional Stability", level: 75, description: "Resilience in the face of adversity, keeping control in tense situations.", indicator: "Straight and firm baseline with little variation." },
        { trait: "Intellectual Focus", level: 80, description: "Capacity for abstraction and practical reasoning focused on quick results.", indicator: "Medium-sized letters with clean upper stems." },
        { trait: "Sociability", level: 70, description: "Extroverted communication directed towards active influence and persuasion.", indicator: "Handwriting slightly slanted to the right." },
        { trait: "Vital Energy", level: 85, description: "Physical disposition and vigorous firmness of purpose in daily life.", indicator: "Firm and uniform pen pressure." }
      ],
      graphologicalObservations: [
        { feature: "Signature", observed: "Larger than general text, with firm bottom line", psychologicalMeaning: "Strong professional ambition, solid self-confidence, and need for social self-assertion." },
        { feature: "Inclination", observed: "Slanted to the right (Dexter)", psychologicalMeaning: "Future orientation, active search for connections, and ease of emotional expression." },
        { feature: "Line Alignment", observed: "Ascending and firm", psychologicalMeaning: "Entrepreneurial spirit, contagious optimism, enthusiasm, and a good dose of personal ambition." }
      ],
      emotionalState: { anxiety: 30, stress: 45, fatigue: 25, confidence: 90 },
      psychologicalProfile: "The writer demonstrates a psychological profile characterized by high dynamism, innate leadership, and strong creative/active energy. They actively seek a protagonist role and are not intimidated by obstacles. The firmness of the strokes suggests rigid self-discipline and consistency in primary goals.\n\nTheir handwriting reveals excellent coordination between logical thinking and pragmatism, allowing them to convert abstract ideas into efficient operational plans. They exhibit an extroverted and assertive stance in the workspace, though they should watch out for impatience with slower paces.",
      strengths: [
        { title: "Strong decision-making under pressure", insight: "The controlled rigidity of the baseline suggests that in times of crisis, you prioritize cold logic and maintain a resolute stance to act without hesitation." },
        { title: "Achiever spirit and courage", insight: "Firm, ascending strokes reveal high motor energy that actively seeks to overcome challenges, treating obstacles as mere steps to progress." },
        { title: "Excellent communication and influence skills", insight: "The moderate rightward slant indicates an ease of quick interpersonal connection and the ability to guide opinions with enthusiastic energy." },
        { title: "High emotional stability", insight: "The uniformity of pressure and spacing demonstrates a stable inner center that buffers daily external emotional impacts." }
      ],
      challenges: [
        { title: "Tendency towards impatience with others", insight: "The fast speed and fluid writing style point to accelerated thought processes, which can cause irritability when others operate at a calmer pace." },
        { title: "Propensity to overload due to high ambition", insight: "Large ovals and an imposing signature signal high self-demand and a desire for expansion, raising stress levels due to accumulating responsibilities." },
        { title: "Risk of appearing excessively directive in teams", insight: "Short or angular endings of words reveal sharp assertiveness that, if not moderated, can be perceived as rigid or bossy." }
      ],
      careerRecommendations: ["Executive Leadership Roles", "Project Management and Startups", "Sales or Commercial Direction", "Strategic Consulting"]
    }
  },
  thinker: {
    es: {
      temperament: { sanguine: 15, choleric: 10, melancholic: 50, phlegmatic: 25 },
      coreTraits: [
        { trait: "Concentración", level: 95, description: "Enfoque profundo y capacidad de inmersión analítica en problemas complejos por largos períodos.", indicator: "Escritura pequeña, bien espaciada y organizada." },
        { trait: "Estabilidad Emocional", level: 65, description: "Control racional rígido, pero con alta sensibilidad intelectual interna.", indicator: "Letras muy rectas y verticales." },
        { trait: "Enfoque Intelectual", level: 92, description: "Pensamiento científico, inclinación a la investigación, exactitud y rigor metodológico.", indicator: "Hampas verticales limpias, trazos precisos y elegantes." },
        { trait: "Sociabilidad", level: 40, description: "Reservado, prefiere interacciones profundas en pequeños grupos antes que grandes eventos.", indicator: "Espaciado ancho entre palabras." },
        { trait: "Energía Vital", level: 60, description: "Energía mental superior a la física; prefiere la planificación intelectual a la acción impulsiva.", indicator: "Presión del bolígrafo leve, pero muy precisa." }
      ],
      graphologicalObservations: [
        { feature: "Tamaño de Letras", observed: "Pequeño (menos de 2mm)", psychologicalMeaning: "Poder de observación meticulosa, inteligencia analítica, modestia o timidez." },
        { feature: "Inclinación", observed: "Perfectamente vertical", psychologicalMeaning: "Predominio absoluto de la razón sobre el sentimiento, postura objetiva, frialdad o autocontrol extremo." },
        { feature: "Organización", observed: "Márgenes limpios, espaciado armónico", psychologicalMeaning: "Claridad mental, gusto por el orden y la planificación previa, gestión eficiente de tiempo." }
      ],
      emotionalState: { anxiety: 40, stress: 35, fatigue: 30, confidence: 75 },
      psychologicalProfile: "El autor posee una mente extremadamente analítica, detallista y enfocada. Su personalidad es introspectiva y orientada al mundo interno de los conceptos y teorías. Destaca por su precisión milimétrica en todo lo que hace, valorando la exactitud y la honestidad intelectual por encima de todo.\n\nSu escritura revela un fuerte control consciente de sus emociones. Prefiere reflexionar largamente antes de tomar una postura. En términos de dinámica social, valora la privacidad y el respeto mutuo, manteniendo límites saludables y eligiendo amistades profundas basadas en afinidades intelectuales claras.",
      strengths: [
        { title: "Excelente capacidad de análisis y detalle", insight: "La escritura pequeña y organizada indica alta actividad intelectual concentrada, con gran enfoque en la exactitud y rechazo por respuestas superficiales." },
        { title: "Pensamiento independiente y lógico", insight: "Conexiones precisas y espaciado armónico sugieren una mente metódica que analiza datos con independencia de influencias emocionales externas." },
        { title: "Fuerte enfoque y persistencia en tareas complejas", insight: "Letras uniformes y verticales demuestran una autodisciplina impecable para perseverar en problemas que exigen profundo esfuerzo mental." },
        { title: "Calma y objetividad en crisis racionales", insight: "La caligrafía perfectamente vertical indica un autocontrol supremo bajo estrés, manteniendo la racionalidad como brújula principal." }
      ],
      challenges: [
        { title: "Dificultad para expresar emociones abiertamente", insight: "El control rígido demostrado en la verticalidad apunta a un bloqueo en la libre expresión de sentimientos, prefiriendo intelectualizar sus propios dolores." },
        { title: "Tendencia al aislamiento o distanciamiento", insight: "Los espaciados de palabras muy amplios sugieren una necesidad defensiva de privacidad y espacio individual, lo que puede alejar conexiones sociales valiosas." },
        { title: "Perfeccionismo excesivo que puede frenar el progreso", insight: "Trazos extremadamente regulares y calculados revelan un miedo subconsciente a equivocarse, postergando conclusiones en busca de una precisión utópica." }
      ],
      careerRecommendations: ["Investigación Científica y Académica", "Análisis de Datos o Desarrollo de Software", "Ingeniería de Precisión", "Auditoría y Planificación Estratégica"]
    },
    pt: {
      temperament: { sanguine: 15, choleric: 10, melancholic: 50, phlegmatic: 25 },
      coreTraits: [
        { trait: "Concentração", level: 95, description: "Foco profundo e capacidade de imersão analítica em problemas complexos por longos períodos.", indicator: "Escrita pequena, bem espaçada e organizada." },
        { trait: "Estabilidade Emocional", level: 65, description: "Controle racional rígido, mas com alta sensibilidade intelectual interna.", indicator: "Letras muito retas e verticais." },
        { trait: "Foco Intelectual", level: 92, description: "Pensamento científico, inclinação à pesquisa, exatidão e rigor metodológico.", indicator: "Hastes verticais limpas, traços precisos e elegantes." },
        { trait: "Sociabilidade", level: 40, description: "Reservado, prefere interações de profundidade em pequenos grupos ao invés de grandes eventos.", indicator: "Espaçamento largo entre palavras." },
        { trait: "Energia Vital", level: 60, description: "Energia mental superior à física; prefere o planejamento intelectual à ação impulsiva.", indicator: "Pressão de caneta leve, porém muito precisa." }
      ],
      graphologicalObservations: [
        { feature: "Tamanho das Letras", observed: "Pequeno (menos de 2mm)", psychologicalMeaning: "Poder de observação meticulosa, inteligência analítica, modéstia ou timidez." },
        { feature: "Inclinação", observed: "Perfeitamente vertical", psychologicalMeaning: "Predomínio absoluto da razão sobre o sentimento, postura objetiva, frieza ou autocontrole extremo." },
        { feature: "Organização", observed: "Margens limpas, espaçamento harmônico", psychologicalMeaning: "Clareza mental, gosto pela ordem e planejamento prévio, gestão eficiente de tempo." }
      ],
      emotionalState: { anxiety: 40, stress: 35, fatigue: 30, confidence: 75 },
      psychologicalProfile: "O autor possui uma mente extremamente analítica, detalhista e focada. Sua personalidade é introspectiva e voltada para o mundo interno dos conceitos e teorias. Destaca-se pela precisão milimétrica em tudo o que faz, valorizando a exatidão e a honestidade intelectual acima de tudo.\n\nSua escrita revela um forte controle consciente de suas emoções. Prefere refletir longamente antes de se posicionar. Em termos de dinâmica social, valoriza a privacidade e o respeito mútuo, mantendo barreiras saudáveis e elegendo amizades profundas baseadas em afinidades intelectuais claras.",
      strengths: [
        { title: "Excelente capacidade de análise e detalhe", insight: "A escrita pequena e organizada indica alta atividade intelectual concentrada, com grande foco em exatidão e recusa por respostas superficiais." },
        { title: "Pensamento independente e lógico", insight: "Conexões precisas e espaçamento harmônico sugerem uma mente metódica que analisa dados com independência de influências emocionais externas." },
        { title: "Forte foco e persistência em tarefas complexas", insight: "Letras uniformes e verticais demonstram autodisciplina impecável para perseverar em problemas que exigem profundo esforço mental." },
        { title: "Calma e objetividade em crises racionais", insight: "A caligrafia perfeitamente vertical indica autocontrole supremo sob estresse, mantendo a racionalidade como bússola principal." }
      ],
      challenges: [
        { title: "Dificuldade em expressar emoções abertamente", insight: "O controle rígido demonstrado na verticalidade aponta para um bloqueio na livre vazão de sentimentos, preferindo intelectualizar as próprias dores." },
        { title: "Tendência ao isolamento ou distanciamento", insight: "Espaçamentos de palavras muito amplos sugerem uma necessidade defensiva de privacidade e espaço individual, o que pode afastar conexões sociais valiosas." },
        { title: "Perfeccionismo excessivo que pode travar o progresso", insight: "Traços extremamente regulares e calculados revelam um medo subconsciente de errar, postergando conclusões em busca de uma precisão utópica." }
      ],
      careerRecommendations: ["Pesquisa Científica e Acadêmica", "Análise de Dados ou Desenvolvimento de Software", "Engenharia de Precisão", "Auditoria e Planejamento Estratégico"]
    },
    en: {
      temperament: { sanguine: 15, choleric: 10, melancholic: 50, phlegmatic: 25 },
      coreTraits: [
        { trait: "Concentration", level: 95, description: "Deep focus and ability to analytically immerse in complex problems for long periods.", indicator: "Small, well-spaced, and organized handwriting." },
        { trait: "Emotional Stability", level: 65, description: "Rigid rational control, but with high internal intellectual sensitivity.", indicator: "Very straight, vertical letters." },
        { trait: "Intellectual Focus", level: 92, description: "Scientific mindset, inclination towards research, precision, and methodical rigor.", indicator: "Clean vertical stems, precise and elegant strokes." },
        { trait: "Sociability", level: 40, description: "Reserved, prefers deep interactions in small groups over large public events.", indicator: "Wide spacing between words." },
        { trait: "Vital Energy", level: 60, description: "Mental energy superior to physical; prefers intellectual planning over impulsive action.", indicator: "Light but highly precise pen pressure." }
      ],
      graphologicalObservations: [
        { feature: "Letter Size", observed: "Small (under 2mm)", psychologicalMeaning: "Meticulous power of observation, analytical intelligence, modesty, or introversion." },
        { feature: "Inclination", observed: "Perfecty vertical", psychologicalMeaning: "Absolute dominance of reason over feeling, objective stance, coolness, or extreme self-control." },
        { feature: "Organization", observed: "Clean margins, harmonic spacing", psychologicalMeaning: "Mental clarity, taste for order, efficient time and priority management." }
      ],
      emotionalState: { anxiety: 40, stress: 35, fatigue: 30, confidence: 75 },
      psychologicalProfile: "The writer possesses an extremely analytical, detailed, and focused mind. Their personality is introspective and oriented toward the internal world of concepts, systems, and theories. They stand out for milimetric precision, valuing accuracy and intellectual honesty above all.\n\nTheir handwriting reveals strong conscious control over emotions. They prefer to reflect extensively before speaking or acting. In terms of social dynamics, they highly value privacy and mutual respect, maintaining healthy boundaries and choosing deep friendships.",
      strengths: [
        { title: "Outstanding analytical and detail capacity", insight: "Small, organized writing indicates high concentrated intellectual activity, with a strong focus on accuracy and a rejection of superficial answers." },
        { title: "Independent and logical thinking", insight: "Precise connections and harmonic spacing suggest a methodical mind that analyzes data independently of external emotional influences." },
        { title: "Strong focus and persistence on complex tasks", insight: "Uniform, vertical letters demonstrate impeccable self-discipline to persevere in problems that require deep mental effort." },
        { title: "Calm and objective in intellectual crises", insight: "Perfecty vertical handwriting indicates supreme self-control under stress, keeping rationality as the main guide." }
      ],
      challenges: [
        { title: "Difficulty expressing emotions openly", insight: "The rigid control shown in verticality points to a blockade in the free flow of feelings, preferring to intellectualize one's own pain." },
        { title: "Tendency towards isolation or detachment", insight: "Very wide word spacing suggests a defensive need for privacy and individual space, which may alienate valuable social connections." },
        { title: "Excessive perfectionism that can delay progress", insight: "Extremely regular and calculated strokes reveal a subconscious fear of making mistakes, delaying conclusions in search of utopian precision." }
      ],
      careerRecommendations: ["Scientific and Academic Research", "Data Analysis or Software Development", "Precision Engineering", "Auditing and Strategic Planning"]
    }
  },
  artist: {
    es: {
      temperament: { sanguine: 45, choleric: 15, melancholic: 30, phlegmatic: 10 },
      coreTraits: [
        { trait: "Creatividad", level: 95, description: "Pensamiento fuera de la caja, rico mundo imaginativo y fuerte sentido estético/artístico.", indicator: "Letras con formas originales y bucles creativos en la escritura." },
        { trait: "Estabilidad Emocional", level: 50, description: "Sensibilidad fluctuante, alta empatía y humor fuertemente guiado por las inspiraciones actuales.", indicator: "Márgenes irregulares y líneas ligeramente onduladas." },
        { trait: "Enfoque Intelectual", level: 75, description: "Razonamiento intuitivo y holístico, preferencia por lo visual y subjetivo.", indicator: "Letras con conexiones parciales o combinadas." },
        { trait: "Sociabilidad", level: 85, description: "Cálido, receptivo, comunicativo y orientado al intercambio emocional auténtico.", indicator: "Escritura con curvas suaves y óvalos abiertos." },
        { trait: "Energía Vital", level: 70, description: "Motivado por el entusiasmo; trabaja en picos creativos intensos.", indicator: "Presión del bolígrafo dinámica y variable." }
      ],
      graphologicalObservations: [
        { feature: "Forma de Letras", observed: "Curvilínea y estilizada", psychologicalMeaning: "Sensibilidad artística, amabilidad, facilidad de adaptación social y prevención de la rigidez mecánica." },
        { feature: "Espaciado", observed: "Irregular y espacioso", psychologicalMeaning: "Fluidez de imaginación, necesidad de libertad de movimientos y aversión a rutinas rígidas." },
        { feature: "Firma", observed: "Estilizada y muy original", psychologicalMeaning: "Fuerte identidad personal, deseo de dejar una marca estética o creadora auténtica en el mundo." }
      ],
      emotionalState: { anxiety: 50, stress: 40, fatigue: 35, confidence: 80 },
      psychologicalProfile: "El autor presenta un perfil psicológico marcado por una imaginación exuberante, rica sensibilidad estética y profundo sentido creativo. Se trata de una persona receptiva a las bellezas y matices del entorno, cuyo bienestar emocional está íntimamente ligado a la libertad de expresión personal.\n\nSu caligrafía curva y expresiva sugiere un carácter afectuoso, cálido y contrario a la monotonía burocrática. Actúa motivado por la inspiración y el entusiasmo, lo que puede generar oscilaciones de enfoque, pero también garantiza creaciones de alto impacto y originalidad refinada en las actividades elegidas.",
      strengths: [
        { title: "Excepcional capacidad creativa y estética", insight: "Trazos curvilíneos originales y bucles dinámicos expresan una imaginación rica y una inclinación natural para ver el mundo a través de prismas originales e innovadores." },
        { title: "Forte empatía y facilidad de sintonía", insight: "Las formas abiertas y los óvalos suaves indican una receptividad social cálida, escuchando y conectando profundamente con los sentimientos de los demás." },
        { title: "Pensamiento holístico e intuición aguda", insight: "Conexiones parciales o combinadas entre las letras revelan que unes lógica e intuición en fracciones de segundo, encontrando soluciones innovadoras." },
        { title: "Flexibilidad y adaptabilidad", insight: "Líneas ligeramente onduladas y márgenes irregulares señalan capacidad de improvisación rápida y armonía en entornos cambiantes." }
      ],
      challenges: [
        { title: "Dificultad con rutinas rígidas y burocracia", insight: "El espaciado libre y flotante demuestra aversión a los procesos puramente mecánicos, que ahogan su energía creativa y generan un aburrimiento rápido." },
        { title: "Vulnerabilidad a fluctuaciones del estado de ánimo", insight: "Presiones variables de escritura e inclinación oscilante apuntan a una sensibilidad aguda, donde factores ambientales sutiles afectan su ánimo diario." },
        { title: "Dificultad para organizar tareas muy metódicas", insight: "La asimetría general sugiere menor preocupación por los detalles del protocolo formal, prefiriendo la visión macro sobre los microcontroles estructurados." }
      ],
      careerRecommendations: ["Diseño Gráfico, Moda o Diseño Web", "Artes Visuales, Música o Escritura Creativa", "Marketing, Publicidad y Branding", "Arquitectura y Decoración de Interiores"]
    },
    pt: {
      temperament: { sanguine: 45, choleric: 15, melancholic: 30, phlegmatic: 10 },
      coreTraits: [
        { trait: "Criatividade", level: 95, description: "Pensamento fora da caixa, rico mundo imaginativo e forte senso estético/artístico.", indicator: "Letras com formas originais e laços criativos na escrita." },
        { trait: "Estabilidade Emocional", level: 50, description: "Sensibilidade flutuante, alta empatia e humor fortemente guiado pelas inspirações atuais.", indicator: "Margens irregulares e linhas ligeiramente onduladas." },
        { trait: "Foco Intelectual", level: 75, description: "Raciocínio intuitivo e holístico, preferência pelo visual e subjetivo.", indicator: "Letras com conexões parciais ou combinadas." },
        { trait: "Sociabilidade", level: 85, description: "Caloroso, receptivo, comunicativo e voltado para a troca emocional autêntica.", indicator: "Escrita com curvas macias e ovais abertas." },
        { trait: "Energia Vital", level: 70, description: "Motivado pelo entusiasmo; trabalha em picos criativos intensos.", indicator: "Pressão de caneta dinâmica e variável." }
      ],
      graphologicalObservations: [
        { feature: "Forma das Letras", observed: "Curvilínea e estilizada", psychologicalMeaning: "Sensibilidade artística, gentileza, facilidade de adaptação social e prevenção à rigidez mecânica." },
        { feature: "Espaçamento", observed: "Irregular e espaçoso", psychologicalMeaning: "Fluidez de imaginação, necessidade de liberdade de movimentos e aversão a rotinas rígidas." },
        { feature: "Assinatura", observed: "Estilizada e muito original", psychologicalMeaning: "Forte identidade pessoal, desejo de deixar uma marca estética ou criativa autêntica no mundo." }
      ],
      emotionalState: { anxiety: 50, stress: 40, fatigue: 35, confidence: 80 },
      psychologicalProfile: "O autor apresenta um perfil psicológico marcado por uma imaginação exuberante, rica sensibilidade estética e profundo senso criativo. Trata-se de uma pessoa receptiva às belezas e nuances do ambiente, cujo bem-estar emocional está intimamente ligado à liberdade de expressão pessoal.\n\nSua caligrafia curva e expressiva sugere um caráter afetuoso, caloroso e avesso à monotonia burocrática. Age movido pela inspiração e pelo entusiasmo, o que pode gerar oscilações de foco, mas também garante criações de alto impacto e originalidade refinada nas atividades escolhidas.",
      strengths: [
        { title: "Excepcional capacidade criativa e estética", insight: "Traços curvilíneos originais e laços dinâmicos expressam uma imaginação rica e uma inclinação natural para ver o mundo por prismas originais e belos." },
        { title: "Forte empatia e facilidade de rapport", insight: "As formas abertas e ovais macias indicam receptividade social calorosa, ouvindo e se conectando profundamente com o sentimento alheio." },
        { title: "Pensamento holístico e intuição aguçada", insight: "Conexões parciais ou combinadas entre as letras revelam que você une lógica e intuição em frações de segundos, encontrando soluções inovadoras." },
        { title: "Flexibilidade e adaptabilidade", insight: "Linhas ligeiramente onduladas e margens irregulares sinalizam capacidade de improviso rápido e harmonia em ambientes mutáveis." }
      ],
      challenges: [
        { title: "Dificuldade com rotinas rígidas e burocracia", insight: "O espaçamento solto e flutuante demonstra aversão a processos puramente mecânicos, que sufocam sua energia criativa e geram tédio rápido." },
        { title: "Vulnerabilidade a flutuações de humor", insight: "Pressões variáveis de escrita e inclinação oscilante apontam para uma sensibilidade aguçada, onde fatores ambientais sutis afetam seu ânimo diário." },
        { title: "Dificuldade para organizar tarefas altamente metódicas", insight: "A assimetria geral sugere menor preocupação com detalhes de protocolo formal, preferindo a visão macro em detrimento de micro-controles estruturados." }
      ],
      careerRecommendations: ["Design Gráfico, Moda ou Web Design", "Artes Visuais, Música ou Escrita Criativa", "Marketing, Publicidade e Branding", "Arquitetura e Decoração de Interiores"]
    },
    en: {
      temperament: { sanguine: 45, choleric: 15, melancholic: 30, phlegmatic: 10 },
      coreTraits: [
        { trait: "Creativity", level: 95, description: "Out-of-the-box thinking, rich imaginative world, and strong aesthetic/artistic sense.", indicator: "Original letter shapes and creative loops in writing." },
        { trait: "Emotional Stability", level: 50, description: "Fluctuating sensitivity, high empathy, and mood heavily guided by current inspirations.", indicator: "Irregular margins and slightly wavy lines." },
        { trait: "Intellectual Focus", level: 75, description: "Intuitive and holistic reasoning, preference for visual and subjective aspects.", indicator: "Letters with partial or mixed connections." },
        { trait: "Sociability", level: 85, description: "Warm, receptive, communicative, and focused on authentic emotional exchange.", indicator: "Handwriting with soft curves and open ovals." },
        { trait: "Vital Energy", level: 70, description: "Driven by enthusiasm; works in intense creative bursts.", indicator: "Dynamic and variable pen pressure." }
      ],
      graphologicalObservations: [
        { feature: "Letter Shape", observed: "Curved and stylized", psychologicalMeaning: "Artistic sensitivity, kindness, ease of social adaptation, and rejection of mechanical rigidity." },
        { feature: "Spacing", observed: "Irregular and spacious", psychologicalMeaning: "Fluidity of imagination, need for freedom of movement, and aversion to strict routines." },
        { feature: "Signature", observed: "Stylized and highly original", psychologicalMeaning: "Strong personal identity, desire to leave an authentic aesthetic or creative mark on the world." }
      ],
      emotionalState: { anxiety: 50, stress: 40, fatigue: 35, confidence: 80 },
      psychologicalProfile: "The writer presents a psychological profile marked by exuberant imagination, rich aesthetic sensitivity, and a profound creative sense. They are highly receptive to the beauty and nuances of their surroundings, and their emotional well-being is tightly linked to freedom of self-expression.\n\nTheir curved and expressive handwriting suggests an affectionate, warm character who dislikes bureaucratic monotony. They act on inspiration and enthusiasm, which can lead to focus fluctuations but guarantees high-impact creations of refined originality.",
      strengths: [
        { title: "Exceptional creative and aesthetic ability", insight: "Original curvilinear strokes and dynamic loops express a rich imagination and a natural inclination to view the world through beautiful, novel lenses." },
        { title: "Strong empathy and natural rapport with others", insight: "Open shapes and soft ovals indicate a warm social receptivity, listening and connecting deeply with the feelings of others." },
        { title: "Holistic thinking and sharp intuition", insight: "Partial or combined connections between letters reveal that you merge logic and intuition in split seconds, finding innovative solutions." },
        { title: "High flexibility and adaptability", insight: "Slightly wavy lines and irregular margins signal quick improvisation and ease of operation in changing environments." }
      ],
      challenges: [
        { title: "Difficulty with tight routines and bureaucracy", insight: "Loose and floating spacing demonstrates an aversion to purely mechanical processes, which suffocate your creative energy and trigger quick boredom." },
        { title: "Vulnerability to mood/motivation swings", insight: "Variable writing pressure and oscillating slant point to sharp sensitivity, where subtle environmental factors easily impact your daily spirits." },
        { title: "Hard time organizing highly methodical tasks", insight: "General asymmetry suggests less concern with formal protocol details, preferring the macro vision over structured micro-controls." }
      ],
      careerRecommendations: ["Graphic Design, Fashion, or Web Design", "Visual Arts, Music, or Creative Writing", "Marketing, Advertising, and Branding", "Architecture and Interior Design"]
    }
  }
};

export default function App() {
  const [language, setLanguage] = useState<"es" | "pt" | "en">("es");
  const [mainView, setMainView] = useState<"analyzer" | "blog">("analyzer");
  const [activeTab, setActiveTab] = useState<"canvas" | "upload" | "guided">("canvas");
  
  // Google AdSense settings states
  const [adsensePubId, setAdsensePubId] = useState<string>(() => {
    return localStorage.getItem("graphostudio_adsense_pub_id") || "";
  });
  const [adsenseSlotId, setAdsenseSlotId] = useState<string>(() => {
    return localStorage.getItem("graphostudio_adsense_slot_id") || "";
  });
  const [adsenseShowPlaceholders, setAdsenseShowPlaceholders] = useState<boolean>(() => {
    const saved = localStorage.getItem("graphostudio_adsense_show_placeholders");
    return saved !== null ? saved === "true" : true;
  });
  const [showAdSenseModal, setShowAdSenseModal] = useState(false);

  // Dynamically load Google AdSense client script when publisher ID is configured
  useEffect(() => {
    if (adsensePubId && adsensePubId.trim().startsWith("ca-pub-")) {
      const pubId = adsensePubId.trim();
      // Remove any existing script to avoid duplication or conflicts
      const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, [adsensePubId]);

  // Inputs
  const [canvasImage, setCanvasImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [guidedAnswers, setGuidedAnswers] = useState<GuidedAnswers | null>(null);
  const [manualText, setManualText] = useState("");
  
  // Report state
  const [report, setReport] = useState<AnalysisReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // Persistent blinking visitor counter state
  const [visitorCount, setVisitorCount] = useState<number>(() => {
    const saved = localStorage.getItem("graphostudio_visitor_count");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    // Set a high, highly realistic and professional seed count
    const seed = 14824;
    localStorage.setItem("graphostudio_visitor_count", seed.toString());
    return seed;
  });

  const [activeUsers, setActiveUsers] = useState<number>(() => Math.floor(Math.random() * 8) + 6); // Starts at a nice number 6-14

  useEffect(() => {
    // Increment visitor count slowly to feel live and authentic
    const visitorInterval = setInterval(() => {
      setVisitorCount(prev => {
        const next = prev + (Math.random() > 0.6 ? 1 : 0);
        localStorage.setItem("graphostudio_visitor_count", next.toString());
        return next;
      });
    }, 15000);

    // Fluctuate active users slightly to look authentic
    const activeInterval = setInterval(() => {
      setActiveUsers(prev => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const next = Math.max(4, Math.min(25, prev + delta));
        return next;
      });
    }, 6000);

    return () => {
      clearInterval(visitorInterval);
      clearInterval(activeInterval);
    };
  }, []);

  // Translation Dictionary
  const t = {
    es: {
      appName: "Grafología Pop",
      appSlogan: "¡Descubrí tu verdadera personalidad! ✨",
      appSub: "¡Escribí una frase y/o estampá tu firma en la pantalla, subí una foto de tus trazos o respondé un cuestionario rápido para revelar tu personalidad, temperamento y energía al instante! 🌟✨",
      languageLabel: "Español",
      inputSectionTitle: "1. ¡Probá ahora mismo! 👇",
      inputSectionSub: "Elegí la opción que más te guste para analizar tus trazos o probá una demostración al toque:",
      tabPresets: "Muestras Listas",
      tabCanvas: "Escribir Firma y/o Frase",
      tabUpload: "Subir Firma y/o Frase",
      tabGuided: "Cuestionario Rápido",
      
      canvasTabTitle: "🎨 ¡Escribí o Dibujá tu Firma y/o Frase acá!",
      canvasTabDesc: "Usá tu dedo, mouse o lápiz para firmar y/o escribir una frase corta de tu puño y letra. ¡Nuestro sistema va a analizar el estilo de tus trazos en dos patadas!",
      
      uploadTabTitle: "📸 Subí una Foto de tu Firma y/o Frase",
      uploadTabDesc: "Sacale una foto nítida a cualquier hoja donde hayas estampado tu firma, escrito una frase o ambas de tu puño y letra. ¡Subila acá para revelar tus secretos!",
      
      guidedTabTitle: "📝 Cuestionario Copado (Sin Foto)",
      guidedTabDesc: "Respondé unas preguntas rápidas sobre cómo es tu caligrafía habitual y descubrí tu perfil al instante.",
      
      presetsTabTitle: "🎭 ¡Elegí un Perfil para Jugar!",
      presetsTabDesc: "Seleccioná una de las firmas y muestras listas para ver cómo funciona el panel interactivo en un segundo. ¡Está buenísimo!",
      
      presetLeader: "Perfil Líder Determinado",
      presetThinker: "Perfil Pensador Curioso",
      presetArtist: "Perfil Creativo Libre",
      
      optAdditionalContext: "¿Algún detalle extra sobre cómo te sentís hoy? (opcional):",
      placeholderContext: "Ej: 'Escribí esto re apurado' o 'Quiero saber si mi firma muestra creatividad'...",
      
      btnAnalyze: "✨ ¡Analizá mi Letra Ahora!",
      btnAnalyzing: "✨ Analizando tu letra...",
      btnNoSampleError: "Por favor, dibujá en el lienzo o subí una imagen antes de analizar.",
      
      resultsTitle: "⚡ ¡Tu Informe!",
      resultsSub: "Descubrí lo que tus trazos dicen de tu forma de ser, tus energías y tus superpoderes ocultos.",
      
      cardProfileTitle: "📝 Quién sos realmente (Tu Perfil)",
      cardTemperamentTitle: "🔥 Tu Temperamento Dominante",
      cardTraitsTitle: "📊 Tus Rasgos de Personalidad",
      cardObservationsTitle: "🔍 Detalles Curiosos de tus Trazos",
      cardEmotionalTitle: "⚡ Tu Energía y Estado Emocional",
      cardStrengthsTitle: "⭐ Tus Superpoderes (Fortalezas)",
      cardChallengesTitle: "⚠️ Tus Desafíos de Crecimiento",
      cardCareerTitle: "💼 Tus Profesiones Ideales",
      
      thFeature: "¿Qué analizamos?",
      thObserved: "Tu Estilo",
      thMeaning: "Lo que significa",
      
      temperamentDesc: "Basado en los temperamentos clásicos para conocer tu energía interna principal de una forma divertida.",
      traitDesc: "Medición estimativa de tu sociabilidad, curiosidad intelectual y nivel de autocontrol.",
      observationDesc: "Detalles curiosos detectados en tus trazos analizados por el ojo clínico del sistema.",
      emotionalDesc: "Una mirada a cómo te sentís hoy a través de la presión, forma e inclinación de tus trazos.",
      
      sanguine: "Sanguíneo (Aventurero)",
      choleric: "Colérico (Enérgico)",
      melancholic: "Melancólico (Detallista)",
      phlegmatic: "Flemático (Pacífico)",
      
      anxiety: "Tensión / Estrés",
      stress: "Nivel de Presión",
      fatigue: "Cansancio",
      confidence: "Confianza en vos",
      
      alertHeader: "💡 Nota de configuración",
      alertBody: "Para realizar análisis automáticos avanzados, configurá tu clave GEMINI_API_KEY en Ajustes. ¡O usá los Perfiles de Muestra para jugar ya mismo! 🎮",
      apiKeyNotice: "Aviso de API"
    },
    pt: {
      appName: "GraphoStudio",
      appSlogan: "Estúdio de Análise Psicografológica",
      appSub: "Descubra traços profundos de personalidade, temperamento hipocrático, forças, desafios e estado emocional analisando cientificamente a caligrafia com a inteligência do Gemini 3.5.",
      languageLabel: "English",
      inputSectionTitle: "1. Forneça uma amostra de escrita",
      inputSectionSub: "Escolha o método mais confortável para capturar os traços da escrita:",
      tabPresets: "Demonstrações Prontas",
      tabCanvas: "Desenhar/Escrever na Tela",
      tabUpload: "Enviar Foto/Imagem",
      tabGuided: "Mapeamento Guiado (Sem Imagem)",
      
      canvasTabTitle: "Escreva na Tela Interativa",
      canvasTabDesc: "Use o mouse, caneta digitalizadora ou o dedo no smartphone para escrever uma pequena frase e assine. A IA analisará o desenho dos seus traços.",
      
      uploadTabTitle: "Envie uma Amostra Escrita",
      uploadTabDesc: "Tire uma foto nítida de uma folha manuscrita assinada e envie aqui. Certifique-se de que a caligrafia esteja em foco com boa iluminação.",
      
      guidedTabTitle: "Questionário Grafológico Guiado",
      guidedTabDesc: "Se não puder desenhar ou enviar uma imagem, responda às perguntas técnicas sobre os traços mais comuns da sua caligrafia habitual.",
      
      presetsTabTitle: "Amostras Clínicas Prontas",
      presetsTabDesc: "Selecione um dos perfis pré-analisados para testar o painel visual de indicadores imediatamente e descobrir como a ciência psicografológica funciona.",
      
      presetLeader: "Perfil Líder Determinado",
      presetThinker: "Perfil Pensador Analítico",
      presetArtist: "Perfil Artista Criativo",
      
      optAdditionalContext: "Contexto adicional ou perguntas que queira responder na análise (opcional):",
      placeholderContext: "Ex: 'Esta caligrafia foi feita sob pressa' ou 'Quero focar em saber sobre minha ansiedade profissional'...",
      
      btnAnalyze: "Iniciar Análise Grafológica",
      btnAnalyzing: "Processando Escrita com Gemini...",
      btnNoSampleError: "Por favor, escreva no quadro ou insira uma imagem antes de analisar.",
      
      resultsTitle: "2. Laudo Psicográfico e Painel de Indicadores",
      resultsSub: "Relatório gerado dinamicamente relacionando os traços psicofisiológicos com a estrutura cognitiva do autor.",
      
      cardProfileTitle: "Síntese do Perfil Psicológico",
      cardTemperamentTitle: "Distribuição dos Temperamentos Hipocráticos",
      cardTraitsTitle: "Intensidade dos Traços de Personalidade",
      cardObservationsTitle: "Análise Micro-Grafológica",
      cardEmotionalTitle: "Indicadores de Estado Emocional Atual",
      cardStrengthsTitle: "Pontos Fortes Identificados",
      cardChallengesTitle: "Desafios & Zonas de Alerta",
      cardCareerTitle: "Direções de Carreira Recomendadas",
      
      thFeature: "Eixo Analisado",
      thObserved: "Traço Observado",
      thMeaning: "Significado Psicológico",
      
      temperamentDesc: "Baseado na teoria clássica hipocrática adaptada para a psicofisiologia grafológica moderna.",
      traitDesc: "Avaliação quantitativa da intensidade dos traços intelectuais, sociais e de controle da personalidade.",
      observationDesc: "Mapeamento anatômico de traços físicos específicos da caligrafia correlacionados a traços psicológicos catalogados.",
      emotionalDesc: "Estimativa reflexiva do estado de espírito de curto prazo, influenciado pelo calibre e uniformidade da pressão.",
      
      sanguine: "Sanguíneo",
      choleric: "Colérico",
      melancholic: "Melancólico",
      phlegmatic: "Fleumático",
      
      anxiety: "Ansiedade/Tensão",
      stress: "Estresse Geral",
      fatigue: "Fadiga Física",
      confidence: "Autoconfiança",
      
      alertHeader: "Configuração do Sistema",
      alertBody: "Para realizar análises dinâmicas de novas fotos ou desenhos com Inteligência Artificial, configure sua chave no painel do AI Studio.",
      apiKeyNotice: "Aviso de API"
    },
    en: {
      appName: "GraphoStudio",
      appSlogan: "Psychographology Analysis Studio",
      appSub: "Discover deep personality traits, Hippocratic temperaments, strengths, challenges, and emotional states by scientifically analyzing handwriting with Gemini 3.5 AI.",
      languageLabel: "Português",
      inputSectionTitle: "1. Provide a Handwriting Sample",
      inputSectionSub: "Choose the most convenient method to capture writing style characteristics:",
      tabPresets: "Pre-loaded Profiles",
      tabCanvas: "Write on Interactive Screen",
      tabUpload: "Upload Photo/Image",
      tabGuided: "Guided Assessment (No Image)",
      
      canvasTabTitle: "Write on the Interactive Board",
      canvasTabDesc: "Use your mouse, digital pen, or touch screen to write a short sentence and sign your name. The AI will evaluate your physical stroke dynamics.",
      
      uploadTabTitle: "Upload a Handwriting Sample",
      uploadTabDesc: "Take a clear, well-lit photo of a handwritten document and upload it here. Ensure the writing is sharp and in focus.",
      
      guidedTabTitle: "Guided Graphology Questionnaire",
      guidedTabDesc: "If you cannot draw or upload an image, answer technical questions about the key physical traits of your usual handwriting style.",
      
      presetsTabTitle: "Pre-analyzed Clinical Samples",
      presetsTabDesc: "Select one of the pre-analyzed profiles to instantly explore the visual indicators dashboard and see how psychographology science works.",
      
      presetLeader: "Driven Leader Profile",
      presetThinker: "Analytical Thinker Profile",
      presetArtist: "Creative Artist Profile",
      
      optAdditionalContext: "Additional context or specific questions for the analysis (optional):",
      placeholderContext: "e.g., 'This handwriting was done in a hurry' or 'I want to focus on my professional anxiety levels'...",
      
      btnAnalyze: "Run Graphology Analysis",
      btnAnalyzing: "Analyzing Handwriting with Gemini...",
      btnNoSampleError: "Please write on the canvas or upload an image before analyzing.",
      
      resultsTitle: "2. Psychographic Report & Indicators Dashboard",
      resultsSub: "Dynamically generated report correlating psycho-physiological hand movements with cognitive and emotional structures.",
      
      cardProfileTitle: "Psychological Profile Synthesis",
      cardTemperamentTitle: "Hippocratic Temperament Distribution",
      cardTraitsTitle: "Personality Traits Intensity",
      cardObservationsTitle: "Micro-Graphological Analysis",
      cardEmotionalTitle: "Current Emotional State Indicators",
      cardStrengthsTitle: "Identified Strengths & Talents",
      cardChallengesTitle: "Challenges & Growth Zones",
      cardCareerTitle: "Recommended Career Directions",
      
      thFeature: "Analyzed Feature",
      thObserved: "Observed Detail",
      thMeaning: "Psychological Meaning",
      
      temperamentDesc: "Based on classical Hippocratic theory adapted to modern grapho-physiological research.",
      traitDesc: "Quantitative rating of intellectual, social, and personal control constructs.",
      observationDesc: "Anatomical mapping of physical writing traits correlated to certified psychological meanings.",
      emotionalDesc: "Reflective estimation of short-term state-of-mind, influenced by stroke caliber and pressure fluctuations.",
      
      sanguine: "Sanguine",
      choleric: "Choleric",
      melancholic: "Melancholic",
      phlegmatic: "Phlegmatic",
      
      anxiety: "Anxiety/Tension",
      stress: "General Stress",
      fatigue: "Physical Fatigue",
      confidence: "Self-Confidence",
      
      alertHeader: "System Settings",
      alertBody: "To perform real-time, custom AI analyses on new handwriting images or canvas drawings, configure your GEMINI_API_KEY in Settings > Secrets.",
      apiKeyNotice: "API Key Note"
    }
  }[language];

  // Helper to change preset
  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setReport(PRESET_SAMPLES[presetKey][language]);
  };

  // Change Language & translate active state
  const changeLanguage = (nextLang: "es" | "pt" | "en") => {
    setLanguage(nextLang);
    // Translate the active report as well if it's one of the presets
    if (selectedPreset && PRESET_SAMPLES[selectedPreset]) {
      setReport(PRESET_SAMPLES[selectedPreset][nextLang]);
    }
  };

  // Run Gemini analysis through our local full-stack server
  const runAnalysis = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    let payload: any = {};

    if (activeTab === "canvas") {
      if (!canvasImage) {
        setErrorMsg(t.btnNoSampleError);
        setIsLoading(false);
        return;
      }
      payload = { image: canvasImage, description: manualText, language };
    } else if (activeTab === "upload") {
      if (!uploadedImage) {
        setErrorMsg(t.btnNoSampleError);
        setIsLoading(false);
        return;
      }
      payload = { image: uploadedImage, description: manualText, language };
    } else if (activeTab === "guided") {
      if (!guidedAnswers) {
        setErrorMsg(language === "pt" ? "Por favor, conclua o questionário guiado de 8 perguntas antes." : "Please complete the 8-question guided survey first.");
        setIsLoading(false);
        return;
      }
      const formattedAnswers = Object.entries(guidedAnswers)
        .map(([key, val]) => `- ${key}: ${val}`)
        .join("\n");
      const fullDesc = `Pesquisa Guiada Respondida pelo Usuário:\n${formattedAnswers}\n\nContexto extra: ${manualText}`;
      payload = { description: fullDesc, language };
    } else {
      // Presets
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro de servidor ao processar amostra.");
      }

      const data: AnalysisReportData = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Não foi possível conectar ao servidor de análise. Verifique sua chave API do Gemini nas configurações.");
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare data for Recharts Temperament Pie Chart
  const temperamentData = report ? [
    { name: t.sanguine, value: report.temperament.sanguine, color: "#e11d48" }, // Rose
    { name: t.choleric, value: report.temperament.choleric, color: "#f59e0b" },  // Amber
    { name: t.melancholic, value: report.temperament.melancholic, color: "#4f46e5" }, // Indigo
    { name: t.phlegmatic, value: report.temperament.phlegmatic, color: "#0d9488" }  // Teal
  ] : [];

  // Prepare data for Recharts Core Traits Bar Chart
  const traitsData = report ? report.coreTraits.map(t => ({
    name: t.trait,
    level: t.level,
    indicator: t.indicator
  })) : [];

  // Prepare data for Emotional State Radial/Bar
  const emotionalData = report ? [
    { name: t.anxiety, score: report.emotionalState.anxiety, fill: "#e11d48" },
    { name: t.stress, score: report.emotionalState.stress, fill: "#f59e0b" },
    { name: t.fatigue, score: report.emotionalState.fatigue, fill: "#64748b" },
    { name: t.confidence, score: report.emotionalState.confidence, fill: "#10b981" }
  ] : [];

  // Reusable component to render Google AdSense ad units or elegant visual placeholders
  const AdSenseBanner = ({ slot, className = "" }: { slot: string; className?: string }) => {
    if (adsensePubId && adsensePubId.trim().startsWith("ca-pub-")) {
      const pubId = adsensePubId.trim();
      return (
        <div className={`w-full overflow-hidden flex justify-center py-2 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 ${className}`}>
          <div className="w-full max-w-lg min-h-[90px] flex flex-col items-center justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client={pubId}
              data-ad-slot={slot || adsenseSlotId || "default"}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
            <script>
              {`(adsbygoogle = window.adsbygoogle || []).push({});`}
            </script>
          </div>
        </div>
      );
    }

    if (!adsenseShowPlaceholders) return null;

    return (
      <div 
        onClick={() => setShowAdSenseModal(true)}
        className={`w-full p-4 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 dark:from-amber-400/2 dark:to-yellow-400/2 rounded-2xl border-2 border-dashed border-amber-400/30 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-400 cursor-pointer transition-all duration-300 relative overflow-hidden group/ad ${className}`}
      >
        <div className="absolute top-0 right-0 p-1 bg-amber-400/10 text-amber-600 dark:text-amber-400 rounded-bl-xl text-[8px] font-black tracking-wider uppercase">
          Google AdSense Space
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-500 flex items-center justify-center shrink-0">
              <span className="text-lg">🪙</span>
            </div>
            <div>
              <h5 className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                {language === "es" ? "Anuncio Google AdSense" : language === "pt" ? "Espaço Publicitário AdSense" : "AdSense Advertisement Unit"}
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                {language === "es" 
                  ? "Esta sección mostrará publicidad real cuando asocies tu código de AdSense sin tocar programación." 
                  : language === "pt" 
                  ? "Esta seção exibirá anúncios reais assim que você conectar seu código do AdSense aqui." 
                  : "This space will display real ads once you link your AdSense code without editing any files."}
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-white dark:text-amber-300 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-xs border border-amber-400/10 transition-all shrink-0 group-hover/ad:scale-105"
          >
            {language === "es" ? "Configurar" : language === "pt" ? "Configurar" : "Configure"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      <VibrantBackground />
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/10">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                {t.appName}
                <span className="text-[10px] uppercase font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded-sm">
                  v3.5
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t.appSlogan}
              </p>
            </div>
          </div>

          {/* Centered navigation menu for mobile and desktop */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-xs font-bold border border-slate-200/40 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMainView("analyzer")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                mainView === "analyzer"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
              }`}
            >
              {language === "es" ? "Analizador" : language === "pt" ? "Analisador" : "Analyzer"}
            </button>
            <button
              type="button"
              onClick={() => setMainView("blog")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 sm:gap-1.5 ${
                mainView === "blog"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white" />
              {language === "es" ? "Blog" : language === "pt" ? "Blog" : "Blog"}
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Google AdSense Configuration Panel Button */}
            <button
              type="button"
              onClick={() => setShowAdSenseModal(true)}
              className="p-1.5 sm:p-2 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/45 rounded-xl text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              title={language === "es" ? "Ajustes de Publicidad Google AdSense" : language === "pt" ? "Ajustes de Publicidade AdSense" : "Google AdSense Settings"}
            >
              <span className="text-sm">🪙</span>
              <span className="hidden sm:inline font-extrabold tracking-wide text-[10px] uppercase">
                {language === "es" ? "Monetizar" : language === "pt" ? "AdSense" : "AdSense"}
              </span>
            </button>

            <Globe className="w-4 h-4 text-indigo-500 shrink-0 hidden md:block" />
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-[11px] sm:text-xs font-bold gap-0.5 sm:gap-1 border border-slate-200/40 dark:border-slate-800">
              <button
                type="button"
                onClick={() => changeLanguage("es")}
                className={`px-2 sm:px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  language === "es"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
                }`}
              >
                <span className="hidden sm:inline">Español</span>
                <span className="inline sm:hidden">ES</span>
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("pt")}
                className={`px-2 sm:px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  language === "pt"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
                }`}
              >
                <span className="hidden sm:inline">Português</span>
                <span className="inline sm:hidden">PT</span>
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`px-2 sm:px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  language === "en"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
                }`}
              >
                <span className="hidden sm:inline">English</span>
                <span className="inline sm:hidden">EN</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Navigation Tabs for mobile/desktop to switch views */}
        <div className="flex justify-center -mb-2">
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-sm w-full grid grid-cols-2">
            <button
              type="button"
              onClick={() => setMainView("analyzer")}
              className={`py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                mainView === "analyzer"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              {language === "es" ? "Analizador" : language === "pt" ? "Analisador" : "Analyzer"}
            </button>
            <button
              type="button"
              onClick={() => setMainView("blog")}
              className={`py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                mainView === "blog"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {language === "es" ? "Blog" : language === "pt" ? "Blog" : "Blog"}
            </button>
          </div>
        </div>

        {mainView === "analyzer" && (
          <>
            {/* Welcome Section */}
            <section className="text-center max-w-3xl mx-auto mt-2" id="hero-welcome">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full mb-3 border border-indigo-100 dark:border-indigo-900">
            <Sparkles className="w-3.5 h-3.5" />
            {language === "es" ? "🎉 ¡Test de Personalidad Grafológica Divertido!" : language === "pt" ? "Psicologia Científica & Perícia Grafotécnica" : "Scientific Handwriting Analysis & Personality Profiling"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {language === "es" ? (
              <span className="inline-flex items-center gap-2 justify-center flex-wrap">
                <span className="animate-blink-yellow-orange">Qué revela tu letra acerca de tu personalidad</span>
              </span>
            ) : language === "pt" ? (
              "Sua Caligrafia Revela Quem Você É"
            ) : (
              "Your Handwriting Reveals Who You Are"
            )}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
            {t.appSub}
          </p>
          <div className="mt-4.5 flex justify-center">
            <button
              onClick={() => setMainView("blog")}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 px-4.5 py-2.5 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/80 cursor-pointer transition-all shadow-xs group"
            >
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>
                {language === "es"
                  ? "📚 ¡Nuevo! Visitá nuestro Blog de Grafología Científica"
                  : language === "pt"
                  ? "📚 Novo! Visite o nosso Blog de Grafologia Científica"
                  : "📚 New! Visit our Scientific Graphology Blog"}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        <AdSenseBanner slot="header-top-banner" className="max-w-3xl mx-auto mt-2" />

        {/* Action Panel Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
          
          {/* LEFT: Input Methods (5 cols on large screens) */}
          <div className="lg:col-span-5 flex flex-col gap-6" id="input-column">
            
            {/* Writing Instructions Guide */}
            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3.5 relative overflow-hidden group/instr">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
              <div className="flex items-center justify-between" id="instructions-header">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {language === "es" ? "🎮 ¿Cómo funciona el juego?" : language === "pt" ? "📋 Instruções de Escrita" : "📋 Writing Guidelines"}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {language === "es" ? "¡Descubrí tu perfil en 3 sencillos pasos!" : language === "pt" ? "Para uma análise grafológica precisa" : "For accurate graphological profiling"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-col gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {language === "es" ? (
                  <ul className="flex flex-col gap-3">
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white text-[11px]">
                          ¡Escribí o Dibujá! ✏️
                        </strong>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                          Usá el lienzo táctil de acá abajo para estampar tu firma y/o escribir una frase, o hacelo en un papel físico.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white text-[11px]">
                          ¡Subí tu Foto o Elegí! 📸
                        </strong>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                          Subí una foto nítida de tu firma y/o frase escrita, respondé el cuestionario rápido, o usá un perfil de muestra para jugar ya mismo.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white text-[11px]">
                          ¡Mirá tus Resultados! 📊
                        </strong>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                          Nuestro sistema va a leer tus trazos para revelarte secretos de personalidad, temperamento y profesión ideal de forma científica.
                        </p>
                      </div>
                    </li>
                  </ul>
                ) : (
                  <>
                    <p className="text-[11px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                      {language === "pt" 
                        ? "Siga estas diretrizes científicas antes de enviar ou desenhar sua amostra:" 
                        : "Follow these scientific requirements before drawing or uploading your sample:"}
                    </p>
                    
                    <ul className="flex flex-col gap-2.5">
                      <li className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <div>
                          <strong className="text-slate-900 dark:text-white text-[11px]">
                            {language === "pt" ? "Papel Branco Liso" : "Blank White Paper"}
                          </strong>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                            {language === "pt" 
                              ? "Escreva em uma folha limpa, sem pautas ou grades, para medir corretamente o alinhamento e as margens." 
                              : "Write on a clean, unruled sheet of paper so line slants and margins can be measured accurately."}
                          </p>
                        </div>
                      </li>

                      <li className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <div>
                          <strong className="text-slate-900 dark:text-white text-[11px]">
                            {language === "pt" ? "Caneta Esferográfica" : "Standard Pen"}
                          </strong>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                            {language === "pt" 
                              ? "Use uma caneta comum (azul ou preta). Isso permite à IA estimar com precisão a pressão psicofisiológica." 
                              : "Use a standard blue or black ballpoint pen. This allows the AI to correctly evaluate psychophysiological pressure."}
                          </p>
                        </div>
                      </li>

                      <li className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <div>
                          <strong className="text-slate-900 dark:text-white text-[11px]">
                            {language === "pt" ? "Escrita Natural" : "Natural Writing"}
                          </strong>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                            {language === "pt" 
                              ? "Redige de 5 a 6 linhas de texto livre em velocidade normal. Não copie textos para evitar rigidez consciente." 
                              : "Write 5 to 6 lines of free-form text at your natural pace. Avoid copying text to prevent artificial writing style."}
                          </p>
                        </div>
                      </li>

                      <li className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                        <div>
                          <strong className="text-slate-900 dark:text-white text-[11px]">
                            {language === "pt" ? "Firme ao Final" : "Sign at the Bottom"}
                          </strong>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                            {language === "pt" 
                              ? "Inclua sua assinatura habitual abaixo. O contraste entre o texto (vida social) e assinatura (eu íntimo) é crucial." 
                              : "Include your usual signature below the paragraph. The contrast between text and signature yields deep insights."}
                          </p>
                        </div>
                      </li>

                      <li className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">5</span>
                        <div>
                          <strong className="text-slate-900 dark:text-white text-[11px]">
                            {language === "pt" ? "Captura Plana e Focada" : "Flat, Well-Lit Photo"}
                          </strong>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                            {language === "pt" 
                              ? "Tire a foto paralela ao papel, com iluminação uniforme e alta nitidez, para que todos os microtraços fiquem visíveis." 
                              : "Take the photo directly parallel to the paper with flat lighting and high sharpness to preserve micro-stroke details."}
                          </p>
                        </div>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  {t.inputSectionTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.inputSectionSub}
                </p>
              </div>

              {/* Tabs Navigation */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-[11px] sm:text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("canvas")}
                  className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                    activeTab === "canvas"
                      ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-extrabold shadow-xs"
                      : "animate-blink-yellow-orange font-extrabold hover:text-orange-500"
                  }`}
                >
                  {t.tabCanvas}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-extrabold shadow-xs"
                      : "animate-blink-yellow-orange font-extrabold hover:text-orange-500"
                  }`}
                >
                  {t.tabUpload}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("guided")}
                  className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                    activeTab === "guided"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
                  }`}
                >
                  {t.tabGuided}
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[220px] flex flex-col justify-between">
                
                {/* CANVAS TAB */}
                {activeTab === "canvas" && (
                  <div className="flex flex-col gap-3">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      <strong>{t.canvasTabTitle}:</strong> {t.canvasTabDesc}
                    </p>
                    <HandwritingCanvas 
                      language={language}
                      onCapture={(img) => {
                        setCanvasImage(img);
                        setSelectedPreset("");
                      }} 
                    />
                  </div>
                )}

                {/* UPLOAD TAB */}
                {activeTab === "upload" && (
                  <div className="flex flex-col gap-3">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      <strong>{t.uploadTabTitle}:</strong> {t.uploadTabDesc}
                    </p>
                    <ImageUploader 
                      language={language} 
                      onUpload={(img) => {
                        setUploadedImage(img);
                        setSelectedPreset("");
                      }} 
                    />
                  </div>
                )}

                {/* GUIDED TAB */}
                {activeTab === "guided" && (
                  <div className="flex flex-col gap-3">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mb-1">
                      <strong>{t.guidedTabTitle}:</strong> {t.guidedTabDesc}
                    </p>
                    <GuidedAssessment 
                      language={language}
                      onChange={(answers) => {
                        setGuidedAnswers(answers);
                        setSelectedPreset("");
                      }}
                    />
                  </div>
                )}

              </div>

              {/* Common contextual notes + Submit button */}
              {activeTab !== "presets" && (
                <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {t.optAdditionalContext}
                  </label>
                  <textarea
                    rows={2}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder={t.placeholderContext}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />

                  {errorMsg && (
                    <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-600 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.btnAnalyzing}</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span>{t.btnAnalyze}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              </div>

              <AdSenseBanner slot="sidebar-bottom-banner" className="mt-4" />

            </div>

            {/* RIGHT: Visual Reports with Recharts (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6" id="report-column">
            
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500 animate-bounce" />
                  {t.resultsTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.resultsSub}
                </p>
              </div>
              
              <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
                {selectedPreset && (
                  <span className="text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-md border border-amber-200/50 dark:border-amber-900/30">
                    {language === "es" ? "Visualizando Muestra" : language === "pt" ? "Visualizando Amostra" : "Viewing Sample Profile"}
                  </span>
                )}
                
                {report && (
                  <button
                    onClick={() => {
                      const getPresetLabel = () => {
                        if (selectedPreset === "leader") {
                          return language === "es" ? "Perfil Líder Determinado" : language === "pt" ? "Perfil Líder Determinado" : "Driven Leader Profile";
                        } else if (selectedPreset === "thinker") {
                          return language === "es" ? "Perfil Pensador Analítico" : language === "pt" ? "Perfil Pensador Analítico" : "Analytical Thinker Profile";
                        } else if (selectedPreset === "artist") {
                          return language === "es" ? "Perfil Artista Creativo" : language === "pt" ? "Perfil Artista Criativo" : "Creative Artist Profile";
                        }
                        return language === "es" ? "Muestra Personalizada" : language === "pt" ? "Amostra Personalizada" : "Custom Handwriting Sample";
                      };
                      generatePDF(report, language, getPresetLabel());
                    }}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    id="download-laudo-btn"
                  >
                    <FileDown className="w-4 h-4 animate-pulse" />
                    <span>{language === "es" ? "Descargar Informe" : language === "pt" ? "Download do Laudo" : "Download Report"}</span>
                  </button>
                )}
              </div>
            </div>

            {report ? (
              <div className="flex flex-col gap-6">

                {/* Synthesis profile block */}
                <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <FileHeart className="w-5 h-5 text-indigo-500" />
                    <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                      {t.cardProfileTitle}
                    </h4>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {report.psychologicalProfile}
                  </div>
                </div>

                {/* RECHARTS TRAIT DISTRIBUTION BENTO GRID SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Temperament Pie/Donut Chart */}
                  <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[360px]">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        {t.cardTemperamentTitle}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {t.temperamentDesc}
                      </p>
                    </div>

                    <div className="h-[200px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={temperamentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {temperamentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "rgba(15, 23, 42, 0.95)", 
                              borderRadius: "8px", 
                              color: "#fff",
                              fontSize: "11px",
                              border: "none"
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legendary labels */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                      {temperamentData.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850">
                          <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: t.color }}></span>
                          <span className="text-slate-500 dark:text-slate-400 truncate">{t.name}:</span>
                          <span className="text-slate-950 dark:text-white font-mono ml-auto">{t.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Radar/Bar Chart for Key Traits */}
                  <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[360px]">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-indigo-500" />
                        {t.cardTraitsTitle}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {t.traitDesc}
                      </p>
                    </div>

                    <div className="h-[220px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={traitsData}>
                          <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" className="opacity-40 dark:opacity-25" />
                          <PolarAngleAxis 
                            dataKey="name" 
                            tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                          />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 8 }} />
                          <Radar
                            name="Intensidade"
                            dataKey="level"
                            stroke="#4f46e5"
                            fill="#818cf8"
                            fillOpacity={0.4}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-[10px] text-center italic text-slate-400">
                      {language === "pt" ? "* Valores calibrados sobre padrões grafofisiológicos de pressão" : "* Values calibrated based on grapho-physiological metrics"}
                    </p>
                  </div>

                </div>

                {/* Detailed Traits Table/Grid explaining what was found in the caligraphy */}
                <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="mb-4">
                    <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      {t.cardObservationsTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {t.observationDesc}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="py-2.5 px-3">{t.thFeature}</th>
                          <th className="py-2.5 px-3">{t.thObserved}</th>
                          <th className="py-2.5 px-3">{t.thMeaning}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {report.graphologicalObservations.map((obs, index) => (
                          <tr key={index} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-all">
                            <td className="py-3 px-3 font-extrabold text-indigo-600 dark:text-indigo-400 max-w-[120px] truncate">{obs.feature}</td>
                            <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">{obs.observed}</td>
                            <td className="py-3 px-3 text-slate-500 dark:text-slate-400 leading-relaxed">{obs.psychologicalMeaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Emotional State Indicators Section with Recharts */}
                <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="mb-4">
                    <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-500" />
                      {t.cardEmotionalTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {t.emotionalDesc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Horizontal Bar Chart for Emotional states */}
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={emotionalData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                            width={100}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "rgba(15, 23, 42, 0.95)", 
                              borderRadius: "8px", 
                              color: "#fff",
                              fontSize: "11px",
                              border: "none"
                            }} 
                          />
                          <Bar dataKey="score" radius={6} barSize={12}>
                            {emotionalData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Numeric breakdown cards with descriptors */}
                    <div className="grid grid-cols-2 gap-3">
                      {emotionalData.map((item, idx) => {
                        let statusColor = "text-emerald-500 bg-emerald-500/10";
                        let levelText = language === "pt" ? "Estável" : "Stable";
                        
                        if (item.name === t.confidence) {
                          if (item.score < 50) {
                            statusColor = "text-rose-500 bg-rose-500/10";
                            levelText = language === "pt" ? "Baixa" : "Low";
                          } else if (item.score > 80) {
                            statusColor = "text-emerald-500 bg-emerald-500/10";
                            levelText = language === "pt" ? "Excelente" : "Excellent";
                          } else {
                            statusColor = "text-amber-500 bg-amber-500/10";
                            levelText = language === "pt" ? "Moderada" : "Moderate";
                          }
                        } else {
                          if (item.score > 70) {
                            statusColor = "text-rose-500 bg-rose-500/10";
                            levelText = language === "pt" ? "Alerta" : "Critical";
                          } else if (item.score > 40) {
                            statusColor = "text-amber-500 bg-amber-500/10";
                            levelText = language === "pt" ? "Moderado" : "Moderate";
                          } else {
                            statusColor = "text-emerald-500 bg-emerald-500/10";
                            levelText = language === "pt" ? "Normal" : "Normal";
                          }
                        }

                        return (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold truncate">{item.name}</span>
                            <div className="flex items-baseline gap-1.5 mt-1">
                              <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">{item.score}%</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm ${statusColor}`}>{levelText}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>

                {/* Strengths & Challenges layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Strengths Column */}
                  <div className="bg-emerald-50/20 dark:bg-emerald-950/5 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-950/40">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <h4 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-300">
                        {t.cardStrengthsTitle}
                      </h4>
                    </div>
                    <ul className="flex flex-col gap-2 text-xs">
                      {report.strengths.map((str, i) => (
                        <li 
                          key={i} 
                          className="relative group/tooltip flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-relaxed cursor-help p-2 rounded-xl hover:bg-emerald-500/10 dark:hover:bg-emerald-500/5 transition-all"
                        >
                          <span className="text-emerald-500 shrink-0 select-none mt-0.5">•</span>
                          <div className="flex-1 flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-1.5">
                              <span>{str.title}</span>
                              <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover/tooltip:text-emerald-500 transition-colors shrink-0" />
                            </span>
                            
                            {/* Hover Tooltip card with full layout and design */}
                            <div className="absolute left-0 right-0 bottom-full mb-2.5 z-50 pointer-events-none opacity-0 scale-95 origin-bottom group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto group-hover/tooltip:scale-100 transition-all duration-200">
                              <div className="bg-slate-950 dark:bg-slate-900 text-slate-100 dark:text-slate-200 p-3.5 rounded-xl shadow-2xl border border-slate-800 dark:border-slate-850 flex flex-col gap-1.5 text-xs">
                                <div className="flex items-center gap-1.5 font-extrabold text-emerald-400 dark:text-emerald-400">
                                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                  <span>{language === "pt" ? "Análise Psicofisiológica" : "Psychophysiological Analysis"}</span>
                                </div>
                                <p className="leading-relaxed font-normal text-slate-300 dark:text-slate-400">
                                  {str.insight}
                                </p>
                              </div>
                              {/* Triangle arrow at bottom */}
                              <div className="w-2.5 h-2.5 bg-slate-950 dark:bg-slate-900 border-r border-b border-slate-800 dark:border-slate-850 transform rotate-45 absolute left-6 -bottom-1 z-40"></div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges Column */}
                  <div className="bg-rose-50/20 dark:bg-rose-950/5 p-5 rounded-2xl border border-rose-100 dark:border-rose-950/40">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      <h4 className="text-sm font-extrabold text-rose-900 dark:text-rose-300">
                        {t.cardChallengesTitle}
                      </h4>
                    </div>
                    <ul className="flex flex-col gap-2 text-xs">
                      {report.challenges.map((cha, i) => (
                        <li 
                          key={i} 
                          className="relative group/tooltip flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-relaxed cursor-help p-2 rounded-xl hover:bg-rose-500/10 dark:hover:bg-rose-500/5 transition-all"
                        >
                          <span className="text-rose-500 shrink-0 select-none mt-0.5">•</span>
                          <div className="flex-1 flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-1.5">
                              <span>{cha.title}</span>
                              <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover/tooltip:text-rose-500 transition-colors shrink-0" />
                            </span>
                            
                            {/* Hover Tooltip card with full layout and design */}
                            <div className="absolute left-0 right-0 bottom-full mb-2.5 z-50 pointer-events-none opacity-0 scale-95 origin-bottom group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto group-hover/tooltip:scale-100 transition-all duration-200">
                              <div className="bg-slate-950 dark:bg-slate-900 text-slate-100 dark:text-slate-200 p-3.5 rounded-xl shadow-2xl border border-slate-800 dark:border-slate-850 flex flex-col gap-1.5 text-xs">
                                <div className="flex items-center gap-1.5 font-extrabold text-rose-400 dark:text-rose-400">
                                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                  <span>{language === "pt" ? "Zonas de Alerta & Fisiologia" : "Growth Zone & Physiology"}</span>
                                </div>
                                <p className="leading-relaxed font-normal text-slate-300 dark:text-slate-400">
                                  {cha.insight}
                                </p>
                              </div>
                              {/* Triangle arrow at bottom */}
                              <div className="w-2.5 h-2.5 bg-slate-950 dark:bg-slate-900 border-r border-b border-slate-800 dark:border-slate-850 transform rotate-45 absolute left-6 -bottom-1 z-40"></div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Career recommendation list */}
                <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                    <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                      {t.cardCareerTitle}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {report.careerRecommendations.map((car, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold">{car}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <AdSenseBanner slot="results-bottom-banner" className="mt-6" />

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center text-center justify-center py-20">
                <FileHeart className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-4">
                  {language === "es" 
                    ? "¡Todavía no armamos ningún informe!" 
                    : language === "pt" 
                    ? "Nenhum laudo gerado ainda" 
                    : "No report generated yet"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  {language === "es" 
                    ? "Por favor, dibujá tu firma, subí una foto o respondé las preguntas del cuestionario en el menú lateral para activar el panel."
                    : language === "pt" 
                    ? "Por favor, envie sua caligrafia ou responda ao questionário no menu lateral para visualizar os indicadores."
                    : "Please upload, draw, or answer the questionnaire in the sidebar to populate the indicators dashboard."}
                </p>
              </div>
            )}

          </div>

        </div>
        </>
        )}

        {mainView === "blog" && (
          <BlogSection language={language} />
        )}

      </main>

      {/* Interactive Stats & Donation Bar at the bottom of the page */}
      <div className="max-w-3xl mx-auto w-full px-4 mb-8" id="stats-donation-bar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Visitor Counter */}
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xs px-5 py-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                {/* Blinking/titilante live indicator */}
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {language === "es" ? "Lectores en línea" : language === "pt" ? "Leitores online" : "Online Readers"}
                </div>
                <div className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-baseline gap-1.5 leading-none mt-1">
                  <span className="animate-pulse duration-1000">{activeUsers}</span>
                  <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                    {language === "es" ? "activos ahora" : language === "pt" ? "ativos agora" : "active now"}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right border-l border-slate-200/60 dark:border-slate-800/60 pl-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {language === "es" ? "Visitas totales" : language === "pt" ? "Visitas totais" : "Total visits"}
              </div>
              <div className="text-lg font-black tracking-tight text-indigo-600 dark:text-indigo-400 leading-none mt-1">
                {visitorCount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Mercado Pago Cafecito Link */}
          <a
            href="https://mpago.la/2m7bcUT"
            target="_blank"
            rel="noopener noreferrer"
            className="group/don bg-indigo-50/60 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all duration-300 px-5 py-3 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/40 flex items-center justify-between gap-3 shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100/80 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover/don:scale-110 transition-transform duration-300">
                <Heart className="w-4 h-4 fill-indigo-600 dark:fill-indigo-400 animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {language === "es" 
                    ? "Si te gustó la app, invítame con un cafecito" 
                    : language === "pt" 
                    ? "Se gostou do app, me apoie com um café" 
                    : "If you liked the app, buy me a coffee"}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 group-hover/don:underline flex items-center gap-1">
                  {language === "es" 
                    ? "Hacé clic acá para colaborar" 
                    : language === "pt" 
                    ? "Clique aqui para colaborar" 
                    : "Click here to support"}
                  <ChevronRight className="w-3 h-3" />
                </p>
              </div>
            </div>
            <span className="text-lg">❤️</span>
          </a>
        </div>
      </div>

      {/* Modern footer with branding rules */}
      <footer className="w-full bg-slate-100 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-900/80 mt-12 py-6 text-center text-xs text-slate-500 dark:text-slate-400" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GraphoStudio — {language === "pt" ? "Psicologia Baseada em Evidências" : "Evidence-Based Psychographology"}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">{language === "pt" ? "Sobre a Grafologia" : "About Graphology"}</a>
            <a href="#" className="hover:underline">{language === "pt" ? "Termos de Uso" : "Terms of Service"}</a>
            <a href="#" className="hover:underline">{language === "pt" ? "Privacidade" : "Privacy Policy"}</a>
          </div>
        </div>
      </footer>

      {/* Google AdSense Monetization Center Modal */}
      {showAdSenseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  🪙
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    {language === "es" ? "Centro de Monetización Google AdSense" : language === "pt" ? "Central de Monetização Google AdSense" : "Google AdSense Monetization Center"}
                  </h3>
                  <p className="text-xs text-amber-50 font-semibold opacity-90">
                    {language === "es" ? "Monetizá tu web sin saber programar" : language === "pt" ? "Monetize seu site sem saber programar" : "Monetize your website without writing code"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdSenseModal(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
                title="Cerrar"
              >
                <XCircle className="w-7 h-7" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 text-xs text-slate-600 dark:text-slate-300">
              
              {/* Introduction Card */}
              <div className="bg-amber-500/5 dark:bg-amber-400/2 p-4 rounded-2xl border border-amber-500/15 dark:border-amber-400/10 flex gap-3.5 items-start">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {language === "es" ? "¡Hola! Configurar tus anuncios es re fácil" : language === "pt" ? "Olá! Configurar seus anúncios é muito fácil" : "Hello! Setting up your ads is simple"}
                  </p>
                  <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                    {language === "es" 
                      ? "Hemos creado 3 zonas de anuncios estratégicas (arriba, lateral y abajo del informe). Solo ingresá tu ID de editor de AdSense y el sitio se encargará de cargar los anuncios reales automáticamente de manera segura." 
                      : language === "pt" 
                      ? "Criamos 3 áreas estratégicas de anúncios (superior, lateral e inferior do laudo). Basta colar o seu ID de editor do AdSense e o site cuidará de carregar os anúncios de forma automática e segura." 
                      : "We have designated 3 premium, high-converting ad zones (top banner, sidebar, and below results). Simply save your AdSense Publisher ID, and our integration will render real ads automatically."}
                  </p>
                </div>
              </div>

              {/* Form Settings */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4">
                <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-amber-500" />
                  {language === "es" ? "Datos de tu Cuenta AdSense" : language === "pt" ? "Dados da sua Conta AdSense" : "AdSense Account Credentials"}
                </h4>

                {/* Publisher ID input */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{language === "es" ? "1. Código de Editor (Publisher ID) *" : language === "pt" ? "1. Código de Editor (Publisher ID) *" : "1. Publisher ID (ca-pub-xxx) *"}</span>
                    <span className="text-[10px] text-indigo-500 hover:underline font-normal cursor-pointer flex items-center gap-1" onClick={() => {
                      navigator.clipboard.writeText("ca-pub-");
                    }}>
                      <Copy className="w-3.5 h-3.5" />
                      {language === "es" ? "Copiar formato" : language === "pt" ? "Copiar formato" : "Copy format"}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={adsensePubId}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setAdsensePubId(val);
                      localStorage.setItem("graphostudio_adsense_pub_id", val);
                    }}
                    placeholder="Ej: ca-pub-1234567890123456"
                    className="w-full text-xs font-mono p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400">
                    {language === "es" 
                      ? "Debe empezar exactamente con 'ca-pub-'. Podés encontrarlo en tu cuenta de AdSense en Cuenta > Información de cuenta." 
                      : language === "pt" 
                      ? "Deve começar com 'ca-pub-'. Encontre-o no seu painel AdSense em Conta > Informações da conta." 
                      : "Must start with 'ca-pub-'. You can copy it from your AdSense Dashboard under Account > Account Information."}
                  </p>
                </div>

                {/* Slot ID Input (Optional) */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">
                    {language === "es" ? "2. ID de Bloque de Anuncio (Opcional)" : language === "pt" ? "2. ID do Bloco de Anúncios (Opcional)" : "2. Default Ad Unit ID / Slot ID (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={adsenseSlotId}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setAdsenseSlotId(val);
                      localStorage.setItem("graphostudio_adsense_slot_id", val);
                    }}
                    placeholder="Ej: 9876543210"
                    className="w-full text-xs font-mono p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400">
                    {language === "es" 
                      ? "Si creaste un bloque de anuncio Display específico para este sitio, podés colocar su ID numérico aquí." 
                      : language === "pt" 
                      ? "Se você criou um bloco de anúncios específico para este site, coloque o ID numérico aqui." 
                      : "If you created a specific Display ad unit for this site, specify its slot ID here."}
                  </p>
                </div>

                {/* Show placeholders toggle */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
                  <div className="flex gap-2.5 items-start">
                    <Layout className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {language === "es" ? "Mostrar placeholders visuales" : language === "pt" ? "Mostrar espaços de rascunho" : "Show visual layout fallbacks"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                        {language === "es" 
                          ? "Muestra cajas informativas en donde se verán tus anuncios para previsualizar el diseño de tu sitio." 
                          : language === "pt" 
                          ? "Exibe caixas indicativas nos locais dos anúncios para planejar e visualizar o layout." 
                          : "Display colored slots to easily preview and design where ads will appear on the page."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !adsenseShowPlaceholders;
                      setAdsenseShowPlaceholders(nextVal);
                      localStorage.setItem("graphostudio_adsense_show_placeholders", nextVal ? "true" : "false");
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-hidden shrink-0 ${adsenseShowPlaceholders ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-800"}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${adsenseShowPlaceholders ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-amber-500" />
                  {language === "es" ? "Guía Paso a Paso para Monetizar" : language === "pt" ? "Passo a Passo para Começar" : "How to complete your AdSense setup"}
                </h4>

                <div className="flex flex-col gap-3.5 pl-1.5">
                  <div className="flex gap-3">
                    <span className="w-5 h-5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
                    <p className="leading-relaxed">
                      <strong>{language === "es" ? "Iniciá sesión en AdSense:" : language === "pt" ? "Faça login no Google AdSense:" : "Log in to your Google AdSense Dashboard:"}</strong>{" "}
                      {language === "es" 
                        ? "Andá a adsense.google.com y entrá a tu cuenta autorizada." 
                        : language === "pt" 
                        ? "Acesse adsense.google.com e faça login na sua conta ativa." 
                        : "Navigate to adsense.google.com and log into your account."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-5 h-5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
                    <p className="leading-relaxed">
                      <strong>{language === "es" ? "Obtené tu Publisher ID:" : language === "pt" ? "Pegue o seu ID de Editor:" : "Find your Publisher ID:"}</strong>{" "}
                      {language === "es" 
                        ? "Buscá arriba a la derecha tu ID que tiene la forma ca-pub-XXXXXXXXXXXXXXXX. Copialo completo." 
                        : language === "pt" 
                        ? "No canto superior direito ou em Conta > Informações da conta, copie seu ID ca-pub-XXXXXXXXXXXXXXXX." 
                        : "Check under Account > Account Information or look at the top right to copy your ID (e.g. ca-pub-xxxxxxxxxxxxxxxx)."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-5 h-5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center font-bold shrink-0 text-[10px]">3</span>
                    <p className="leading-relaxed">
                      <strong>{language === "es" ? "Pegalo acá abajo y guardá:" : language === "pt" ? "Cole aqui e salve:" : "Paste and Save changes:"}</strong>{" "}
                      {language === "es" 
                        ? "Ingresalo en el campo 'Código de Editor' arriba y presioná Guardar. ¡Listo! Ya estás monetizando tus visitas sin tocar una sola línea de código." 
                        : language === "pt" 
                        ? "Insira-o no campo de entrada acima e clique em Concluir. Pronto! Suas visitas já começam a gerar rendimentos." 
                        : "Paste it into the fields above and press the complete button. You are ready to generate revenue!"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info regarding Auto Ads */}
              <div className="bg-slate-100 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-3 items-start">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                  <strong>{language === "es" ? "💡 Soporte para Anuncios Automáticos (Auto Ads):" : language === "pt" ? "💡 Suporte para Anúncios Automáticos (Auto Ads):" : "💡 Supports Google Auto Ads:"}</strong>{" "}
                  {language === "es" 
                    ? "Nuestra integración carga de forma segura el script oficial de Google. Esto significa que si activaste 'Anuncios Automáticos' en tu panel de Google AdSense, Google distribuirá anuncios flotantes adicionales automáticamente por el sitio." 
                    : language === "pt" 
                    ? "Nossa integração injeta de forma limpa o script oficial do Google. Se você habilitou 'Anúncios Automáticos' no painel do AdSense, o Google distribuirá anúncios flutuantes inteligentes ao longo do site." 
                    : "Our dynamic engine loads Google's script seamlessly. If you turned on 'Auto Ads' in your AdSense control panel, Google will automatically serve floating anchor and overlay ads on your pages."}
                </p>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAdsensePubId("");
                  setAdsenseSlotId("");
                  localStorage.removeItem("graphostudio_adsense_pub_id");
                  localStorage.removeItem("graphostudio_adsense_slot_id");
                  setShowAdSenseModal(false);
                }}
                className="text-slate-500 hover:text-rose-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-rose-500/5 transition-all cursor-pointer border border-transparent hover:border-rose-500/10"
              >
                {language === "es" ? "Desactivar / Limpiar Todo" : language === "pt" ? "Desativar / Limpar Tudo" : "Disable / Reset Configuration"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAdSenseModal(false);
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/15 cursor-pointer text-center"
              >
                {language === "es" ? "¡Listo, Guardar Cambios! 🌟" : language === "pt" ? "Salvar Alterações! 🌟" : "Save Changes! 🌟"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
