import type {
  AthleteProfile,
  PrescribedWorkout,
  PrescriptionContext,
  PrescriptionResult,
  ReadinessLevel,
  TrainingPhase,
  AthleteLevel,
  GoalType,
  WorkoutStage,
  WorkoutType,
  ScenarioTemplate,
} from './types';
import { ReadinessProtocol } from './ReadinessProtocol';

// ============================================================================
// MOTOR DE PRESCRIÇÃO SAN RUN
// Motor de Decisão: DADO → INTERPRETAÇÃO → DECISÃO
// ============================================================================

export class PrescriptionEngine {
  /**
   * Prescreve um treino baseado em:
   * 1. Perfil do atleta (DADO)
   * 2. Prontidão (INTERPRETAÇÃO)
   * 3. Contexto da fase (INTERPRETAÇÃO)
   * 4. Matriz de decisão (DECISÃO)
   */
  static prescribe(
    athlete: AthleteProfile,
    readinessLevel: ReadinessLevel,
    readinessScore: number
  ): PrescriptionResult {
    try {
      // ===== CONSTRUIR CONTEXTO =====
      const context = this.buildContext(athlete, readinessLevel, readinessScore);

      // ===== SELECIONAR TEMPLATE =====
      const template = this.selectTemplate(athlete.level, athlete.goalType, athlete.phase);

      // ===== GERAR TREINO =====
      const workout = this.generateWorkout(athlete, context, template);

      // ===== GERAR RACIOCÍNIO =====
      const reasoning = this.generateReasoning(athlete, context, template, workout);

      return {
        success: true,
        workout,
        reasoning,
      };
    } catch (error) {
      return {
        success: false,
        workout: null,
        reasoning: {
          athleteProfile: 'Erro ao processar perfil',
          readinessAnalysis: 'Erro ao analisar prontidão',
          phaseContext: 'Erro ao processar fase',
          decision: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        },
      };
    }
  }

  // ============================================================================
  // CONSTRUIR CONTEXTO (INTERPRETAÇÃO)
  // ============================================================================

  private static buildContext(
    athlete: AthleteProfile,
    readinessLevel: ReadinessLevel,
    readinessScore: number
  ): PrescriptionContext {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekNumber = this.getWeekNumber(today);
    const isRecoveryWeek = weekNumber % 4 === 0; // A cada 4 semanas
    const volumeProgress = this.calculateVolumeProgress(athlete);

    return {
      athlete,
      readiness: readinessLevel,
      readinessScore,
      dayOfWeek,
      weekNumber,
      isRecoveryWeek,
      volumeProgress,
    };
  }

  // ============================================================================
  // SELECIONAR TEMPLATE (DECISÃO)
  // ============================================================================

  private static selectTemplate(
    level: AthleteLevel,
    goalType: GoalType,
    phase: TrainingPhase
  ): ScenarioTemplate {
    // Matriz de templates por cenário
    const templates = this.getTemplateMatrix();
    const key = `${level}-${goalType}-${phase}`;

    return templates[key] || templates['beginner-5km-base'];
  }

