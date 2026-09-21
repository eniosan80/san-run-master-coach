export interface AthleteSession {
  id: string;
  name: string;
  age: number;
  sex: string;
  experience: string;
  weeklyFrequency: string;
  trainingDays: number[]; // 0=Dom,1=Seg,2=Ter,3=Qua,4=Qui,5=Sex,6=SÃƒÆ’Ã‚Â¡b
  goal: string;
  startDate: string;
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
    targetRpe?: number;
  elapsedSeconds?: number;
}

/** Bloco estruturado de treino - fonte única de verdade */
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
  day: string;        // "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB" | "DOM"
  dayIndex: number;   // 0-6
  title: string;
  duration: string;
  rpe: number;
  objective: string;
  status: "done" | "active" | "next" | "locked" | "rest";
  // Dados completos do treino - fonte única de verdade
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

// Flat execution step ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â generated from BuilderBlock list for the timer
export interface ExecStep {
  blockId: string;
  label: string;       // "Corrida forte", "RecuperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o", "Aquecimento", etc.
  blockName: string;   // nome do bloco pai ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ex: "Corrida Progressiva" ou "AQUECIMENTO"
  type: BuilderBlock["type"];
  phase: "work" | "rest" | "warmup" | "cooldown"; // for coloring
  durationSec: number;
  rpe?: number;
  notes?: string;
  repLabel?: string;   // "1 / 8" (serie atual / total)
  totalReps?: number;  // total de repetiÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes do bloco (sÃƒÆ’Ã‚Â³ para series)
  currentRep?: number; // nÃƒÆ’Ã‚Âºmero da repetiÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o atual (1-based)
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ FORÃƒÆ’Ã¢â‚¬Â¡A SAN RUN ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
export interface ForcaProfile {
  daysPerWeek: number;          // 1ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“4
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
  focusDays: number[];    // JS day indices (0=Dom...6=Sáb)
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
        // Work phase ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â label ÃƒÆ’Ã‚Â© o nome real do bloco (ex: "Corrida forte")
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
            label: "RecuperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o",
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
  if (min <= 0) return "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${min % 60 > 0 ? min % 60 + "min" : ""}`.trim();
}

// Converte WorkoutBlock[] (treinos do plano semanal) para ExecStep[] ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â mesma interface do timer
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
            label: block.restLabel ?? "RecuperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o",
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

/** Biblioteca de treinos inline ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â mesmos dados de classify.ts mas sem dep de backend */
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
      instructions: "Inicie com 10 min de caminhada em ritmo confortÃƒÆ’Ã‚Â¡vel. Em seguida, alterne: 1 min de trote leve + 2 min de caminhada. Repita 4 vezes. Finalize com 5 min de caminhada.",
      why: "Alternar caminhada e trote constrÃƒÆ’Ã‚Â³i base sem sobrecarregar articulaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes e mÃƒÆ’Ã‚Âºsculos.",
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
      objective: "Criar o hÃƒÆ’Ã‚Â¡bito de movimento",
      instructions: "Caminhe em ritmo constante e confortÃƒÆ’Ã‚Â¡vel. Mantenha postura ereta, ombros relaxados. Respire pelo nariz quando possÃƒÆ’Ã‚Â­vel.",
      why: "Ativar o sistema cardiovascular de forma gentil e criar o hÃƒÆ’Ã‚Â¡bito.",
      successCriteria: "Terminar o tempo proposto sem exaustÃƒÆ’Ã‚Â£o.",
      blocks: [
        { type: "continuous", label: "Caminhada LE", durationMin: 30, rpe: 2 },
      ],
    },
    {
      title: "Corrida/Caminhada Progressiva",
      duration: "30 min", rpe: 3,
      objective: "Introduzir o trote gradualmente",
      instructions: "10 min caminhada leve. Alterne: 2 min trote leve + 2 min caminhada. Repita 4 vezes. Finalize com 4 min de caminhada.",
      why: "ProgressÃƒÆ’Ã‚Â£o gradual respeita o ritmo de adaptaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o do seu corpo.",
      successCriteria: "Completar todas as sÃƒÆ’Ã‚Â©ries sem parar antes do tempo.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 10, rpe: 2 },
        { type: "series", label: "Trote LE", reps: 4, workDurationMin: 2, restDurationMin: 2, workRpe: 3, restRpe: 2, restLabel: "Caminhada LE" },
        { type: "cooldown", label: "Desaquecimento", durationMin: 4, rpe: 2 },
      ],
    },
  ],
  2: [
    {
      title: "Corrida ContÃƒÆ’Ã‚Â­nua Leve",
      duration: "30 min", rpe: 4,
      objective: "Construir base aerÃƒÆ’Ã‚Â³bica",
      instructions: "Corra em ritmo leve e constante. VocÃƒÆ’Ã‚Âª deve conseguir falar frases curtas enquanto corre. Se nÃƒÆ’Ã‚Â£o conseguir, reduza o ritmo.",
      why: "ResistÃƒÆ’Ã‚Âªncia aerÃƒÆ’Ã‚Â³bica ÃƒÆ’Ã‚Â© o alicerce de qualquer progresso.",
      successCriteria: "Completar o tempo sem pausas. Terminar cansado, mas nÃƒÆ’Ã‚Â£o esgotado.",
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
      why: "EstÃƒÆ’Ã‚Â­mulos curtos de velocidade desenvolvem potÃƒÆ’Ã‚Âªncia sem acumular fadiga excessiva.",
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
      objective: "ProgressÃƒÆ’Ã‚Â£o de ritmo",
      instructions: "5 min aquecimento. 10 min corrida leve. 10 min corrida moderada. 5 min corrida forte. 5 min desaquecimento.",
      why: "Aprender a progredir o esforÃƒÆ’Ã‚Â§o ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â habilidade fundamental para provas.",
      successCriteria: "Cada bloco visivelmente mais rÃƒÆ’Ã‚Â¡pido que o anterior.",
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
      why: "Variações de ritmo desenvolvem múltiplos sistemas energéticos e ensinam seu corpo a se recuperar sob esforço — essencial para provas.",
      successCriteria: "Completar todos os blocos sem precisar reduzir o ritmo moderado para leve.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 10, rpe: 4 },
        { type: "series", label: "Corrida MO", reps: 3, workDurationMin: 4, restDurationMin: 2, workRpe: 6, restRpe: 3, restLabel: "RecuperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o LE" },
        { type: "cooldown", label: "Desaquecimento", durationMin: 10, rpe: 4 },
      ],
    },
    {
      title: "Fartlek 5ÃƒÆ’Ã¢â‚¬â€2'",
      duration: "40 min", rpe: 6,
      objective: "Capacidade de aceleraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o e recuperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o",
      instructions: "10 min aquecimento. 5 aceleraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes de 2 min em ritmo forte + 2 min trote leve. 10 min desaquecimento.",
      why: "Fartlek desenvolve capacidade de acelerar e se recuperar ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â base para qualquer objetivo de performance.",
      successCriteria: "Manter o mesmo ritmo nas 5 aceleraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 10, rpe: 4 },
        { type: "series", label: "Fartlek FO", reps: 5, workDurationMin: 2, restDurationMin: 2, workRpe: 7, restRpe: 3, restLabel: "Trote LE" },
        { type: "cooldown", label: "Desaquecimento", durationMin: 10, rpe: 4 },
      ],
    },
    {
      title: "Corrida Longa",
      duration: "55 min", rpe: 5,
      objective: "Volume aerÃƒÆ’Ã‚Â³bico semanal",
      instructions: "10 min aquecimento. 40 min corrida contÃƒÆ’Ã‚Â­nua em ritmo leve-moderado. 5 min desaquecimento.",
      why: "O longo semanal ÃƒÆ’Ã‚Â© insubstituÃƒÆ’Ã‚Â­vel. Volume aerÃƒÆ’Ã‚Â³bico ÃƒÆ’Ã‚Â© o que constrÃƒÆ’Ã‚Â³i a base para tudo.",
      successCriteria: "Completar os 40 min contÃƒÆ’Ã‚Â­nuos mantendo ritmo conversacional.",
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
      objective: "Controle de esforÃƒÆ’Ã‚Â§o e progressÃƒÆ’Ã‚Â£o",
      instructions: "Divida o treino em 3 partes iguais: primeiro terÃƒÆ’Ã‚Â§o em ritmo leve, segundo terÃƒÆ’Ã‚Â§o em ritmo moderado, ÃƒÆ’Ã‚Âºltimo terÃƒÆ’Ã‚Â§o em ritmo forte. NÃƒÆ’Ã‚Â£o saia rÃƒÆ’Ã‚Â¡pido ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â termine forte.",
      why: "Treinos progressivos desenvolvem controle de esforÃƒÆ’Ã‚Â§o e eficiÃƒÆ’Ã‚Âªncia metabÃƒÆ’Ã‚Â³lica.",
      successCriteria: "Cada bloco mais rÃƒÆ’Ã‚Â¡pido que o anterior. ÃƒÆ’Ã…Â¡ltimo km mais rÃƒÆ’Ã‚Â¡pido que o primeiro.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 5, rpe: 4 },
        { type: "continuous", label: "Corrida LE", durationMin: 12, rpe: 5 },
        { type: "continuous", label: "Corrida MO", durationMin: 12, rpe: 6 },
        { type: "continuous", label: "Corrida FO", durationMin: 11, rpe: 7 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 5, rpe: 4 },
      ],
    },
    {
      title: "Intervalado 8ÃƒÆ’Ã¢â‚¬â€2'",
      duration: "50 min", rpe: 8,
      objective: "Velocidade e VO2max",
      instructions: "15 min aquecimento. 8 repetiÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes de: 2 min em ritmo forte (RPE 8) + 90 seg recuperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o ativa. 10 min desaquecimento.",
      why: "Intervalados de alta intensidade aumentam VO2max e velocidade de corrida.",
      successCriteria: "Manter o mesmo ritmo do intervalo 1 no intervalo 8.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 15, rpe: 4 },
        { type: "series", label: "Intervalo FO", reps: 8, workDurationMin: 2, restDurationMin: 1.5, workRpe: 8, restRpe: 3, restLabel: "Trote LE" },
        { type: "cooldown", label: "Desaquecimento", durationMin: 10, rpe: 4 },
      ],
    },
    {
      title: "LongÃƒÆ’Ã‚Â£o Progressivo",
      duration: "70 min", rpe: 6,
      objective: "ResistÃƒÆ’Ã‚Âªncia e eficiÃƒÆ’Ã‚Âªncia energÃƒÆ’Ã‚Â©tica",
      instructions: "10 min aquecimento. 50 min progressivos: 20 min LE, 20 min MO, 10 min FO. 10 min desaquecimento.",
      why: "LongÃƒÆ’Ã‚Â£o progressivo constrÃƒÆ’Ã‚Â³i resistÃƒÆ’Ã‚Âªncia e eficiÃƒÆ’Ã‚Âªncia energÃƒÆ’Ã‚Â©tica.",
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
      instructions: "15 min aquecimento. 6 repetiÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes de: 3 min em ritmo forte (RPE 8-9) + 2 min recuperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o ativa (trote leve). 15 min desaquecimento.",
      why: "Intervalados de alta intensidade aumentam VO2max, velocidade limiar e capacidade de repetir esforÃƒÆ’Ã‚Â§os.",
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
      objective: "Velocidade sustentÃƒÆ’Ã‚Â¡vel mÃƒÆ’Ã‚Â¡xima",
      instructions: "15 min aquecimento. 25 min em ritmo de limiar (RPE 7-8 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â desconfortÃƒÆ’Ã‚Â¡vel mas sustentÃƒÆ’Ã‚Â¡vel). 15 min desaquecimento.",
      why: "Treino de limiar aumenta a velocidade que vocÃƒÆ’Ã‚Âª consegue manter por longos perÃƒÆ’Ã‚Â­odos.",
      successCriteria: "Manter o ritmo constante nos 25 min sem precisar reduzir.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 15, rpe: 5 },
        { type: "continuous", label: "Limiar MF", durationMin: 25, rpe: 8 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 15, rpe: 5 },
      ],
    },
    {
      title: "LongÃƒÆ’Ã‚Â£o de Performance",
      duration: "90 min", rpe: 7,
      objective: "Base para provas de longa distÃƒÆ’Ã‚Â¢ncia",
      instructions: "15 min aquecimento. 60 min corrida contÃƒÆ’Ã‚Â­nua em ritmo moderado-forte. 15 min desaquecimento.",
      why: "Volume alto com intensidade moderada. Base para provas de longa distÃƒÆ’Ã‚Â¢ncia.",
      successCriteria: "Completar os 90 min. Ritmo estÃƒÆ’Ã‚Â¡vel nos ÃƒÆ’Ã‚Âºltimos 20 min.",
      blocks: [
        { type: "warmup", label: "Aquecimento", durationMin: 15, rpe: 5 },
        { type: "continuous", label: "Corrida MO-FO", durationMin: 60, rpe: 7 },
        { type: "cooldown", label: "Desaquecimento", durationMin: 15, rpe: 5 },
      ],
    },
  ],
};

