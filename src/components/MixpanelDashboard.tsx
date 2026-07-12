import React, { useState, useEffect } from "react";
import { 
  BarChart2, 
  Settings, 
  Activity, 
  Terminal, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  HelpCircle, 
  Database,
  X,
  TrendingUp,
  Users,
  Percent,
  FileText,
  Sparkles,
  Layers,
  Flame,
  Info
} from "lucide-react";
import { 
  initMixpanel, 
  getActiveToken, 
  isMixpanelActive, 
  getLocalEventLog, 
  subscribeToEvents, 
  TrackedEventRecord,
  trackEvent
} from "../lib/mixpanel";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface MixpanelDashboardProps {
  language: "es" | "pt" | "en";
  onClose?: () => void;
}

export default function MixpanelDashboard({ language, onClose }: MixpanelDashboardProps) {
  const [token, setToken] = useState(getActiveToken());
  const [isSaved, setIsSaved] = useState(false);
  const [active, setActive] = useState(isMixpanelActive());
  const [events, setEvents] = useState<TrackedEventRecord[]>(getLocalEventLog());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"metrics" | "integration">("metrics");
  const [timeRange, setTimeRange] = useState<"7d" | "15d">("15d");
  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/metrics/summary");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error("Error loading metrics summary:", e);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Subscribe to live events and fetch summary
  useEffect(() => {
    fetchSummary();
    const unsubscribe = subscribeToEvents(() => {
      setEvents(getLocalEventLog());
      fetchSummary();
    });
    return () => unsubscribe();
  }, []);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    initMixpanel(token.trim());
    setActive(isMixpanelActive());
    setIsSaved(true);
    trackEvent("Mixpanel Token Configured", { source: "UI Settings Panel", has_token: !!token.trim() });
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearToken = () => {
    setToken("");
    initMixpanel("");
    setActive(false);
    trackEvent("Mixpanel Token Cleared", { source: "UI Settings Panel" });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Compute simple event frequencies
  const eventCounts = events.reduce((acc, ev) => {
    acc[ev.name] = (acc[ev.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueEventNames = Object.keys(eventCounts);

  // Simulated fallback metrics data
  const trafficData15d = [
    { day: "01 Jul", visitas: 120, analisis: 75, pdfs: 30 },
    { day: "02 Jul", visitas: 145, analisis: 92, pdfs: 38 },
    { day: "03 Jul", visitas: 160, analisis: 105, pdfs: 48 },
    { day: "04 Jul", visitas: 130, analisis: 80, pdfs: 32 },
    { day: "05 Jul", visitas: 110, analisis: 68, pdfs: 25 },
    { day: "06 Jul", visitas: 155, analisis: 98, pdfs: 40 },
    { day: "07 Jul", visitas: 180, analisis: 125, pdfs: 55 },
    { day: "08 Jul", visitas: 210, analisis: 148, pdfs: 64 },
    { day: "09 Jul", visitas: 195, analisis: 130, pdfs: 58 },
    { day: "10 Jul", visitas: 170, analisis: 112, pdfs: 45 },
    { day: "11 Jul", visitas: 225, analisis: 160, pdfs: 72 },
    { day: "12 Jul", visitas: 250, analisis: 185, pdfs: 88 }
  ];

  const activeTrafficDataRaw = summary ? summary.trafficData15d : trafficData15d;
  const activeTrafficData = timeRange === "7d" ? activeTrafficDataRaw.slice(-7) : activeTrafficDataRaw;

  const funnelData = [
    { stage: language === "es" ? "1. Visita" : language === "pt" ? "1. Visita" : "1. Visit", value: 100, color: "#4f46e5" },
    { stage: language === "es" ? "2. Cargar/Dibuja" : language === "pt" ? "2. Carregar/Desenha" : "2. Upload/Draw", value: 84, color: "#8b5cf6" },
    { stage: language === "es" ? "3. Análisis" : language === "pt" ? "3. Análise" : "3. Analysis", value: 68, color: "#10b981" },
    { stage: language === "es" ? "4. Guardar PDF" : language === "pt" ? "4. Salvar PDF" : "4. Save PDF", value: 45, color: "#f59e0b" }
  ];

  const activeFunnelData = summary ? summary.funnelData.map((item: any) => ({
    ...item,
    stage: language === "es" 
      ? item.stage.replace("1. Visit", "1. Visita").replace("2. Upload/Draw", "2. Cargar/Dibuja").replace("3. Analysis", "3. Análisis").replace("4. Save PDF", "4. Guardar PDF").replace("1. Visita", "1. Visita")
      : language === "pt"
      ? item.stage.replace("1. Visit", "1. Visita").replace("2. Upload/Draw", "2. Carregar/Desenha").replace("3. Analysis", "3. Análise").replace("4. Save PDF", "4. Salvar PDF").replace("1. Visita", "1. Visita")
      : item.stage
  })) : funnelData;

  const traitsData = [
    { name: language === "es" ? "Creativo / Artístico" : language === "pt" ? "Criativo / Artístico" : "Creative / Artistic", value: 35, color: "#4f46e5" },
    { name: language === "es" ? "Lógico / Analítico" : language === "pt" ? "Lógico / Analítico" : "Logical / Analytical", value: 28, color: "#10b981" },
    { name: language === "es" ? "Líder / Ambicioso" : language === "pt" ? "Líder / Ambicioso" : "Leader / Ambitious", value: 20, color: "#f59e0b" },
    { name: language === "es" ? "Emocional / Sensible" : language === "pt" ? "Emocional / Sensível" : "Emotional / Sensitive", value: 17, color: "#ec4899" }
  ];

  const activeTraitsData = summary ? summary.traitsData.map((item: any) => ({
    ...item,
    name: language === "es"
      ? item.name.replace("Sanguíneo", "Sanguíneo (Creativo / Dinámico)").replace("Colérico", "Colérico (Líder / Ambicioso)").replace("Melancólico", "Melancólico (Analítico / Sensible)").replace("Flemático", "Flemático (Calmo / Lógico)")
      : language === "pt"
      ? item.name.replace("Sanguíneo", "Sanguíneo (Criativo / Dinâmico)").replace("Colérico", "Colérico (Líder / Ambicioso)").replace("Melancólico", "Melancólico (Analítico / Sensível)").replace("Flemático", "Flemático (Calmo / Lógico)")
      : item.name
  })) : traitsData;

  const languageData = [
    { name: "Español (ES)", value: 55, color: "#4f46e5" },
    { name: "Português (PT)", value: 30, color: "#10b981" },
    { name: "English (EN)", value: 15, color: "#f59e0b" }
  ];

  const activeLanguageData = summary ? summary.languageData : languageData;

  // Translation Dictionary
  const dict = {
    es: {
      title: "Centro de Analíticas y Métricas Mixpanel",
      subtitle: "Métricas avanzadas de tu proyecto en tiempo real. Visualiza embudos, comportamiento de usuarios y rasgos sin costo adicional.",
      tabMetrics: "📊 Métricas de Tráfico",
      tabIntegration: "🔌 Consola de Integración",
      statusLabel: "Estado del Rastreador:",
      activeStatus: "Conectado / Activo",
      simulatedStatus: "Modo Simulación (Gratuito e Integrado)",
      statusDescActive: "Mixpanel está registrando y enviando eventos reales directamente a tu dashboard online.",
      statusDescSim: "Este panel simula y calcula métricas realistas para tu app sin que tengas que programar nada.",
      tokenInputLabel: "Project Token de Mixpanel",
      tokenPlaceholder: "Pega tu Mixpanel Project Token aquí...",
      saveBtn: "Guardar y Conectar",
      savedAlert: "¡Token guardado! Mixpanel se ha reinicializado.",
      clearBtn: "Desconectar",
      statsTitle: "Eventos Capturados en esta Sesión",
      statsEmpty: "No hay eventos registrados en esta sesión todavía. ¡Interactúa con la app para ver las métricas poblarse en vivo!",
      liveLogTitle: "Terminal de Eventos en Tiempo Real (JSON Stream)",
      eventTime: "Hora",
      eventName: "Evento",
      eventMeta: "Propiedades",
      simulatedBadge: "Simulado",
      liveBadge: "En Vivo",
      guideTitle: "Pasos para conectar tu Mixpanel Real (Gratis)",
      guideStep1: "1. Regístrate gratis en Mixpanel.com y crea un nuevo Proyecto.",
      guideStep2: "2. Ve a Configuración del Proyecto (Project Settings) y copia el 'Project Token'.",
      guideStep3: "3. Pégalo en la pestaña 'Consola de Integración' para ver tus analíticas reales.",
      copyConfirm: "Copiado",
      
      // Dashboard-specific translations
      metricsSummaryTitle: "Resumen Operativo (Últimos 30 días)",
      statVisits: "Visitas Únicas",
      statAnalyses: "Análisis Completados",
      statConversion: "Tasa de Conversión",
      statPdfs: "Informes PDF Guardados",
      trendTitle: "Tendencia de Actividad Diaria",
      trendSubtitle: "Visitas frente a análisis exitosos y descargas de reportes.",
      funnelTitle: "Embudo de Conversión de la App",
      funnelSubtitle: "Porcentaje de usuarios que avanzan en el flujo de grafología.",
      traitsTitle: "Tipos de Escritura Más Comunes",
      traitsSubtitle: "Rasgos dominantes detectados en las firmas y textos analizados.",
      languagesTitle: "Distribución de Idiomas",
      languagesSubtitle: "Preferencia de lenguaje elegida por los usuarios.",
      alertSimulatedTitle: "💡 Analíticas Gratuitas e Integradas",
      alertSimulatedText: "Estamos simulando métricas realistas basadas en patrones de uso históricos. No necesitas pagar nada ni registrarte para ver el diseño y comportamiento de las estadísticas. Si deseas conectar tu propio proyecto Mixpanel gratis, hazlo desde la pestaña de Integración."
    },
    pt: {
      title: "Central de Métricas e Análise do Mixpanel",
      subtitle: "Métricas avançadas do seu projeto em tempo real. Visualize funis, comportamento do usuário e traços sem custo adicional.",
      tabMetrics: "📊 Métricas de Tráfego",
      tabIntegration: "🔌 Console de Integração",
      statusLabel: "Status do Rastreador:",
      activeStatus: "Conectado / Ativo",
      simulatedStatus: "Modo Simulação (Gratuito e Integrado)",
      statusDescActive: "Mixpanel está registrando e enviando eventos reais diretamente para o seu painel online.",
      statusDescSim: "Este painel simula e calcula métricas realistas para seu aplicativo sem que você precise programar nada.",
      tokenInputLabel: "Project Token do Mixpanel",
      tokenPlaceholder: "Cole o seu Mixpanel Project Token aqui...",
      saveBtn: "Salvar e Conectar",
      savedAlert: "Token salvo! O Mixpanel foi reinicializado.",
      clearBtn: "Desconectar",
      statsTitle: "Eventos Capturados nesta Sessão",
      statsEmpty: "Nenhum evento registrado nesta sessão ainda. Interaja com o app para ver as métricas atualizarem ao vivo!",
      liveLogTitle: "Terminal de Eventos em Tempo Real (JSON Stream)",
      eventTime: "Hora",
      eventName: "Evento",
      eventMeta: "Propriedades",
      simulatedBadge: "Simulado",
      liveBadge: "Ao Vivo",
      guideTitle: "Passos para conectar seu Mixpanel Real (Grátis)",
      guideStep1: "1. Cadastre-se gratuitamente em Mixpanel.com e crie um novo Projeto.",
      guideStep2: "2. Vá em Configurações do Projeto (Project Settings) e copie o 'Project Token'.",
      guideStep3: "3. Cole na aba 'Console de Integração' para visualizar suas estatísticas reais.",
      copyConfirm: "Copiado",
      
      // Dashboard-specific translations
      metricsSummaryTitle: "Resumo Operacional (Últimos 30 dias)",
      statVisits: "Visitas Únicas",
      statAnalyses: "Análises Concluídas",
      statConversion: "Taxa de Conversão",
      statPdfs: "Relatórios PDF Salvos",
      trendTitle: "Tendência de Atividade Diária",
      trendSubtitle: "Visitas versus análises bem-sucedidas e downloads de laudos.",
      funnelTitle: "Funil de Conversão do App",
      funnelSubtitle: "Porcentagem de usuários que avançam no fluxo de grafologia.",
      traitsTitle: "Tipos de Escrita Mais Comuns",
      traitsSubtitle: "Traços dominantes detectados nas assinaturas e textos analisados.",
      languagesTitle: "Distribuição de Idiomas",
      languagesSubtitle: "Preferência de idioma escolhida pelos usuários.",
      alertSimulatedTitle: "💡 Análises Gratuitas e Integradas",
      alertSimulatedText: "Estamos simulando métricas realistas com base em padrões de uso históricos. Você não precisa pagar nada para ver a distribuição das estatísticas. Se quiser conectar seu próprio Mixpanel real, faça-o na aba de Integração."
    },
    en: {
      title: "Mixpanel Metrics & Analytics Center",
      subtitle: "Advanced real-time metrics for your project. Visualize funnels, user behaviors, and traits at no extra cost.",
      tabMetrics: "📊 Traffic Metrics",
      tabIntegration: "🔌 Integration Console",
      statusLabel: "Tracker Status:",
      activeStatus: "Connected / Active",
      simulatedStatus: "Simulation Mode (Free & Built-In)",
      statusDescActive: "Mixpanel is recording and sending real events directly to your online project dashboard.",
      statusDescSim: "This dashboard calculates realistic and interactive metrics for your app without requiring any code.",
      tokenInputLabel: "Mixpanel Project Token",
      tokenPlaceholder: "Paste your Mixpanel Project Token here...",
      saveBtn: "Save & Connect",
      savedAlert: "Token saved! Mixpanel re-initialized.",
      clearBtn: "Disconnect",
      statsTitle: "Events Captured in this Session",
      statsEmpty: "No events registered in this session yet. Interact with the app to watch metrics populate live!",
      liveLogTitle: "Real-time Event Console (JSON Stream)",
      eventTime: "Time",
      eventName: "Event",
      eventMeta: "Properties",
      simulatedBadge: "Simulated",
      liveBadge: "Live",
      guideTitle: "Steps to Connect your Real Mixpanel (Free)",
      guideStep1: "1. Register for free on Mixpanel.com and create a new Project.",
      guideStep2: "2. Go to Project Settings and copy the 'Project Token'.",
      guideStep3: "3. Paste it under the 'Integration Console' tab to stream live analytics.",
      copyConfirm: "Copied",
      
      // Dashboard-specific translations
      metricsSummaryTitle: "Operational Summary (Last 30 days)",
      statVisits: "Unique Visits",
      statAnalyses: "Completed Analyses",
      statConversion: "Conversion Rate",
      statPdfs: "PDF Reports Saved",
      trendTitle: "Daily Activity Trend",
      trendSubtitle: "Pageviews against successful handwriting analyses and PDF saves.",
      funnelTitle: "App Conversion Funnel",
      funnelSubtitle: "Percentage of users moving through the analysis workflow.",
      traitsTitle: "Most Common Writing Traits",
      traitsSubtitle: "Dominant psychological aspects found in analyzed handwriting.",
      languagesTitle: "Language Distribution",
      languagesSubtitle: "Locale preference selected by current visitors.",
      alertSimulatedTitle: "💡 Free Built-In Analytics",
      alertSimulatedText: "We are displaying realistic metrics based on historical usage patterns. You don't need a paid plan to preview analytics layouts. If you want to connect your own free Mixpanel project, do so under the Integration tab."
    }
  }[language === "pt" ? "pt" : language === "es" ? "es" : "en"];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full mx-auto animate-fade-in" id="mixpanel-dashboard-container">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-indigo-600 via-indigo-700 to-violet-800 px-6 py-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <BarChart2 className="w-5 h-5 text-indigo-200 animate-pulse" />
            </div>
            <h3 className="text-lg font-black tracking-tight">{dict.title}</h3>
          </div>
          <p className="text-xs text-indigo-100/90 mt-1 max-w-2xl font-medium leading-relaxed">
            {dict.subtitle}
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 z-10">
          {/* Close button */}
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
              aria-label="Cerrar panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "metrics"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {dict.tabMetrics}
          </button>
          <button
            onClick={() => setActiveTab("integration")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "integration"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            {dict.tabIntegration}
          </button>
        </div>

        {/* Time range switcher (only visible in metrics tab) */}
        {activeTab === "metrics" && (
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[10px] font-bold gap-1">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === "7d"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              7 {language === "es" ? "Días" : "Dias"}
            </button>
            <button
              onClick={() => setTimeRange("15d")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === "15d"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              15 {language === "es" ? "Días" : "Dias"}
            </button>
          </div>
        )}
      </div>

      {/* METRICS VIEW TAB */}
      {activeTab === "metrics" && (
        <div className="p-6 flex flex-col gap-6">
          
          {/* Informative Header Alert */}
          <div className="bg-gradient-to-r from-indigo-500/5 to-violet-500/5 dark:from-indigo-400/2 dark:to-violet-400/2 p-4 rounded-2xl border border-indigo-500/15 dark:border-indigo-400/10 flex gap-3.5 items-start">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <h4 className="text-xs font-extrabold text-indigo-950 dark:text-indigo-300">
                {dict.alertSimulatedTitle}
              </h4>
              <p className="text-[11px] mt-0.5 leading-relaxed text-slate-500 dark:text-slate-400">
                {dict.alertSimulatedText}
              </p>
            </div>
          </div>

          {/* Bento Summary Grid Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Unique views */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">{dict.statVisits}</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white">
                  {summary ? summary.totalVisits.toLocaleString() : "2,854"}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded-md">+14%</span>
              </div>
            </div>

            {/* Completed Analyses */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">{dict.statAnalyses}</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white">
                  {summary ? summary.totalAnalyses.toLocaleString() : "1,942"}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded-md">+22%</span>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">{dict.statConversion}</span>
                <Percent className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white">
                  {summary ? `${summary.conversionRate}%` : "68.2%"}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded-md">+3.2%</span>
              </div>
            </div>

            {/* PDFs Exported */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">{dict.statPdfs}</span>
                <FileText className="w-4 h-4 text-violet-500" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white">
                  {summary ? summary.totalPdfs.toLocaleString() : "815"}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded-md">+18%</span>
              </div>
            </div>
          </div>

          {/* Core Analytics charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Traffic Activity line chart (8 cols) */}
            <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  {dict.trendTitle}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{dict.trendSubtitle}</p>
              </div>

              <div className="h-[240px] w-full text-[10px] font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        border: "1px solid #1e293b",
                        borderRadius: "12px",
                        color: "#fff"
                      }}
                    />
                    <Area type="monotone" name={language === "es" ? "Visitas" : "Visits"} dataKey="visitas" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
                    <Area type="monotone" name={language === "es" ? "Análisis" : "Analyses"} dataKey="analisis" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAnalyses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Conversion Funnel Bar chart (4 cols) */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-violet-500" />
                  {dict.funnelTitle}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{dict.funnelSubtitle}</p>
              </div>

              <div className="h-[240px] w-full text-[10px] font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeFunnelData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} tickLine={false} />
                    <YAxis type="category" dataKey="stage" stroke="#94a3b8" tickLine={false} width={80} />
                    <Tooltip 
                      formatter={(val) => `${val}%`}
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        border: "1px solid #1e293b",
                        borderRadius: "12px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="value" name={language === "es" ? "Tasa" : "Rate"} radius={[0, 6, 6, 0]}>
                      {activeFunnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personality Traits detected donut (Pie chart) */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  {dict.traitsTitle}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{dict.traitsSubtitle}</p>
              </div>

              <div className="h-[180px] w-full text-[10px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeTraitsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {activeTraitsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => `${val}%`}
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        border: "1px solid #1e293b",
                        borderRadius: "12px",
                        color: "#fff"
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Languages breakdown (Pie chart) */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-500" />
                  {dict.languagesTitle}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{dict.languagesSubtitle}</p>
              </div>

              <div className="h-[180px] w-full text-[10px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeLanguageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {activeLanguageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => `${val}%`}
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        border: "1px solid #1e293b",
                        borderRadius: "12px",
                        color: "#fff"
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* INTEGRATION VIEW TAB (The original live connection panel) */}
      {activeTab === "integration" && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: Setup, Status & Guide (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            
            {/* Status Indicator Widget */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-2.5 animate-fade-in">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {dict.statusLabel}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full animate-pulse ${active ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-amber-500 shadow-xs shadow-amber-500/50"}`}></span>
                <span className="text-sm font-black text-slate-800 dark:text-white">
                  {active ? dict.activeStatus : dict.simulatedStatus}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                {active ? dict.statusDescActive : dict.statusDescSim}
              </p>
            </div>

            {/* Token Form */}
            <form onSubmit={handleSaveToken} className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                {dict.tokenInputLabel}
              </label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={dict.tokenPlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-mono"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
                    {dict.saveBtn}
                  </button>
                  {active && (
                    <button
                      type="button"
                      onClick={handleClearToken}
                      className="py-2 px-3.5 rounded-xl border border-rose-200 dark:border-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs cursor-pointer transition-all"
                    >
                      {dict.clearBtn}
                    </button>
                  )}
                </div>
              </div>

              {isSaved && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{dict.savedAlert}</span>
                </div>
              )}
            </form>

            {/* Quick Setup Guide Accordion */}
            <div className="bg-indigo-50/30 dark:bg-indigo-950/10 p-4.5 rounded-2xl border border-indigo-100/60 dark:border-indigo-950/40 flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300 font-extrabold text-xs">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span>{dict.guideTitle}</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                <li>{dict.guideStep1}</li>
                <li>{dict.guideStep2}</li>
                <li>{dict.guideStep3}</li>
              </ul>
            </div>

          </div>

          {/* RIGHT PANEL: Real-time logs and counts (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Quick counts bar chart list of local events */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 mb-3">
                <Activity className="w-4 h-4 text-orange-500" />
                {dict.statsTitle}
              </h4>
              
              {uniqueEventNames.length === 0 ? (
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium py-4 text-center">
                  {dict.statsEmpty}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[110px] overflow-y-auto pr-1">
                  {uniqueEventNames.map((name) => {
                    const count = eventCounts[name];
                    const percentage = Math.min(100, (count / events.length) * 100);
                    return (
                      <div key={name} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-col gap-1 shadow-xs">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[110px]">{name}</span>
                          <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md">{count}x</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-linear-to-r from-indigo-500 to-violet-600 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Event Stream Terminal Console */}
            <div className="bg-slate-950 text-slate-200 p-4.5 rounded-2xl border border-slate-800 shadow-lg flex flex-col gap-3 flex-1 min-h-[250px] max-h-[350px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono font-extrabold text-slate-300 uppercase tracking-wider">{dict.liveLogTitle}</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE STREAM
                </span>
              </div>

              <div className="flex-1 overflow-y-auto font-mono text-[10.5px] flex flex-col gap-2.5 pr-1 scrollbar-thin">
                {events.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-1.5 py-12">
                    <Activity className="w-5 h-5 text-slate-700 animate-pulse" />
                    <span>[Esperando eventos...]</span>
                  </div>
                ) : (
                  events.map((ev, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-xl hover:border-slate-800 transition-all">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-500 font-bold">[{ev.timestamp}]</span>
                          <span className="text-emerald-400 font-black">{ev.name}</span>
                        </div>
                        
                        <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                          ev.simulated 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                        }`}>
                          {ev.simulated ? dict.simulatedBadge : dict.liveBadge}
                        </span>
                      </div>

                      {Object.keys(ev.properties).length > 0 && (
                        <div className="mt-1.5 text-slate-400 text-[10px] pl-3 border-l border-slate-800 flex flex-col gap-0.5">
                          <div className="flex items-center justify-between group">
                            <span className="text-slate-500 italic">payload:</span>
                            <button 
                              type="button"
                              onClick={() => copyToClipboard(JSON.stringify(ev.properties, null, 2), idx)}
                              className="text-slate-500 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5 text-[9px] py-0.5 px-1 rounded hover:bg-slate-800"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  <span className="text-emerald-400">{dict.copyConfirm}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-black/40 p-2 rounded-lg text-[9.5px] max-w-full overflow-x-auto text-slate-300 leading-normal scrollbar-thin">
                            {JSON.stringify(ev.properties, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
