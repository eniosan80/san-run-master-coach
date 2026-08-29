
// ============================================================================
// TIPOS
// ============================================================================

export type ExperienceLevel =
  | "never"
  | "beginner"
  | "intermediate"
  | "advanced";

export type WeeklyFrequency =
  | "0"
  | "1-2"
  | "3-4"
  | "5+";

export type Phase =
  | "Adaptação"
  | "Construção"
  | "Evolução"
  | "Desempenho"
  | "Retorno";

export interface AthleteInput {
  age: number;
  sex: string;
  experience: ExperienceLevel;
  weeklyFrequency: WeeklyFrequency;
  goal: string;
}

export interface Classification {
  level: number;
  levelName: string;
  reason: string;
  nextFocus: string;
  phase: Phase;
}

export interface Diagnosis {
  data: string;
  interpretation: string;
  decision: string;
}

export interface WorkoutBlock {
  type: "warmup" | "series" | "cooldown" | "continuous";
  label: string;

  // Blocos contínuos / aquecimento / desaquecimento
  durationMin?: number;
  rpe?: number;

  // Blocos de séries
  reps?: number;
  workDurationMin?: number;
  restDurationMin?: number;
  workRpe?: number;
  restRpe?: number;
  restLabel?: string;
}

export interface WorkoutRecommendation {
  title: string;
  duration: string;
  rpe: number;
  instructions: string;
  why: string;
  successCriteria: string;
  blocks: WorkoutBlock[];
}

// ============================================================================
// CLASSIFICAÇÃO
// ============================================================================

const LEVEL_NAMES: Record<number, string> = {
  1: "Iniciante Absoluto",
  2: "Corredor Iniciante",
  3: "Intermediário",
  4: "Avançado",
  5: "Desempenho",
};

const LEVEL_REASONS: Record<number, string> = {
  1: "Você está começando sua jornada na corrida. Isso é o mais importante — o primeiro passo já foi dado.",
  2: "Você tem contato inicial com a corrida, mas ainda está construindo base física e técnica.",
  3: "Você já tem uma rotina de treinos consistente e responde bem ao estímulo moderado.",
  4: "Sua base está sólida. Você suporta volume e intensidade com boa recuperação.",
  5: "Você treina com frequência alta, entende seu corpo e busca otimização de performance.",
};

const LEVEL_NEXT_FOCUS: Record<number, string> = {
  1: "Criar o hábito de movimento. Treinos curtos, leves e consistentes.",
  2: "Desenvolver resistência aeróbica base e técnica de passada.",
  3: "Aumentar volume gradualmente e introduzir variação de ritmo.",
  4: "Trabalhar zonas de intensidade e treinos específicos por objetivo.",
  5: "Periodização avançada, recuperação estratégica e picos de performance.",
};

const LEVEL_PHASES: Record<number, Phase> = {
  1: "Adaptação",
  2: "Adaptação",
  3: "Construção",
  4: "Evolução",
  5: "Desempenho",
};

export function classifyAthlete(
  input: AthleteInput
): Classification {
  let score = 0;

  // --------------------------------------------------------------------------
  // EXPERIÊNCIA
  // --------------------------------------------------------------------------

  if (input.experience === "never") {
    score += 0;
  } else if (input.experience === "beginner") {
    score += 1;
  } else if (input.experience === "intermediate") {
    score += 2;
  } else if (input.experience === "advanced") {
    score += 3;
  }

  // --------------------------------------------------------------------------
  // FREQUÊNCIA SEMANAL
  // --------------------------------------------------------------------------

  if (input.weeklyFrequency === "0") {
    score += 0;
  } else if (input.weeklyFrequency === "1-2") {
    score += 1;
  } else if (input.weeklyFrequency === "3-4") {
    score += 2;
  } else if (input.weeklyFrequency === "5+") {
    score += 3;
  }

  // --------------------------------------------------------------------------
  // IDADE
  // --------------------------------------------------------------------------
  // Atualmente a idade não altera a pontuação.
  // Mantemos o campo no AthleteInput porque ele é utilizado no diagnóstico.

  // --------------------------------------------------------------------------
  // CONVERSÃO DA PONTUAÇÃO PARA NÍVEL
  // --------------------------------------------------------------------------

  let level: number;

  if (score <= 0) {
    level = 1;
  } else if (score <= 1) {
    level = 2;
  } else if (score <= 3) {
    level = 3;
  } else if (score <= 4) {
    level = 4;
  } else {
    level = 5;
  }

  return {
    level,
    levelName: LEVEL_NAMES[level],
    reason: LEVEL_REASONS[level],
    nextFocus: LEVEL_NEXT_FOCUS[level],
    phase: LEVEL_PHASES[level],
  };
}

