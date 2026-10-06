/**
 * Tipos da Voz do Mentor SAN RUN V1.0
 * Apenas tipagem de domínio, sem lógica de decisão metodológica.
 */

export type MentorSituation =
  | "welcome"
  | "fear"
  | "anxiety"
  | "missed_workout"
  | "incomplete_workout"
  | "difficult_workout"
  | "pain"
  | "recovery"
  | "achievement"
  | "advance"
  | "consolidate"
  | "adapt"
  | "regress_1"
  | "regress_2"
  | "not_done"
  | "correction"
  | "discouragement"
  | "quit"
  | "return"
  | "autonomy";

export type MentorIntent =
  | "welcome"
  | "understand"
  | "reassure"
  | "slow_down"
  | "encourage"
  | "celebrate"
  | "correct"
  | "protect"
  | "explain"
  | "consolidate"
  | "guide"
  | "invite_reflection"
  | "support_autonomy";

export type MentorTone =
  | "warm"
  | "calm"
  | "encouraging"
  | "firm"
  | "protective"
  | "reflective"
  | "celebratory";

export type MentorDensity = "low" | "medium" | "high";

export type EmotionalContext =
  | "neutral"
  | "uncertain"
  | "fear"
  | "anxious"
  | "discouraged"
  | "frustrated";

export type MessageRole = "canonical" | "variation" | "anchor" | "signature";

export type MessageSource =
  | "official_document"
  | "san_run_existing"
  | "operational_definition";

export type MentorMethodologicalDecision =
  | "advance"
  | "consolidate"
  | "adapt"
  | "regress_1"
  | "regress_2"
  | "not_done";

export type SANRunMessage = {
  messageId: string;
  situation: MentorSituation;
  intent: MentorIntent;
  tone: MentorTone;
  density: MentorDensity;
  canonical: string;
  decision?: MentorMethodologicalDecision;
  role: MessageRole;
  source: MessageSource;
  questions?: string[];
};

export type MentorValidationResult = {
  valid: boolean;
  violations: string[];
};

export type MentorMessageSelectionInput = {
  situation: MentorSituation;
  emotionalContext?: EmotionalContext;
  painReported?: boolean;
  recentMessageIds?: string[];
  decision?: MentorMethodologicalDecision;
};

export type MentorMessageSelectionResult = {
  messageId: string;
  situation: MentorSituation;
  intent: MentorIntent;
  tone: MentorTone;
  density: MentorDensity;
  canonical: string;
  role: MessageRole;
  variationAllowed: boolean;
};
