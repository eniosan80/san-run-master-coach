import type {
  ProgressionRole,
  SessionType,
  TrainingProgram,
  TrainingSession,
  WorkoutBlock,
  WorkoutBlockSequence,
} from "../types";

const PROGRAM_ID = "2K_CONTINUOUS_2X" as const;

const block = (
  order: number,
  activity: WorkoutBlock["activity"],
  durationSeconds: number,
  intensity: WorkoutBlock["intensity"],
  pseMin: number,
  pseMax: number,
  label?: string,
): WorkoutBlock => ({
  order,
  activity,
  durationSeconds,
  intensity,
  pseMin,
  pseMax,
  ...(label ? { label } : {}),
});

const seq = (
  blocks: WorkoutBlock[],
  repetitions: number,
): WorkoutBlockSequence => ({
  blocks,
  repetitions,
});

const guidance: Record<SessionType, string> = {
  run_walk:
    "Corra em esforço controlado e use a caminhada para recuperar. O objetivo é perceber o corpo, não perseguir pace.",
  walk:
    "Caminhe de forma contínua e confortável. O objetivo é construir resistência sem necessidade de correr.",
  fartlek:
    "Nos blocos moderados, mantenha esforço controlado. No bloco forte, aumente o esforço sem transformar em tiro. Recupere caminhando.",
  walk_trot:
    "Caminhe primeiro e faça o trote em esforço confortável. O trote deve permanecer controlado.",
  continuous_run:
    "Corra de forma contínua em PSE 5–6. Priorize constância e controle, sem buscar velocidade.",
  challenge:
    "Este desafio não é aprovação ou reprovação. Busque 15 minutos contínuos ou 2 km contínuos. Não é preciso cumprir os dois.",
};

type SessionInput = {
  week: number;
  sessionNumber: TrainingSession["sessionNumber"];
  title: string;
  type: SessionType;
  objective: string;
  blocks: WorkoutBlockSequence[];
  progressionRole: ProgressionRole;
  completionCriteria?: TrainingSession["completionCriteria"];
};

const session = (input: SessionInput): TrainingSession => ({
  id: `${PROGRAM_ID}_W${input.week}_T${input.sessionNumber}`,
  programId: PROGRAM_ID,
  week: input.week,
  sessionNumber: input.sessionNumber,
  title: input.title,
  type: input.type,
  objective: input.objective,
  warmup: null,
  blocks: input.blocks,
  cooldown: null,
  athleteGuidance: guidance[input.type],
  ...(input.completionCriteria
    ? { completionCriteria: input.completionCriteria }
    : {}),
  progressionRole: input.progressionRole,
});