// ============================================================================
// DIAGNÓSTICO
// ============================================================================

export function generateDiagnosis(
  input: AthleteInput,
  classification: Classification
): Diagnosis {
  const freqLabels: Record<WeeklyFrequency, string> = {
    "0": "nenhum treino por semana",
    "1-2": "1 a 2 treinos por semana",
    "3-4": "3 a 4 treinos por semana",
    "5+": "5 ou mais treinos por semana",
  };

  const expLabels: Record<ExperienceLevel, string> = {
    never: "nunca praticou corrida",
    beginner: "está começando na corrida agora",
    intermediate: "já corre há algum tempo",
    advanced: "é um corredor experiente",
  };

  const sexLabel =
    input.sex === "male" || input.sex === "M"
      ? "masculino"
      : input.sex === "female" || input.sex === "F"
        ? "feminino"
        : "outro";

  return {
    data: `${input.age} anos, ${sexLabel}, ${expLabels[input.experience]}, com ${freqLabels[input.weeklyFrequency]}. Objetivo declarado: "${input.goal}".`,

    interpretation:
      `O atleta está no Nível ${classification.level} — ${classification.levelName}. ` +
      `${classification.reason} ` +
      `A fase atual é ${classification.phase}, o que indica que o foco principal deve ser em ${classification.nextFocus.toLowerCase()}.`,

    decision:
      `Iniciar protocolo de ${classification.phase}. ` +
      `${classification.nextFocus} ` +
      `O objetivo declarado será usado como direção — mas o caminho começa pelo processo, não pelo destino.`,
  };
}

// ============================================================================
// BIBLIOTECA DE TREINOS SAN RUN
// ============================================================================

export const WORKOUT_LIBRARY: Record<
  number,
  WorkoutRecommendation[]
