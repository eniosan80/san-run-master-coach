/**
 * Validador da Voz do Mentor SAN RUN V1.0.
 * Recebe unknown e valida estrutura, valores de enum do domínio e regras de pergunta.
 * Sem casts inseguros: apenas Record<string, unknown>.
 */

import type {
  MentorDensity,
  MentorIntent,
  MentorMethodologicalDecision,
  MentorSituation,
  MentorTone,
  MentorValidationResult,
  MessageRole,
  MessageSource,
} from "./types";

const SITUATIONS: readonly MentorSituation[] = [
  "welcome", "fear", "anxiety", "missed_workout", "incomplete_workout",
  "difficult_workout", "pain", "recovery", "achievement", "advance",
  "consolidate", "adapt", "regress_1", "regress_2", "not_done",
  "correction", "discouragement", "quit", "return", "autonomy",
];
const INTENTS: readonly MentorIntent[] = [
  "welcome", "understand", "reassure", "slow_down", "encourage", "celebrate", "correct",
  "protect", "explain", "consolidate", "guide", "invite_reflection", "support_autonomy",
];
const TONES: readonly MentorTone[] = [
  "warm", "calm", "encouraging", "firm", "protective", "reflective", "celebratory",
];
const DENSITIES: readonly MentorDensity[] = ["low", "medium", "high"];
const ROLES: readonly MessageRole[] = ["canonical", "variation", "anchor", "signature"];
const SOURCES: readonly MessageSource[] = [
  "official_document", "san_run_existing", "operational_definition",
];
const DECISIONS: readonly MentorMethodologicalDecision[] = [
  "advance", "consolidate", "adapt", "regress_1", "regress_2", "not_done",
];

function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

export function validateSANRunMessage(input: unknown): MentorValidationResult {
  const violations: string[] = [];

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { valid: false, violations: ["mensagem deve ser um objeto"] };
  }
  const obj = input as Record<string, unknown>;

  if (!isNonEmptyString(obj.messageId)) violations.push("messageId inválido");
  if (!isOneOf(SITUATIONS, obj.situation)) violations.push("situation inválida");
  if (!isOneOf(INTENTS, obj.intent)) violations.push("intent inválido");
  if (!isOneOf(TONES, obj.tone)) violations.push("tone inválido");
  if (!isOneOf(DENSITIES, obj.density)) violations.push("density inválida");
  if (!isNonEmptyString(obj.canonical)) violations.push("canonical inválido");
  if (!isOneOf(ROLES, obj.role)) violations.push("role inválido");
  if (!isOneOf(SOURCES, obj.source)) violations.push("source inválido");
  if (obj.decision !== undefined && !isOneOf(DECISIONS, obj.decision)) {
    violations.push("decision inválida");
  }

  const questionMarkCount =
    typeof obj.canonical === "string"
      ? (obj.canonical.match(/\?/g) ?? []).length
      : 0;
  if (questionMarkCount > 1) {
    violations.push("canonical deve conter no máximo 1 caractere '?'");
  }
  if (questionMarkCount > 0 && obj.questions !== undefined) {
    violations.push("canonical com '?' não pode ter questions definido");
  }

  if (obj.questions !== undefined) {
    if (!Array.isArray(obj.questions)) {
      violations.push("questions deve ser undefined ou array");
    } else if (!obj.questions.every((q: unknown) => typeof q === "string")) {
      violations.push("todos os elementos de questions devem ser string");
    }
  }

  return { valid: violations.length === 0, violations };
}