const SESSIONS: TrainingSession[] = [
  // W1 — ADAPTAÇÃO
  session({
    week: 1,
    sessionNumber: 1,
    title: "Semana 1 · Treino 1 — Primeiros estímulos de corrida",
    type: "run_walk",
    objective:
      "Apresentar a corrida de forma gradual, priorizando controle do esforço e adaptação ao movimento.",
    blocks: [
      seq(
        [
          block(1, "run", 30, "MO", 4, 4, "Corrida controlada"),
          block(2, "walk", 90, "FR", 1, 3, "Caminhada"),
        ],
        7,
      ),
    ],
    progressionRole: "adaptation",
  }),
  session({
    week: 1,
    sessionNumber: 2,
    title: "Semana 1 · Treino 2 — Construção da base",
    type: "walk",
    objective:
      "Desenvolver resistência geral por meio de caminhada contínua, sem exigir corrida.",
    blocks: [seq([block(1, "walk", 1800, "FR", 1, 3, "Caminhada contínua")], 1)],
    progressionRole: "adaptation",
  }),

  // W2 — CONSOLIDAÇÃO
  session({
    week: 2,
    sessionNumber: 1,
    title: "Semana 2 · Treino 1 — Corrida curta controlada",
    type: "run_walk",
    objective:
      "Aumentar gradualmente o tempo correndo sem elevar excessivamente a intensidade.",
    blocks: [
      seq(
        [
          block(1, "run", 60, "MO", 4, 4, "Corrida"),
          block(2, "walk", 120, "FR", 1, 3, "Caminhada"),
        ],
        6,
      ),
    ],
    progressionRole: "consolidation",
  }),
  session({
    week: 2,
    sessionNumber: 2,
    title: "Semana 2 · Treino 2 — Caminhada + estímulos de corrida",
    type: "run_walk",
    objective:
      "Introduzir períodos curtos de corrida dentro de uma sessão predominantemente confortável.",
    blocks: [
      seq(
        [
          block(1, "run", 45, "MO", 4, 4, "Corrida curta"),
          block(2, "walk", 90, "FR", 1, 3, "Caminhada"),
        ],
        6,
      ),
    ],
    progressionRole: "consolidation",
  }),

  // W3 — PROGRESSÃO
  session({
    week: 3,
    sessionNumber: 1,
    title: "Semana 3 · Treino 1 — Corrida em blocos",
    type: "run_walk",
    objective:
      "Aumentar a tolerância a períodos maiores de corrida.",
    blocks: [
      seq(
        [
          block(1, "run", 120, "MO", 5, 5, "Corrida sustentada"),
          block(2, "walk", 120, "FR", 1, 3, "Caminhada"),
        ],
        5,
      ),
    ],
    progressionRole: "progression",
  }),
  session({
    week: 3,
    sessionNumber: 2,
    title: "Semana 3 · Treino 2 — Corrida intervalada introdutória",
    type: "run_walk",
    objective:
      "Ensinar a alternar corrida e recuperação de forma controlada antes da introdução formal do fartlek.",
    blocks: [
      seq(
        [
          block(1, "run", 60, "MO", 4, 5, "Corrida"),
          block(2, "walk", 90, "FR", 1, 3, "Recuperação"),
        ],
        6,
      ),
    ],
    progressionRole: "progression",
  }),

  // W4 — TRANSIÇÃO
  session({
    week: 4,
    sessionNumber: 1,
    title: "Semana 4 · Treino 1 — Caminhada + Trote de Transição",
    type: "walk_trot",
    objective:
      "Construir resistência e preparar o corpo para períodos mais longos de corrida contínua.",
    blocks: [
      seq(
        [
          block(1, "walk", 1500, "FR", 1, 3, "Caminhada"),
          block(2, "trot", 300, "MO", 4, 5, "Trote de transição"),
        ],
        1,
      ),
    ],
    progressionRole: "progression",
  }),
  session({
    week: 4,
    sessionNumber: 2,
    title: "Semana 4 · Treino 2 — Fartlek SAN RUN",
    type: "fartlek",
    objective:
      "Introduzir variações de esforço de forma controlada, usando PSE como referência principal.",
    blocks: [
      seq(
        [
          block(1, "run", 60, "MO", 5, 6, "Moderado"),
          block(2, "run", 30, "FO", 7, 8, "Forte controlado"),
          block(3, "walk", 120, "FR", 1, 3, "Recuperação"),
        ],
        4,
      ),
    ],
    progressionRole: "progression",
  }),

  // W5 — PROGRESSÃO
  session({
    week: 5,
    sessionNumber: 1,
    title: "Semana 5 · Treino 1 — Fartlek controlado",
    type: "fartlek",
    objective:
      "Aumentar gradualmente o tempo sob estímulo moderado e forte sem exigir longos períodos contínuos de corrida.",
    blocks: [
      seq(
        [
          block(1, "run", 120, "MO", 5, 6, "Moderado"),
          block(2, "run", 30, "FO", 7, 8, "Forte controlado"),
          block(3, "walk", 120, "FR", 1, 3, "Recuperação"),
        ],
        4,
      ),
    ],
    progressionRole: "progression",
  }),
  session({
    week: 5,
    sessionNumber: 2,
    title: "Semana 5 · Treino 2 — Corrida sustentada",
    type: "run_walk",
    objective:
      "Ampliar o maior bloco contínuo de corrida mantendo intensidade moderada.",
    blocks: [
      seq(
        [
          block(1, "run", 240, "MO", 5, 6, "Corrida sustentada"),
          block(2, "walk", 120, "FR", 1, 3, "Caminhada"),
        ],
        3,
      ),
    ],
    progressionRole: "progression",
  }),

  // W6 — CONSOLIDAÇÃO AVANÇADA
  session({
    week: 6,
    sessionNumber: 1,
    title: "Semana 6 · Treino 1 — Fartlek progressivo",
    type: "fartlek",
    objective:
      "Aumentar a capacidade de sustentar esforços moderados e fortes por períodos maiores.",
    blocks: [
      seq(
        [
          block(1, "run", 180, "MO", 5, 6, "Moderado"),
          block(2, "run", 60, "FO", 7, 8, "Forte controlado"),
          block(3, "walk", 120, "FR", 1, 3, "Recuperação"),
        ],
        3,
      ),
    ],
    progressionRole: "progression",
  }),
  session({
    week: 6,
    sessionNumber: 2,
    title: "Semana 6 · Treino 2 — Caminhada + Trote de Transição",
    type: "walk_trot",
    objective:
      "Ampliar o tempo contínuo de trote e preparar o atleta para a fase final do programa.",
    blocks: [
      seq(
        [
          block(1, "walk", 1200, "FR", 1, 3, "Caminhada"),
          block(2, "trot", 420, "MO", 4, 6, "Trote de transição"),
        ],
        1,
      ),
    ],
    progressionRole: "progression",
  }),

  // W7 — PREPARAÇÃO FINAL
  session({
    week: 7,
    sessionNumber: 1,
    title: "Semana 7 · Treino 1 — Fartlek de manutenção",
    type: "fartlek",
    objective:
      "Manter o estímulo de intensidade sem gerar fadiga excessiva antes da fase final.",
    blocks: [
      seq(
        [
          block(1, "run", 180, "MO", 5, 6, "Moderado"),
          block(2, "run", 60, "FO", 7, 7, "Forte controlado"),
          block(3, "walk", 120, "FR", 1, 3, "Recuperação"),
        ],
        3,
      ),
    ],
    progressionRole: "final_prep",
  }),
  session({
    week: 7,
    sessionNumber: 2,
    title: "Semana 7 · Treino 2 — Corrida contínua em blocos",
    type: "run_walk",
    objective:
      "Aproximar o atleta da capacidade de correr continuamente por períodos maiores.",
    blocks: [
      seq(
        [
          block(1, "run", 480, "MO", 5, 6, "Corrida contínua"),
          block(2, "walk", 120, "FR", 1, 3, "Recuperação"),
          block(3, "run", 300, "MO", 5, 6, "Corrida contínua"),
        ],
        1,
      ),
    ],
    progressionRole: "final_prep",
  }),

  // W8 — CONCLUSÃO
  session({
    week: 8,
    sessionNumber: 1,
    title: "Semana 8 · Treino 1 — Corrida contínua",
    type: "continuous_run",
    objective:
      "Testar a capacidade de permanecer correndo continuamente por 12 minutos.",
    blocks: [
      seq(
        [block(1, "run", 720, "MO", 5, 6, "Corrida contínua")],
        1,
      ),
    ],
    completionCriteria: {
      type: "duration",
      targetSeconds: 720,
      continuous: true,
    },
    progressionRole: "final_prep",
  }),
  session({
    week: 8,
    sessionNumber: 2,
    title: "Semana 8 · Treino 2 — Desafio SAN RUN 2K",
    type: "challenge",
    objective:
      "Concluir o ciclo verificando a capacidade de correr continuamente por 15 minutos ou completar 2 km.",
    blocks: [
      seq(
        [block(1, "run", 900, "MO", 5, 6, "Desafio contínuo")],
        1,
      ),
    ],
    completionCriteria: {
      type: "duration_or_distance",
      options: [
        {
          type: "duration",
          targetSeconds: 900,
          continuous: true,
        },
        {
          type: "distance",
          targetKm: 2,
          continuous: true,
        },
      ],
    },
    progressionRole: "challenge",
  }),
];

export const PROGRAM_2K_CONTINUOUS_2X: TrainingProgram = {
  id: PROGRAM_ID,
  name: "Correr 2 km ou 15 minutos sem caminhar — 2x/semana",
  weeks: 8,
  sessionsPerWeek: 2,
  totalSessions: 16,
  recommendedFor: ["never_ran"],
  nextProgression: null,
  sessions: SESSIONS,
};
