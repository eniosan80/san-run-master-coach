// ============================================================================
// TIPOS DO MOTOR DE PRESCRIÇÃO SAN RUN
// ============================================================================

export type AthleteLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingPhase = 'base' | 'build' | 'peak' | 'recovery' | 'return';
export type ReadinessLevel = 'low' | 'moderate' | 'high';
export type GoalType = '2km' | '5km' | '10km' | 'half-marathon' | 'marathon' | 'general';

// ============================================================================
// DADOS DE ENTRADA (DADO)
// ============================================================================

export interface AthleteProfile {
  id: string;
  name: string;
  level: AthleteLevel;
  phase: TrainingPhase;
  goalType: GoalType;
  weeklyVolume: number; // km
  maxHeartRate?: number;
  lactateThreshold?: number;
  recentWorkouts: WorkoutHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutHistory {
  date: Date;
  type: string;
  duration: number; // minutos
  distance: number; // km
  rpe: number; // 1-10
  completed: boolean;
  notes?: string;
}

export interface ReadinessInput {
  athleteId: string;
  sleepHours: number;
  stressLevel: number; // 1-10
  muscleStiffness: number; // 1-10
  motivation: number; // 1-10
  recentInjuries: boolean;
  daysRestRecently: number;
}

// ============================================================================
// INTERPRETAÇÃO (PROCESSAMENTO)
// ============================================================================

export interface PrescriptionContext {
  athlete: AthleteProfile;
  readiness: ReadinessLevel;
  readinessScore: number; // 0-100
  dayOfWeek: number; // 0-6
  weekNumber: number;
  isRecoveryWeek: boolean;
  volumeProgress: number; // % da meta semanal
}

export interface TrainingZone {
  name: string;
  minHR?: number;
  maxHR?: number;
  minPace?: number; // min/km
  maxPace?: number; // min/km
  rpeMin: number;
  rpeMax: number;
  description: string;
}

// ============================================================================
// DECISÃO (SAÍDA)
// ============================================================================

export interface PrescribedWorkout {
  id: string;
  athleteId: string;
  date: Date;
  name: string;
  description: string;
  type: WorkoutType;
  duration: number; // minutos
  distance: number; // km
  targetPace?: number; // min/km
  targetHR?: number;
  targetRPE: number; // 1-10
  stages: WorkoutStage[];
  notes: string;
  adaptations: string[]; // Explicar por que foi adaptado
  difficulty: number; // 1-10
  expectedRecoveryHours: number;
}

export type WorkoutType =
  | 'easy'
  | 'moderate'
  | 'tempo'
  | 'interval'
  | 'long-run'
  | 'strength'
  | 'recovery'
  | 'cross-training';

export interface WorkoutStage {
  order: number;
  name: string;
  type: 'warmup' | 'main' | 'cooldown' | 'strength';
  duration: number; // minutos
  distance?: number; // km
  intensity: 'easy' | 'moderate' | 'hard';
  targetPace?: number; // min/km
  targetRPE: number;
  instructions: string[];
}

// ============================================================================
// MATRIZ DE PRONTIDÃO
// ============================================================================

export interface ReadinessFactors {
  sleep: number; // peso 0.3
  stress: number; // peso -0.2
  muscleStiffness: number; // peso -0.15
  motivation: number; // peso 0.25
  restDays: number; // peso 0.2
  injuries: number; // peso -1.0 (anula tudo)
}

export interface ReadinessProtocolResult {
  readinessLevel: ReadinessLevel;
  readinessScore: number; // 0-100
  factors: ReadinessFactors;
  recommendation: string;
  workoutModifications: WorkoutModification[];
}

export interface WorkoutModification {
  apply: boolean;
  type: 'reduce-volume' | 'reduce-intensity' | 'increase-recovery' | 'skip-workout' | 'none';
  percentage?: number; // 0-100, quanto reduzir
  reason: string;
}

// ============================================================================
// PRESCRIÇÃO POR CENÁRIOS
// ============================================================================

export interface ScenarioTemplate {
  level: AthleteLevel;
  goalType: GoalType;
  phase: TrainingPhase;
  workoutPatterns: WorkoutPattern[];
  volumeRange: {
    min: number;
    target: number;
    max: number;
  };
  intensityDistribution: {
    easy: number; // %
    moderate: number; // %
    hard: number; // %
  };
}

export interface WorkoutPattern {
  dayOfWeek: number;
  type: WorkoutType;
  volumePercentage: number;
  intensityPercentage: number;
}

// ============================================================================
// SAÍDA DO MOTOR
// ============================================================================

export interface PrescriptionResult {
  success: boolean;
  workout: PrescribedWorkout | null;
  reasoning: {
    athleteProfile: string;
    readinessAnalysis: string;
    phaseContext: string;
    decision: string;
  };
  alternatives?: PrescribedWorkout[];
}