  private static getTemplateMatrix(): Record<string, ScenarioTemplate> {
    return {
      // ===== INICIANTE 2 KM =====
      'beginner-2km-base': {
        level: 'beginner',
        goalType: '2km',
        phase: 'base',
        workoutPatterns: [
          { dayOfWeek: 1, type: 'easy', volumePercentage: 0.2, intensityPercentage: 0.3 },
          { dayOfWeek: 3, type: 'moderate', volumePercentage: 0.25, intensityPercentage: 0.5 },
          { dayOfWeek: 5, type: 'easy', volumePercentage: 0.2, intensityPercentage: 0.3 },
          { dayOfWeek: 6, type: 'long-run', volumePercentage: 0.35, intensityPercentage: 0.4 },
        ],
        volumeRange: { min: 8, target: 12, max: 15 },
        intensityDistribution: { easy: 0.6, moderate: 0.3, hard: 0.1 },
      },

      'beginner-2km-build': {
        level: 'beginner',
        goalType: '2km',
        phase: 'build',
        workoutPatterns: [
          { dayOfWeek: 1, type: 'easy', volumePercentage: 0.15, intensityPercentage: 0.3 },
          { dayOfWeek: 3, type: 'interval', volumePercentage: 0.25, intensityPercentage: 0.7 },
          { dayOfWeek: 5, type: 'tempo', volumePercentage: 0.2, intensityPercentage: 0.6 },
          { dayOfWeek: 6, type: 'long-run', volumePercentage: 0.3, intensityPercentage: 0.4 },
        ],
        volumeRange: { min: 10, target: 15, max: 18 },
        intensityDistribution: { easy: 0.5, moderate: 0.3, hard: 0.2 },
      },

      // ===== INICIANTE 5 KM =====
      'beginner-5km-base': {
        level: 'beginner',
        goalType: '5km',
        phase: 'base',
        workoutPatterns: [
          { dayOfWeek: 1, type: 'easy', volumePercentage: 0.2, intensityPercentage: 0.3 },
          { dayOfWeek: 3, type: 'moderate', volumePercentage: 0.25, intensityPercentage: 0.5 },
          { dayOfWeek: 5, type: 'easy', volumePercentage: 0.2, intensityPercentage: 0.3 },
          { dayOfWeek: 6, type: 'long-run', volumePercentage: 0.35, intensityPercentage: 0.4 },
        ],
        volumeRange: { min: 12, target: 18, max: 22 },
        intensityDistribution: { easy: 0.65, moderate: 0.25, hard: 0.1 },
      },

      'beginner-5km-build': {
        level: 'beginner',
        goalType: '5km',
        phase: 'build',
        workoutPatterns: [
          { dayOfWeek: 1, type: 'easy', volumePercentage: 0.15, intensityPercentage: 0.3 },
          { dayOfWeek: 3, type: 'interval', volumePercentage: 0.25, intensityPercentage: 0.7 },
          { dayOfWeek: 5, type: 'tempo', volumePercentage: 0.2, intensityPercentage: 0.6 },
          { dayOfWeek: 6, type: 'long-run', volumePercentage: 0.3, intensityPercentage: 0.45 },
        ],
        volumeRange: { min: 15, target: 22, max: 28 },
        intensityDistribution: { easy: 0.55, moderate: 0.3, hard: 0.15 },
      },

      // ===== INTERMEDIÁRIO 10 KM =====
      'intermediate-10km-base': {
        level: 'intermediate',
        goalType: '10km',
        phase: 'base',
        workoutPatterns: [
          { dayOfWeek: 1, type: 'easy', volumePercentage: 0.15, intensityPercentage: 0.3 },
          { dayOfWeek: 2, type: 'strength', volumePercentage: 0.1, intensityPercentage: 0.5 },
          { dayOfWeek: 3, type: 'moderate', volumePercentage: 0.25, intensityPercentage: 0.5 },
          { dayOfWeek: 5, type: 'tempo', volumePercentage: 0.2, intensityPercentage: 0.6 },
          { dayOfWeek: 6, type: 'long-run', volumePercentage: 0.3, intensityPercentage: 0.4 },
        ],
        volumeRange: { min: 30, target: 40, max: 50 },
        intensityDistribution: { easy: 0.5, moderate: 0.3, hard: 0.2 },
      },

      'intermediate-10km-build': {
        level: 'intermediate',
        goalType: '10km',
        phase: 'build',
        workoutPatterns: [
          { dayOfWeek: 1, type: 'easy', volumePercentage: 0.12, intensityPercentage: 0.3 },
          { dayOfWeek: 2, type: 'strength', volumePercentage: 0.1, intensityPercentage: 0.6 },
          { dayOfWeek: 3, type: 'interval', volumePercentage: 0.25, intensityPercentage: 0.75 },
          { dayOfWeek: 5, type: 'tempo', volumePercentage: 0.23, intensityPercentage: 0.65 },
          { dayOfWeek: 6, type: 'long-run', volumePercentage: 0.3, intensityPercentage: 0.45 },
        ],
        volumeRange: { min: 35, target: 50, max: 60 },
        intensityDistribution: { easy: 0.45, moderate: 0.3, hard: 0.25 },
      },

      // ===== MEIA MARATONA =====
      'advanced-half-marathon-base': {
        level: 'advanced',
        goalType: 'half-marathon',
        phase: 'base',
        workoutPatterns: [
          { dayOfWeek: 1, type: 'easy', volumePercentage: 0.12, intensityPercentage: 0.3 },
          { dayOfWeek: 2, type: 'strength', volumePercentage: 0.1, intensityPercentage: 0.6 },
          { dayOfWeek: 3, type: 'moderate', volumePercentage: 0.2, intensityPercentage: 0.5 },
          { dayOfWeek: 5, type: 'tempo', volumePercentage: 0.18, intensityPercentage: 0.6 },
          { dayOfWeek: 6, type: 'long-run', volumePercentage: 0.4, intensityPercentage: 0.45 },
        ],
        volumeRange: { min: 50, target: 70, max: 85 },
        intensityDistribution: { easy: 0.5, moderate: 0.3, hard: 0.2 },
      },

      'advanced-half-marathon-peak': {
        level: 'advanced',
        goalType: 'half-marathon',
        phase: 'peak',
        workoutPatterns: [
          { dayOfWeek: 1, type: 'easy', volumePercentage: 0.1, intensityPercentage: 0.3 },
          { dayOfWeek: 2, type: 'strength', volumePercentage: 0.08, intensityPercentage: 0.7 },
          { dayOfWeek: 3, type: 'interval', volumePercentage: 0.22, intensityPercentage: 0.8 },
          { dayOfWeek: 5, type: 'tempo', volumePercentage: 0.2, intensityPercentage: 0.7 },
          { dayOfWeek: 6, type: 'long-run', volumePercentage: 0.4, intensityPercentage: 0.5 },
        ],
        volumeRange: { min: 55, target: 75, max: 90 },
        intensityDistribution: { easy: 0.45, moderate: 0.3, hard: 0.25 },
      },

      // ===== RETORNO APÓS PAUSA =====
      'beginner-general-return': {
        level: 'beginner',
        goalType: 'general',
        phase: 'return',
        workoutPatterns: [
          { dayOfWeek: 1, type: 'easy', volumePercentage: 0.3, intensityPercentage: 0.25 },
          { dayOfWeek: 3, type: 'easy', volumePercentage: 0.3, intensityPercentage: 0.25 },
          { dayOfWeek: 5, type: 'easy', volumePercentage: 0.25, intensityPercentage: 0.25 },
          { dayOfWeek: 6, type: 'easy', volumePercentage: 0.15, intensityPercentage: 0.3 },
        ],
        volumeRange: { min: 5, target: 10, max: 12 },
        intensityDistribution: { easy: 0.95, moderate: 0.05, hard: 0 },
      },

      'intermediate-general-return': {
        level: 'intermediate',
        goalType: 'general',
        phase: 'return',
        workoutPatterns: [
          { dayOfWeek: 1, type: 'easy', volumePercentage: 0.25, intensityPercentage: 0.3 },
          { dayOfWeek: 3, type: 'moderate', volumePercentage: 0.3, intensityPercentage: 0.45 },
          { dayOfWeek: 5, type: 'easy', volumePercentage: 0.25, intensityPercentage: 0.3 },
          { dayOfWeek: 6, type: 'moderate', volumePercentage: 0.2, intensityPercentage: 0.4 },
        ],
        volumeRange: { min: 15, target: 25, max: 30 },
        intensityDistribution: { easy: 0.7, moderate: 0.25, hard: 0.05 },
      },
    };
  }

