// ============================================================================
// BIBLIOTECA OFICIAL SAN RUN — PONTO DE ENTRADA
// Importe tipos e programas por aqui, nunca pelos arquivos internos.
// ============================================================================

export type {
  CompletionCriteria,
  ProgressionRole,
  ProgramId,
  SessionType,
  TrainingProgram,
  TrainingSession,
  WorkoutBlock,
  WorkoutBlockSequence,
  AdaptiveDefinition,
  DistanceStimulus,
  FixedStimulus,
  HistoricalComparisonDefinition,
  MainStimulusDefinition,
  ProgressionState,
  ProtocolPoolStimulus,
  ReferenceDurationStimulus,
  StageDefinition,
  StimulusProtocol,
  TrainingProgram3K,
  TrainingSession3K,
  WarmupDefinition,
} from "./types";

export { PROGRAM_2K_CONTINUOUS } from "./programs/2K_CONTINUOUS";
export { PROGRAM_2K_CONTINUOUS_2X } from "./programs/2K_CONTINUOUS_2X";
export { PROGRAM_3K_EXTENSION } from "./programs/3K_EXTENSION";
export { resolve2KProgramSelection, select2KProgram } from "./selection";
