import React, { useState } from "react";
import { Eye, Users, Calendar, RefreshCw, X, CheckCircle2, Lock, PlusCircle, Activity } from "lucide-react";
import { VisitorStats, setOwnerExcluded, recordTestVisit } from "../lib/visitorCounter";

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
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggle = () => {
    const nextState = !stats.isOwnerExcluded;
    setOwnerExcluded(nextState);
    onToggleOwnerExclusion(nextState);
  };

  const handleTestIncrement = async () => {
    setTesting(true);
    setTestSuccess(false);
    try {
      await recordTestVisit();
      onRefresh();
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setTesting(false);
    }
  };

  const texts = {
    es: {
      title: "Contador de Visitas Reales",
      subtitle: "Métricas fidedignas y verificadas en tiempo real",
      totalVisits: "Visitas Reales Totales",
      todayVisits: "Visitas de Hoy",
      uniqueVisitors: "Visitantes Únicos",
      activeUsers: "En línea ahora",
      excludedOwner: "Visitas excluidas",
      testVisitBtn: "Registrar Visita de Prueba (+1)",
      testVisitLoading: "Registrando...",
      testVisitSuccess: "¡Visita de prueba sumada al contador!",
      ownerStatusTitle: "Modo Creador (Exclusión opcional)",
      ownerExcludedActive: "Tus visitas están siendo excluidas del contador",
      ownerExcludedDesc: "Tus ingresos no suman al total para no alterar las métricas.",
      ownerIncludedActive: "Todas las visitas se están sumando normalmente",
      ownerIncludedDesc: "Tus visitas se contabilizan igual que las de tus usuarios.",
      btnExclude: "Excluir Mis Visitas",
      btnInclude: "Contar Todas Mis Visitas",
      refresh: "Actualizar datos",
      close: "Cerrar",
      featuresTitle: "Características del Sistema de Métricas:",
      feature1: "Conteo directo persistente y protegido en el servidor.",
      feature2: "Detección de usuarios únicos y sesiones activas en tiempo real.",
      feature3: "Sin trackers externos ni cookies invasivas.",
      activeTag: "ACTIVO",
    },
    pt: {
      title: "Contador de Visitas Reais",
      subtitle: "Métricas autênticas e verificadas em tempo real",
      totalVisits: "Visitas Reais Totais",
      todayVisits: "Visitas de Hoje",
      uniqueVisitors: "Visitantes Únicos",
      activeUsers: "Online agora",
      excludedOwner: "Visitas excluídas",
      testVisitBtn: "Registrar Visita de Teste (+1)",
      testVisitLoading: "Registrando...",
      testVisitSuccess: "Visita de teste adicionada com sucesso!",
      ownerStatusTitle: "Modo Criador (Exclusão opcional)",
      ownerExcludedActive: "Suas visitas estão sendo excluídas do contador",
      ownerExcludedDesc: "Seus acessos não somam ao total para manter as métricas puras.",
      ownerIncludedActive: "Todas as visitas estão sendo somadas normalmente",
      ownerIncludedDesc: "Suas visitas são contabilizadas junto com as dos usuários.",
      btnExclude: "Excluir Minhas Visitas",
      btnInclude: "Contar Todas as Visitas",
      refresh: "Atualizar dados",
      close: "Fechar",
      featuresTitle: "Características do Sistema de Métricas:",
      feature1: "Contagem direta persistente e protegida no servidor.",
      feature2: "Detecção de visitantes únicos e usuários online em tempo real.",
      feature3: "Sem rastreadores externos ou cookies invasivos.",
      activeTag: "ATIVO",
    },
    en: {
      title: "Real Visitor Counter",
      subtitle: "Genuine and verified metrics in real time",
      totalVisits: "Total Real Visits",
      todayVisits: "Visits Today",
      uniqueVisitors: "Unique Visitors",
      activeUsers: "Online now",
      excludedOwner: "Excluded visits",
      testVisitBtn: "Add Test Visit (+1)",
      testVisitLoading: "Adding...",
      testVisitSuccess: "Test visit successfully counted!",
      ownerStatusTitle: "Creator Mode (Optional Exclusion)",
      ownerExcludedActive: "Your visits are excluded from the counter",
      ownerExcludedDesc: "Your sessions are ignored to keep external stats clean.",
      ownerIncludedActive: "All visits are being counted normally",
      ownerIncludedDesc: "Your visits are counted alongside visitor sessions.",
      btnExclude: "Exclude My Visits",
      btnInclude: "Count My Visits",
      refresh: "Refresh stats",
      close: "Close",
      featuresTitle: "Metrics System Features:",
      feature1: "Persistent and server-protected visit tracking.",
      feature2: "Real-time active users and unique visitor detection.",
      feature3: "Zero external trackers or invasive cookies.",
      activeTag: "ACTIVE",
    }
  }[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
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
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold mb-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{texts.totalVisits}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalVisits.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-[11px] font-bold mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{texts.todayVisits}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.todayVisits.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold mb-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>{texts.activeUsers}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.activeUsers.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[11px] font-bold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>{texts.uniqueVisitors}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.uniqueVisitors.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Test Increment Action Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {texts.testVisitBtn}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {testSuccess ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{texts.testVisitSuccess}</span>
              ) : (
                "Comprobá al instante que el contador suma visitas correctamente."
              )}
            </p>
          </div>
          <button
            type="button"
            disabled={testing}
            onClick={handleTestIncrement}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{testing ? texts.testVisitLoading : "+1 Visita"}</span>
          </button>
        </div>

        {/* Creator / Owner Mode Toggle */}
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {texts.ownerStatusTitle}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {stats.isOwnerExcluded ? texts.ownerExcludedDesc : texts.ownerIncludedDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 border ${
                stats.isOwnerExcluded
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              {stats.isOwnerExcluded ? texts.btnInclude : texts.btnExclude}
            </button>
          </div>
        </div>

        {/* Features bullet points */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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
