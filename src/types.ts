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
