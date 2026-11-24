import { PaymentSettings, UserQuota } from "../types";

const STORAGE_KEY_CLIENT_ID = "graphostudio_client_id";
const STORAGE_KEY_QUOTA_CACHE = "graphostudio_quota_cache";

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  pack1Url: "https://paypal.me/margsaft/5",
  pack5Url: "https://mpago.la/21ZzzP7",
  proUrl: "https://paypal.me/margsaft/5",
  pack1Price: "$5 USD",
  pack5Price: "$8.000 Arg",
  proPrice: "$15 USD",
  contactEmail: "gracwiew@gmail.com",
  whatsappNumber: "",
};

export function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "ssr_client";
  let id = localStorage.getItem(STORAGE_KEY_CLIENT_ID);
  if (!id || id.length < 8) {
    const rand =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
        : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    id = `gp_${rand}`;
    localStorage.setItem(STORAGE_KEY_CLIENT_ID, id);
  }
  return id;
}

export function getCachedQuota(): UserQuota {
  const clientId = getOrCreateClientId();
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_QUOTA_CACHE);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...parsed,
          clientId,
          paymentSettings: {
            ...DEFAULT_PAYMENT_SETTINGS,
            ...(parsed.paymentSettings || {}),
          },
        };
      }
    } catch {
      // Ignore parse errors
    }
  }
  return {
    clientId,
    freeUsed: 0,
    freeLimit: 3,
    freeRemaining: 3,
    paidCredits: 0,
    isProUnlimited: false,
    hasAccess: true,
    totalStudies: 0,
    paymentSettings: DEFAULT_PAYMENT_SETTINGS,
  };
}

export function cacheQuota(quota: UserQuota): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_QUOTA_CACHE, JSON.stringify(quota));
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchUserQuota(): Promise<UserQuota> {
  const clientId = getOrCreateClientId();
  try {
    const res = await fetch(`/api/credits?clientId=${encodeURIComponent(clientId)}`);
    if (!res.ok) throw new Error("Failed to fetch credits");
    const data: UserQuota = await res.json();
    cacheQuota(data);
    return data;
  } catch {
    return getCachedQuota();
  }
}

export async function redeemActivationCode(code: string): Promise<{
  success: boolean;
  creditsAdded?: number;
  grantsPro?: boolean;
  quota?: UserQuota;
  error?: string;
}> {
  const clientId = getOrCreateClientId();
  const res = await fetch("/api/credits/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, code }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, error: data.error || "Código inválido" };
  }
  if (data.quota) {
    cacheQuota(data.quota);
  }
  return data;
}
