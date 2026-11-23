import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

interface Props {
  language: "es" | "pt" | "en";
}

export const OfflineIndicator: React.FC<Props> = ({ language }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  const text = {
    es: "Modo sin conexión — Podés ver tus estudios guardados y muestras.",
    pt: "Modo offline — Você pode ver seus estudos salvos e amostras.",
    en: "Offline Mode — Saved studies and samples remain available.",
  }[language];

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-4 left-4 right-4 md:right-auto z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
};
