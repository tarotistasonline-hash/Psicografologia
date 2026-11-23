export interface Temperament {
  sanguine: number;
  choleric: number;
  melancholic: number;
  phlegmatic: number;
}

export interface CoreTrait {
  trait: string;
  level: number;
  description: string;
  indicator: string;
}

export interface GraphologicalObservation {
  feature: string;
  observed: string;
  psychologicalMeaning: string;
}

export interface EmotionalState {
  anxiety: number;
  stress: number;
  fatigue: number;
  confidence: number;
}

export interface PsychInsight {
  title: string;
  insight: string;
}

export interface AnalysisReportData {
  temperament: Temperament;
  coreTraits: CoreTrait[];
  graphologicalObservations: GraphologicalObservation[];
  emotionalState: EmotionalState;
  psychologicalProfile: string;
  strengths: PsychInsight[];
  challenges: PsychInsight[];
  careerRecommendations: string[];
}

export interface GuidedAnswers {
  size: string;
  slant: string;
  baseline: string;
  pressure: string;
  connections: string;
  spacing: string;
  margins: string;
  signature: string;
}

export type PlanId = "pack1" | "pack5" | "pro";

export interface PaymentSettings {
  pack1Url: string;
  pack5Url: string;
  proUrl: string;
  pack1Price: string;
  pack5Price: string;
  proPrice: string;
  contactEmail: string;
  whatsappNumber: string;
}

export interface UserQuota {
  clientId: string;
  freeUsed: number;
  freeLimit: number;
  freeRemaining: number;
  paidCredits: number;
  isProUnlimited: boolean;
  hasAccess: boolean;
  totalStudies: number;
  stripeEnabled?: boolean;
  paymentSettings: PaymentSettings;
}

export interface ActivationCode {
  code: string;
  planId: PlanId;
  creditsToAdd: number;
  grantsPro: boolean;
  maxUses: number;
  usedCount: number;
  createdAt: number;
  note?: string;
}

export interface StudyHistoryItem {
  id: string;
  createdAt: number;
  method: "canvas" | "upload" | "guided";
  language: "es" | "pt" | "en";
  summaryPreview: string;
  dominantTemperament: string;
  report: AnalysisReportData;
}

