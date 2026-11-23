import React, { useState } from "react";
import {
  X,
  Lock,
  Check,
  Sparkles,
  KeyRound,
  ExternalLink,
  Mail,
  CreditCard,
  ShieldCheck,
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
  const [stripeLoading, setStripeLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const copy = {
    es: {
      titleReached: "Alcanzaste tus 3 estudios gratuitos",
      titleUpgrade: "Desbloqueá más estudios grafológicos",
      subtitle:
        "Cada estudio personalizado analiza trazos, presión, inclinación y firma con Inteligencia Artificial. Elegí un pack para continuar sin límites.",
      meterLabel: "Estudios gratuitos usados",
      popular: "Más elegido",
      plans: {
        pack1: {
          name: "1 Estudio Extra",
          desc: "Ideal para un análisis puntual de firma o texto.",
          perks: ["1 análisis IA completo", "Descarga de informe PDF", "Guardado en tu historial"],
        },
        pack5: {
          name: "Pack 5 Estudios",
          desc: "Analizá tu firma, la de tu pareja y amigos.",
          perks: ["5 análisis IA completos", "Sin vencimiento de créditos", "Informes PDF y enlace compartible"],
        },
        pro: {
          name: "Pase Pro Ilimitado",
          desc: "Uso ilimitado en tu app instalada.",
          perks: ["Estudios IA ilimitados", "Descargas PDF ilimitadas", "Prioridad en nuevos módulos"],
        },
      },
      payNowMp: "Pagar con Mercado Pago / Checkout",
      payNowStripe: "Pagar con Tarjeta (Stripe)",
      step1: "1. Realizá el pago del plan elegido",
      step2: "2. Ingresá tu código de activación",
      codePlaceholder: "Ej: GP-5-A1B2C3",
      redeemBtn: "Activar",
      redeemingBtn: "Validando...",
      needCode: "¿Ya pagaste? Solicitá tu código al creador:",
      sendMail: "Enviar comprobante por Email",
      sendWa: "Enviar por WhatsApp",
      successMsg: "¡Créditos activados con éxito! Ya podés continuar analizando.",
      close: "Cerrar",
    },
    pt: {
      titleReached: "Você atingiu seus 3 estudos gratuitos",
      titleUpgrade: "Desbloqueie mais estudos grafológicos",
      subtitle:
        "Cada estudo personalizado analisa traços, pressão, inclinação e assinatura com Inteligência Artificial. Escolha um pacote para continuar.",
      meterLabel: "Estudos gratuitos usados",
      popular: "Mais escolhido",
      plans: {
        pack1: {
          name: "1 Estudo Extra",
          desc: "Ideal para uma análise pontual de assinatura ou texto.",
          perks: ["1 análise IA completa", "Download do laudo em PDF", "Salvo no seu histórico"],
        },
        pack5: {
          name: "Pacote 5 Estudos",
          desc: "Analise sua assinatura, do seu par e de amigos.",
          perks: ["5 análises IA completas", "Créditos sem validade", "Laudos em PDF e link compartilhável"],
        },
        pro: {
          name: "Passe Pro Ilimitado",
          desc: "Uso ilimitado no seu app instalado.",
          perks: ["Estudos IA ilimitados", "Downloads PDF ilimitados", "Prioridade em novos recursos"],
        },
      },
      payNowMp: "Pagar com Mercado Pago / Checkout",
      payNowStripe: "Pagar com Cartão (Stripe)",
      step1: "1. Realize o pagamento do plano escolhido",
      step2: "2. Insira seu código de ativação",
      codePlaceholder: "Ex: GP-5-A1B2C3",
      redeemBtn: "Ativar",
      redeemingBtn: "Validando...",
      needCode: "Já pagou? Solicite seu código ao criador:",
      sendMail: "Enviar comprovante por Email",
      sendWa: "Enviar por WhatsApp",
      successMsg: "Créditos ativados com sucesso! Você já pode continuar analisando.",
      close: "Fechar",
    },
    en: {
      titleReached: "You have used your 3 free studies",
      titleUpgrade: "Unlock more handwriting studies",
      subtitle:
        "Each personalized study analyzes strokes, pressure, slant, and signature using AI. Pick a plan to keep exploring.",
      meterLabel: "Free studies used",
      popular: "Best value",
      plans: {
        pack1: {
          name: "1 Extra Study",
          desc: "Great for a single signature or handwriting report.",
          perks: ["1 full AI analysis", "PDF report download", "Saved in your history"],
        },
        pack5: {
          name: "5-Study Pack",
          desc: "Analyze your signature, partner, and friends.",
          perks: ["5 full AI analyses", "Credits never expire", "PDF reports & share links"],
        },
        pro: {
          name: "Unlimited Pro Pass",
          desc: "Unlimited access inside your installed app.",
          perks: ["Unlimited AI studies", "Unlimited PDF exports", "Priority access to updates"],
        },
      },
      payNowMp: "Pay via Checkout Link",
      payNowStripe: "Pay with Card (Stripe)",
      step1: "1. Complete payment for your selected plan",
      step2: "2. Enter your activation code",
      codePlaceholder: "e.g. GP-5-A1B2C3",
      redeemBtn: "Activate",
      redeemingBtn: "Checking...",
      needCode: "Already paid? Request your activation code:",
      sendMail: "Email Payment Receipt",
      sendWa: "Send via WhatsApp",
      successMsg: "Credits activated! You can now run your analysis.",
      close: "Close",
    },
  }[language];

  const { paymentSettings } = quota;

  const planUrlMap: Record<PlanId, string> = {
    pack1: paymentSettings.pack1Url || "https://mpago.la/2m7bcUT",
    pack5: paymentSettings.pack5Url || "https://mpago.la/2m7bcUT",
    pro: paymentSettings.proUrl || "https://mpago.la/2m7bcUT",
  };

  const planPriceMap: Record<PlanId, string> = {
    pack1: paymentSettings.pack1Price || "$1.99 USD",
    pack5: paymentSettings.pack5Price || "$4.99 USD",
    pro: paymentSettings.proPrice || "$9.99 USD",
  };

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
        setFeedback({ type: "error", text: res.error || "Código inválido" });
      }
    } catch {
      setFeedback({ type: "error", text: "Error al validar el código." });
    } finally {
      setRedeeming(false);
    }
  };

  const handleStripeCheckout = async () => {
    setStripeLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: quota.clientId,
          planId: selectedPlan,
          returnUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "No se pudo iniciar Stripe Checkout");
      }
      window.location.href = data.url;
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setStripeLoading(false);
    }
  };

  const selectedPlanName = copy.plans[selectedPlan].name;
  const mailSubject = encodeURIComponent(`Grafología Pop - Activación ${selectedPlanName}`);
  const mailBody = encodeURIComponent(
    `Hola! Realicé el pago por ${selectedPlanName} (${planPriceMap[selectedPlan]}).\nMi ID de app es: ${quota.clientId}\nAdjunto comprobante para recibir mi código de activación.`
  );
  const waText = encodeURIComponent(
    `Hola! Pagué por ${selectedPlanName} en Grafología Pop. Mi ID es ${quota.clientId}. ¿Me enviás mi código de activación?`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shrink-0">
              {limitReachedTrigger ? <Lock className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {limitReachedTrigger || quota.freeRemaining === 0 ? copy.titleReached : copy.titleUpgrade}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {copy.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label={copy.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Free-Studies Progress Meter */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {copy.meterLabel}:{" "}
            <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
              {quota.freeUsed} / {quota.freeLimit}
            </span>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-48">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  idx < quota.freeUsed
                    ? "bg-amber-500"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {(["pack1", "pack5", "pro"] as PlanId[]).map((planKey) => {
            const isSelected = selectedPlan === planKey;
            const planInfo = copy.plans[planKey];
            return (
              <button
                key={planKey}
                type="button"
                onClick={() => setSelectedPlan(planKey)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {planInfo.name}
                    </span>
                    {planKey === "pack5" && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {copy.popular}
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                    {planPriceMap[planKey]}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                    {planInfo.desc}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                    {planInfo.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        {/* Step 1: Payment CTA */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{copy.step1}</p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={planUrlMap[selectedPlan]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {copy.payNowMp} ({planPriceMap[selectedPlan]})
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {quota.stripeEnabled && (
              <button
                type="button"
                onClick={handleStripeCheckout}
                disabled={stripeLoading}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{copy.payNowStripe}</span>
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Redeem Activation Code */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">{copy.step2}</p>
          <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={copy.codePlaceholder}
                className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={redeeming || !code.trim()}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              {redeeming ? copy.redeemingBtn : copy.redeemBtn}
            </button>
          </form>

          {feedback && (
            <p
              className={`mt-2 text-xs font-semibold ${
                feedback.type === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {feedback.text}
            </p>
          )}

          {/* Direct contact / receipt verification fallback */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>{copy.needCode}</span>
            <div className="flex items-center gap-3">
              {paymentSettings.contactEmail && (
                <a
                  href={`mailto:${paymentSettings.contactEmail}?subject=${mailSubject}&body=${mailBody}`}
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{copy.sendMail}</span>
                </a>
              )}
              {paymentSettings.whatsappNumber && (
                <a
                  href={`https://wa.me/${paymentSettings.whatsappNumber.replace(/\D/g, "")}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>{copy.sendWa}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