  // ============================================================================
  // GERAR TREINO (DECISÃO)
  // ============================================================================

  private static generateWorkout(
    athlete: AthleteProfile,
    context: PrescriptionContext,
    template: ScenarioTemplate
  ): PrescribedWorkout {
    const today = new Date();
    const workoutId = `workout-${athlete.id}-${today.getTime()}`;

    // Selecionar padrão do dia da semana
    const pattern = template.workoutPatterns.find((p) => p.dayOfWeek === context.dayOfWeek);
    const workoutType = pattern?.type || 'easy';

    // Calcular volume e intensidade
    const volume = this.calculateVolume(athlete, context, template, pattern);
    const intensity = this.calculateIntensity(context, workoutType);

    // Gerar etapas do treino
    const stages = this.generateStages(workoutType, volume, intensity);

    // Adaptar por prontidão
    const adaptedStages = this.adaptStagesByReadiness(stages, context.readiness);
    const adaptations = this.generateAdaptations(context);

    return {
      id: workoutId,
      athleteId: athlete.id,
      date: today,
      name: this.generateWorkoutName(workoutType, volume),
      description: this.generateDescription(workoutType, athlete.level),
      type: workoutType,
      duration: this.calculateDuration(adaptedStages),
      distance: volume,
      targetPace: this.calculatePace(volume, this.calculateDuration(adaptedStages)),
      targetRPE: this.getTargetRPE(workoutType, context.readiness),
      stages: adaptedStages,
      notes: this.generateNotes(athlete, context),
      adaptations,
      difficulty: this.calculateDifficulty(workoutType, intensity, context.readiness),
      expectedRecoveryHours: this.calculateRecoveryTime(workoutType, intensity),
    };
  }

