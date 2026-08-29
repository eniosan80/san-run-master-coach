import { ForcaProfile, ForcaBlock, ForcaPlan } from "./store";
import { EXERCISES } from "./forca-data";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function toBlock(e: typeof EXERCISES[0]): ForcaBlock {
  return {
    name: e.name,
    sets: e.sets,
    reps: e.reps,
    duration: e.duration,
    why: e.why,
    steps: e.steps,
    type: e.categoryId === "mobilidade"
      ? "mobilidade"
      : e.categoryId === "educativos"
      ? "educativo"
      : e.categoryId === "nucleo"
      ? "ativacao"
      : "forca",
  };
}

/* ─────────────────────────────────────────────
   Prescrição de blocos por perfil
   Lógica:
   - mobility travado/pouca  → sempre adicionar 2 blocos mobilidade
   - weakAreas core          → prancha + dead-bug
   - weakAreas gluteos       → ponte + elevação-lateral
   - weakAreas pernas        → agachamento + avanço
   - weakAreas panturrilhas  → elevação panturrilha
   - discomfort joelho       → substituir avanço por ponte
   - discomfort tornozelo    → adicionar mobilidade tornozelo
   - discomfort lombar       → dead-bug + antirotação (sem agachamento pesado)
   Retorna lista de blocks deduplicated
───────────────────────────────────────────── */
function prescribeBlocks(profile: ForcaProfile): ForcaBlock[] {
  const blocks: ForcaBlock[] = [];
  const addedIds = new Set<string>();

  function add(id: string) {
    if (addedIds.has(id)) return;
    const ex = EXERCISES.find(e => e.id === id);
    if (ex) {
      blocks.push(toBlock(ex));
      addedIds.add(id);
    }
  }

  /* 1. Mobilidade de entrada (sempre 2 min warmup) */
  if (profile.mobility === "travado" || profile.mobility === "pouca") {
    add("mobilidade-tornozelo");
    add("mobilidade-quadril");
  } else {
    // mesmo atletas com boa mobilidade fazem 1 exercício educativo de abertura
    add("mobilidade-tornozelo");
  }

  /* 2. Áreas fracas */
  const w = profile.weakAreas;

  if (w.includes("core") || w.includes("nao_sei")) {
    add("prancha");
    add("dead-bug");
  }

  if (w.includes("gluteos") || w.includes("nao_sei")) {
    add("ponte-gluteo");
    add("elevacao-lateral");
  }

  if (w.includes("pernas")) {
    // Se tem desconforto no joelho: evitar avanço
    if (!profile.discomfort.includes("joelho")) {
      add("avanco");
    }
    add("agachamento");
  }

  if (w.includes("panturrilhas")) {
    add("panturrilha");
  }

  /* 3. Desconfortos específicos — adicionar exercícios preventivos */
  if (profile.discomfort.includes("joelho")) {
    add("ponte-gluteo");
    add("elevacao-lateral");
  }

  if (profile.discomfort.includes("tornozelo")) {
    add("mobilidade-tornozelo");
    add("panturrilha");
  }

  if (profile.discomfort.includes("quadril")) {
    add("mobilidade-quadril");
    add("alongamento-hip-flexor");
  }

  if (profile.discomfort.includes("lombar")) {
    add("dead-bug");
    add("anti-rotacao");
  }

  if (profile.discomfort.includes("posterior")) {
    add("ponte-gluteo");
    add("mobilidade-quadril");
  }

  if (profile.discomfort.includes("panturrilha")) {
    add("panturrilha");
    add("mobilidade-tornozelo");
  }

  /* 4. Educativos de finalização */
  add("skipping");

  /* 5. Fallback: se pouca coisa prescrita adiciona base */
  if (blocks.length < 3) {
    add("prancha");
    add("agachamento");
    add("ponte-gluteo");
  }

const typeOrder: Record<ForcaBlock["type"], number> = {
  mobilidade: 0,
  ativacao: 1,
  educativo: 2,
  forca: 3,
};

blocks.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

return blocks;
}

