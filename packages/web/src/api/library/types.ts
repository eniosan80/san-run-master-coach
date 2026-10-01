// ============================================================================
// BIBLIOTECA OFICIAL SAN RUN — TIPOS
//
// Tipos próprios e independentes da biblioteca. NÃO reutilizam nem alteram o
// WorkoutBlock legado de `api/lib/classify.ts` nem os tipos do PrescriptionEngine.
// ============================================================================

/** IDs dos programas oficiais da biblioteca. */
export type ProgramId =
  | "2K_CONTINUOUS"
  | "2K_CONTINUOUS_2X";

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
  programId: ProgramId;
  week: number;
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
  id: ProgramId;
  name: string;
  weeks: number;
  sessionsPerWeek: number;
  totalSessions: number;
  recommendedFor: ["never_ran"];
  nextProgression: null;
  sessions: TrainingSession[];
};

// ============================================================================
// PROGRAMA 3K — TIPOS ADITIVOS
//
// Estritamente aditivos e isolados: nenhum tipo acima foi alterado, então os
// programas 2K continuam compilando e valendo exatamente como antes.
//
// O 3K é organizado por ESTÁGIOS metodológicos (não por semanas fixas) e é um
// único programa para 2 ou 3 treinos por semana: a frequência muda a
// distribuição das sessões, não a metodologia. Quem decide a transição entre
// sessões e estágios é o motor de progressão — a biblioteca só define os
// estímulos permitidos.
// ============================================================================

/**
* Estados de progressão que o motor pode atribuir após uma sessão.
* A decisão pertence ao motor, não à sessão isolada.
* `not_done` (treino não realizado) NÃO é regressão e não indica baixa capacidade.
*/
export type ProgressionState =
  | "advance"
  | "consolidate"
  | "adapt"
  | "regress_1"
  | "regress_2"
  | "not_done";

/** Marca que a sessão pode ser repetida/adaptada pelo motor. */
export type AdaptiveDefinition = {
  repeatable: true;
  /** Estados que o motor pode atribuir. A biblioteca não mapeia nenhum estado para outro. */
  states: ProgressionState[];
};

/** Aquecimento, separado do estímulo principal e fora do cálculo da capacidade de corrida. */
export type WarmupDefinition =
  | { type: "walk"; durationSeconds: 300; intensity: "FR" }
  | { type: "video"; contentId: string }
  | { type: "walk_plus_video"; durationSeconds: 300; contentId: string };

/** Liga um protocolo a uma sessão anterior para comparação (contexto, não regra de progressão). */
export type HistoricalComparisonDefinition = {
  sourceProgramId: string;
  sourceSessionId?: string;
  preserveStructure: boolean;
  preserveRepetitions: boolean;
  comparisonMetrics: (
    | "pse"
    | "perception"
    | "control"
    | "duration"
    | "distance"
  )[];
};

/** Estímulo parametrizado pelo tempo de referência dos 2 km (não é substituição textual). */
export type ReferenceDurationStimulus = {
  type: "reference_plus_duration";
  reference: "previous_2k_completion_time";
  additionalDurationSeconds: 300;
  runBlockMinSeconds: 300;
  runBlockMaxSeconds: 360;
  recoverySeconds: 60;
  intensity: "MO";
  pseMin: 5;
  pseMax: 6;
};

/** Corrida contínua definida por distância (sem duração fixa). */
export type DistanceStimulus = {
  type: "continuous_distance";
  targetKm: number;
  continuous: true;
  intensity: "MO";
  pseMin: number;
  pseMax: number;
  /** Quando presente, esta corrida cria a referência individual usada por estímulos parametrizados. */
  establishesReference?: {
    reference: "previous_2k_completion_time";
    basedOn: ("completion_time" | "pse" | "control_perception")[];
  };
};

/** Protocolo fixo: blocos e repetições já definidos. */
export type FixedStimulus = {
  type: "fixed";
  sequences: WorkoutBlockSequence[];
};

/** Protocolo aprovado de um pool de velocidade. */
export type StimulusProtocol = {
  id: "V1" | "V2" | "V3" | "V4";
  purpose:
    | "repeat_known_stimulus"
    | "controlled_speed"
    | "sustain_fo"
    | "historical_comparison";
  sequences: WorkoutBlockSequence[];
  historicalComparison?: HistoricalComparisonDefinition;
};

/** Pool de protocolos aprovados; a escolha de um deles pertence ao motor. */
export type ProtocolPoolStimulus = {
  type: "protocol_pool";
  protocols: StimulusProtocol[];
};

/** Estímulo principal da sessão: protocolo fixo, parametrizado, por distância ou pool. */
export type MainStimulusDefinition =
  | FixedStimulus
  | ReferenceDurationStimulus
  | DistanceStimulus
  | ProtocolPoolStimulus;

/** Estágio metodológico do 3K (um bloco de sessões, não uma semana fixa). */
export type StageDefinition = {
  stageId: 1 | 2 | 3 | 4;
  id:
    | "CONSOLIDAR_E_AMPLIAR"
    | "CONSTRUIR_RESISTENCIA_VELOCIDADE"
    | "APROXIMAR_DOS_3K"
    | "DESAFIO_3K";
  purpose: string;
};

/** Sessão do programa 3K. */
export type TrainingSession3K = {
  id: string;
  programId: "PROGRAM_3K_EXTENSION";
  stageId: StageDefinition["stageId"];
  /** Identifica a sessão metodológica dentro do estágio, ex.: "3K-S3-T5". */
  stageSessionId: string;
  title: string;
  type: SessionType;
  objective: string;
  warmup: WarmupDefinition;
  mainStimulus: MainStimulusDefinition;
  athleteGuidance: string;
  /** Ausente quando a metodologia não define critério objetivo para a sessão. */
  completionCriteria?: CompletionCriteria;
  progressionRole: ProgressionRole;
  historicalComparison?: HistoricalComparisonDefinition;
  adaptive?: AdaptiveDefinition;
};

/** Programa oficial 3K: um único programa para 2 ou 3 sessões por semana. */
export type TrainingProgram3K = {
  id: "PROGRAM_3K_EXTENSION";
  name: "Correr 3 km sem parar";
  originProgram: "2K";
  sessionsPerWeek: [2, 3];
  adaptive: true;
  stages: StageDefinition[];
  sessions: TrainingSession3K[];
};
