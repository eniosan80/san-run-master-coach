import type {
  AdaptiveDefinition,
  CompletionCriteria,
  HistoricalComparisonDefinition,
  MainStimulusDefinition,
  ProgressionRole,
  ReferenceDurationStimulus,
  SessionType,
  StageDefinition,
  StimulusProtocol,
  TrainingProgram3K,
  TrainingSession3K,
  WarmupDefinition,
  WorkoutBlock,
  WorkoutBlockSequence,
} from "../types";

// ============================================================================
// PROGRAMA OFICIAL SAN RUN — PROGRAM_3K_EXTENSION
// Correr 3 km sem parar · extensão após a conquista/consolidação dos 2 km
//
// Um ÚNICO programa para 2 ou 3 treinos por semana: a frequência muda a
// distribuição das sessões, não a metodologia. A terceira sessão semanal não
// acelera a progressão.
//
// Os estágios são blocos metodológicos, não semanas fixas. Qualquer sessão pode
// ser repetida; a transição é decidida pelo motor de progressão a partir da
// resposta do atleta (não há encerramento por calendário). Esta biblioteca só
// define os estímulos permitidos.
//
// Escala de intensidade:
//   FR = caminhada (PSE 1–3) · MO = moderado (PSE 5–6) · FO = forte (PSE 7–8)
//
// Notas de modelagem:
// - O aquecimento é separado do estímulo principal (`warmup` × `mainStimulus`) e
//   nunca entra no cálculo da capacidade de corrida.
// - Nenhum vídeo ou link é cadastrado aqui: o aquecimento inicial é a caminhada
//   FR de 5 minutos. `video` e `walk_plus_video` ficam apenas previstos nos tipos.
// - Nenhuma sessão define aprovação/reprovação. O critério objetivo (quando
//   existe) é independente da qualidade da resposta (PSE, percepção, controle).
// - `not_done` NÃO é regressão: a biblioteca não mapeia nenhum estado em outro.
// - A retirada da caminhada no Estágio 3 depende da resposta do atleta e não da
//   posição da sessão; por isso nenhuma regra de remoção é codificada aqui.
// ============================================================================

const PROGRAM_ID = "PROGRAM_3K_EXTENSION" as const;

// ----------------------------------------------------------------------------
// Construtores de blocos (internos)
// ----------------------------------------------------------------------------

/** Caminhada — FR, PSE 1–3. */
const walk = (order: number, durationSeconds: number): WorkoutBlock => ({
  order,
  activity: "walk",
  durationSeconds,
  intensity: "FR",
  pseMin: 1,
  pseMax: 3,
  label: "Caminhada",
});

/** Corrida — MO, com o PSE informado. */
const run = (
  order: number,
  durationSeconds: number,
  pseMin: number,
  pseMax: number,
  label = "Corrida",
): WorkoutBlock => ({
  order,
  activity: "run",
  durationSeconds,
  intensity: "MO",
  pseMin,
  pseMax,
  label,
});

/** Bloco forte — FO, PSE 7–8. */
const strong = (order: number, durationSeconds: number): WorkoutBlock => ({
  order,
  activity: "run",
  durationSeconds,
  intensity: "FO",
  pseMin: 7,
  pseMax: 8,
  label: "Forte",
});

const seq = (blocks: WorkoutBlock[], repetitions: number): WorkoutBlockSequence => ({
  blocks,
  repetitions,
});

/** Corrida MO PSE 5–6 (Estágios 1, 3 e 4). */
const mo56 = (order: number, minutes: number): WorkoutBlock =>
  run(order, minutes * 60, 5, 6);

// ----------------------------------------------------------------------------
// Peças compartilhadas (sempre objetos novos, para não haver estado compartilhado)
// ----------------------------------------------------------------------------

/** Aquecimento inicial: 5 minutos de caminhada FR, fora do estímulo principal. */
const warmup = (): WarmupDefinition => ({
  type: "walk",
  durationSeconds: 300,
  intensity: "FR",
});