// trainingDays: array of JS day indices chosen by athlete (0=Dom,1=Seg...6=SÃƒÆ’Ã‚Â¡b)
// If empty/undefined, falls back to default spread
export function generateDefaultWeeklyPlan(
  level: number,
  trainingDays?: number[],
  startDate?: string
): WeeklyPlan {
  const anchor = startDate ? new Date(startDate) : new Date();

  const start = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    anchor.getDate()
  );

  // A semana do calendário sempre começa na segunda-feira.
  const monday = new Date(start);
  const day = monday.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  monday.setDate(monday.getDate() - daysFromMonday);

  const dayLabels = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

  const lib =
    WORKOUT_LIBRARY_FRONTEND[Math.min(Math.max(level, 1), 5)];

  const chosen =
    trainingDays && trainingDays.length > 0
      ? trainingDays
      : [2, 4, 6];

  let workoutIdx = 0;

  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const workouts: WeeklyWorkout[] = Array.from(
    { length: 7 },
    (_, offset) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + offset);

      const jsDay = date.getDay();

      // Na primeira semana, dias anteriores ao início do aluno
      // não fazem parte do calendário dele.
      if (date < start) {
        return {
          day: dayLabels[jsDay],
          dayIndex: jsDay,
          title: "Indisponível",
          duration: "-",
          rpe: 1,
          objective: "Antes do início do plano",
          status: "locked",
        };
      }

      const isTrainingDay = chosen.includes(jsDay);

      if (!isTrainingDay) {
        return {
          day: dayLabels[jsDay],
          dayIndex: jsDay,
          title: "Descanso",
          duration: "-",
          rpe: 1,
          objective: "Recuperação",
          status: "rest",
        };
      }

      const tpl = lib[workoutIdx % lib.length];
      workoutIdx++;

      const isToday =
        date.getFullYear() === todayDate.getFullYear() &&
        date.getMonth() === todayDate.getMonth() &&
        date.getDate() === todayDate.getDate();

      return {
        day: dayLabels[jsDay],
        dayIndex: jsDay,
        ...tpl,
        status: isToday ? "active" : "next",
      };
    }
  );

  return {
    weekNumber: 1,
    startDate: monday.toISOString(),
    completedCount: 0,
    requiredCount: workouts.filter(
      (workout) => workout.status !== "rest" && workout.status !== "locked"
    ).length,
    unlocked: true,
    workouts,
  };
}



