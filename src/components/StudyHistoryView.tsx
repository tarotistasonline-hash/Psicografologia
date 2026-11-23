import React from "react";
import { Clock, Trash2, ArrowRight, FileHeart } from "lucide-react";
import { StudyHistoryItem } from "../types";

interface Props {
  history: StudyHistoryItem[];
  onSelectStudy: (item: StudyHistoryItem) => void;
  onDeleteStudy: (id: string) => void;
  onGoToAnalyzer: () => void;
  language: "es" | "pt" | "en";
}

export const StudyHistoryView: React.FC<Props> = ({
  history,
  onSelectStudy,
  onDeleteStudy,
  onGoToAnalyzer,
  language,
}) => {
  const copy = {
    es: {
      title: "Mis Estudios Guardados",
      subtitle: "Accedé a tus informes anteriores sin conexión y sin gastar nuevos créditos.",
      emptyTitle: "Todavía no tenés estudios guardados",
      emptyDesc: "Cada análisis grafológico que realices se guardará automáticamente acá en tu dispositivo.",
      cta: "Hacer mi primer estudio",
      open: "Abrir informe",
      methods: {
        canvas: "Firma / Lienzo",
        upload: "Foto subida",
        guided: "Cuestionario",
      },
    },
    pt: {
      title: "Meus Estudos Salvos",
      subtitle: "Acesse seus laudos anteriores offline sem gastar novos créditos.",
      emptyTitle: "Você ainda não tem estudos salvos",
      emptyDesc: "Cada análise grafológica realizada será salva automaticamente aqui no seu dispositivo.",
      cta: "Fazer meu primeiro estudo",
      open: "Abrir laudo",
      methods: {
        canvas: "Assinatura / Tela",
        upload: "Foto enviada",
        guided: "Questionário",
      },
    },
    en: {
      title: "Saved Study History",
      subtitle: "Revisit your past handwriting reports offline without using extra credits.",
      emptyTitle: "No saved studies yet",
      emptyDesc: "Every AI handwriting analysis you run is automatically saved here on your device.",
      cta: "Run your first study",
      open: "Open report",
      methods: {
        canvas: "Canvas / Signature",
        upload: "Uploaded photo",
        guided: "Guided quiz",
      },
    },
  }[language];

  return (
    <section className="max-w-4xl mx-auto w-full py-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{copy.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onGoToAnalyzer}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer self-start"
        >
          <span>{copy.cta}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center">
          <FileHeart className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{copy.emptyTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{copy.emptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString()}
                    <span aria-hidden="true">·</span>
                    <span>{copy.methods[item.method]}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteStudy(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-2">
                  {item.dominantTemperament}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  {item.summaryPreview}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectStudy(item)}
                className="min-h-[40px] w-full rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{copy.open}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
