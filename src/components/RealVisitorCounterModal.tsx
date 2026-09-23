import React from "react";
import { ShieldCheck, ShieldAlert, Eye, Users, Calendar, RefreshCw, X, CheckCircle2, Lock } from "lucide-react";
import { VisitorStats, setOwnerExcluded } from "../lib/visitorCounter";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stats: VisitorStats;
  onRefresh: () => void;
  onToggleOwnerExclusion: (excluded: boolean) => void;
  language: "es" | "pt" | "en";
}

export const RealVisitorCounterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  stats,
  onRefresh,
  onToggleOwnerExclusion,
  language
}) => {
  if (!isOpen) return null;

  const handleToggle = () => {
    const nextState = !stats.isOwnerExcluded;
    setOwnerExcluded(nextState);
    onToggleOwnerExclusion(nextState);
  };

  const texts = {
    es: {
      title: "Contador de Visitas Reales",
      subtitle: "Métricas fidedignas con exclusión de visitas del creador/administrador",
      totalVisits: "Visitas Reales Totales",
      todayVisits: "Visitas de Hoy",
      uniqueVisitors: "Visitantes Únicos",
      activeUsers: "En línea ahora",
      excludedOwner: "Tus visitas ignoradas",
      ownerStatusTitle: "Modo Creador (Exclusión de tus visitas)",
      ownerExcludedActive: "Tus visitas están EXCLUIDAS del contador",
      ownerExcludedDesc: "Cada vez que entres a la web, recargues la página o hagas pruebas, el contador NO sumará tus visitas para que veas métricas 100% reales de tus usuarios.",
      ownerIncludedActive: "Tus visitas se están SUMANDO al contador",
      ownerIncludedDesc: "Actualmente tu navegador se comporta como un visitante más. Activá la exclusión para evitar inflar las estadísticas.",
      btnExclude: "Excluir Mis Visitas",
      btnInclude: "Incluir Mis Visitas (Prueba)",
      refresh: "Actualizar datos",
      close: "Cerrar",
      featuresTitle: "Garantías del Sistema de Visitas Reales:",
      feature1: "Filtro anti-inflación: los usuarios sólo computan 1 visita cada 30 minutos.",
      feature2: "Exclusión del creador persistente en este dispositivo y servidor.",
      feature3: "Almacenamiento persistente en servidor sin servicios de terceros ni Mixpanel.",
      activeTag: "ACTIVO",
      zeroNote: "Nota: Si 'Visitas de hoy' y 'En línea' dicen 0, es porque tus visitas como creador están excluidas y no hay visitantes externos conectados ahora. Para registrar tu visita como prueba, haz clic en 'Incluir Mis Visitas (Prueba)'."
    },
    pt: {
      title: "Contador de Visitas Reais",
      subtitle: "Métricas autênticas com exclusão das visitas do criador/administrador",
      totalVisits: "Visitas Reais Totais",
      todayVisits: "Visitas de Hoje",
      uniqueVisitors: "Visitantes Únicos",
      activeUsers: "Online agora",
      excludedOwner: "Suas visitas ignoradas",
      ownerStatusTitle: "Modo Criador (Exclusão das suas visitas)",
      ownerExcludedActive: "Suas visitas estão EXCLUÍDAS do contador",
      ownerExcludedDesc: "Cada vez que você acessar a web, recarregar ou testar, o contador NÃO somará suas visitas, garantindo números 100% autênticos dos seus usuários.",
      ownerIncludedActive: "Suas visitas estão sendo SOMADAS ao contador",
      ownerIncludedDesc: "Atualmente seu navegador se comporta como um visitante comum. Ative a exclusão para não inflar as métricas.",
      btnExclude: "Excluir Minhas Visitas",
      btnInclude: "Incluir Minhas Visitas (Teste)",
      refresh: "Actualizar dados",
      close: "Fechar",
      featuresTitle: "Garantías do Sistema de Visitas Reais:",
      feature1: "Filtro anti-inflação: visitantes contam apenas 1 visita a cada 30 minutos.",
      feature2: "Exclusão persistente do criador neste dispositivo e servidor.",
      feature3: "Armazenamento direto no servidor, sem dependência do Mixpanel.",
      activeTag: "ATIVO",
      zeroNote: "Nota: Se 'Visitas de hoje' e 'Online' dizem 0, é porque suas visitas de criador estão excluídas e não há visitantes externos agora."
    },
    en: {
      title: "Real Visitor Counter",
      subtitle: "Genuine metrics with strict creator/admin visit exclusion",
      totalVisits: "Total Real Visits",
      todayVisits: "Visits Today",
      uniqueVisitors: "Unique Visitors",
      activeUsers: "Online now",
      excludedOwner: "Your visits ignored",
      ownerStatusTitle: "Creator Mode (Your visits exclusion)",
      ownerExcludedActive: "Your visits are EXCLUDED from the counter",
      ownerExcludedDesc: "Whenever you open the app, refresh, or run tests, your visits will NOT be counted, keeping stats 100% genuine.",
      ownerIncludedActive: "Your visits are currently being COUNTED",
      ownerIncludedDesc: "Your browser is currently treated as a regular visitor. Turn on exclusion to keep visitor numbers pure.",
      btnExclude: "Exclude My Visits",
      btnInclude: "Include My Visits (Testing)",
      refresh: "Refresh stats",
      close: "Close",
      featuresTitle: "Real Visitor Counter Guarantees:",
      feature1: "Anti-inflation filter: visitors are counted once every 30 minutes.",
      feature2: "Persistent creator exclusion saved locally and on the server.",
      feature3: "Clean server-side storage without Mixpanel or external trackers.",
      activeTag: "ACTIVE",
      zeroNote: "Note: If 'Visits Today' and 'Online' show 0, it is because creator visits are excluded and no external users are browsing right now."
    }
  }[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-600/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                {texts.title}
                <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-sm">
                  {texts.activeTag}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {texts.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{texts.totalVisits}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalVisits.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{texts.todayVisits}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.todayVisits.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{texts.activeUsers}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.activeUsers.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>{texts.uniqueVisitors}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.uniqueVisitors.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 col-span-2 sm:col-span-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>{texts.excludedOwner}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.excludedOwnerVisits.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Informative explanation note if stats are 0 */}
        {stats.todayVisits === 0 && (
          <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
            <span className="text-indigo-500 font-bold shrink-0 text-sm">ℹ️</span>
            <p>{texts.zeroNote}</p>
          </div>
        )}

        {/* Creator / Owner Mode Box */}
        <div className={`p-4 rounded-2xl border transition-all ${
          stats.isOwnerExcluded
            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
            : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              stats.isOwnerExcluded
                ? "bg-emerald-600 text-white"
                : "bg-amber-500 text-white"
            }`}>
              {stats.isOwnerExcluded ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                {texts.ownerStatusTitle}
              </p>
              <p className={`text-xs font-bold mt-0.5 ${
                stats.isOwnerExcluded 
                  ? "text-emerald-700 dark:text-emerald-400" 
                  : "text-amber-700 dark:text-amber-400"
              }`}>
                {stats.isOwnerExcluded ? texts.ownerExcludedActive : texts.ownerIncludedActive}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {stats.isOwnerExcluded ? texts.ownerExcludedDesc : texts.ownerIncludedDesc}
              </p>

              <button
                type="button"
                onClick={handleToggle}
                className={`mt-3 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs ${
                  stats.isOwnerExcluded
                    ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {stats.isOwnerExcluded ? texts.btnInclude : texts.btnExclude}
              </button>
            </div>
          </div>
        </div>

        {/* Informative bullet points */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
            {texts.featuresTitle}
          </p>
          <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{texts.feature1}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{texts.feature2}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{texts.feature3}</span>
            </li>
          </ul>
        </div>

        {/* Footer controls */}
        <div className="mt-5 pt-3 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{texts.refresh}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-600/20 transition-all"
          >
            {texts.close}
          </button>
        </div>
      </div>
    </div>
  );
};
