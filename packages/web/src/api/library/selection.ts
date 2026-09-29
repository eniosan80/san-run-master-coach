import type { ProgramId } from "./types";

/**
 * Seleciona o programa oficial de 2 km para iniciantes
 * conforme a disponibilidade semanal de treinos.
 *
 * Regra atual:
 * - 2 treinos/semana → programa 2K_CONTINUOUS_2X
 * - 3 treinos/semana → programa 2K_CONTINUOUS
 */
export const select2KProgram = (
  sessionsPerWeek: 2 | 3,
): ProgramId => {
  if (sessionsPerWeek === 2) {
    return "2K_CONTINUOUS_2X";
  }

  return "2K_CONTINUOUS";
};
