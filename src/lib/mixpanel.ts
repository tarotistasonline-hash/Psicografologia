import mixpanel from "mixpanel-browser";

// Check environment variable or fallback to localStorage custom token entered in UI
const getStoredToken = () => {
  if (typeof window === "undefined") return "";
  const envToken = (import.meta as any).env.VITE_MIXPANEL_TOKEN;
  if (envToken && envToken.trim() !== "") {
    return envToken.trim();
  }
  return localStorage.getItem("custom_mixpanel_token") || "";
};

let activeToken = getStoredToken();
let isInitialized = false;

// Local event log for the interactive panel/dashboard
export interface TrackedEventRecord {
  name: string;
  properties: Record<string, any>;
  timestamp: string;
  simulated: boolean;
}

const localEventLog: TrackedEventRecord[] = [];
type EventListener = (event: TrackedEventRecord) => void;
const listeners: Set<EventListener> = new Set();

/**
 * Register a listener to be notified when a new event is tracked
 */
export const subscribeToEvents = (listener: EventListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Returns the current live log of tracked events
 */
export const getLocalEventLog = () => [...localEventLog];

/**
 * Safely resolves the mixpanel object, handling different bundler export conventions
 */
const getMixpanel = () => {
  if (typeof window === "undefined") return null;
  let mp: any = mixpanel;
  if (mp && mp.default) {
    mp = mp.default;
  }
  return mp;
};

/**
 * Initializes Mixpanel if a token is provided in the environment or localStorage.
 */
export const initMixpanel = (customToken?: string) => {
  try {
    const mp = getMixpanel();
    if (!mp) {
      console.log("[Mixpanel] Browser context or mixpanel library is not available.");
      return;
    }

    if (customToken !== undefined) {
      activeToken = customToken;
      if (typeof window !== "undefined") {
        if (customToken) {
          localStorage.setItem("custom_mixpanel_token", customToken);
        } else {
          localStorage.removeItem("custom_mixpanel_token");
        }
      }
    } else {
      activeToken = getStoredToken();
    }

    if (activeToken && activeToken.trim() !== "") {
      mp.init(activeToken, {
        debug: (import.meta as any).env.DEV,
        track_pageview: true,
        persistence: "localStorage",
      });
      isInitialized = true;
      console.log("[Mixpanel] Successfully initialized with token:", activeToken.substring(0, 6) + "...");
    } else {
      isInitialized = false;
      console.log(
        "[Mixpanel] VITE_MIXPANEL_TOKEN is not configured and no custom token found. Running in simulation mode (events logged to console)."
      );
    }
  } catch (error) {
    console.error("[Mixpanel] Error during initialization:", error);
  }
};

/**
 * Gets the current active token
 */
export const getActiveToken = () => activeToken;

/**
 * Checks if Mixpanel is currently initialized with a token
 */
export const isMixpanelActive = () => isInitialized;

/**
 * Tracks an event in Mixpanel.
 * @param eventName Name of the event (e.g., "Analysis Started", "Viewed Blog")
 * @param properties Optional metadata for the event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  const record: TrackedEventRecord = {
    name: eventName,
    properties: properties || {},
    timestamp: new Date().toLocaleTimeString(),
    simulated: !isInitialized,
  };

  // Add to local logs
  localEventLog.unshift(record);
  if (localEventLog.length > 50) {
    localEventLog.pop();
  }

  // Notify subscribers
  listeners.forEach((listener) => {
    try {
      listener(record);
    } catch (e) {
      console.error(e);
    }
  });

  try {
    if (isInitialized) {
      const mp = getMixpanel();
      if (mp && typeof mp.track === "function") {
        mp.track(eventName, properties);
        return;
      }
    }
    console.log(`[Mixpanel Sim] Event tracked: "${eventName}"`, properties);
  } catch (error) {
    console.error(`[Mixpanel] Error tracking event "${eventName}":`, error);
  }
};

/**
 * Identifies a user with a unique ID and optionally sets user properties.
 * @param userId Unique ID for the user
 * @param userProperties Optional properties to update on the user profile
 */
export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  try {
    if (isInitialized) {
      const mp = getMixpanel();
      if (mp && typeof mp.identify === "function") {
        mp.identify(userId);
        if (userProperties && mp.people && typeof mp.people.set === "function") {
          mp.people.set(userProperties);
        }
        return;
      }
    }
    console.log(`[Mixpanel Sim] Identified user: "${userId}"`, userProperties);
  } catch (error) {
    console.error(`[Mixpanel] Error identifying user "${userId}":`, error);
  }
};

