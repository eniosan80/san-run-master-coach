export interface AthleteSession {
  id: string;
  name: string;
  age: number;
  sex: string;
  experience: string;
  weeklyFrequency: string;
  trainingDays: number[]; // 0=Dom,1=Seg,2=Ter,3=Qua,4=Qui,5=Sex,6=Sáb
  goal: string;
  level: number;
  phase: string;
}

export interface ClassificationData {
  level: number;
  levelName: string;
  reason: string;
  nextFocus: string;
  phase: string;
}

export interface DiagnosisData {
  data: string;
  interpretation: string;
  decision: string;
}

export interface WorkoutData {
  id?: string;
  title: string;
  duration: string;
  rpe: number;
  instructions: string;
  why: string;
  successCriteria: string;
  blocks?: WorkoutBlock[];
}

export interface CheckinData {
  sleep: number;
  energy: number;
  pain: number;
  motivation: number;
  readiness: string;
  date: string;
}

export interface WorkoutRecord {
  date: string;
  title: string;
  duration: string;
  completed: boolean;
  rpe: number;
  elapsedSeconds?: number;
}

/** Bloco estruturado de treino — fonte única de verdade */
export interface WorkoutBlock {
  type: "warmup" | "series" | "cooldown" | "continuous";
  label: string;
  durationMin?: number;
  rpe?: number;
  reps?: number;
  workDurationMin?: number;
  restDurationMin?: number;
  workRpe?: number;
  restRpe?: number;
  restLabel?: string;
}

export interface WeeklyWorkout {
  day: string;        // "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SÁB" | "DOM"
  dayIndex: number;   // 0-6
  title: string;
  duration: string;
  rpe: number;
  objective: string;
  status: "done" | "active" | "next" | "locked" | "rest";
  // Dados completos do treino — fonte única de verdade
  instructions?: string;
  why?: string;
  successCriteria?: string;
  blocks?: WorkoutBlock[];
}

export interface WeeklyPlan {
  weekNumber: number;
  startDate: string;
  workouts: WeeklyWorkout[];
  completedCount: number;
  requiredCount: number;
  unlocked: boolean;
}

export interface BuilderBlock {
  id: string;
  type: "warmup" | "series" | "recovery" | "cooldown";
  label: string;
  // For warmup/recovery/cooldown: duration in minutes (number)
  durationMin: number;
  rpe?: number;
  notes?: string;
  // Series-specific
  reps?: number;           // number of repetitions
  workDurationMin?: number; // work interval duration (min)
  restDurationMin?: number; // rest interval duration (min)
  workRpe?: number;
  restRpe?: number;
}

export interface BuilderSession {
  name: string;
  blocks: BuilderBlock[];
  totalDuration: string;
  createdAt: string;
}

// Flat execution step — generated from BuilderBlock list for the timer
export interface ExecStep {
  blockId: string;
  label: string;       // "Corrida forte", "Recuperação", "Aquecimento", etc.
  blockName: string;   // nome do bloco pai — ex: "Corrida Progressiva" ou "AQUECIMENTO"
  type: BuilderBlock["type"];
  phase: "work" | "rest" | "warmup" | "cooldown"; // for coloring
  durationSec: number;
  rpe?: number;
  notes?: string;
  repLabel?: string;   // "1 / 8" (serie atual / total)
  totalReps?: number;  // total de repetições do bloco (só para series)
  currentRep?: number; // número da repetição atual (1-based)
}

/* ─── FORÇA SAN RUN ─── */
export interface ForcaProfile {
  daysPerWeek: number;          // 1–4
  discomfort: string[];         // joelho, quadril, tornozelo, panturrilha, posterior, lombar, nenhuma
  weakAreas: string[];          // core, gluteos, pernas, panturrilhas, nao_sei
  mobility: "travado" | "pouca" | "normal" | "boa";
  generatedAt: string;          // ISO date
}

export interface ForcaBlock {
  exerciseId?: string;
  name: string;
  duration?: string;  // "05:00"
  sets?: number;
  reps?: number;
  why: string;
  steps: string[];
  type: "mobilidade" | "ativacao" | "forca" | "educativo";
}