/* ─────────────────────────────────────────────
   Calcular tempo total estimado
───────────────────────────────────────────── */
function estimateDuration(blocks: ForcaBlock[]): string {
  let seconds = 0;
  for (const b of blocks) {
    if (b.duration) {
      // "30 segundos" → 30s, "1 minuto" → 60s
      const match = b.duration.match(/(\d+)/);
      if (match) seconds += parseInt(match[1]) * (b.duration.includes("minuto") ? 60 : 1);
      // 3 sets
      if (b.sets) seconds *= b.sets;
    } else if (b.sets && b.reps) {
      // ~3s per rep + 30s rest between sets
      seconds += b.sets * (b.reps * 3 + 30);
    }
  }
  // add 60s per block for transitions
  seconds += blocks.length * 60;

  const mins = Math.round(seconds / 60);
  return `${Math.max(mins, 8)} min`;
}

/* ─────────────────────────────────────────────
   Nome do plano baseado no perfil
───────────────────────────────────────────── */
function planTitle(profile: ForcaProfile): string {
  const hasLombar = profile.discomfort.includes("lombar");
  const hasJoelho = profile.discomfort.includes("joelho");
  const hasMobLimitada = profile.mobility === "travado" || profile.mobility === "pouca";

  if (hasMobLimitada && profile.weakAreas.includes("core")) return "Mobilidade + Core";
  if (hasMobLimitada) return "Mobilidade + Estabilidade";
  if (hasLombar) return "Proteção Lombar + Core";
  if (hasJoelho) return "Estabilidade de Joelho";
  if (profile.weakAreas.includes("pernas") && profile.weakAreas.includes("core")) return "Força Funcional";
  if (profile.weakAreas.includes("gluteos")) return "Ativação de Glúteos";
  if (profile.weakAreas.includes("core")) return "Core do Corredor";
  return "Complemento de Corrida";
}

function planObjective(profile: ForcaProfile): string {
  const hasMob = profile.mobility === "travado" || profile.mobility === "pouca";
  if (hasMob) return "Melhorar amplitude de movimento e ativar musculatura estabilizadora antes da corrida.";
  if (profile.discomfort.includes("joelho")) return "Fortalecer estabilizadores do joelho e reduzir risco de lesão.";
  if (profile.discomfort.includes("lombar")) return "Ativar core profundo e proteger a lombar durante as passadas.";
  return "Desenvolver força específica para corrida, melhorar economia de movimento e prevenir lesões.";
}

/* ─────────────────────────────────────────────
   FUNÇÃO PRINCIPAL
   trainingDays: dias JS de corrida (0=Dom…6=Sáb)
   Retorna ForcaPlan com focusDays = dias sem corrida (até daysPerWeek)
───────────────────────────────────────────── */
export function generateForcaPlan(profile: ForcaProfile, trainingDays: number[]): ForcaPlan {
  const allDays = [0, 1, 2, 3, 4, 5, 6];
  const restDays = allDays.filter(d => !trainingDays.includes(d));

  // Preferir dias imediatamente após corrida (recovery ativo)
  // Se não há dias de descanso suficientes, pegar dias de treino com menor conflito
  let focusDays: number[];
  if (restDays.length >= profile.daysPerWeek) {
    // Ordenar: preferir dias logo após um dia de treino
    const sorted = [...restDays].sort((a, b) => {
      const prevA = trainingDays.includes((a + 6) % 7) ? 1 : 0;
      const prevB = trainingDays.includes((b + 6) % 7) ? 1 : 0;
      return prevB - prevA;
    });
    focusDays = sorted.slice(0, profile.daysPerWeek);
  } else {
    // Pegar todos os dias de descanso disponíveis
    focusDays = restDays.slice(0, profile.daysPerWeek);
  }

  const blocks = prescribeBlocks(profile);

  return {
    title: planTitle(profile),
    objective: planObjective(profile),
    focusDays,
    totalDuration: estimateDuration(blocks),
    blocks,
    sessionsCompleted: 0,
    weeksCompleted: 0,
  };
}
