/**
 * Componente determinístico de transição 2K → 3K.
 *
 * Responsabilidade exclusiva:
 * Avaliar o resultado do desafio final de um programa 2K (CONTINUOUS ou 2X)
 * e retornar se o atleta deve avançar para 3K, consolidar 2K, não atingiu o objetivo ou não realizou.
 *
 * Função pura, sem I/O, sem side-effects, determinística.
 */

export type TwoKProgramId =
  | "2K_CONTINUOUS"
  | "2K_CONTINUOUS_2X";

export type TwoKTransitionInput = {
  sourceProgramId: TwoKProgramId;
  completed: boolean;
  objective: {
    achieved: boolean;
    continuous: boolean;
    durationSeconds?: number;
    distanceKm?: number;
  };
  actualPse?: number;
};

export type TwoKTransitionDecision =
  | "advance_to_3k"
  | "consolidate_2k"
  | "not_achieved"
  | "not_done";

export type TwoKTransitionResult = {
  decision: TwoKTransitionDecision;
  targetProgramId: "PROGRAM_3K_EXTENSION" | null;
  reason: string;
};

/**
 * Avalia a transição 2K → 3K de forma determinística.
 *
 * Regras de decisão (aplicadas em ordem):
 * 1. completed === false → not_done
 * 2. completed === true && objective.continuous === false → not_achieved
 * 3. completed === true && objective.achieved === false → not_achieved
 * 4. objetivo atingido sem actualPse → consolidate_2k
 * 5. actualPse >= 7 → consolidate_2k
 * 6. actualPse >= 5 && actualPse <= 6 → advance_to_3k
 * 7. actualPse < 5 → advance_to_3k
 *
 * targetProgramId:
 * - "PROGRAM_3K_EXTENSION" quando decision === "advance_to_3k"
 * - null para todas as demais decisões
 */
export function evaluateTwoKTransition(
  input: TwoKTransitionInput
): TwoKTransitionResult {
  // Regra 1: Treino não foi realizado
  if (!input.completed) {
    return {
      decision: "not_done",
      targetProgramId: null,
      reason: "Treino não foi realizado. Aguarde próxima oportunidade.",
    };
  }

  // Regra 2: Treino realizado mas não foi contínuo
  if (!input.objective.continuous) {
    return {
      decision: "not_achieved",
      targetProgramId: null,
      reason: "Objetivo não realizado: treino não foi contínuo.",
    };
  }

  // Regra 3: Treino realizado e contínuo mas objetivo não atingido
  if (!input.objective.achieved) {
    return {
      decision: "not_achieved",
      targetProgramId: null,
      reason: "Objetivo não realizado: não atingiu a distância/duração esperada.",
    };
  }

  // A partir daqui: treino realizado, contínuo e objetivo atingido

  // Regra 4: Objetivo atingido sem PSE definido
  if (input.actualPse === undefined) {
    return {
      decision: "consolidate_2k",
      targetProgramId: null,
      reason: "Objetivo atingido, mas PSE não foi registrado. Consolidar 2K antes de avançar.",
    };
  }

  // Regra 5: PSE >= 7 (tolerância baixa)
  if (input.actualPse >= 7) {
    return {
      decision: "consolidate_2k",
      targetProgramId: null,
      reason: `PSE ${input.actualPse} (tolerância baixa). Consolidar 2K antes de avançar para 3K.`,
    };
  }

  // Regra 6: PSE 5-6 (tolerância ótima)
  if (input.actualPse >= 5 && input.actualPse <= 6) {
    return {
      decision: "advance_to_3k",
      targetProgramId: "PROGRAM_3K_EXTENSION",
      reason: `PSE ${input.actualPse} (tolerância ótima). Atleta pronto para avançar para 3K.`,
    };
  }

  // Regra 7: PSE < 5 (tolerância excelente)
  return {
    decision: "advance_to_3k",
    targetProgramId: "PROGRAM_3K_EXTENSION",
    reason: `PSE ${input.actualPse} (tolerância excelente). Atleta bem recuperado, pronto para 3K.`,
  };
}