export interface ForcaPlan {
  title: string;          // "Estabilidade + Mobilidade"
  objective: string;
  focusDays: number[];    // JS day indices (0=Dom…6=Sáb)
  totalDuration: string;  // "22 min"
  blocks: ForcaBlock[];
  sessionsCompleted: number;
  weeksCompleted: number;
  lastSessionDate?: string;
}

export interface Session {
  athlete: AthleteSession;
  classification: ClassificationData;
  diagnosis: DiagnosisData;
  workout: WorkoutData;
  checkins: CheckinData[];
  workoutHistory: WorkoutRecord[];
  streak: number;
  totalWorkouts: number;
  weeklyPlan?: WeeklyPlan;
  savedBuilds?: BuilderSession[];
  activeBuilderSession?: BuilderSession;
  forcaProfile?: ForcaProfile;
  forcaPlan?: ForcaPlan;
}

const KEY = "san-run-v2";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch { return null; }
}

export function saveSession(data: Session) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function addCheckin(checkin: CheckinData) {
  const s = loadSession();
  if (!s) return;
  s.checkins = [checkin, ...(s.checkins || [])].slice(0, 30);
  saveSession(s);
}

export function addWorkoutRecord(record: WorkoutRecord) {
  const s = loadSession();
  if (!s) return;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  s.workoutHistory = [record, ...(s.workoutHistory || [])].slice(0, 50);
  s.totalWorkouts = (s.totalWorkouts || 0) + 1;

  // Streak logic
  const prev = (s.workoutHistory || [])[1];
  if (prev && new Date(prev.date).toDateString() === yesterday) {
    s.streak = (s.streak || 0) + 1;
  } else if (!prev || new Date(prev.date).toDateString() !== today) {
    s.streak = 1;
  }

  // Update weekly plan completion
  if (s.weeklyPlan) {
    const todayDayIndex = new Date().getDay();
    const w = s.weeklyPlan.workouts.find(w => w.dayIndex === todayDayIndex && w.status !== "rest" && w.status !== "done");
    if (w) {
      w.status = "done";
      s.weeklyPlan.completedCount = Math.min(
        (s.weeklyPlan.completedCount || 0) + 1,
        s.weeklyPlan.workouts.filter(w => w.status !== "rest").length
      );
    }
  }

  saveSession(s);
}

export function refreshWeeklyPlanStatuses() {
  const s = loadSession();
  if (!s?.weeklyPlan) return;
  const todayDayIndex = new Date().getDay();
  for (const w of s.weeklyPlan.workouts) {
    if (w.status === "done" || w.status === "rest") continue;
    w.status = w.dayIndex === todayDayIndex ? "active" : "next";
  }
  saveSession(s);
}

// Expands BuilderBlock[] into flat ExecStep[] for the timer
export function expandBlocksToSteps(blocks: BuilderBlock[]): ExecStep[] {
  const steps: ExecStep[] = [];
  for (const block of blocks) {
    if (block.type === "series" && block.reps && block.reps > 0) {
      for (let r = 1; r <= block.reps; r++) {
        const repLabel = `${r} / ${block.reps}`;
        // Work phase — label é o nome real do bloco (ex: "Corrida forte")
        steps.push({
          blockId: block.id,
          label: block.label,
          blockName: block.label,
          type: "series",
          phase: "work",
          durationSec: (block.workDurationMin ?? 2) * 60,
          rpe: block.workRpe ?? block.rpe,
          notes: block.notes,
          repLabel,
          totalReps: block.reps,
          currentRep: r,
        });
        // Rest phase (skip if no restDuration)
        if ((block.restDurationMin ?? 0) > 0) {
          steps.push({
            blockId: block.id,
            label: "Recuperação",
            blockName: block.label,
            type: "series",
            phase: "rest",
            durationSec: (block.restDurationMin!) * 60,
            rpe: block.restRpe ?? 2,
            notes: undefined,
            repLabel,
            totalReps: block.reps,
            currentRep: r,
          });
        }
      }
    } else {
      steps.push({
        blockId: block.id,
        label: block.label,
        blockName: block.label,
        type: block.type,
        phase: block.type === "warmup" ? "warmup" : block.type === "cooldown" ? "cooldown" : block.type === "recovery" ? "rest" : "work",
        durationSec: (block.durationMin ?? 0) * 60,
        rpe: block.rpe,
        notes: block.notes,
      });
    }
  }
  return steps;
}