const adaptive = (): AdaptiveDefinition => ({
  repeatable: true,
  states: ["advance", "consolidate", "adapt", "regress_1", "regress_2", "not_done"],
});

/** Estímulo do Estágio 1 (T2 e T3): tempo dos 2 km + aprox. 5 min, em blocos de 5–6 min + 1 min FR. */
const referencePlusDuration = (): ReferenceDurationStimulus => ({
  type: "reference_plus_duration",
  reference: "previous_2k_completion_time",
  additionalDurationSeconds: 300,
  runBlockMinSeconds: 300,
  runBlockMaxSeconds: 360,
  recoverySeconds: 60,
  intensity: "MO",
  pseMin: 5,
  pseMax: 6,
});

/** Comparação histórica com o ciclo 2K: preserva estrutura e repetições (sem alterar a dose). */
const historicalFrom2K = (): HistoricalComparisonDefinition => ({
  sourceProgramId: "2K",
  preserveStructure: true,
  preserveRepetitions: true,
  comparisonMetrics: ["pse", "perception", "control"],
});

/** Estímulo fixo de uma única sequência. */
const fixed = (sequence: WorkoutBlockSequence): MainStimulusDefinition => ({
  type: "fixed",
  sequences: [sequence],
});

// ----------------------------------------------------------------------------
// Pool de velocidade (Estágio 2 · T2): V1–V4
// ----------------------------------------------------------------------------

const SPEED_POOL: StimulusProtocol[] = [
  {
    id: "V1",
    purpose: "repeat_known_stimulus",
    sequences: [seq([strong(1, 60), walk(2, 120)], 4)],
  },
  {
    id: "V2",
    purpose: "controlled_speed",
    sequences: [seq([strong(1, 45), walk(2, 75)], 4)],
  },
  {
    id: "V3",
    purpose: "sustain_fo",
    sequences: [seq([strong(1, 120), walk(2, 120)], 4)],
  },
  {
    id: "V4",
    purpose: "historical_comparison",
    sequences: [seq([strong(1, 120), walk(2, 60)], 6)],
    historicalComparison: historicalFrom2K(),
  },
];

// ----------------------------------------------------------------------------
// Estágios
// ----------------------------------------------------------------------------

const STAGES: StageDefinition[] = [
  {
    stageId: 1,
    id: "CONSOLIDAR_E_AMPLIAR",
    purpose:
      "Usar o 2K como referência e acrescentar aproximadamente 5 minutos de capacidade de corrida.",
  },
  {
    stageId: 2,
    id: "CONSTRUIR_RESISTENCIA_VELOCIDADE",
    purpose:
      "Aumentar a resistência e introduzir velocidade controlada, incluindo comparação histórica.",
  },
  {
    stageId: 3,
    id: "APROXIMAR_DOS_3K",
    purpose: "Aumentar a continuidade e reduzir gradualmente a dependência da caminhada.",
  },
  {
    stageId: 4,
    id: "DESAFIO_3K",
    purpose: "Preparar, tentar e consolidar os 3 km contínuos.",
  },
];

// ----------------------------------------------------------------------------
// Orientações ao atleta
// ----------------------------------------------------------------------------

const GUIDANCE = {
  s1t1:
    "Corra 2 km contínuos, em ritmo de conversa (PSE 5–6). Anote o tempo, o esforço e como foi o seu controle: esses dados criam a sua referência individual para os próximos treinos.",
  s1t2:
    "Corra em blocos de 5 a 6 minutos, com 1 minuto de caminhada entre eles, em ritmo de conversa. O tempo total de corrida parte do seu tempo dos 2 km mais cerca de 5 minutos. O aquecimento não entra nessa conta.",
  s1t3:
    "Repita o treino anterior para consolidar. Não aumente a dose por conta própria.",
  s2t1:
    "Corra os blocos de 7 minutos em esforço moderado e use os 2 minutos de caminhada para se recuperar. Se precisar caminhar mais para se recuperar, tudo bem.",
  s2t2:
    "Faça o estímulo de velocidade indicado para o dia. Nos blocos fortes, aumente o esforço de forma controlada; nos blocos de caminhada, recupere. Se precisar caminhar mais para se recuperar, tudo bem.",
  s2t3:
    "Alterne 5 minutos moderados, 1 minuto forte e 2 minutos de caminhada. Se precisar caminhar mais para se recuperar, tudo bem.",
  stage3:
    "Corra em esforço moderado (PSE 5–6), em ritmo de conversa. O minuto de caminhada entre os blocos será reduzido conforme a sua resposta mostrar mais continuidade. Esta sessão pode ser repetida.",
  s4t1:
    "Corra em ritmo de conversa (PSE 5–6), com 1 minuto de caminhada entre os blocos.",
  s4t2:
    "Corra 3 km contínuos, sem caminhar, em ritmo de conversa (PSE 5–6) e sem preocupação com pace. Se precisar caminhar antes de completar, caminhe e registre o que realmente aconteceu.",
} as const;

