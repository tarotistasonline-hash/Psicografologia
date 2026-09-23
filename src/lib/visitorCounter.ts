/**
 * Client-side utilities for verified real visitor counting with owner exclusion.
 */

export interface VisitorStats {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitors: number;
  activeUsers: number;
  excludedOwnerVisits: number;
  isOwnerExcluded: boolean;
  lastVisitTime?: number;
}

const STORAGE_KEY_EXCLUDE_OWNER = "graphostudio_exclude_owner";
const STORAGE_KEY_SESSION_ID = "graphostudio_session_id";
const STORAGE_KEY_CACHED_STATS = "graphostudio_cached_visitor_stats";

/**
 * Checks whether the current user is identified as the owner/creator,
 * meaning their visits are excluded from the real visit counter.
 */
export const isOwnerExcluded = (): boolean => {
  if (typeof window === "undefined") return true;

  // Check URL query parameters for explicit owner flag (e.g. ?admin=true, ?owner=true, ?creator=true)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("owner") || urlParams.has("admin") || urlParams.has("creator")) {
    localStorage.setItem(STORAGE_KEY_EXCLUDE_OWNER, "true");
    return true;
  }

  const stored = localStorage.getItem(STORAGE_KEY_EXCLUDE_OWNER);
  if (stored !== null) {
    return stored === "true";
  }

  // Auto-detect development/preview environments for the owner
  const hostname = window.location.hostname;
  const isDevEnvironment = 
    hostname.includes("ais-dev") || 
    hostname.includes("localhost") || 
    hostname === "127.0.0.1" || 
    hostname.includes("webcontainer") ||
    (import.meta as any).env?.DEV === true;

  if (isDevEnvironment) {
    // Default to true in development/preview to protect creator visits from inflating count
    localStorage.setItem(STORAGE_KEY_EXCLUDE_OWNER, "true");
    return true;
  }

  return false;
};

/**
 * Manually toggle or set the owner exclusion state.
 */
export const setOwnerExcluded = (excluded: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_EXCLUDE_OWNER, excluded ? "true" : "false");
};

/**
 * Get or create a session ID for visit deduplication in the current browser session.
 */
export const getSessionId = (): string => {
  if (typeof window === "undefined") return "server-session";
  let sessionId = sessionStorage.getItem(STORAGE_KEY_SESSION_ID);
  if (!sessionId) {
    sessionId = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem(STORAGE_KEY_SESSION_ID, sessionId);
  }
  return sessionId;
};

/**
 * Fetch latest visitor statistics from the backend server.
 */
export const fetchVisitorStats = async (): Promise<VisitorStats> => {
  const isExcluded = isOwnerExcluded();
  const sessionId = getSessionId();
  try {
    const res = await fetch(`/api/visits?isOwner=${isExcluded ? "1" : "0"}&sessionId=${encodeURIComponent(sessionId)}`);
    if (!res.ok) throw new Error("Failed to fetch visit stats");
    const data = await res.json();
    
    const stats: VisitorStats = {
      totalVisits: Number(data.totalVisits || 0),
      todayVisits: Number(data.todayVisits || 0),
      uniqueVisitors: Number(data.uniqueVisitors || 0),
      activeUsers: Number(data.activeUsers || 0),
      excludedOwnerVisits: Number(data.excludedOwnerVisits || 0),
      isOwnerExcluded: isExcluded,
      lastVisitTime: data.lastVisitTime
    };

    localStorage.setItem(STORAGE_KEY_CACHED_STATS, JSON.stringify(stats));
    return stats;
  } catch (err) {
    console.warn("[Visitor Counter] Could not fetch stats, using cached or fallback:", err);
    const cached = localStorage.getItem(STORAGE_KEY_CACHED_STATS);
    if (cached) {
      try {
        return { ...JSON.parse(cached), isOwnerExcluded: isExcluded };
      } catch (e) {}
    }
    return {
      totalVisits: 0,
      todayVisits: 0,
      uniqueVisitors: 0,
      activeUsers: 0,
      excludedOwnerVisits: 0,
      isOwnerExcluded: isExcluded
    };
  }
};

/**
 * Records a real visit on the server. If the user is flagged as owner,
 * the server records it as an excluded visit without incrementing the total.
 */
export const recordRealVisit = async (language: string = "es"): Promise<VisitorStats> => {
  const isExcluded = isOwnerExcluded();
  const sessionId = getSessionId();

  try {
    const res = await fetch("/api/visits/record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        isOwner: isExcluded,
        sessionId,
        language,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        path: typeof window !== "undefined" ? window.location.pathname : "/"
      })
    });

    if (!res.ok) throw new Error("Failed to record visit");
    const data = await res.json();

    const stats: VisitorStats = {
      totalVisits: Number(data.totalVisits || 0),
      todayVisits: Number(data.todayVisits || 0),
      uniqueVisitors: Number(data.uniqueVisitors || 0),
      activeUsers: Number(data.activeUsers || 0),
      excludedOwnerVisits: Number(data.excludedOwnerVisits || 0),
      isOwnerExcluded: isExcluded,
      lastVisitTime: data.lastVisitTime
    };

    localStorage.setItem(STORAGE_KEY_CACHED_STATS, JSON.stringify(stats));
    return stats;
  } catch (err) {
    console.warn("[Visitor Counter] Failed to record visit:", err);
    return fetchVisitorStats();
  }
};

/**
 * Lightweight safe tracker for general user interaction events without external dependencies like Mixpanel.
 */
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  // Silent or debug log in development
  if (typeof window !== "undefined" && (import.meta as any).env?.DEV) {
    console.debug(`[Event] ${eventName}`, properties);
  }
};
