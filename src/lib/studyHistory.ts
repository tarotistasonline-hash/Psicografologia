import { AnalysisReportData, StudyHistoryItem } from "../types";

const STORAGE_KEY_HISTORY = "graphostudio_study_history";
const MAX_HISTORY_ITEMS = 50;

export function getStudyHistory(): StudyHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStudyToHistory(
  report: AnalysisReportData,
  method: "canvas" | "upload" | "guided",
  language: "es" | "pt" | "en"
): StudyHistoryItem[] {
  if (typeof window === "undefined") return [];
  const entries = Object.entries(report.temperament) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const dominantKey = entries[0]?.[0] || "sanguine";

  const labels: Record<string, { es: string; pt: string; en: string }> = {
    sanguine: { es: "Sanguíneo", pt: "Sanguíneo", en: "Sanguine" },
    choleric: { es: "Colérico", pt: "Colérico", en: "Choleric" },
    melancholic: { es: "Melancólico", pt: "Melancólico", en: "Melancholic" },
    phlegmatic: { es: "Flemático", pt: "Fleumático", en: "Phlegmatic" },
  };

  const newItem: StudyHistoryItem = {
    id: `st_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
    method,
    language,
    dominantTemperament: labels[dominantKey]?.[language] || dominantKey,
    summaryPreview: report.psychologicalProfile.slice(0, 140) + "...",
    report,
  };

  const existing = getStudyHistory();
  const updated = [newItem, ...existing].slice(0, MAX_HISTORY_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch {
    // Ignore storage limit errors
  }
  return updated;
}

export function deleteStudyFromHistory(id: string): StudyHistoryItem[] {
  const existing = getStudyHistory();
  const updated = existing.filter((item) => item.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }
  return updated;
}