  // ============================================================================
  // CÁLCULOS AUXILIARES
  // ============================================================================

  private static calculateVolume(
    athlete: AthleteProfile,
    context: PrescriptionContext,
    template: ScenarioTemplate,
    pattern?: { volumePercentage: number }
  ): number {
    const baseVolume = context.isRecoveryWeek ? template.volumeRange.target * 0.6 : template.volumeRange.target;
    const volumeFromPattern = pattern ? baseVolume * pattern.volumePercentage : baseVolume * 0.2;

    // Ajustar por prontidão
    const readinessMultiplier = context.readinessScore / 100;
    return Math.round(volumeFromPattern * readinessMultiplier * 10) / 10;
  }

  private static calculateIntensity(context: PrescriptionContext, workoutType: WorkoutType): number {
    const intensityMap: Record<WorkoutType, number> = {
      easy: 0.3,
      moderate: 0.5,
      tempo: 0.6,
      interval: 0.8,
      'long-run': 0.4,
      strength: 0.6,
      recovery: 0.2,
      'cross-training': 0.5,
    };

    const baseIntensity = intensityMap[workoutType] || 0.5;
    const readinessAdjustment = context.readinessScore / 100;

    return baseIntensity * readinessAdjustment;
  }

  private static calculateDuration(stages: WorkoutStage[]): number {
    return stages.reduce((total, stage) => total + stage.duration, 0);
  }

  private static calculatePace(distance: number, duration: number): number {
    if (distance === 0 || duration === 0) return 0;
    return Math.round((duration / distance) * 10) / 10;
  }

  private static calculateDifficulty(
    workoutType: WorkoutType,
    intensity: number,
    readiness: ReadinessLevel
  ): number {
    const baseMap: Record<WorkoutType, number> = {
      easy: 2,
      moderate: 4,
      tempo: 6,
      interval: 8,
      'long-run': 5,
      strength: 6,
      recovery: 1,
      'cross-training': 4,
    };

    let difficulty = baseMap[workoutType] || 5;

    // Ajustar por prontidão
    if (readiness === 'low') difficulty = Math.max(1, difficulty - 2);
    if (readiness === 'high') difficulty = Math.min(10, difficulty + 1);

    return difficulty;
  }

  private static calculateRecoveryTime(workoutType: WorkoutType, intensity: number): number {
    const baseRecovery: Record<WorkoutType, number> = {
      easy: 4,
      moderate: 6,
      tempo: 8,
      interval: 12,
      'long-run': 24,
      strength: 8,
      recovery: 2,
      'cross-training': 6,
    };

    return Math.round(baseRecovery[workoutType] * (1 + intensity));
  }

  private static getTargetRPE(workoutType: WorkoutType, readiness: ReadinessLevel): number {
    const baseRPE: Record<WorkoutType, number> = {
      easy: 3,
      moderate: 5,
      tempo: 6,
      interval: 8,
      'long-run': 5,
      strength: 6,
      recovery: 2,
      'cross-training': 4,
    };

    let rpe = baseRPE[workoutType] || 5;

    // Ajustar por prontidão
    if (readiness === 'low') rpe = Math.max(1, rpe - 2);
    if (readiness === 'high') rpe = Math.min(10, rpe + 1);

    return rpe;
  }

  // ============================================================================
  // GERAÇÃO DE ETAPAS
  // ============================================================================

