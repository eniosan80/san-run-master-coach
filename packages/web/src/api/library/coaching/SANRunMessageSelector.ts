/**
 * Seletor determinístico da Voz do Mentor SAN RUN V1.0.
 * Sem randomização, sem I/O. A situation é a fonte primária da seleção.
 */

import { SANRUN_MESSAGE_LIBRARY } from "./SANRunMessageLibrary";
import type {
  MentorDensity,
  MentorMessageSelectionInput,
  MentorMessageSelectionResult,
  MentorSituation,
  SANRunMessage,
} from "./types";

function adaptDensityForFrustration(density: MentorDensity): MentorDensity {
  return density === "high" ? "medium" : density;
}

function pickCandidate(
  situation: MentorSituation,
  recentMessageIds: readonly string[],
): SANRunMessage {
  const candidates = Array.from(SANRUN_MESSAGE_LIBRARY.values()).filter(
    (m) => m.situation === situation,
  );
  const first = candidates[0];
  if (first === undefined) {
    throw new Error(`Situação sem mensagem canônica: ${String(situation)}`);
  }
  const notRecent = candidates.find((m) => !recentMessageIds.includes(m.messageId));
  return notRecent ?? first;
}

export function selectMentorMessage(
  input: MentorMessageSelectionInput,
): MentorMessageSelectionResult {
  // painReported tem prioridade absoluta sobre a situation informada.
  const situation: MentorSituation = input.painReported === true ? "pain" : input.situation;
  const selected = pickCandidate(situation, input.recentMessageIds ?? []);

  // frustrated: preserva a mensagem e adapta SOMENTE tone e density.
  const frustrated = input.emotionalContext === "frustrated";

  return {
    messageId: selected.messageId,
    situation: selected.situation,
    intent: selected.intent,
    tone: frustrated ? "calm" : selected.tone,
    density: frustrated ? adaptDensityForFrustration(selected.density) : selected.density,
    canonical: selected.canonical,
    role: selected.role,
    variationAllowed: selected.role === "variation",
  };
}
