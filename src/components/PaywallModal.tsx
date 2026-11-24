import React, { useState } from "react";
import {
  X,
  Lock,
  Check,
  Sparkles,
  KeyRound,
  ExternalLink,
  Mail,
  Crown,
} from "lucide-react";
import { PlanId, UserQuota } from "../types";
import { redeemActivationCode } from "../lib/credits";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quota: UserQuota;
  onQuotaUpdated: (next: UserQuota) => void;
  language: "es" | "pt" | "en";
  limitReachedTrigger?: boolean;
}

export const PaywallModal: React.FC<Props> = ({
  isOpen,
  onClose,
  quota,
  onQuotaUpdated,
  language,
  limitReachedTrigger = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pack5");
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const copy = {
    es: {
      titleReached: "Alcanzaste tus 3 estudios gratuitos",
      titleUpgrade: "Desbloqueá más estudios grafológicos",
      subtitle:
        "Cada estudio personalizado analiza trazos, presión, inclinación y firma con Inteligencia Artificial. Pagá con Mercado Pago o PayPal para continuar.",
      meterLabel: "Estudios gratuitos usados",
      popular: "Recomendado",
      plans: {
        pack1: {
          name: "1 Estudio Extra",
          desc: "Ideal para un análisis puntual de firma o texto manuscrito.",
          perks: ["1 análisis IA completo", "Descarga de informe PDF", "Guardado en tu historial"],
        },
        pack5: {
          name: "Pack 5 Estudios",
          desc: "Analizá tu firma, la de tu pareja, familiares y amigos.",
          perks: ["5 análisis IA completos", "Sin vencimiento de créditos", "Informes PDF y acceso offline"],
        },
        pro: {
          name: "Pase Pro Ilimitado",
          desc: "Uso ilimitado y acceso permanente en tu app.",
          perks: ["Estudios IA ilimitados", "Descargas PDF ilimitadas", "Acceso prioritario y sin límites"],
        },
      },
      step1Title: "1. Elegí tu medio de pago (Mercado Pago o PayPal):",
      mpTitle: "Mercado Pago",
      mpPrice: "$ 8.000 Arg",
      mpDesc: "Argentina: Tarjetas de débito/crédito, transferencias y dinero en cuenta.",
      mpBtn: "Pagar con Mercado Pago ($ 8.000 Arg)",
      ppTitle: "PayPal",
      ppPrice: "$ 5 USD",
      ppDesc: "Internacional: Tarjetas de crédito internacionales y saldo PayPal.",
      ppBtn: "Pagar con PayPal ($ 5 USD)",
      step2Title: "2. Activá tu acceso (o ingresá tu PIN de creador):",
      step2Desc:
        "Una vez realizado el pago, enviá el comprobante a gracwiew@gmail.com para recibir tu código personal:",
      codePlaceholder: "Ingresá tu código o PIN 1824...",
      redeemBtn: "Activar Acceso",
      redeemingBtn: "Validando...",
      creatorNotice:
        "👑 ¿Sos el dueño/administrador de la app? Ingresá tu PIN 1824 para desbloqueo Pro Ilimitado inmediato.",
      sendMail: "Enviar comprobante a gracwiew@gmail.com",
      successMsg: "¡Acceso activado con éxito! Ya podés continuar analizando caligrafías.",
      close: "Cerrar",
    },
    pt: {
      titleReached: "Você atingiu seus 3 estudos gratuitos",
      titleUpgrade: "Desbloqueie mais estudos grafológicos",
      subtitle:
        "Cada estudo personalizado analisa traços, pressão, inclinação e assinatura com Inteligência Artificial. Pague com Mercado Pago ou PayPal.",
      meterLabel: "Estudos gratuitos usados",
      popular: "Recomendado",
      plans: {
        pack1: {
          name: "1 Estudo Extra",
          desc: "Ideal para um laudo pontual de assinatura ou texto.",
          perks: ["1 análise IA completa", "Download do laudo em PDF", "Salvo no seu histórico"],
        },
        pack5: {
          name: "Pacote 5 Estudos",
          desc: "Analise sua assinatura, de parceiros, família e amigos.",
          perks: ["5 análises IA completas", "Créditos sem validade", "Laudos em PDF e acesso offline"],
        },
        pro: {
          name: "Passe Pro Ilimitado",
          desc: "Uso ilimitado e permanente no seu aplicativo.",
          perks: ["Estudos IA ilimitados", "Downloads PDF ilimitados", "Acesso prioritário"],
        },
      },
      step1Title: "1. Escolha sua forma de pagamento (Mercado Pago ou PayPal):",
      mpTitle: "Mercado Pago",
      mpPrice: "$ 8.000 Arg",
      mpDesc: "Argentina / América Latina: Cartões e saldo em conta.",
      mpBtn: "Pagar com Mercado Pago ($ 8.000 Arg)",
      ppTitle: "PayPal",
      ppPrice: "$ 5 USD",
      ppDesc: "Internacional: Cartões de crédito e saldo PayPal.",
      ppBtn: "Pagar com PayPal ($ 5 USD)",
      step2Title: "2. Ative seu acesso (ou digite seu PIN do criador):",
      step2Desc:
        "Após o pagamento, envie o comprovante para gracwiew@gmail.com para receber seu código:",
      codePlaceholder: "Digite seu código ou PIN 1824...",
      redeemBtn: "Ativar Acesso",
      redeemingBtn: "Validando...",
      creatorNotice:
        "👑 É o criador/administrador do app? Digite seu PIN 1824 para desbloqueio Pro Ilimitado imediato.",
      sendMail: "Enviar comprovante para gracwiew@gmail.com",
      successMsg: "Acesso ativado com sucesso! Você já pode continuar suas análises.",
      close: "Fechar",
    },
    en: {
      titleReached: "You have used your 3 free studies",
      titleUpgrade: "Unlock more handwriting studies",
      subtitle:
        "Each personalized study analyzes strokes, pressure, slant, and signature with Artificial Intelligence. Pay with PayPal or Mercado Pago.",
      meterLabel: "Free studies used",
      popular: "Recommended",
      plans: {
        pack1: {
          name: "1 Extra Study",
          desc: "Great for a single signature or handwriting report.",
          perks: ["1 full AI analysis", "PDF report download", "Saved in your history"],
        },
        pack5: {
          name: "5-Study Pack",
          desc: "Analyze your signature, partner, family, and friends.",
          perks: ["5 full AI analyses", "Credits never expire", "PDF reports & offline history"],
        },
        pro: {
          name: "Unlimited Pro Pass",
          desc: "Unlimited permanent access in your app.",
          perks: ["Unlimited AI studies", "Unlimited PDF exports", "Priority access"],
        },
      },
      step1Title: "1. Choose your payment method (Mercado Pago or PayPal):",
      mpTitle: "Mercado Pago",
      mpPrice: "$ 8.000 Arg",
      mpDesc: "Argentina / South America: Debit/credit cards and local payment methods.",
      mpBtn: "Pay with Mercado Pago ($ 8.000 Arg)",
      ppTitle: "PayPal",
      ppPrice: "$ 5 USD",
      ppDesc: "International: Credit cards and PayPal balance.",
      ppBtn: "Pay with PayPal ($ 5 USD)",
      step2Title: "2. Activate your access (or enter your creator PIN):",
      step2Desc:
        "After payment, send your receipt to gracwiew@gmail.com to receive your activation code:",
      codePlaceholder: "Enter code or PIN 1824...",
      redeemBtn: "Activate Access",
      redeemingBtn: "Validating...",
      creatorNotice:
        "👑 Are you the app creator/owner? Enter PIN 1824 for instant unlimited Pro unlock.",
      sendMail: "Send receipt to gracwiew@gmail.com",
      successMsg: "Access successfully activated! You can now analyze handwriting.",
      close: "Close",
    },
  }[language];

  const mpUrl = quota.paymentSettings?.pack5Url || "https://mpago.la/21ZzzP7";
  const paypalUrl = quota.paymentSettings?.pack1Url || "https://paypal.me/margsaft/5";
  const contactEmail = quota.paymentSettings?.contactEmail || "gracwiew@gmail.com";

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setRedeeming(true);
    setFeedback(null);
    try {
      const res = await redeemActivationCode(code.trim());
      if (res.success && res.quota) {
        onQuotaUpdated(res.quota);
        setFeedback({ type: "success", text: copy.successMsg });
        setCode("");
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: "error", text: res.error || "Código no encontrado o inválido." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error al validar el código." });
    } finally {
      setRedeeming(false);
    }
  };

  const mailSubject = encodeURIComponent("Grafología Express - Comprobante de Pago");
  const mailBody = encodeURIComponent(
    `Hola!\n\nRealicé el pago para Grafología Express.\nMi ID de usuario es: ${quota.clientId}\n\nAdjunto mi comprobante para recibir mi código de activación.\n\nMuchas gracias!`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shrink-0 shadow-lg shadow-indigo-600/30">
              {limitReachedTrigger ? <Lock className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight font-serif tracking-tight">
                {limitReachedTrigger || quota.freeRemaining === 0 ? copy.titleReached : copy.titleUpgrade}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {copy.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={copy.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Studies Progress Meter */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-300">
            {copy.meterLabel}:{" "}
            <span className="font-mono tabular-nums font-bold text-white">
              {quota.freeUsed} / {quota.freeLimit}
            </span>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-48">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  idx < quota.freeUsed ? "bg-amber-500" : "bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Official Payment Methods (Mercado Pago & PayPal) */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-200">{copy.step1Title}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mercado Pago Card */}
            <div className="p-4 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-950/30 to-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    {copy.mpTitle}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
                    Argentina
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-white mt-1">
                  {copy.mpPrice}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                  {copy.mpDesc}
                </p>
              </div>

              <a
                href={mpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
              >
                <span>{copy.mpBtn}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* PayPal Card */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    {copy.ppTitle}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    Internacional
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-white mt-1">
                  {copy.ppPrice}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                  {copy.ppDesc}
                </p>
              </div>

              <a
                href={paypalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                <span>{copy.ppBtn}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Step 2: Redeem Activation Code */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-200 mb-1">{copy.step2Title}</p>
          <p className="text-[11px] text-slate-400 mb-3">{copy.step2Desc}</p>

          <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={copy.codePlaceholder}
                className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={redeeming || !code.trim()}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-md shadow-emerald-600/20"
            >
              {redeeming ? copy.redeemingBtn : copy.redeemBtn}
            </button>
          </form>

          {feedback && (
            <p
              className={`mt-2.5 text-xs font-semibold ${
                feedback.type === "success" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {feedback.text}
            </p>
          )}

          {/* Quick email button & Creator PIN note */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
            <a
              href={`mailto:${contactEmail}?subject=${mailSubject}&body=${mailBody}`}
              className="inline-flex items-center gap-1.5 font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{copy.sendMail}</span>
            </a>

            <div className="inline-flex items-center gap-1.5 text-amber-300/90 font-medium">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{copy.creatorNotice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