  private static generateStages(workoutType: WorkoutType, volume: number, intensity: number): WorkoutStage[] {
    const stages: WorkoutStage[] = [];
    let order = 1;

    // Aquecimento
    stages.push({
      order: order++,
      name: 'Aquecimento',
      type: 'warmup',
      duration: 10,
      distance: volume * 0.15,
      intensity: 'easy',
      targetRPE: 2,
      instructions: [
        'Comece devagar',
        'Aumente gradualmente o ritmo',
        'Faça mobilidade dinâmica',
      ],
    });

    // Bloco principal
    if (workoutType === 'easy') {
      stages.push({
        order: order++,
        name: 'Corrida Fácil',
        type: 'main',
        duration: Math.round(volume * 6),
        distance: volume * 0.7,
        intensity: 'easy',
        targetRPE: 3,
        instructions: [
          'Mantenha ritmo conversável',
          'Foco em consistência',
          'Respire normalmente',
        ],
      });
    } else if (workoutType === 'moderate') {
      stages.push({
        order: order++,
        name: 'Corrida Moderada',
        type: 'main',
        duration: Math.round(volume * 6),
        distance: volume * 0.7,
        intensity: 'moderate',
        targetRPE: 5,
        instructions: [
          'Aumente o ritmo gradualmente',
          'Mantenha esforço constante',
          'Respiração controlada',
        ],
      });
    } else if (workoutType === 'tempo') {
      stages.push({
        order: order++,
        name: 'Corrida Forte (Tempo)',
        type: 'main',
        duration: Math.round(volume * 5),
        distance: volume * 0.65,
        intensity: 'hard',
        targetRPE: 6,
        instructions: [
          'Ritmo desafiador mas sustentável',
          'Foco mental forte',
          'Respiração profunda e controlada',
        ],
      });
    } else if (workoutType === 'interval') {
      const intervals = Math.ceil(volume / 2);
      stages.push({
        order: order++,
        name: `${intervals}x Intervalos`,
        type: 'main',
        duration: Math.round(volume * 4),
        distance: volume * 0.6,
        intensity: 'hard',
        targetRPE: 8,
        instructions: [
          `${intervals} repetições de ${Math.round(2 / intervals * 100) / 100} km`,
          'Recuperação: 1 minuto entre repetições',
          'Máximo esforço em cada repetição',
        ],
      });
    } else if (workoutType === 'long-run') {
      stages.push({
        order: order++,
        name: 'Corrida Longa',
        type: 'main',
        duration: Math.round(volume * 6.5),
        distance: volume * 0.75,
        intensity: 'moderate',
        targetRPE: 5,
        instructions: [
          'Ritmo conversável o tempo todo',
          'Hidrate regularmente',
          'Foco na resistência',
        ],
      });
    }

    // Desaquecimento
    stages.push({
      order: order++,
      name: 'Desaquecimento',
      type: 'cooldown',
      duration: 5,
      distance: volume * 0.15,
      intensity: 'easy',
      targetRPE: 2,
      instructions: [
        'Reduza o ritmo gradualmente',
        'Respire profundamente',
        'Prepare-se para o alongamento',
      ],
    });

    return stages;
  }

  private static adaptStagesByReadiness(stages: WorkoutStage[], readiness: ReadinessLevel): WorkoutStage[] {
    if (readiness === 'low') {
      return stages.map((stage) => ({
        ...stage,
        duration: Math.round(stage.duration * 0.8),
        distance: stage.distance ? stage.distance * 0.8 : undefined,
        intensity:
          stage.intensity === 'hard'
            ? 'moderate'
            : stage.intensity === 'moderate'
              ? 'easy'
              : stage.intensity,
        targetRPE: Math.max(1, stage.targetRPE - 1),
      }));
    }

    if (readiness === 'high') {
      return stages.map((stage) => ({
        ...stage,
        targetRPE: Math.min(10, stage.targetRPE + 1),
      }));
    }

    return stages;
  }

  // ============================================================================
  // GERAÇÃO DE TEXTO
  // ============================================================================

  private static generateWorkoutName(workoutType: WorkoutType, volume: number): string {
    const names: Record<WorkoutType, string> = {
      easy: `Corrida Fácil - ${volume} km`,
      moderate: `Corrida Moderada - ${volume} km`,
      tempo: `Corrida Forte (Tempo) - ${volume} km`,
      interval: `Treino de Intervalos - ${volume} km`,
      'long-run': `Corrida Longa - ${volume} km`,
      strength: 'Treino de Força SAN RUN',
      recovery: 'Recuperação Ativa',
      'cross-training': 'Treino Cruzado',
    };

    return names[workoutType] || `Treino SAN RUN - ${volume} km`;
  }

