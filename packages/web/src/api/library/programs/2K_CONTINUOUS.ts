import type {
  ProgressionRole,
  SessionType,
  TrainingProgram,
  TrainingSession,
  WorkoutBlock,
  WorkoutBlockSequence,
} from "../types";

// ============================================================================
// PROGRAMA OFICIAL SAN RUN — 2K_CONTINUOUS
// Correr 2 km ou 15 minutos sem caminhar · 7 semanas · 3 sessões por semana
//
// Escala de intensidade:
//   FR = caminhada (PSE 1–3) · MO = moderado (PSE 4–6) · FO = forte (PSE 7–8)
//
// Notas de modelagem:
// - Nenhuma sessão tem aquecimento ou desaquecimento definidos pela metodologia,
//   então `warmup` e `cooldown` são `null` em todas.
// - Não há metas de distância nas sessões intermediárias. Se algum consumidor
//   precisar estimar distância, deve fazê-lo por bloco (caminhada = 10 min/km,
//   corrida/trote = 7 min/km), apenas como estimativa — sem alterar a prescrição.
// - O ritmo é sempre uma orientação; o atleta pode caminhar mais para se recuperar.
// ============================================================================

const PROGRAM_ID = "2K_CONTINUOUS" as const;

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

/** Corrida — MO. Usa `pseMax = pseMin` quando o PSE é um valor único. */
const run = (
  order: number,
  durationSeconds: number,
  pseMin: number,
  pseMax: number = pseMin,
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

/** Trote — MO, PSE 4–6. */
const trot = (order: number, durationSeconds: number): WorkoutBlock => ({
  order,
  activity: "trot",
  durationSeconds,
  intensity: "MO",
  pseMin: 4,
  pseMax: 6,
  label: "Trote",
});

/** Bloco forte de fartlek — FO, PSE 7–8. */
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

// ----------------------------------------------------------------------------
// Orientações ao atleta (por tipo de sessão)
// ----------------------------------------------------------------------------

const GUIDANCE = {
  run_walk:
    "Corra em ritmo de conversa e use a caminhada para recuperar o fôlego. Se precisar de mais tempo de caminhada para se recuperar, tudo bem: caminhe mais e depois retome o treino.",
  walk: "Caminhe de forma contínua, em ritmo confortável e constante.",
  fartlek:
    "Nos blocos moderados, mantenha um ritmo de conversa; nos blocos fortes, aumente o esforço de forma controlada; nos blocos de caminhada, recupere. Se precisar caminhar mais para se recuperar, tudo bem.",
  walk_trot:
    "Caminhe primeiro e, no trote, mantenha o ritmo de conversa. Se precisar caminhar mais para se recuperar, tudo bem.",
  continuous_run:
    "Corra de forma contínua, em ritmo de conversa. Se precisar caminhar para se recuperar, caminhe e depois retome, anotando o que aconteceu.",
  challenge:
    "Este desafio não é prova de aprovação ou reprovação. Corra em ritmo de conversa até completar 15 minutos contínuos ou 2 km contínuos; não é preciso cumprir os dois. Se precisar caminhar antes de atingir um dos critérios, caminhe e registre o que realmente aconteceu — isso não é fracasso.",
} as const satisfies Record<SessionType, string>;

// ----------------------------------------------------------------------------
// Fábrica de sessão (interna)
// ----------------------------------------------------------------------------

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
  athleteGuidance: GUIDANCE[input.type],
  ...(input.completionCriteria ? { completionCriteria: input.completionCriteria } : {}),
  progressionRole: input.progressionRole,
});

// ----------------------------------------------------------------------------
// Sessões — 7 semanas × 3 sessões = 21
// ----------------------------------------------------------------------------

