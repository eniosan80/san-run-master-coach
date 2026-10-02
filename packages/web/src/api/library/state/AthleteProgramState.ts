/**
 * Contrato de estado persistente do atleta dentro de um programa.
 *
 * Responsabilidade exclusiva:
 * Representar genericamente onde o atleta está metodologicamente.
 *
 * Não conhece: 2K, 3K, progression engine, banco, API, UI, calendar.
 * Apenas: estado, validações explícitas, aplicação de progressão.
 *
 * Funções puras, determinísticas, sem I/O, sem side-effects.
 */

export type AthleteProgramStatus =
  | "active"
  | "paused"
  | "completed";

export type AthleteProgramState = {
  athleteId: string;
  programId: string;
  status: AthleteProgramStatus;
  sessionsPerWeek: 2 | 3;
  currentStage: number;
  currentSessionId: string;
  sourceProgramId?: string;
  startedAt: string;
  updatedAt: string;
};

export type GenericProgression = {
  decision: "advance" | "consolidate" | "not_done";
  nextStage: number;
  nextSessionId: string | null;
};

/**
 * Cria um novo estado de programa para um atleta.
 *
 * Validações:
 * - athleteId não vazio
 * - programId não vazio
 * - currentSessionId não vazio
 * - sessionsPerWeek === 2 ou 3
 * - currentStage >= 1
 * - startedAt não vazio
 * - updatedAt não vazio
 *
 * Função pura: mesma entrada = mesma saída.
 */
export function createAthleteProgramState(input: {
  athleteId: string;
  programId: string;
  sessionsPerWeek: 2 | 3;
  currentStage: number;
  currentSessionId: string;
  sourceProgramId?: string;
  startedAt: string;
  updatedAt: string;
}): AthleteProgramState {
  // Validação: athleteId
  if (!input.athleteId || input.athleteId.trim() === "") {
    throw new Error("athleteId não pode estar vazio");
  }

  // Validação: programId
  if (!input.programId || input.programId.trim() === "") {
    throw new Error("programId não pode estar vazio");
  }

  // Validação: currentSessionId
  if (!input.currentSessionId || input.currentSessionId.trim() === "") {
    throw new Error("currentSessionId não pode estar vazio");
  }

  // Validação: sessionsPerWeek
  if (input.sessionsPerWeek !== 2 && input.sessionsPerWeek !== 3) {
    throw new Error("sessionsPerWeek deve ser 2 ou 3");
  }

  // Validação: currentStage
  if (input.currentStage < 1) {
    throw new Error("currentStage deve ser >= 1");
  }

  // Validação: startedAt
  if (!input.startedAt || input.startedAt.trim() === "") {
    throw new Error("startedAt não pode estar vazio");
  }

  // Validação: updatedAt
  if (!input.updatedAt || input.updatedAt.trim() === "") {
    throw new Error("updatedAt não pode estar vazio");
  }

  return {
    athleteId: input.athleteId,
    programId: input.programId,
    status: "active",
    sessionsPerWeek: input.sessionsPerWeek,
    currentStage: input.currentStage,
    currentSessionId: input.currentSessionId,
    sourceProgramId: input.sourceProgramId,
    startedAt: input.startedAt,
    updatedAt: input.updatedAt,
  };
}

/**
 * Aplica uma progressão a um estado existente.
 *
 * Regras:
 * 1. not_done → mantém tudo
 * 2. consolidate → mantém stage e session
 * 3. advance com nextSessionId !== null → atualiza stage e session
 * 4. advance com nextSessionId === null → marca completed
 *
 * Validações:
 * - status === "paused" → erro
 * - status === "completed" → erro
 * - sourceProgramId é imutável
 * - estado original não é mutado
 *
 * Função pura: não modifica input, retorna novo estado.
 */
export function applyProgressionToAthleteProgramState(
  state: AthleteProgramState,
  progression: GenericProgression
): AthleteProgramState {
  // Validação: estado paused
  if (state.status === "paused") {
    throw new Error(
      "Não é possível aplicar progressão a um programa pausado"
    );
  }

  // Validação: estado completed
  if (state.status === "completed") {
    throw new Error(
      "Não é possível aplicar progressão a um programa completado"
    );
  }

  // Regra 1: not_done → mantém tudo
  if (progression.decision === "not_done") {
    return { ...state };
  }

  // Regra 2: consolidate → mantém stage e session
  if (progression.decision === "consolidate") {
    return { ...state };
  }

  // Regra 3 e 4: advance
  if (progression.decision === "advance") {
    // Regra 4: nextSessionId === null → completed
    if (progression.nextSessionId === null) {
      return {
        ...state,
        status: "completed",
      };
    }

    // Regra 3: nextSessionId !== null → avança
    return {
      ...state,
      currentStage: progression.nextStage,
      currentSessionId: progression.nextSessionId,
    };
  }

  // Fallback (nunca deve chegar aqui se progression.decision é válido)
  throw new Error(
    `Decisão de progressão inválida: ${progression.decision}`
  );
}
