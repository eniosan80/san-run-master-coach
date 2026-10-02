/**
 * Progression Engine para 3K Extension.
 *
 * Responsabilidade exclusiva:
 * Avaliar o resultado de uma sessão 3K e determinar o próximo estado metodológico.
 *
 * Calendário = quando o treino acontece.
 * Progression Engine = qual estímulo vem depois.
 *
 * Função pura, determinística, sem I/O, sem side-effects.
 */

export type ThreeKStage = 1 | 2 | 3 | 4;

export type ThreeKProgressionDecision =
  | "advance"
  | "consolidate"
  | "not_done";

export type ThreeKProgressionInput = {
  programId: "PROGRAM_3K_EXTENSION";
  stage: ThreeKStage;
  sessionId: string;
  completed: boolean;
  actualPse?: number;
  control?: "controlled" | "borderline" | "poor";
  tolerated?: boolean;
};

export type ThreeKProgressionResult = {
  decision: ThreeKProgressionDecision;
  currentStage: ThreeKStage;
  nextStage: ThreeKStage;
  nextSessionId: string | null;
  reason: string;
};

/**
 * Tabela determinística de progressão para 3K Extension.
 * Cada sessão mapeia para a próxima sessão quando advance.
 */
const PROGRESSION_TABLE: Record<string, string | null> = {
  // Stage 1
  "3K-S1-T1": "3K-S1-T2",
  "3K-S1-T2": "3K-S1-T3",
  "3K-S1-T3": "3K-S2-T1",
  // Stage 2
  "3K-S2-T1": "3K-S2-T2",
  "3K-S2-T2": "3K-S2-T3",
  "3K-S2-T3": "3K-S3-T1",
  // Stage 3
  "3K-S3-T1": "3K-S3-T2",
  "3K-S3-T2": "3K-S3-T3",
  "3K-S3-T3": "3K-S3-T4",
  "3K-S3-T4": "3K-S3-T5",
  "3K-S3-T5": "3K-S3-T6",
  "3K-S3-T6": "3K-S4-T1",
  // Stage 4
  "3K-S4-T1": "3K-S4-T2",
  "3K-S4-T2": null,
};

/**
 * Mapa de sessões válidas por stage.
 * Valida se uma sessão pertence ao stage informado.
 */
const VALID_SESSIONS_BY_STAGE: Record<ThreeKStage, Set<string>> = {
  1: new Set(["3K-S1-T1", "3K-S1-T2", "3K-S1-T3"]),
  2: new Set(["3K-S2-T1", "3K-S2-T2", "3K-S2-T3"]),
  3: new Set([
    "3K-S3-T1",
    "3K-S3-T2",
    "3K-S3-T3",
    "3K-S3-T4",
    "3K-S3-T5",
    "3K-S3-T6",
  ]),
  4: new Set(["3K-S4-T1", "3K-S4-T2"]),
};

/**
 * Extrai o stage de uma sessionId.
 * Exemplo: "3K-S2-T3" → 2
 */
function extractStageFromSessionId(sessionId: string): ThreeKStage | null {
  const match = sessionId.match(/3K-S(\d)-T\d+/);
  if (!match) return null;
  const stage = parseInt(match[1], 10) as ThreeKStage;
  if (![1, 2, 3, 4].includes(stage)) return null;
  return stage;
}

/**
 * Valida se uma sessionId é válida para um stage.
 */
function isValidSessionForStage(
  sessionId: string,
  stage: ThreeKStage
): boolean {
  return VALID_SESSIONS_BY_STAGE[stage].has(sessionId);
}

/**
 * Resolve o nextStage baseado na nextSessionId.
 * Quando avança para outra stage, nextStage muda.
 */
function resolveNextStage(
  currentStage: ThreeKStage,
  nextSessionId: string | null
): ThreeKStage {
  if (nextSessionId === null) {
    return currentStage;
  }
  const nextStageFromSession = extractStageFromSessionId(nextSessionId);
  return nextStageFromSession ?? currentStage;
}

/**
 * Avalia a progressão 3K de forma determinística.
 *
 * Regras de decisão:
 * 1. completed === false → not_done (sem regressão)
 * 2. completed === true && actualPse === undefined → consolidate
 * 3. actualPse === 0 → advance
 * 4. actualPse <= 4 → advance
 * 5. actualPse >= 5 && actualPse <= 6 → advance
 * 6. actualPse >= 7 → consolidate
 *
 * control e tolerated existem no contrato mas não alteram a decisão em V1.
 */
export function evaluateThreeKProgression(
  input: ThreeKProgressionInput
): ThreeKProgressionResult {
  // Validar programId
  if (input.programId !== "PROGRAM_3K_EXTENSION") {
    throw new Error(
      `ProgramId inválido: ${input.programId}. Esperado: PROGRAM_3K_EXTENSION`
    );
  }

  // Validar sessionId para o stage
  if (!isValidSessionForStage(input.sessionId, input.stage)) {
    throw new Error(
      `Session inválida para o Stage informado: ${input.sessionId} não pertence a Stage ${input.stage}`
    );
  }

  // Regra 1: Treino não foi realizado
  if (!input.completed) {
    return {
      decision: "not_done",
      currentStage: input.stage,
      nextStage: input.stage,
      nextSessionId: input.sessionId,
      reason: "Treino não foi realizado. Aguarde próxima oportunidade.",
    };
  }

  // Regra 2: Treino realizado mas sem PSE
  if (input.actualPse === undefined) {
    return {
      decision: "consolidate",
      currentStage: input.stage,
      nextStage: input.stage,
      nextSessionId: input.sessionId,
      reason: "Treino realizado, mas PSE não foi registrado. Consolidar sessão.",
    };
  }

  // Regra 3: PSE === 0 (avanço automático)
  if (input.actualPse === 0) {
    const nextSessionId = PROGRESSION_TABLE[input.sessionId] ?? null;
    const nextStage = resolveNextStage(input.stage, nextSessionId);
    return {
      decision: "advance",
      currentStage: input.stage,
      nextStage,
      nextSessionId,
      reason: `PSE ${input.actualPse} (recuperação excelente). Avançar para próxima sessão.`,
    };
  }

  // Regra 4: PSE <= 4 (avanço)
  if (input.actualPse <= 4) {
    const nextSessionId = PROGRESSION_TABLE[input.sessionId] ?? null;
    const nextStage = resolveNextStage(input.stage, nextSessionId);
    return {
      decision: "advance",
      currentStage: input.stage,
      nextStage,
      nextSessionId,
      reason: `PSE ${input.actualPse} (recuperação ótima). Avançar para próxima sessão.`,
    };
  }

  // Regra 5: PSE >= 5 && PSE <= 6 (avanço)
  if (input.actualPse >= 5 && input.actualPse <= 6) {
    const nextSessionId = PROGRESSION_TABLE[input.sessionId] ?? null;
    const nextStage = resolveNextStage(input.stage, nextSessionId);
    return {
      decision: "advance",
      currentStage: input.stage,
      nextStage,
      nextSessionId,
      reason: `PSE ${input.actualPse} (recuperação boa). Avançar para próxima sessão.`,
    };
  }

  // Regra 6: PSE >= 7 (consolidação)
  return {
    decision: "consolidate",
    currentStage: input.stage,
    nextStage: input.stage,
    nextSessionId: input.sessionId,
    reason: `PSE ${input.actualPse} (tolerância baixa). Consolidar sessão atual.`,
  };
}