> = {
  // --------------------------------------------------------------------------
  // NÍVEL 1
  // --------------------------------------------------------------------------

  1: [
    {
      title: "Caminhada Ativa + Trote Suave",
      duration: "25 min",
      rpe: 3,
      instructions:
        "Inicie com 10 min de caminhada em ritmo confortável. " +
        "Em seguida, alterne: 1 min de trote leve + 2 min de caminhada. " +
        "Repita 4 vezes. Finalize com 5 min de caminhada.",
      why:
        "Seu corpo está se adaptando ao impacto da corrida. " +
        "Alternar caminhada e trote constrói base sem sobrecarregar articulações e músculos.",
      successCriteria:
        "Manter o trote sem parar antes do tempo e chegar ao final sem dor ou desconforto excessivo.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 10,
          rpe: 2,
        },
        {
          type: "series",
          label: "Trote Leve",
          reps: 4,
          workDurationMin: 1,
          restDurationMin: 2,
          workRpe: 3,
          restRpe: 2,
          restLabel: "Caminhada LE",
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 5,
          rpe: 2,
        },
      ],
    },

    {
      title: "Caminhada de Base",
      duration: "30 min",
      rpe: 2,
      instructions:
        "Caminhe em ritmo constante e confortável. " +
        "Mantenha postura ereta, ombros relaxados. " +
        "Respire pelo nariz quando possível. " +
        "Você deve conseguir conversar sem dificuldade.",
      why:
        "Ativar o sistema cardiovascular de forma gentil. " +
        "Este treino cria o hábito e prepara o corpo para estímulos maiores.",
      successCriteria:
        "Terminar o tempo proposto sem exaustão. Sentir que poderia continuar por mais tempo.",
      blocks: [
        {
          type: "continuous",
          label: "Caminhada LE",
          durationMin: 30,
          rpe: 2,
        },
      ],
    },

    {
      title: "Corrida/Caminhada Progressiva",
      duration: "30 min",
      rpe: 3,
      instructions:
        "10 min caminhada leve. " +
        "Alterne: 2 min trote leve + 2 min caminhada. " +
        "Repita 4 vezes. Finalize com 4 min de caminhada.",
      why:
        "Introduzir o trote de forma gradual, respeitando o ritmo do seu corpo.",
      successCriteria:
        "Completar todas as séries sem parar antes do tempo.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 10,
          rpe: 2,
        },
        {
          type: "series",
          label: "Trote LE",
          reps: 4,
          workDurationMin: 2,
          restDurationMin: 2,
          workRpe: 3,
          restRpe: 2,
          restLabel: "Caminhada LE",
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 4,
          rpe: 2,
        },
      ],
    },
  ],

  // --------------------------------------------------------------------------
  // NÍVEL 2
  // --------------------------------------------------------------------------

  2: [
    {
      title: "Corrida Contínua Leve",
      duration: "30 min",
      rpe: 4,
      instructions:
        "Corra em ritmo leve e constante. " +
        "O teste: você deve conseguir falar frases curtas enquanto corre. " +
        "Se não conseguir, reduza o ritmo. " +
        "Não precisa ser rápido — precisa ser contínuo.",
      why:
        "Desenvolver resistência aeróbica base é o alicerce de qualquer progresso. " +
        "Correr devagar hoje é o que permite correr mais rápido no futuro.",
      successCriteria:
        "Completar o tempo sem pausas. Ritmo cardíaco controlado. Terminar cansado, mas não esgotado.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 5,
          rpe: 3,
        },
        {
          type: "continuous",
          label: "Corrida LE",
          durationMin: 20,
          rpe: 4,
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 5,
          rpe: 3,
        },
      ],
    },

    {
      title: "Tiros Curtos",
      duration: "35 min",
      rpe: 6,
      instructions:
        "5 min aquecimento. " +
        "8 tiros de: 30 segundos em ritmo forte + 1 min caminhada. " +
        "10 min corrida leve. 5 min desaquecimento.",
      why:
        "Introduzir estímulos de velocidade curtos para desenvolver potência sem acumular fadiga excessiva.",
      successCriteria:
        "Manter a mesma intensidade do tiro 1 no tiro 8.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 5,
          rpe: 3,
        },
        {
          type: "series",
          label: "Tiro FO",
          reps: 8,
          workDurationMin: 0.5,
          restDurationMin: 1,
          workRpe: 6,
          restRpe: 2,
          restLabel: "Caminhada LE",
        },
        {
          type: "continuous",
          label: "Corrida LE",
          durationMin: 10,
          rpe: 4,
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 5,
          rpe: 3,
        },
      ],
    },

    {
      title: "Corrida Progressiva",
      duration: "35 min",
      rpe: 5,
      instructions:
        "5 min aquecimento. " +
        "10 min corrida leve. " +
        "10 min corrida moderada. " +
        "5 min corrida forte. " +
        "5 min desaquecimento.",
      why:
        "Aprender a progredir o esforço ao longo do treino — habilidade fundamental para provas.",
      successCriteria:
        "Cada bloco visivelmente mais rápido que o anterior.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 5,
          rpe: 3,
        },
        {
          type: "continuous",
          label: "Corrida LE",
          durationMin: 10,
          rpe: 4,
        },
        {
          type: "continuous",
          label: "Corrida MO",
          durationMin: 10,
          rpe: 5,
        },
        {
          type: "continuous",
          label: "Corrida FO",
          durationMin: 5,
          rpe: 6,
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 5,
          rpe: 3,
        },
      ],
    },
  ],

  // --------------------------------------------------------------------------
  // NÍVEL 3
  // --------------------------------------------------------------------------

  3: [
    {
      title: "Corrida com Variação de Ritmo",
      duration: "40 min",
      rpe: 6,
      instructions:
        "10 min aquecimento em ritmo leve. " +
        "20 min alternando: 4 min ritmo moderado + 2 min ritmo leve. " +
        "Finalize com 10 min de desaquecimento leve.",
      why:
        "Variações de ritmo desenvolvem múltiplos sistemas energéticos e ensinam seu corpo a se recuperar sob esforço — essencial para provas.",
      successCriteria:
        "Completar todos os blocos sem precisar reduzir o ritmo moderado para leve.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 10,
          rpe: 4,
        },
        {
          type: "series",
          label: "Corrida MO",
          reps: 3,
          workDurationMin: 4,
          restDurationMin: 2,
          workRpe: 6,
          restRpe: 3,
          restLabel: "Recuperação LE",
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 10,
          rpe: 4,
        },
      ],
    },

    {
      title: "Fartlek 5×2'",
      duration: "40 min",
      rpe: 6,
      instructions:
        "10 min aquecimento. " +
        "5 acelerações de 2 min em ritmo forte + 2 min trote leve. " +
        "10 min desaquecimento.",
      why:
        "Fartlek desenvolve capacidade de acelerar e se recuperar — base para qualquer objetivo de performance.",
      successCriteria:
        "Manter o mesmo ritmo nas 5 acelerações. Recuperação completa nos intervalos.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 10,
          rpe: 4,
        },
        {
          type: "series",
          label: "Fartlek FO",
          reps: 5,
          workDurationMin: 2,
          restDurationMin: 2,
          workRpe: 7,
          restRpe: 3,
          restLabel: "Trote LE",
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 10,
          rpe: 4,
        },
      ],
    },

    {
      title: "Corrida Longa",
      duration: "55 min",
      rpe: 5,
      instructions:
        "10 min aquecimento. " +
        "40 min corrida contínua em ritmo leve-moderado. " +
        "5 min desaquecimento.",
      why:
        "Volume aeróbico é o que constrói a base para tudo. O longo semanal é insubstituível.",
      successCriteria:
        "Completar os 40 min contínuos mantendo ritmo conversacional.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 10,
          rpe: 4,
        },
        {
          type: "continuous",
          label: "Corrida MO",
          durationMin: 40,
          rpe: 5,
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 5,
          rpe: 3,
        },
      ],
    },
  ],

  // --------------------------------------------------------------------------
  // NÍVEL 4
  // --------------------------------------------------------------------------

  4: [
    {
      title: "Corrida Progressiva",
      duration: "45 min",
      rpe: 7,
      instructions:
        "Divida o treino em 3 partes iguais: primeiro terço em ritmo leve, segundo terço em ritmo moderado, último terço em ritmo forte, mas sustentável.",
      why:
        "Treinos progressivos desenvolvem controle de esforço e eficiência metabólica. Aprender a acelerar no final é uma habilidade competitiva.",
      successCriteria:
        "Cada bloco mais rápido que o anterior. Último km mais rápido que o primeiro.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 5,
          rpe: 4,
        },
        {
          type: "continuous",
          label: "Corrida LE",
          durationMin: 12,
          rpe: 5,
        },
        {
          type: "continuous",
          label: "Corrida MO",
          durationMin: 12,
          rpe: 6,
        },
        {
          type: "continuous",
          label: "Corrida FO",
          durationMin: 11,
          rpe: 7,
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 5,
          rpe: 4,
        },
      ],
    },

    {
      title: "Intervalado 8×400m",
      duration: "50 min",
      rpe: 8,
      instructions:
        "15 min aquecimento. " +
        "8 repetições de: 2 min em ritmo forte + 90 seg recuperação ativa. " +
        "10 min desaquecimento.",
      why:
        "Intervalados de alta intensidade aumentam VO2max e velocidade de corrida. Treino de alta qualidade.",
      successCriteria:
        "Manter o mesmo ritmo do intervalo 1 no intervalo 8.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 15,
          rpe: 4,
        },
        {
          type: "series",
          label: "Intervalo FO",
          reps: 8,
          workDurationMin: 2,
          restDurationMin: 1.5,
          workRpe: 8,
          restRpe: 3,
          restLabel: "Trote LE",
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 10,
          rpe: 4,
        },
      ],
    },

    {
      title: "Longão Progressivo",
      duration: "70 min",
      rpe: 6,
      instructions:
        "10 min aquecimento. " +
        "50 min progressivos: 20 min LE, 20 min MO, 10 min FO. " +
        "10 min desaquecimento.",
      why:
        "Longão progressivo constrói resistência e ensina o corpo a usar energia de forma eficiente.",
      successCriteria:
        "Completar os 50 min sem parar, acelerando progressivamente.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 10,
          rpe: 4,
        },
        {
          type: "continuous",
          label: "Corrida LE",
          durationMin: 20,
          rpe: 5,
        },
        {
          type: "continuous",
          label: "Corrida MO",
          durationMin: 20,
          rpe: 6,
        },
        {
          type: "continuous",
          label: "Corrida FO",
          durationMin: 10,
          rpe: 7,
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 10,
          rpe: 4,
        },
      ],
    },
  ],

  // --------------------------------------------------------------------------
  // NÍVEL 5
  // --------------------------------------------------------------------------

  5: [
    {
      title: "Intervalado de Alta Intensidade",
      duration: "55 min",
      rpe: 8,
      instructions:
        "15 min aquecimento. " +
        "6 repetições de: 3 min em ritmo forte (RPE 8-9) + 2 min recuperação ativa. " +
        "15 min desaquecimento.",
      why:
        "Intervalados de alta intensidade aumentam VO2max, velocidade limiar e capacidade de repetir esforços. Treino fundamental para performance.",
      successCriteria:
        "Manter o mesmo ritmo do bloco 1 no bloco 6. Frequência cardíaca que responde e se recupera.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 15,
          rpe: 5,
        },
        {
          type: "series",
          label: "Intervalo MF",
          reps: 6,
          workDurationMin: 3,
          restDurationMin: 2,
          workRpe: 9,
          restRpe: 3,
          restLabel: "Trote LE",
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 15,
          rpe: 5,
        },
      ],
    },

    {
      title: "Corrida de Limiar",
      duration: "55 min",
      rpe: 8,
      instructions:
        "15 min aquecimento. " +
        "25 min em ritmo de limiar (RPE 7-8 — desconfortável mas sustentável). " +
        "15 min desaquecimento.",
      why:
        "Treino de limiar aumenta a velocidade que você consegue manter por longos períodos — base da performance.",
      successCriteria:
        "Manter o ritmo constante nos 25 min sem precisar reduzir.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 15,
          rpe: 5,
        },
        {
          type: "continuous",
          label: "Limiar MF",
          durationMin: 25,
          rpe: 8,
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 15,
          rpe: 5,
        },
      ],
    },

    {
      title: "Longão de Performance",
      duration: "90 min",
      rpe: 7,
      instructions:
        "15 min aquecimento. " +
        "60 min corrida contínua em ritmo moderado-forte. " +
        "15 min desaquecimento.",
      why:
        "Volume alto com intensidade moderada. Base para provas de longa distância.",
      successCriteria:
        "Completar os 90 min. Ritmo estável nos últimos 20 min.",
      blocks: [
        {
          type: "warmup",
          label: "Aquecimento",
          durationMin: 15,
          rpe: 5,
        },
        {
          type: "continuous",
          label: "Corrida MO-FO",
          durationMin: 60,
          rpe: 7,
        },
        {
          type: "cooldown",
          label: "Desaquecimento",
          durationMin: 15,
          rpe: 5,
        },
      ],
    },
  ],
};