  private static generateDescription(workoutType: WorkoutType, level: AthleteLevel): string {
    const descriptions: Record<WorkoutType, Record<AthleteLevel, string>> = {
      easy: {
        beginner: 'Um treino leve para construir consistência e base aeróbica.',
        intermediate: 'Treino de recuperação e construção de base aeróbica.',
        advanced: 'Recuperação ativa para manter o volume sem estresse.',
      },
      moderate: {
        beginner: 'Treino moderado para desenvolver resistência.',
        intermediate: 'Treino de desenvolvimento de capacidade aeróbica.',
        advanced: 'Treino de ritmo de competição moderado.',
      },
      tempo: {
        beginner: 'Treino de ritmo forte para desenvolver velocidade.',
        intermediate: 'Treino de limiar lático para melhorar performance.',
        advanced: 'Treino de ritmo de meia maratona.',
      },
      interval: {
        beginner: 'Treino de intervalos curtos para desenvolver velocidade.',
        intermediate: 'Treino de intervalos para aumentar capacidade anaeróbica.',
        advanced: 'Treino de intervalos avançado para pico de performance.',
      },
      'long-run': {
        beginner: 'Treino longo para construir resistência.',
        intermediate: 'Treino longo de desenvolvimento.',
        advanced: 'Treino longo de resistência para provas.',
      },
      strength: {
        beginner: 'Treino de força complementar para corredores.',
        intermediate: 'Treino de força para prevenir lesões e melhorar performance.',
        advanced: 'Treino de força avançado para potência e resistência.',
      },
      recovery: {
        beginner: 'Recuperação ativa para acelerar adaptação.',
        intermediate: 'Recuperação ativa entre treinos intensos.',
        advanced: 'Recuperação ativa para otimizar adaptação.',
      },
      'cross-training': {
        beginner: 'Treino cruzado para desenvolver capacidade geral.',
        intermediate: 'Treino cruzado para variar estímulo.',
        advanced: 'Treino cruzado para recuperação e desenvolvimento.',
      },
    };

    return descriptions[workoutType]?.[level] || 'Treino SAN RUN personalizado.';
  }

  private static generateNotes(athlete: AthleteProfile, context: PrescriptionContext): string {
    let notes = `Treino prescrito para ${athlete.name} (${athlete.level}).`;

    if (context.isRecoveryWeek) {
      notes += ' 🔄 Esta é uma semana de recuperação - reduza a intensidade.';
    }

    if (context.readiness === 'low') {
      notes += ' ⚠️ Prontidão baixa - foque em completar o treino com consistência.';
    }

    if (context.readiness === 'high') {
      notes += ' 💪 Prontidão alta - você pode desafiar-se hoje!';
    }

    return notes;
  }

  private static generateAdaptations(context: PrescriptionContext): string[] {
    const adaptations: string[] = [];

    if (context.isRecoveryWeek) {
      adaptations.push('Semana de recuperação: volume reduzido em 40%');
    }

    if (context.readiness === 'low') {
      adaptations.push('Prontidão baixa: intensidade reduzida em 20%');
      adaptations.push('Prontidão baixa: duração reduzida em 15%');
    }

    if (context.readiness === 'high') {
      adaptations.push('Prontidão alta: RPE-alvo aumentado em 1 ponto');
    }

    if (context.volumeProgress > 100) {
      adaptations.push(`Volume semanal já em ${context.volumeProgress}% da meta`);
    }

    return adaptations;
  }

  // ============================================================================
  // GERAR RACIOCÍNIO (EXPLICAÇÃO DA DECISÃO)
  // ============================================================================

  private static generateReasoning(
    athlete: AthleteProfile,
    context: PrescriptionContext,
    template: ScenarioTemplate,
    workout: PrescribedWorkout
  ): {
    athleteProfile: string;
    readinessAnalysis: string;
    phaseContext: string;
    decision: string;
  } {
    return {
      athleteProfile: `${athlete.name} é um atleta ${athlete.level} com objetivo de ${athlete.goalType}. Volume semanal: ${athlete.weeklyVolume} km.`,
      readinessAnalysis: `Prontidão: ${context.readiness} (${context.readinessScore}/100). Treino adaptado conforme necessário.`,
      phaseContext: `Fase atual: ${athlete.phase}${context.isRecoveryWeek ? ' (SEMANA DE RECUPERAÇÃO)' : ''}. Dia da semana: ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][context.dayOfWeek]}.`,
      decision: `Prescrito: ${workout.name} com ${workout.distance} km, RPE-alvo ${workout.targetRPE}/10, duração ${workout.duration} min.`,
    };
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  private static getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDay.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  }

  private static calculateVolumeProgress(athlete: AthleteProfile): number {
    const weeklyTotal = athlete.recentWorkouts
      .filter((w) => {
        const workoutDate = new Date(w.date);
        const today = new Date();
        const daysDiff = (today.getTime() - workoutDate.getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 7;
      })
      .reduce((sum, w) => sum + (w.completed ? w.distance : 0), 0);

    return Math.round((weeklyTotal / athlete.weeklyVolume) * 100);
  }
}
