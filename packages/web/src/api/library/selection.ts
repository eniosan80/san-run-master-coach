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

/**
 * Resultado da resolução do programa oficial de 2 km a partir da
 * quantidade de dias disponíveis para treinar.
 */
export type TwoKProgramSelection =
  | {
      status: "requires_more_days";
      minSessionsPerWeek: 2;
    }
  | {
      status: "selected";
      programId: ProgramId;
      sessionsPerWeek: 2 | 3;
    };

/**
 * Resolve qual programa oficial de 2 km deve ser selecionado a partir da
 * quantidade de dias disponíveis por semana (`trainingDays`).
 *
 * Regra metodológica:
 * - 0 ou 1 dia  → requer mais dias (mínimo de 2 treinos por semana)
 * - 2 dias      → programa 2K_CONTINUOUS_2X (2 sessões por semana)
 * - 3 ou mais   → programa 2K_CONTINUOUS (3 sessões por semana);
 *                 não existe programa oficial com 4 ou 5 sessões
 *
 * Função pura e determinística: sem dependência de UI, onboarding,
 * banco de dados, calendário ou PrescriptionEngine.
 */
export const resolve2KProgramSelection = (
  availableDays: number,
): TwoKProgramSelection => {
  if (availableDays >= 3) {
    return {
      status: "selected",
      programId: select2KProgram(3),
      sessionsPerWeek: 3,
    };
  }

  if (availableDays === 2) {
    return {
      status: "selected",
      programId: select2KProgram(2),
      sessionsPerWeek: 2,
    };
  }

  return {
    status: "requires_more_days",
    minSessionsPerWeek: 2,
  };
};
