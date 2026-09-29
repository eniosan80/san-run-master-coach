// ============================================================================
// BIBLIOTECA OFICIAL SAN RUN — TIPOS
//
// Tipos próprios e independentes da biblioteca. NÃO reutilizam nem alteram o
// WorkoutBlock legado de `api/lib/classify.ts` nem os tipos do PrescriptionEngine.
// ============================================================================

/** Tipos de sessão permitidos. */
export type SessionType =
  | "run_walk"
  | "walk"
  | "fartlek"
  | "walk_trot"
  | "continuous_run"
  | "challenge";

/** Papel da sessão dentro da progressão do programa. */
export type ProgressionRole =
  | "adaptation"
  | "consolidation"
  | "progression"
  | "final_prep"
  | "taper"
  | "challenge";

/**
 * Um bloco de trabalho.
 * Intensidade: FR = caminhada (PSE 1–3) · MO = moderado (PSE 4–6) · FO = forte (PSE 7–8)
 */
export type WorkoutBlock = {
  order: number;
  activity: "run" | "walk" | "trot";
  durationSeconds: number;
  intensity: "FR" | "MO" | "FO";
  pseMin: number;
  pseMax: number;
  label?: string;
};

/** Sequência de blocos repetida `repetitions` vezes. */
export type WorkoutBlockSequence = {
  blocks: WorkoutBlock[];
  repetitions: number;
};

/**
 * Critério de conclusão — contrato fechado.
 * `continuous: true` significa "sem caminhada".
 */
export type CompletionCriteria =
  | {
      type: "duration";
      targetSeconds: number;
      continuous: true;
    }
  | {
      type: "distance";
      targetKm: number;
      continuous: true;
    }
  | {
      type: "duration_or_distance";
      options: [
        {
          type: "duration";
          targetSeconds: number;
          continuous: true;
        },
        {
          type: "distance";
          targetKm: number;
          continuous: true;
        },
      ];
    };

/** Uma sessão de treino do programa. */
export type TrainingSession = {
  id: string;
  programId: "2K_CONTINUOUS";
  /** Semana do programa (1–7). */
  week: number;
  /** Posição da sessão dentro da semana (1–3). */
  sessionNumber: 1 | 2 | 3;
  title: string;
  type: SessionType;
  objective: string;
  /** `null` quando a metodologia não define aquecimento para a sessão. */
  warmup: WorkoutBlockSequence | null;
  /** Corpo da sessão, em ordem de execução. */
  blocks: WorkoutBlockSequence[];
  /** `null` quando a metodologia não define desaquecimento para a sessão. */
  cooldown: WorkoutBlockSequence | null;
  athleteGuidance: string;
  /** Ausente quando a metodologia não define critério de conclusão para a sessão. */
  completionCriteria?: CompletionCriteria;
  progressionRole: ProgressionRole;
};

/** Programa de treino oficial. */
export type TrainingProgram = {
  id: "2K_CONTINUOUS";
  name: "Correr 2 km ou 15 minutos sem caminhar";
  weeks: 7;
  sessionsPerWeek: 3;
  totalSessions: 21;
  recommendedFor: ["never_ran"];
  nextProgression: null;
  sessions: TrainingSession[];
};