export function calcTotalDurationMin(blocks: BuilderBlock[]): number {
  let total = 0;
  for (const b of blocks) {
    if (b.type === "series" && b.reps) {
      total += b.reps * ((b.workDurationMin ?? 2) + (b.restDurationMin ?? 0));
    } else {
      total += b.durationMin ?? 0;
    }
  }
  return total;
}

export function formatDurationMin(min: number): string {
  if (min <= 0) return "—";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${min % 60 > 0 ? min % 60 + "min" : ""}`.trim();
}

// Converte WorkoutBlock[] (treinos do plano semanal) para ExecStep[] — mesma interface do timer
export function expandWorkoutBlocksToSteps(blocks: WorkoutBlock[]): ExecStep[] {
  const steps: ExecStep[] = [];
  let idCounter = 0;
  for (const block of blocks) {
    const blockId = `wb_${idCounter++}`;
    if (block.type === "series" && block.reps && block.reps > 0) {
      for (let r = 1; r <= block.reps; r++) {
        const repLabel = `${r} / ${block.reps}`;
        steps.push({
          blockId,
          label: block.label,
          blockName: block.label,
          type: "series",
          phase: "work",
          durationSec: (block.workDurationMin ?? 1) * 60,
          rpe: block.workRpe ?? block.rpe,
          repLabel,
          totalReps: block.reps,
          currentRep: r,
        });
        if ((block.restDurationMin ?? 0) > 0) {
          steps.push({
            blockId,
            label: block.restLabel ?? "Recuperação",
            blockName: block.label,
            type: "series",
            phase: "rest",
            durationSec: (block.restDurationMin!) * 60,
            rpe: block.restRpe ?? 2,
            repLabel,
            totalReps: block.reps,
            currentRep: r,
          });
        }
      }
    } else {
      // warmup | cooldown | continuous
      const phase: ExecStep["phase"] =
        block.type === "warmup"   ? "warmup"   :
        block.type === "cooldown" ? "cooldown" : "work";
      steps.push({
        blockId,
        label: block.label,
        blockName: block.label,
        type: block.type === "continuous" ? "series" : (block.type as BuilderBlock["type"]),
        phase,
        durationSec: (block.durationMin ?? 0) * 60,
        rpe: block.rpe,
      });
    }
  }
  return steps;
}

/** Biblioteca de treinos inline — mesmos dados de classify.ts mas sem dep de backend */
const WORKOUT_LIBRARY_FRONTEND: Record<number, Array<{
  title: string; duration: string; rpe: number; objective: string;
  instructions: string; why: string; successCriteria: string;
  blocks: WorkoutBlock[];
}>> = {
  1: [
    {
      title: "Caminhada Ativa + Trote Suave",
      duration: "25 min", rpe: 3,
      objective: "Adaptar o corpo ao impacto da corrida",
      instructions: "Inicie com 10 min de caminhada em ritmo confortável. Em seguida, alterne: 1 min de trote leve + 2 min de caminhada. Repita 4 vezes. Finalize com 5 min de caminhada.",
      why: "Alternar caminhada e trote constrói base sem sobrecarregar articulações e músculos.",
      successCriteria: "Manter o trote sem parar antes do tempo e chegar ao final sem dor.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 10, rpe: 2 },
        { type: "series", label: "Trote LE", reps: 4, workDurationMin: 1, restDurationMin: 2, workRpe: 3, restRpe: 2, restLabel: "Caminhada LE" },
        { type: "cooldown", label: "Desaquecimento", durationMin: 5, rpe: 2 },
      ],
    },
    {
      title: "Caminhada de Base",
      duration: "30 min", rpe: 2,
      objective: "Criar o hábito de movimento",
      instructions: "Caminhe em ritmo constante e confortável. Mantenha postura ereta, ombros relaxados. Respire pelo nariz quando possível.",
      why: "Ativar o sistema cardiovascular de forma gentil e criar o hábito.",
      successCriteria: "Terminar o tempo proposto sem exaustão.",
      blocks: [
        { type: "continuous", label: "Caminhada LE", durationMin: 30, rpe: 2 },
      ],
    },
    {
      title: "Corrida/Caminhada Progressiva",
      duration: "30 min", rpe: 3,
      objective: "Introduzir o trote gradualmente",
      instructions: "10 min caminhada leve. Alterne: 2 min trote leve + 2 min caminhada. Repita 4 vezes. Finalize com 4 min de caminhada.",
      why: "Progressão gradual respeita o ritmo de adaptação do seu corpo.",
      successCriteria: "Completar todas as séries sem parar antes do tempo.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 10, rpe: 2 },
        { type: "series", label: "Trote LE", reps: 4, workDurationMin: 2, restDurationMin: 2, workRpe: 3, restRpe: 2, restLabel: "Caminhada LE" },
        { type: "cooldown", label: "Desaquecimento", durationMin: 4, rpe: 2 },
      ],
    },
  ],
  2: [
    {
      title: "Corrida Contínua Leve",
      duration: "30 min", rpe: 4,
      objective: "Construir base aeróbica",
      instructions: "Corra em ritmo leve e constante. Você deve conseguir falar frases curtas enquanto corre. Se não conseguir, reduza o ritmo.",
      why: "Resistência aeróbica é o alicerce de qualquer progresso.",
      successCriteria: "Completar o tempo sem pausas. Terminar cansado, mas não esgotado.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 5, rpe: 3 },
        { type: "continuous", label: "Corrida LE", durationMin: 20, rpe: 4 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 5, rpe: 3 },
      ],
    },
    {
      title: "Tiros Curtos",
      duration: "35 min", rpe: 6,
      objective: "Introduzir velocidade",
      instructions: "5 min aquecimento. 8 tiros de 30 seg em ritmo forte + 1 min caminhada. 10 min corrida leve. 5 min desaquecimento.",
      why: "Estímulos curtos de velocidade desenvolvem potência sem acumular fadiga excessiva.",
      successCriteria: "Manter a mesma intensidade do tiro 1 no tiro 8.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 5, rpe: 3 },
        { type: "series", label: "Tiro FO", reps: 8, workDurationMin: 0.5, restDurationMin: 1, workRpe: 6, restRpe: 2, restLabel: "Caminhada LE" },
        { type: "continuous", label: "Corrida LE", durationMin: 10, rpe: 4 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 5, rpe: 3 },
      ],
    },
    {
      title: "Corrida Progressiva",
      duration: "35 min", rpe: 5,
      objective: "Progressão de ritmo",
      instructions: "5 min aquecimento. 10 min corrida leve. 10 min corrida moderada. 5 min corrida forte. 5 min desaquecimento.",
      why: "Aprender a progredir o esforço — habilidade fundamental para provas.",
      successCriteria: "Cada bloco visivelmente mais rápido que o anterior.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 5, rpe: 3 },
        { type: "continuous", label: "Corrida LE", durationMin: 10, rpe: 4 },
        { type: "continuous", label: "Corrida MO", durationMin: 10, rpe: 5 },
        { type: "continuous", label: "Corrida FO", durationMin: 5, rpe: 6 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 5, rpe: 3 },
      ],
    },
  ],
  3: [
    {
      title: "Corrida com Variação de Ritmo",
      duration: "40 min", rpe: 6,
      objective: "Desenvolver variação de ritmo",
      instructions: "10 min aquecimento em ritmo leve. 20 min alternando: 4 min ritmo moderado (pode falar poucas palavras) + 2 min ritmo leve. Finalize com 10 min de desaquecimento leve.",
      why: "Variações de ritmo desenvolvem múltiplos sistemas energéticos — essencial para provas.",
      successCriteria: "Completar todos os blocos sem precisar reduzir o ritmo moderado para leve.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 10, rpe: 4 },
        { type: "series", label: "Corrida MO", reps: 3, workDurationMin: 4, restDurationMin: 2, workRpe: 6, restRpe: 3, restLabel: "Recuperação LE" },
        { type: "cooldown", label: "Desaquecimento", durationMin: 10, rpe: 4 },
      ],
    },
    {
      title: "Fartlek 5×2'",
      duration: "40 min", rpe: 6,
      objective: "Capacidade de aceleração e recuperação",
      instructions: "10 min aquecimento. 5 acelerações de 2 min em ritmo forte + 2 min trote leve. 10 min desaquecimento.",
      why: "Fartlek desenvolve capacidade de acelerar e se recuperar — base para qualquer objetivo de performance.",
      successCriteria: "Manter o mesmo ritmo nas 5 acelerações.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 10, rpe: 4 },
        { type: "series", label: "Fartlek FO", reps: 5, workDurationMin: 2, restDurationMin: 2, workRpe: 7, restRpe: 3, restLabel: "Trote LE" },
        { type: "cooldown", label: "Desaquecimento", durationMin: 10, rpe: 4 },
      ],
    },
    {
      title: "Corrida Longa",
      duration: "55 min", rpe: 5,
      objective: "Volume aeróbico semanal",
      instructions: "10 min aquecimento. 40 min corrida contínua em ritmo leve-moderado. 5 min desaquecimento.",
      why: "O longo semanal é insubstituível. Volume aeróbico é o que constrói a base para tudo.",
      successCriteria: "Completar os 40 min contínuos mantendo ritmo conversacional.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 10, rpe: 4 },
        { type: "continuous", label: "Corrida MO", durationMin: 40, rpe: 5 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 5, rpe: 3 },
      ],
    },
  ],
  4: [
    {
      title: "Corrida Progressiva",
      duration: "45 min", rpe: 7,
      objective: "Controle de esforço e progressão",
      instructions: "Divida o treino em 3 partes iguais: primeiro terço em ritmo leve, segundo terço em ritmo moderado, último terço em ritmo forte. Não saia rápido — termine forte.",
      why: "Treinos progressivos desenvolvem controle de esforço e eficiência metabólica.",
      successCriteria: "Cada bloco mais rápido que o anterior. Último km mais rápido que o primeiro.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 5, rpe: 4 },
        { type: "continuous", label: "Corrida LE", durationMin: 12, rpe: 5 },
        { type: "continuous", label: "Corrida MO", durationMin: 12, rpe: 6 },
        { type: "continuous", label: "Corrida FO", durationMin: 11, rpe: 7 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 5, rpe: 4 },
      ],
    },
    {
      title: "Intervalado 8×2'",
      duration: "50 min", rpe: 8,
      objective: "Velocidade e VO2max",
      instructions: "15 min aquecimento. 8 repetições de: 2 min em ritmo forte (RPE 8) + 90 seg recuperação ativa. 10 min desaquecimento.",
      why: "Intervalados de alta intensidade aumentam VO2max e velocidade de corrida.",
      successCriteria: "Manter o mesmo ritmo do intervalo 1 no intervalo 8.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 15, rpe: 4 },
        { type: "series", label: "Intervalo FO", reps: 8, workDurationMin: 2, restDurationMin: 1.5, workRpe: 8, restRpe: 3, restLabel: "Trote LE" },
        { type: "cooldown", label: "Desaquecimento", durationMin: 10, rpe: 4 },
      ],
    },
    {
      title: "Longão Progressivo",
      duration: "70 min", rpe: 6,
      objective: "Resistência e eficiência energética",
      instructions: "10 min aquecimento. 50 min progressivos: 20 min LE, 20 min MO, 10 min FO. 10 min desaquecimento.",
      why: "Longão progressivo constrói resistência e eficiência energética.",
      successCriteria: "Completar os 50 min sem parar, acelerando progressivamente.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 10, rpe: 4 },
        { type: "continuous", label: "Corrida LE", durationMin: 20, rpe: 5 },
        { type: "continuous", label: "Corrida MO", durationMin: 20, rpe: 6 },
        { type: "continuous", label: "Corrida FO", durationMin: 10, rpe: 7 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 10, rpe: 4 },
      ],
    },
  ],
  5: [
    {
      title: "Intervalado de Alta Intensidade",
      duration: "55 min", rpe: 8,
      objective: "VO2max e performance",
      instructions: "15 min aquecimento. 6 repetições de: 3 min em ritmo forte (RPE 8-9) + 2 min recuperação ativa (trote leve). 15 min desaquecimento.",
      why: "Intervalados de alta intensidade aumentam VO2max, velocidade limiar e capacidade de repetir esforços.",
      successCriteria: "Manter o mesmo ritmo do bloco 1 no bloco 6.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 15, rpe: 5 },
        { type: "series", label: "Intervalo MF", reps: 6, workDurationMin: 3, restDurationMin: 2, workRpe: 9, restRpe: 3, restLabel: "Trote LE" },
        { type: "cooldown", label: "Desaquecimento", durationMin: 15, rpe: 5 },
      ],
    },
    {
      title: "Corrida de Limiar",
      duration: "55 min", rpe: 8,
      objective: "Velocidade sustentável máxima",
      instructions: "15 min aquecimento. 25 min em ritmo de limiar (RPE 7-8 — desconfortável mas sustentável). 15 min desaquecimento.",
      why: "Treino de limiar aumenta a velocidade que você consegue manter por longos períodos.",
      successCriteria: "Manter o ritmo constante nos 25 min sem precisar reduzir.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 15, rpe: 5 },
        { type: "continuous", label: "Limiar MF", durationMin: 25, rpe: 8 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 15, rpe: 5 },
      ],
    },
    {
      title: "Longão de Performance",
      duration: "90 min", rpe: 7,
      objective: "Base para provas de longa distância",
      instructions: "15 min aquecimento. 60 min corrida contínua em ritmo moderado-forte. 15 min desaquecimento.",
      why: "Volume alto com intensidade moderada. Base para provas de longa distância.",
      successCriteria: "Completar os 90 min. Ritmo estável nos últimos 20 min.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 15, rpe: 5 },
        { type: "continuous", label: "Corrida MO-FO", durationMin: 60, rpe: 7 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 15, rpe: 5 },
      ],
    },
  ],
};

// trainingDays: array of JS day indices chosen by athlete (0=Dom,1=Seg...6=Sáb)
// If empty/undefined, falls back to default spread
export function generateDefaultWeeklyPlan(level: number, trainingDays?: number[]): WeeklyPlan {
  const today = new Date();
  const todayDayIndex = today.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const dayLabels = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  // Display order: Mon→Sun (JS indices)
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];

  const lib = WORKOUT_LIBRARY_FRONTEND[Math.min(Math.max(level, 1), 5)];

  const chosen: number[] = (trainingDays && trainingDays.length > 0)
    ? trainingDays
    : [1, 3, 5, 6];

  // Sort chosen days in display order (Mon first)
  const sortedChosen = [...chosen].sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));

  let workoutIdx = 0;
  const workouts: WeeklyWorkout[] = weekOrder.map((jsDay) => {
    const isTrainingDay = sortedChosen.includes(jsDay);
    if (isTrainingDay) {
      const tpl = lib[workoutIdx % lib.length];
      // Status based on actual day of week
      let status: WeeklyWorkout["status"];
      if (jsDay === todayDayIndex) {
        status = "active"; // today
      } else {
        // past days in this week = next (available), future = next (available)
        // All training days available — athlete chooses when to do
        status = "next";
      }
      workoutIdx++;
      return {
        day: dayLabels[jsDay],
        dayIndex: jsDay,
        title: tpl.title,
        duration: tpl.duration,
        rpe: tpl.rpe,
        objective: tpl.objective,
        status,
        // Dados completos — fonte única de verdade
        instructions: tpl.instructions,
        why: tpl.why,
        successCriteria: tpl.successCriteria,
        blocks: tpl.blocks,
      };
    } else {
      return {
        day: dayLabels[jsDay],
        dayIndex: jsDay,
        title: "Descanso",
        duration: "—",
        rpe: 1,
        objective: "Recuperação",
        status: "rest" as WeeklyWorkout["status"],
      };
    }
  });

  return {
    weekNumber: 1,
    startDate: monday.toISOString(),
    completedCount: 0,
    requiredCount: sortedChosen.length,
    unlocked: true,
    workouts,
  };
}