// ----------------------------------------------------------------------------
// Fábrica de sessão (interna)
// ----------------------------------------------------------------------------

type SessionInput = {
  stageId: TrainingSession3K["stageId"];
  stageSession: number;
  title: string;
  type: SessionType;
  objective: string;
  mainStimulus: MainStimulusDefinition;
  athleteGuidance: string;
  progressionRole: ProgressionRole;
  completionCriteria?: CompletionCriteria;
};

const session = (input: SessionInput): TrainingSession3K => ({
  id: `${PROGRAM_ID}_S${input.stageId}_T${input.stageSession}`,
  programId: PROGRAM_ID,
  stageId: input.stageId,
  stageSessionId: `3K-S${input.stageId}-T${input.stageSession}`,
  title: input.title,
  type: input.type,
  objective: input.objective,
  warmup: warmup(),
  mainStimulus: input.mainStimulus,
  athleteGuidance: input.athleteGuidance,
  ...(input.completionCriteria ? { completionCriteria: input.completionCriteria } : {}),
  progressionRole: input.progressionRole,
  adaptive: adaptive(),
});

// ----------------------------------------------------------------------------
// Sessões — Estágio 1 (3) + Estágio 2 (3) + Estágio 3 (6) + Estágio 4 (2) = 14
// ----------------------------------------------------------------------------

/** Estágio 3: corrida / 1 min FR / corrida, em minutos de corrida. */
const stage3 = (stageSession: number, first: number, second: number): TrainingSession3K =>
  session({
    stageId: 3,
    stageSession,
    title: `3K · Estágio 3 · Treino ${stageSession} — ${first} min / 1 min FR / ${second} min`,
    type: "run_walk",
    objective: "Aumentar a continuidade da corrida, com recuperação curta em caminhada.",
    mainStimulus: fixed(seq([mo56(1, first), walk(2, 60), mo56(3, second)], 1)),
    athleteGuidance: GUIDANCE.stage3,
    progressionRole: "progression",
  });

