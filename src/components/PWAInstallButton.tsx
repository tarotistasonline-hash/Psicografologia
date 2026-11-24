import React, { useState } from "react";
import { Download, Smartphone, Share, PlusSquare, X } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface Props {
  language: "es" | "pt" | "en";
}

export const PWAInstallButton: React.FC<Props> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Suppress when already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const copy = {
    es: {
      btnLabel: "Instalar App",
      iosTitle: "Instalar en iPhone / iPad",
      browserTitle: "Instalar Grafología Express como App",
      iosStep1: "Tocá el botón Compartir en la barra de Safari.",
      iosStep2: "Deslizá hacia abajo y elegí Añadir a pantalla de inicio.",
      browserDesc:
        "Podés instalar esta app directamente en tu celular o computadora para usarla en pantalla completa y acceder a tu historial sin conexión.",
      browserStep1: "En Chrome o Edge (Android/PC): tocá el menú ⋮ (arriba a la derecha) o el ícono de instalación en la barra de direcciones.",
      browserStep2: "Elegí «Instalar aplicación» o «Añadir a pantalla de inicio».",
      iframeNote: "Si estás viendo la app dentro de un editor o marco, abrila en su enlace público directo para activar el botón de instalación nativa.",
      close: "Entendido",
    },
    pt: {
      btnLabel: "Instalar App",
      iosTitle: "Instalar no iPhone / iPad",
      browserTitle: "Instalar Grafologia Express como App",
      iosStep1: "Toque no botão Compartilhar na barra do Safari.",
      iosStep2: "Role para baixo e toque em Adicionar à Tela de Início.",
      browserDesc:
        "Você pode instalar este aplicativo no seu celular ou computador para usá-lo em tela cheia e acessar seu histórico offline.",
      browserStep1: "No Chrome ou Edge (Android/PC): toque no menu ⋮ (canto superior direito) ou no ícone de instalação na barra de endereços.",
      browserStep2: "Selecione «Instalar aplicativo» ou «Adicionar à tela inicial».",
      iframeNote: "Se você estiver visualizando dentro de um quadro, abra no link público direto para ativar a instalação nativa.",
      close: "Entendi",
    },
    en: {
      btnLabel: "Install App",
      iosTitle: "Install on iPhone / iPad",
      browserTitle: "Install Grafología Express App",
      iosStep1: "Tap the Share button in the Safari toolbar.",
      iosStep2: "Scroll down and tap Add to Home Screen.",
      browserDesc:
        "Install this app on your phone or computer for a full-screen standalone experience and offline study history.",
      browserStep1: "In Chrome or Edge (Android/Desktop): click the ⋮ menu or the install icon in the address bar.",
      browserStep2: "Select «Install app» or «Add to Home Screen».",
      iframeNote: "If you are viewing inside an embedded frame, open the direct public URL to trigger native installation.",
      close: "Got it",
    },
  }[language];

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        id="pwa-install-btn"
        className="min-h-[40px] flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] px-3 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>{copy.btnLabel}</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isIOS ? copy.iosTitle : copy.browserTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label={copy.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700">
                  <Share className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>1. {copy.iosStep1}</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700">
                  <PlusSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>2. {copy.iosStep2}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>{copy.browserDesc}</p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 space-y-1.5">
                  <p>1. {copy.browserStep1}</p>
                  <p>2. {copy.browserStep2}</p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {copy.iframeNote}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              {copy.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
