import React, { useEffect, useState } from "react";
import {
  X,
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  RotateCcw,
  Save,
  DollarSign,
  Lock,
} from "lucide-react";
import { ActivationCode, PaymentSettings, PlanId, UserQuota } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quota: UserQuota;
  onQuotaUpdated: (next: UserQuota) => void;
  language: "es" | "pt" | "en";
}

interface DashboardStats {
  totalAiStudies: number;
  totalPaidUnlocks: number;
  totalUsers: number;
  proUsers: number;
}

export const CreatorMonetizationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  quota,
  onQuotaUpdated,
  language,
}) => {
  const [pinConfigured, setPinConfigured] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [unlockedPin, setUnlockedPin] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [settings, setSettings] = useState<PaymentSettings>(quota.paymentSettings);

  const [newPlan, setNewPlan] = useState<PlanId>("pack5");
  const [newNote, setNewNote] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSettings(quota.paymentSettings);
    fetch("/api/creator/status")
      .then((r) => r.json())
      .then((d) => setPinConfigured(Boolean(d.pinConfigured)))
      .catch(() => setPinConfigured(true));
  }, [isOpen, quota.paymentSettings]);

  if (!isOpen) return null;

  const copy = {
    es: {
      title: "Panel de Monetización (Creador)",
      subtitle: "Gestioná links de pago, precios y códigos de desbloqueo tras los 3 estudios gratis.",
      setupPinTitle: "Configurá tu PIN de Creador",
      setupPinDesc: "Por seguridad, creá un PIN privado (mín. 4 caracteres) para administrar tus códigos y links de cobro.",
      enterPinTitle: "Ingresá tu PIN de Creador",
      pinPlaceholder: "PIN secreto...",
      unlockBtn: "Ingresar al Panel",
      createPinBtn: "Guardar PIN y Entrar",
      statsStudies: "Estudios IA",
      statsUsers: "Usuarios",
      statsUnlocks: "Desbloqueos",
      statsPro: "Usuarios Pro",
      genTitle: "Generar Código de Activación",
      notePlaceholder: "Nota opcional (ej: Juan - Mercado Pago)",
      genBtn: "Crear Código",
      codesTitle: "Códigos Generados",
      noCodes: "Todavía no generaste códigos de activación.",
      settingsTitle: "Links de Pago (Mercado Pago / PayPal) y Precios",
      saveSettings: "Guardar Configuración",
      resetTestBtn: "Reiniciar mis 3 estudios gratis (Prueba)",
      close: "Cerrar",
    },
    pt: {
      title: "Painel de Monetização (Criador)",
      subtitle: "Gerencie links de pagamento, preços e códigos de desbloqueio após os 3 estudos grátis.",
      setupPinTitle: "Configure seu PIN de Criador",
      setupPinDesc: "Por segurança, crie um PIN privado (mín. 4 caracteres) para administrar seus códigos e links.",
      enterPinTitle: "Digite seu PIN de Criador",
      pinPlaceholder: "PIN secreto...",
      unlockBtn: "Entrar no Painel",
      createPinBtn: "Salvar PIN e Entrar",
      statsStudies: "Estudos IA",
      statsUsers: "Usuários",
      statsUnlocks: "Desbloqueios",
      statsPro: "Usuários Pro",
      genTitle: "Gerar Código de Ativação",
      notePlaceholder: "Nota opcional (ex: João - Mercado Pago)",
      genBtn: "Criar Código",
      codesTitle: "Códigos Gerados",
      noCodes: "Nenhum código gerado ainda.",
      settingsTitle: "Links de Pagamento e Preços",
      saveSettings: "Salvar Configurações",
      resetTestBtn: "Resetar meus 3 estudos grátis (Teste)",
      close: "Fechar",
    },
    en: {
      title: "Creator Monetization Panel",
      subtitle: "Manage payment links, pricing, and activation codes after the 3 free studies.",
      setupPinTitle: "Set Up Your Creator PIN",
      setupPinDesc: "Create a private PIN (min. 4 characters) to manage payment links and activation codes.",
      enterPinTitle: "Enter Creator PIN",
      pinPlaceholder: "Secret PIN...",
      unlockBtn: "Unlock Panel",
      createPinBtn: "Save PIN & Continue",
      statsStudies: "AI Studies",
      statsUsers: "Users",
      statsUnlocks: "Paid Unlocks",
      statsPro: "Pro Users",
      genTitle: "Generate Activation Code",
      notePlaceholder: "Optional note (e.g. buyer email)",
      genBtn: "Generate Code",
      codesTitle: "Generated Codes",
      noCodes: "No activation codes generated yet.",
      settingsTitle: "Payment Links & Pricing",
      saveSettings: "Save Settings",
      resetTestBtn: "Reset My 3 Free Studies (Testing)",
      close: "Close",
    },
  }[language];

  const loadDashboard = async (pin: string) => {
    const res = await fetch("/api/creator/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "PIN incorrecto");
    }
    setUnlockedPin(pin);
    setStats(data.stats);
    setCodes(data.codes || []);
    if (data.paymentSettings) setSettings(data.paymentSettings);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (pinConfigured === false) {
        const setupRes = await fetch("/api/creator/setup-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: pinInput }),
        });
        const setupData = await setupRes.json();
        if (!setupRes.ok) throw new Error(setupData.error || "Error");
        setPinConfigured(true);
      }
      await loadDashboard(pinInput);
      setPinInput("");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleGenerateCode = async () => {
    if (!unlockedPin) return;
    setStatusMsg(null);
    const res = await fetch("/api/creator/generate-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: unlockedPin, planId: newPlan, maxUses: 1, note: newNote }),
    });
    const data = await res.json();
    if (res.ok) {
      setCodes(data.codes || []);
      setNewNote("");
      setStatusMsg(`Código creado: ${data.code.code}`);
    }
  };

  const handleDeleteCode = async (codeStr: string) => {
    if (!unlockedPin) return;
    const res = await fetch("/api/creator/delete-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: unlockedPin, code: codeStr }),
    });
    const data = await res.json();
    if (res.ok) setCodes(data.codes || []);
  };

  const handleSaveSettings = async () => {
    if (!unlockedPin) return;
    setStatusMsg(null);
    const res = await fetch("/api/creator/update-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: unlockedPin, paymentSettings: settings }),
    });
    const data = await res.json();
    if (res.ok) {
      onQuotaUpdated({ ...quota, paymentSettings: data.paymentSettings });
      setStatusMsg("Configuración de pagos guardada.");
    }
  };

  const handleResetMyQuota = async () => {
    if (!unlockedPin) return;
    const res = await fetch("/api/creator/reset-quota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: unlockedPin, clientId: quota.clientId }),
    });
    const data = await res.json();
    if (res.ok && data.quota) {
      onQuotaUpdated(data.quota);
      setStatusMsg("Tus 3 estudios gratuitos de prueba fueron reiniciados.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{copy.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!unlockedPin ? (
          <form onSubmit={handlePinSubmit} className="mt-6 max-w-sm mx-auto space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Lock className="w-4 h-4 text-indigo-500" />
              <span>{pinConfigured === false ? copy.setupPinTitle : copy.enterPinTitle}</span>
            </div>
            {pinConfigured === false && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {copy.setupPinDesc}
              </p>
            )}
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder={copy.pinPlaceholder}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {authError && <p className="text-xs font-semibold text-rose-600">{authError}</p>}
            <button
              type="submit"
              className="w-full min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              {pinConfigured === false ? copy.createPinBtn : copy.unlockBtn}
            </button>
          </form>
        ) : (
          <div className="mt-5 space-y-6">
            {statusMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {statusMsg}
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 font-semibold">{copy.statsStudies}</div>
                  <div className="text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                    {stats.totalAiStudies}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 font-semibold">{copy.statsUsers}</div>
                  <div className="text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                    {stats.totalUsers}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 font-semibold">{copy.statsUnlocks}</div>
                  <div className="text-xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {stats.totalPaidUnlocks}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 font-semibold">{copy.statsPro}</div>
                  <div className="text-xl font-black font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {stats.proUsers}
                  </div>
                </div>
              </div>
            )}

            {/* Generate Activation Code */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                <span>{copy.genTitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as PlanId)}
                  className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="pack1">+1 Estudio Extra</option>
                  <option value="pack5">+5 Estudios</option>
                  <option value="pro">Pase Pro Ilimitado</option>
                </select>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={copy.notePlaceholder}
                  className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="min-h-[42px] flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{copy.genBtn}</span>
                </button>
              </div>

              {/* Codes list */}
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {codes.length === 0 ? (
                  <p className="text-[11px] text-slate-400">{copy.noCodes}</p>
                ) : (
                  codes.map((c) => (
                    <div
                      key={c.code}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {c.code}
                        </span>
                        <span className="ml-2 text-[11px] text-slate-500">
                          {c.grantsPro ? "Pro" : `+${c.creditsToAdd}`} · {c.usedCount}/{c.maxUses}
                          {c.note ? ` · ${c.note}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(c.code);
                            setCopiedCode(c.code);
                            setTimeout(() => setCopiedCode(null), 1500);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="Copiar código"
                        >
                          {copiedCode === c.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCode(c.code)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-rose-500 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Links & Prices */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">{copy.settingsTitle}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Link Pack 1 Estudio</label>
                  <input
                    type="url"
                    value={settings.pack1Url}
                    onChange={(e) => setSettings({ ...settings, pack1Url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Precio Pack 1</label>
                  <input
                    type="text"
                    value={settings.pack1Price}
                    onChange={(e) => setSettings({ ...settings, pack1Price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Link Pack 5 Estudios</label>
                  <input
                    type="url"
                    value={settings.pack5Url}
                    onChange={(e) => setSettings({ ...settings, pack5Url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Precio Pack 5</label>
                  <input
                    type="text"
                    value={settings.pack5Price}
                    onChange={(e) => setSettings({ ...settings, pack5Price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Link Pase Pro Ilimitado</label>
                  <input
                    type="url"
                    value={settings.proUrl}
                    onChange={(e) => setSettings({ ...settings, proUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Precio Pase Pro</label>
                  <input
                    type="text"
                    value={settings.proPrice}
                    onChange={(e) => setSettings({ ...settings, proPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Email de contacto / comprobantes</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">WhatsApp (opcional, con código país)</label>
                  <input
                    type="text"
                    placeholder="Ej: 5491122334455"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetMyQuota}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{copy.resetTestBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{copy.saveSettings}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
