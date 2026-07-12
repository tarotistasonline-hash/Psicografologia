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
  PlusCircle,
  TrendingUp
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
  const [showTooltip, setShowTooltip] = useState(false);

  // Subscribe to live events
  useEffect(() => {
    const unsubscribe = subscribeToEvents(() => {
      setEvents(getLocalEventLog());
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

  // Spanish translation dictionary (with English and Portuguese fallbacks)
  const dict = {
    es: {
      title: "Métricas y Configuración de Mixpanel",
      subtitle: "Inserta tu token para rastrear eventos reales o mirá el simulador de eventos en tiempo real.",
      statusLabel: "Estado de Mixpanel:",
      activeStatus: "Conectado / Activo",
      simulatedStatus: "Modo Simulación (Consola Local)",
      tokenInputLabel: "Project Token de Mixpanel",
      tokenPlaceholder: "Pega tu Mixpanel Project Token aquí...",
      saveBtn: "Guardar y Conectar",
      savedAlert: "¡Token guardado! Mixpanel se ha reinicializado.",
      clearBtn: "Desconectar",
      statsTitle: "Métricas Rápidas (Sesión)",
      statsEmpty: "No hay eventos registrados en esta sesión todavía. ¡Interactúa con la app para ver las métricas en acción!",
      liveLogTitle: "Consola de Eventos en Tiempo Real",
      eventTime: "Hora",
      eventName: "Evento",
      eventMeta: "Propiedades",
      simulatedBadge: "Simulado",
      liveBadge: "En Vivo",
      guideTitle: "Guía de Configuración Rápida",
      guideStep1: "1. Regístrate gratis en Mixpanel.com y crea un nuevo Proyecto.",
      guideStep2: "2. Ve a Configuración del Proyecto (Project Settings) y copia el 'Project Token'.",
      guideStep3: "3. Pégalo en este panel o defínelo como VITE_MIXPANEL_TOKEN en los Ajustes de Google AI Studio.",
      copyConfirm: "Copiado",
    },
    pt: {
      title: "Métricas e Configuração do Mixpanel",
      subtitle: "Insira seu token para rastrear eventos reais ou veja o simulador de eventos em tempo real.",
      statusLabel: "Status do Mixpanel:",
      activeStatus: "Conectado / Ativo",
      simulatedStatus: "Modo Simulação (Console Local)",
      tokenInputLabel: "Project Token do Mixpanel",
      tokenPlaceholder: "Cole o seu Mixpanel Project Token aqui...",
      saveBtn: "Salvar e Conectar",
      savedAlert: "Token salvo! O Mixpanel foi reinicializado.",
      clearBtn: "Desconectar",
      statsTitle: "Métricas Rápidas (Sessão)",
      statsEmpty: "Nenhum evento registrado nesta sessão ainda. Interaja com o app para ver as métricas em ação!",
      liveLogTitle: "Console de Eventos em Tempo Real",
      eventTime: "Hora",
      eventName: "Evento",
      eventMeta: "Propriedades",
      simulatedBadge: "Simulado",
      liveBadge: "Ao Vivo",
      guideTitle: "Guia de Configuração Rápida",
      guideStep1: "1. Cadastre-se gratuitamente em Mixpanel.com e crie um novo Projeto.",
      guideStep2: "2. Vá em Configurações do Projeto (Project Settings) e copie o 'Project Token'.",
      guideStep3: "3. Cole neste painel ou defina como VITE_MIXPANEL_TOKEN nas Configurações do Google AI Studio.",
      copyConfirm: "Copiado",
    },
    en: {
      title: "Mixpanel Metrics & Configuration",
      subtitle: "Insert your token to track real events or watch the live tracking simulator.",
      statusLabel: "Mixpanel Status:",
      activeStatus: "Connected / Active",
      simulatedStatus: "Simulation Mode (Local Console)",
      tokenInputLabel: "Mixpanel Project Token",
      tokenPlaceholder: "Paste your Mixpanel Project Token here...",
      saveBtn: "Save & Connect",
      savedAlert: "Token saved! Mixpanel re-initialized.",
      clearBtn: "Disconnect",
      statsTitle: "Session Metrics Summary",
      statsEmpty: "No events registered in this session yet. Interact with the app to watch metrics populate live!",
      liveLogTitle: "Real-time Event Stream Console",
      eventTime: "Time",
      eventName: "Event",
      eventMeta: "Properties",
      simulatedBadge: "Simulated",
      liveBadge: "Live",
      guideTitle: "Quick Configuration Guide",
      guideStep1: "1. Register for free on Mixpanel.com and create a Project.",
      guideStep2: "2. Go to Project Settings and copy the 'Project Token'.",
      guideStep3: "3. Paste it here or define it as VITE_MIXPANEL_TOKEN in Google AI Studio Settings.",
      copyConfirm: "Copied",
    }
  }[language === "pt" ? "pt" : language === "es" ? "es" : "en"];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full mx-auto" id="mixpanel-dashboard-container">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-indigo-600 via-indigo-700 to-violet-800 px-6 py-5 text-white flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <BarChart2 className="w-5 h-5 text-indigo-200" />
            </div>
            <h3 className="text-lg font-black tracking-tight">{dict.title}</h3>
          </div>
          <p className="text-xs text-indigo-100/90 mt-1 max-w-xl font-medium">
            {dict.subtitle}
          </p>
        </div>
        
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

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Setup, Status & Guide (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Status Indicator Widget */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {dict.statusLabel}
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full animate-pulse ${active ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-amber-500 shadow-sm shadow-amber-500/50"}`}></span>
              <span className="text-sm font-black text-slate-800 dark:text-white">
                {active ? dict.activeStatus : dict.simulatedStatus}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
              {active 
                ? "Mixpanel está registrando y enviando eventos reales directamente a tu dashboard online."
                : "La app simula el envío y registra todo de manera interactiva en la consola de la derecha."}
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
                  <RefreshCw className="w-3.5 h-3.5" />
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
          
          {/* Quick counts bar chart list */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-4 h-4 text-orange-500" />
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
                    <div key={name} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-col gap-1.5 shadow-xs">
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
    </div>
  );
}
