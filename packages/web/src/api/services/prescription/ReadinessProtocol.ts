import type {
  ReadinessInput,
  ReadinessFactors,
  ReadinessProtocolResult,
  ReadinessLevel,
  WorkoutModification,
} from './types';

// ============================================================================
// PROTOCOLO DE PRONTIDÃO - MATRIZ DE DECISÃO
// ============================================================================

export class ReadinessProtocol {
  /**
   * Analisa entrada de prontidão e retorna score + recomendações
   * DADO → INTERPRETAÇÃO → DECISÃO
   */
  static evaluate(input: ReadinessInput): ReadinessProtocolResult {
    // ===== DADO =====
    const factors = this.extractFactors(input);

    // ===== INTERPRETAÇÃO =====
    const readinessScore = this.calculateScore(factors);
    const readinessLevel = this.classifyReadiness(readinessScore);

    // ===== DECISÃO =====
    const recommendation = this.generateRecommendation(readinessLevel, factors);
    const modifications = this.generateModifications(readinessLevel, factors);

    return {
      readinessLevel,
      readinessScore,
      factors,
      recommendation,
      workoutModifications: modifications,
    };
  }

  // ============================================================================
  // EXTRAÇÃO DE FATORES
  // ============================================================================

  private static extractFactors(input: ReadinessInput): ReadinessFactors {
    return {
      sleep: this.normalizeSleep(input.sleepHours),
      stress: this.normalizeStress(input.stressLevel),
      muscleStiffness: this.normalizeStiffness(input.muscleStiffness),
      motivation: this.normalizeMotivation(input.motivation),
      restDays: this.normalizeRestDays(input.daysRestRecently),
      injuries: input.recentInjuries ? -100 : 0,
    };
  }

  private static normalizeSleep(hours: number): number {
    // Ideal: 7-9 horas
    if (hours >= 7 && hours <= 9) return 100;
    if (hours >= 6 && hours < 7) return 80;
    if (hours > 9 && hours <= 10) return 80;
    if (hours >= 5 && hours < 6) return 50;
    if (hours > 10) return 60;
    return 30; // < 5 horas
  }

  private static normalizeStress(level: number): number {
    // 1-10 scale, onde 10 = estresse máximo
    // Invertemos: 10 (alto estresse) = 0 pontos
    return Math.max(0, 100 - level * 10);
  }

  private static normalizeStiffness(level: number): number {
    // 1-10 scale, onde 10 = muito rígido
    // Invertemos: 10 (muito rígido) = 0 pontos
    return Math.max(0, 100 - level * 10);
  }

  private static normalizeMotivation(level: number): number {
    // 1-10 scale, onde 10 = muito motivado
    return level * 10;
  }

  private static normalizeRestDays(days: number): number {
    // Ideal: 1-2 dias de descanso por semana
    if (days === 0) return 60; // Sem descanso recente
    if (days === 1) return 100; // Perfeito
    if (days === 2) return 100; // Perfeito
    if (days === 3) return 80; // Bastante descanso
    if (days >= 4) return 50; // Muito descanso (pode estar desmotivado)
    return 70;
  }

  // ============================================================================
  // CÁLCULO DE SCORE
  // ============================================================================

  private static calculateScore(factors: ReadinessFactors): number {
    const WEIGHTS = {
      sleep: 0.3,
      stress: -0.2,
      muscleStiffness: -0.15,
      motivation: 0.25,
      restDays: 0.2,
      injuries: -1.0, // Anula tudo se houver lesão
    };

    // Se há lesão recente, retorna 0 imediatamente
    if (factors.injuries < -50) return 0;

    const score =
      factors.sleep * WEIGHTS.sleep +
      factors.stress * WEIGHTS.stress +
      factors.muscleStiffness * WEIGHTS.muscleStiffness +
      factors.motivation * WEIGHTS.motivation +
      factors.restDays * WEIGHTS.restDays;

    return Math.max(0, Math.min(100, score));
  }

  // ============================================================================
  // CLASSIFICAÇÃO DE PRONTIDÃO
  // ============================================================================

  private static classifyReadiness(score: number): ReadinessLevel {
    if (score >= 70) return 'high';
    if (score >= 40) return 'moderate';
    return 'low';
  }

  // ============================================================================
  // GERAÇÃO DE RECOMENDAÇÕES
  // ============================================================================

  private static generateRecommendation(
    readinessLevel: ReadinessLevel,
    factors: ReadinessFactors
  ): string {
    const recommendations = {
      high: 'Você está bem preparado! Pode fazer um treino desafiador hoje.',
      moderate: 'Você está em condição regular. Faça um treino moderado com foco em consistência.',
      low: 'Sua prontidão está baixa. Considere um treino leve ou descanso ativo.',
    };

    let rec = recommendations[readinessLevel];

    // Adicionar contexto específico
    if (factors.sleep < 50) {
      rec += ' ⚠️ Durma mais para recuperar melhor.';
    }
    if (factors.stress > 70) {
      rec += ' 💪 Reduzir intensidade pode ajudar a gerenciar estresse.';
    }
    if (factors.muscleStiffness > 70) {
      rec += ' 🔄 Comece com aquecimento extra ou mobilidade.';
    }

    return rec;
  }

  // ============================================================================
  // GERAÇÃO DE MODIFICAÇÕES
  // ============================================================================

  private static generateModifications(
    readinessLevel: ReadinessLevel,
    factors: ReadinessFactors
  ): WorkoutModification[] {
    const modifications: WorkoutModification[] = [];

    // Se há lesão, pular treino
    if (factors.injuries < -50) {
      modifications.push({
        apply: true,
        type: 'skip-workout',
        reason: 'Lesão recente detectada',
      });
      return modifications;
    }

    // Prontidão baixa
    if (readinessLevel === 'low') {
      modifications.push({
        apply: true,
        type: 'reduce-intensity',
        percentage: 40,
        reason: 'Prontidão baixa - reduzir intensidade',
      });
      modifications.push({
        apply: true,
        type: 'increase-recovery',
        percentage: 50,
        reason: 'Aumentar tempo de recuperação entre séries',
      });
    }

    // Sono inadequado
    if (factors.sleep < 50) {
      modifications.push({
        apply: true,
        type: 'reduce-volume',
        percentage: 30,
        reason: 'Sono insuficiente - reduzir volume',
      });
    }

    // Estresse alto
    if (factors.stress > 70) {
      modifications.push({
        apply: true,
        type: 'reduce-intensity',
        percentage: 20,
        reason: 'Estresse elevado - manter treino leve',
      });
    }

    // Rigidez muscular alta
    if (factors.muscleStiffness > 70) {
      modifications.push({
        apply: true,
        type: 'increase-recovery',
        percentage: 30,
        reason: 'Rigidez muscular alta - mais mobilidade',
      });
    }

    // Se nenhuma modificação foi aplicada
    if (modifications.length === 0) {
      modifications.push({
        apply: false,
        type: 'none',
        reason: 'Prontidão ótima - treino conforme planejado',
      });
    }

    return modifications;
  }
}
