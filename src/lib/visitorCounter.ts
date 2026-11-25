/**
 * Client-side utilities for verified real visitor counting.
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
const STORAGE_KEY_CLEANUP_DONE = "graphostudio_owner_flag_cleared_v3";

// One-time cleanup of legacy auto-exclusion that was mistakenly set on ais-dev/preview
if (typeof window !== "undefined") {
  try {
    if (!localStorage.getItem(STORAGE_KEY_CLEANUP_DONE)) {
      localStorage.removeItem(STORAGE_KEY_EXCLUDE_OWNER);
      localStorage.setItem(STORAGE_KEY_CLEANUP_DONE, "true");
    }
  } catch {}
}

/**
 * Checks whether the current user explicitly activated owner exclusion mode.
 * Defaults to false so all genuine visits count.
 */
export const isOwnerExcluded = (): boolean => {
  if (typeof window === "undefined") return false;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("exclude_owner") === "true") {
    localStorage.setItem(STORAGE_KEY_EXCLUDE_OWNER, "true");
    return true;
  }
  if (urlParams.get("exclude_owner") === "false") {
    localStorage.removeItem(STORAGE_KEY_EXCLUDE_OWNER);
    return false;
  }

  const stored = localStorage.getItem(STORAGE_KEY_EXCLUDE_OWNER);
  return stored === "true";
};

/**
 * Manually toggle or set the owner exclusion state.
 */
export const setOwnerExcluded = (excluded: boolean): void => {
  if (typeof window === "undefined") return;
  if (excluded) {
    localStorage.setItem(STORAGE_KEY_EXCLUDE_OWNER, "true");
  } else {
    localStorage.removeItem(STORAGE_KEY_EXCLUDE_OWNER);
  }
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
      totalVisits: 1,
      todayVisits: 1,
      uniqueVisitors: 1,
      activeUsers: 1,
      excludedOwnerVisits: 0,
      isOwnerExcluded: isExcluded
    };
  }
};

/**
 * Records a visit on the server.
 */
export const recordRealVisit = async (language: string = "es", force: boolean = false): Promise<VisitorStats> => {
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
        force,
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
 * Explicit test increment to verify counter in 1 click.
 */
export const recordTestVisit = async (): Promise<VisitorStats> => {
  try {
    const res = await fetch("/api/visits/test-increment", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      const data = await res.json();
      const stats: VisitorStats = {
        totalVisits: Number(data.totalVisits || 0),
        todayVisits: Number(data.todayVisits || 0),
        uniqueVisitors: Number(data.uniqueVisitors || 0),
        activeUsers: Number(data.activeUsers || 0),
        excludedOwnerVisits: Number(data.excludedOwnerVisits || 0),
        isOwnerExcluded: isOwnerExcluded(),
        lastVisitTime: data.lastVisitTime
      };
      localStorage.setItem(STORAGE_KEY_CACHED_STATS, JSON.stringify(stats));
      return stats;
    }
  } catch (e) {
    console.error("Test increment failed:", e);
  }
  return recordRealVisit("es", true);
};

/**
 * Safe client tracker for internal UX events.
 */
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && (import.meta as any).env?.DEV) {
    console.debug(`[Event] ${eventName}`, properties);
  }
};