const SESSIONS: TrainingSession[] = [
  // ===== SEMANA 1 — adaptation =====
  session({
    week: 1,
    sessionNumber: 1,
    title: "Semana 1 · Treino 1 — Corrida e caminhada",
    type: "run_walk",
    objective: "Introduzir a corrida em blocos curtos, alternados com caminhada.",
    blocks: [seq([run(1, 30, 4), walk(2, 90)], 7)],
    progressionRole: "adaptation",
  }),
  session({
    week: 1,
    sessionNumber: 2,
    title: "Semana 1 · Treino 2 — Corrida e caminhada",
    type: "run_walk",
    objective: "Ampliar levemente os blocos de corrida, com recuperação em caminhada.",
    blocks: [seq([run(1, 45, 4), walk(2, 135)], 6)],
    progressionRole: "adaptation",
  }),
  session({
    week: 1,
    sessionNumber: 3,
    title: "Semana 1 · Treino 3 — Caminhada",
    type: "walk",
    objective: "Manter a rotina de treino com caminhada contínua.",
    blocks: [seq([walk(1, 1800)], 1)],
    progressionRole: "adaptation",
  }),

  // ===== SEMANA 2 — consolidation =====
  session({
    week: 2,
    sessionNumber: 1,
    title: "Semana 2 · Treino 1 — Corrida e caminhada",
    type: "run_walk",
    objective: "Consolidar blocos de corrida de 1 minuto com recuperação em caminhada.",
    blocks: [seq([run(1, 60, 4), walk(2, 120)], 6)],
    progressionRole: "consolidation",
  }),
  session({
    week: 2,
    sessionNumber: 2,
    title: "Semana 2 · Treino 2 — Corrida e caminhada",
    type: "run_walk",
    objective: "Consolidar blocos de corrida de 1 minuto e meio, com caminhada equivalente.",
    blocks: [seq([run(1, 90, 4), walk(2, 90)], 6)],
    progressionRole: "consolidation",
  }),
  session({
    week: 2,
    sessionNumber: 3,
    title: "Semana 2 · Treino 3 — Caminhada",
    type: "walk",
    objective: "Manter a rotina de treino com caminhada contínua.",
    blocks: [seq([walk(1, 2100)], 1)],
    progressionRole: "consolidation",
  }),

  // ===== SEMANA 3 — consolidation =====
  session({
    week: 3,
    sessionNumber: 1,
    title: "Semana 3 · Treino 1 — Corrida e caminhada",
    type: "run_walk",
    objective: "Consolidar blocos de corrida de 2 minutos com caminhada equivalente.",
    blocks: [seq([run(1, 120, 5), walk(2, 120)], 5)],
    progressionRole: "consolidation",
  }),
  session({
    week: 3,
    sessionNumber: 2,
    title: "Semana 3 · Treino 2 — Corrida e caminhada",
    type: "run_walk",
    objective: "Consolidar blocos de corrida de 2 minutos com caminhada mais curta.",
    blocks: [seq([run(1, 120, 5), walk(2, 60)], 5)],
    progressionRole: "consolidation",
  }),
  session({
    week: 3,
    sessionNumber: 3,
    title: "Semana 3 · Treino 3 — Caminhada",
    type: "walk",
    objective: "Manter a rotina de treino com caminhada contínua.",
    blocks: [seq([walk(1, 2400)], 1)],
    progressionRole: "consolidation",
  }),

  // ===== SEMANA 4 — progression =====
  session({
    week: 4,
    sessionNumber: 1,
    title: "Semana 4 · Treino 1 — Corrida e caminhada",
    type: "run_walk",
    objective: "Progredir para blocos de corrida de 3 minutos.",
    blocks: [seq([run(1, 180, 6), walk(2, 120)], 4)],
    progressionRole: "progression",
  }),
  session({
    week: 4,
    sessionNumber: 2,
    title: "Semana 4 · Treino 2 — Fartlek",
    type: "fartlek",
    objective: "Introduzir variação de ritmo entre blocos moderados, fortes e caminhada.",
    blocks: [seq([run(1, 60, 6, 6, "Moderado"), strong(2, 60), walk(3, 120)], 4)],
    progressionRole: "progression",
  }),
  session({
    week: 4,
    sessionNumber: 3,
    title: "Semana 4 · Treino 3 — Caminhada e trote",
    type: "walk_trot",
    objective: "Combinar caminhada contínua com um bloco final de trote.",
    blocks: [seq([walk(1, 2100), trot(2, 300)], 1)],
    progressionRole: "progression",
  }),

  // ===== SEMANA 5 — progression =====
  session({
    week: 5,
    sessionNumber: 1,
    title: "Semana 5 · Treino 1 — Corrida e caminhada",
    type: "run_walk",
    objective: "Progredir para blocos de corrida de 4 minutos.",
    blocks: [seq([run(1, 240, 6), walk(2, 120)], 3)],
    progressionRole: "progression",
  }),
  session({
    week: 5,
    sessionNumber: 2,
    title: "Semana 5 · Treino 2 — Fartlek",
    type: "fartlek",
    objective: "Ampliar o bloco moderado do fartlek, mantendo o bloco forte e a caminhada.",
    blocks: [seq([run(1, 120, 6, 6, "Moderado"), strong(2, 60), walk(3, 120)], 4)],
    progressionRole: "progression",
  }),
  session({
    week: 5,
    sessionNumber: 3,
    title: "Semana 5 · Treino 3 — Caminhada e trote",
    type: "walk_trot",
    objective: "Combinar caminhada contínua com um bloco final de trote mais longo.",
    blocks: [seq([walk(1, 2100), trot(2, 420)], 1)],
    progressionRole: "progression",
  }),

  // ===== SEMANA 6 — progression =====
  session({
    week: 6,
    sessionNumber: 1,
    title: "Semana 6 · Treino 1 — Corrida e caminhada",
    type: "run_walk",
    objective: "Progredir para blocos de corrida de 5 minutos com caminhada curta.",
    blocks: [seq([run(1, 300, 6), walk(2, 60)], 2)],
    progressionRole: "progression",
  }),
  session({
    week: 6,
    sessionNumber: 2,
    title: "Semana 6 · Treino 2 — Fartlek",
    type: "fartlek",
    objective: "Ampliar novamente o bloco moderado do fartlek.",
    blocks: [seq([run(1, 180, 6, 6, "Moderado"), strong(2, 60), walk(3, 120)], 3)],
    progressionRole: "progression",
  }),
  session({
    week: 6,
    sessionNumber: 3,
    title: "Semana 6 · Treino 3 — Caminhada e trote",
    type: "walk_trot",
    objective: "Combinar caminhada contínua com um bloco final de trote de 10 minutos.",
    blocks: [seq([walk(1, 1800), trot(2, 600)], 1)],
    progressionRole: "progression",
  }),

  // ===== SEMANA 7 — final_prep / taper / challenge =====
  session({
    week: 7,
    sessionNumber: 1,
    title: "Semana 7 · Treino 1 — Corrida contínua",
    type: "continuous_run",
    objective: "Correr 12 minutos contínuos como preparação final para o desafio.",
    blocks: [seq([run(1, 720, 5, 6, "Corrida contínua")], 1)],
    completionCriteria: {
      type: "duration",
      targetSeconds: 720,
      continuous: true,
    },
    progressionRole: "final_prep",
  }),
  session({
    week: 7,
    sessionNumber: 2,
    title: "Semana 7 · Treino 2 — Corrida e caminhada",
    type: "run_walk",
    objective: "Reduzir o volume antes do desafio, alternando corrida e caminhada.",
    blocks: [seq([run(1, 120, 5), walk(2, 120)], 3)],
    progressionRole: "taper",
  }),
  session({
    week: 7,
    sessionNumber: 3,
    title: "Semana 7 · Treino 3 — Desafio SAN RUN",
    type: "challenge",
    objective: "Completar 15 minutos contínuos ou 2 km contínuos, sem caminhar.",
    // Bloco de referência: 15 min de corrida contínua. O critério de conclusão é
    // 15 min OU 2 km — o que for atingido primeiro; não é preciso cumprir os dois.
    blocks: [seq([run(1, 900, 5, 6, "Corrida contínua")], 1)],
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

// ----------------------------------------------------------------------------
// Programa
// ----------------------------------------------------------------------------

export const PROGRAM_2K_CONTINUOUS: TrainingProgram = {
  id: "2K_CONTINUOUS",
  name: "Correr 2 km ou 15 minutos sem caminhar",
  weeks: 7,
  sessionsPerWeek: 3,
  totalSessions: 21,
  recommendedFor: ["never_ran"],
  nextProgression: null,
  sessions: SESSIONS,
};