// ============================================================================
// TREINO DE RECUPERAÇÃO
// ============================================================================

const RECOVERY_WORKOUT: WorkoutRecommendation = {
  title: "Recuperação Ativa",
  duration: "20 min",
  rpe: 2,

  instructions:
    "Caminhada leve ou trote muito suave por 15-20 minutos. " +
    "O objetivo é mover o corpo sem criar estresse adicional.",

  why:
    "Recuperação é treino. Respeitar os sinais do corpo é o que separa atletas que evoluem dos que se machucam.",

  successCriteria:
    "Sentir-se melhor ao final do que no início. Zero dor nova.",

  blocks: [
    {
      type: "continuous",
      label: "Caminhada LE",
      durationMin: 20,
      rpe: 2,
    },
  ],
};

// ============================================================================
// GERAÇÃO DO TREINO
// ============================================================================

export function generateWorkout(
  level: number,
  phase: Phase,
  checkinReadiness?: string
): WorkoutRecommendation {
  // O parâmetro phase faz parte da API da função e será utilizado
  // nas próximas regras de periodização.
  // Por enquanto, mantemos a fase sem alterar a seleção da biblioteca.
  void phase;

  const readiness = checkinReadiness ?? "high";

  const safeLevel = Math.min(
    Math.max(level, 1),
    5
  );

  const lib = WORKOUT_LIBRARY[safeLevel];

  const recommendation = lib[0];

  // --------------------------------------------------------------------------
  // READINESS BAIXA
  // --------------------------------------------------------------------------

  if (readiness === "low") {
    return {
      ...RECOVERY_WORKOUT,
      title: `Recuperação Ativa — ${recommendation.title}`,
    };
  }

  // --------------------------------------------------------------------------
  // READINESS MÉDIA
  // --------------------------------------------------------------------------

  if (readiness === "medium") {
    return {
      ...recommendation,
      rpe: Math.max(1, recommendation.rpe - 1),
      title: `Treino Ajustado — ${recommendation.title}`,
    };
  }

  // --------------------------------------------------------------------------
  // READINESS ALTA
  // --------------------------------------------------------------------------

  return recommendation;
}