const SESSIONS: TrainingSession3K[] = [
  // ===== ESTÁGIO 1 — Consolidar e ampliar =====
  session({
    stageId: 1,
    stageSession: 1,
    title: "3K · Estágio 1 · Treino 1 — 2 km contínuos",
    type: "continuous_run",
    objective: "Correr 2 km contínuos para criar a referência individual de tempo, PSE e controle.",
    mainStimulus: {
      type: "continuous_distance",
      targetKm: 2,
      continuous: true,
      intensity: "MO",
      pseMin: 5,
      pseMax: 6,
      establishesReference: {
        reference: "previous_2k_completion_time",
        basedOn: ["completion_time", "pse", "control_perception"],
      },
    },
    athleteGuidance: GUIDANCE.s1t1,
    progressionRole: "consolidation",
  }),
  session({
    stageId: 1,
    stageSession: 2,
    title: "3K · Estágio 1 · Treino 2 — Tempo dos 2 km + 5 minutos",
    type: "run_walk",
    objective:
      "Acrescentar cerca de 5 minutos de capacidade de corrida ao tempo dos 2 km, em blocos de 5 a 6 minutos.",
    mainStimulus: referencePlusDuration(),
    athleteGuidance: GUIDANCE.s1t2,
    progressionRole: "progression",
  }),
  session({
    stageId: 1,
    stageSession: 3,
    title: "3K · Estágio 1 · Treino 3 — Repetição do Treino 2",
    type: "run_walk",
    objective: "Repetir o estímulo do Treino 2 para consolidar, sem aumentar a dose.",
    mainStimulus: referencePlusDuration(),
    athleteGuidance: GUIDANCE.s1t3,
    progressionRole: "consolidation",
  }),

  // ===== ESTÁGIO 2 — Construir resistência + velocidade =====
  session({
    stageId: 2,
    stageSession: 1,
    title: "3K · Estágio 2 · Treino 1 — 3 × 7 min MO / 2 min FR",
    type: "run_walk",
    objective: "Aumentar a resistência com blocos moderados de 7 minutos.",
    mainStimulus: fixed(seq([run(1, 420, 5, 6, "Moderado"), walk(2, 120)], 3)),
    athleteGuidance: GUIDANCE.s2t1,
    progressionRole: "progression",
  }),
  session({
    stageId: 2,
    stageSession: 2,
    title: "3K · Estágio 2 · Treino 2 — Velocidade (pool V1–V4)",
    type: "fartlek",
    objective: "Introduzir velocidade controlada com um protocolo aprovado do pool V1–V4.",
    mainStimulus: { type: "protocol_pool", protocols: SPEED_POOL },
    athleteGuidance: GUIDANCE.s2t2,
    progressionRole: "progression",
  }),
  session({
    stageId: 2,
    stageSession: 3,
    title: "3K · Estágio 2 · Treino 3 — 3 × (5 min MO + 1 min FO + 2 min FR)",
    type: "fartlek",
    objective: "Alterna blocos moderados, fortes e de caminhada para resistência e velocidade.",
    mainStimulus: fixed(seq([run(1, 300, 5, 6, "Moderado"), strong(2, 60), walk(3, 120)], 3)),
    athleteGuidance: GUIDANCE.s2t3,
    progressionRole: "progression",
  }),

  // ===== ESTÁGIO 3 — Aproximar dos 3 km =====
  stage3(1, 8, 8),
  stage3(2, 10, 10),
  stage3(3, 12, 10),
  stage3(4, 12, 12),
  stage3(5, 15, 5),
  stage3(6, 15, 8),

  // ===== ESTÁGIO 4 — Desafio 3K =====
  session({
    stageId: 4,
    stageSession: 1,
    title: "3K · Estágio 4 · Treino 1 — 10 min / 6 min / 4 min",
    type: "run_walk",
    objective: "Preparar o desafio com três blocos de corrida separados por 1 minuto de caminhada.",
    mainStimulus: fixed(
      seq([mo56(1, 10), walk(2, 60), mo56(3, 6), walk(4, 60), mo56(5, 4)], 1),
    ),
    athleteGuidance: GUIDANCE.s4t1,
    progressionRole: "final_prep",
  }),
  session({
    stageId: 4,
    stageSession: 2,
    title: "3K · Estágio 4 · Treino 2 — Desafio 3 km contínuos",
    type: "challenge",
    objective: "Correr 3 km contínuos.",
    mainStimulus: {
      type: "continuous_distance",
      targetKm: 3,
      continuous: true,
      intensity: "MO",
      pseMin: 5,
      pseMax: 6,
    },
    athleteGuidance: GUIDANCE.s4t2,
    completionCriteria: {
      type: "distance",
      targetKm: 3,
      continuous: true,
    },
    progressionRole: "challenge",
  }),
];

// ----------------------------------------------------------------------------
// Programa
// ----------------------------------------------------------------------------

export const PROGRAM_3K_EXTENSION: TrainingProgram3K = {
  id: "PROGRAM_3K_EXTENSION",
  name: "Correr 3 km sem parar",
  originProgram: "2K",
  sessionsPerWeek: [2, 3],
  adaptive: true,
  stages: STAGES,
  sessions: SESSIONS,
};
