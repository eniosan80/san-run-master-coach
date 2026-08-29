export interface Exercise {
  id: string;
  categoryId: string;
  name: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  sets?: number;
  reps?: number;
  duration?: string; // ex: "30 segundos"
  why: string;
  steps: string[];
  muscles: string[];
  illustration: "squat" | "lunge" | "calf" | "bridge" | "plank" | "lateral" | "antirotation" | "deadbug" | "ankle" | "hip" | "thoracic" | "hipflex" | "skipping" | "knees" | "heels" | "coordination";
  media?: {
    type: "animation" | "video";
    src: string;
    poster?: string;
    alt: string;
  };
}

export const EXERCISES: Exercise[] = [
  /* ─── PERNAS & ESTABILIDADE ─── */
  {
    id: "agachamento",
    categoryId: "pernas",
    name: "Agachamento",
    level: "Iniciante",
    sets: 3,
    reps: 12,
    why: "Fortalece quadríceps, glúteos e estabilizadores do joelho — músculos essenciais para cada passada na corrida.",
    steps: [
      "Em pé, pés na largura dos ombros, dedos levemente abertos para fora.",
      "Empurre os quadris para trás e dobre os joelhos descendo até a coxa ficar paralela ao chão.",
      "Mantenha o peito erguido, joelhos alinhados com os pés.",
      "Empurre o chão para subir, contraindo os glúteos no topo.",
    ],
    muscles: ["Quadríceps", "Glúteos", "Isquiotibiais"],
    illustration: "squat",
  },
  {
    id: "avanco",
    categoryId: "pernas",
    name: "Avanço",
    level: "Iniciante",
    sets: 3,
    reps: 10,
    why: "Simula o movimento da passada e melhora equilíbrio e estabilidade unilateral — direto no padrão da corrida.",
    steps: [
      "Em pé, pés juntos, postura ereta.",
      "Dê um passo à frente com um pé e desça o joelho de trás em direção ao chão.",
      "O joelho da frente não deve ultrapassar o pé.",
      "Empurre o chão para retornar à posição inicial e alterne os lados.",
    ],
    muscles: ["Quadríceps", "Glúteos", "Core"],
    illustration: "lunge",
  },
  {
    id: "panturrilha",
    categoryId: "pernas",
    name: "Elevação de Panturrilha",
    level: "Iniciante",
    sets: 3,
    reps: 20,
    why: "Panturrilhas fortes absorvem impacto e impulsionam a corrida. Reduz risco de lesões no tendão de Aquiles.",
    steps: [
      "Em pé com apoio de parede ou cadeira para equilíbrio.",
      "Suba nas pontas dos pés elevando os calcanhares ao máximo.",
      "Segure 1 segundo no topo.",
      "Desça de forma controlada até o calcanhar quase tocar o chão.",
    ],
    muscles: ["Gastrocnêmio", "Sóleo", "Tendão de Aquiles"],
    illustration: "calf",
  },
  {
    id: "ponte-gluteo",
    categoryId: "pernas",
    name: "Ponte de Glúteo",
    level: "Iniciante",
    sets: 3,
    reps: 15,
    why: "Ativa glúteos e estabiliza quadril — essencial para manter boa mecânica de corrida e prevenir dor no joelho.",
    steps: [
      "Deite de costas, joelhos dobrados, pés no chão na largura do quadril.",
      "Contraia o core e eleve o quadril até formar uma linha reta de ombros a joelhos.",
      "Aperte os glúteos no topo por 2 segundos.",
      "Desça de forma controlada sem deixar o quadril tocar o chão entre as repetições.",
    ],
    muscles: ["Glúteo Médio", "Glúteo Máximo", "Isquiotibiais"],
    illustration: "bridge",
  },

  /* ─── NÚCLEO ─── */
  {
    id: "prancha",
    categoryId: "nucleo",
    name: "Prancha Isométrica",
    level: "Iniciante",
    duration: "30 segundos",
    why: "Core estável significa menos oscilação lateral na corrida — economia de energia e proteção da coluna.",
    steps: [
      "Apoio nos antebraços e pontas dos pés, corpo formando linha reta.",
      "Contraia o abdômen, glúteos e quadríceps simultaneamente.",
      "Mantenha o quadril neutro — nem elevado, nem afundando.",
      "Respire normalmente durante todo o tempo.",
    ],
    muscles: ["Transverso Abdominal", "Oblíquos", "Multífidos"],
    illustration: "plank",
  },
  {
    id: "elevacao-lateral",
    categoryId: "nucleo",
    name: "Prancha Lateral",
    level: "Intermediário",
    duration: "20 segundos cada lado",
    why: "Fortalece oblíquos e glúteo médio — controla a inclinação do quadril que afeta diretamente a mecânica da passada.",
    steps: [
      "Deite de lado apoiando no antebraço, pés empilhados ou um à frente do outro.",
      "Eleve o quadril formando linha reta da cabeça aos pés.",
      "Mantenha o quadril elevado sem deixar rodar.",
      "Respire normalmente. Troque de lado.",
    ],
    muscles: ["Oblíquos", "Glúteo Médio", "Quadrado Lombar"],
    illustration: "lateral",
  },
  {
    id: "anti-rotacao",
    categoryId: "nucleo",
    name: "Anti-rotação com Resistência",
    level: "Intermediário",
    sets: 3,
    reps: 10,
    why: "Treina a capacidade do core de resistir à rotação — crucial para manter eficiência nos braços durante a corrida.",
    steps: [
      "Em pé lateral a uma parede ou ancoragem, segure as mãos unidas à frente do peito.",
      "Estenda os braços na horizontal sem deixar o tronco rotar.",
      "Mantenha a posição por 2 segundos com máxima tensão.",
      "Retorne devagar. Complete um lado antes de trocar.",
    ],
    muscles: ["Oblíquos", "Transverso", "Glúteos"],
    illustration: "antirotation",
  },
  {
    id: "dead-bug",
    categoryId: "nucleo",
    name: "Dead Bug",
    level: "Iniciante",
    sets: 3,
    reps: 8,
    why: "Coordena membros opostos mantendo o core estável — imita o padrão neuromotor da corrida no plano seguro.",
    steps: [
      "Deite de costas, braços apontados para o teto, joelhos a 90° no ar.",
      "Expire e estenda o braço direito e a perna esquerda simultaneamente até quase o chão.",
      "Retorne à posição inicial e repita no lado oposto.",
      "Mantenha a lombar colada no chão durante todo o movimento.",
    ],
    muscles: ["Transverso", "Multífidos", "Iliopsoas"],
    illustration: "deadbug",
  },

  /* ─── MOBILIDADE ─── */
  {
    id: "mobilidade-tornozelo",
    categoryId: "mobilidade",
    name: "Mobilidade de Tornozelo",
    level: "Iniciante",
    sets: 3,
    reps: 12,
    why: "Tornozelo rígido compromete o contato com o solo e aumenta sobrecarga no joelho e quadril durante a corrida.",
    steps: [
      "Em pé perto de uma parede, pé a 10 cm dela.",
      "Dobre o joelho em direção à parede mantendo o calcanhar no chão.",
      "Tente tocar o joelho na parede sem levantar o calcanhar.",
      "Aumente a distância progressivamente a cada série.",
    ],
    muscles: ["Tornozelo", "Gêmeos", "Fáscia Plantar"],
    illustration: "ankle",
  },
  {
    id: "mobilidade-quadril",
    categoryId: "mobilidade",
    name: "Rotação de Quadril",
    level: "Iniciante",
    duration: "45 segundos",
    why: "Quadril com boa mobilidade permite passada mais ampla e reduz tensão na lombar durante corridas longas.",
    steps: [
      "Deitado de costas, joelhos dobrados, pés no chão.",
      "Deixe os dois joelhos tombarem suavemente para um lado.",
      "Segure a posição por 3 respirações profundas.",
      "Retorne ao centro e vá para o outro lado.",
    ],
    muscles: ["Piriforme", "Rotadores do Quadril", "Lombar"],
    illustration: "hip",
  },
  {
    id: "rotacao-toracica",
    categoryId: "mobilidade",
    name: "Rotação Torácica",
    level: "Iniciante",
    sets: 2,
    reps: 10,
    why: "Melhora balanço de braços e reduz compensações na lombar que surgem em corridas mais longas.",
    steps: [
      "Em quatro apoios, coloque uma mão atrás da cabeça.",
      "Rotacione o cotovelo em direção ao teto abrindo o peito.",
      "Mantenha os quadris estáveis — o movimento é só na coluna torácica.",
      "Retorne e repita. Alterne os lados.",
    ],
    muscles: ["Coluna Torácica", "Oblíquos", "Romboides"],
    illustration: "thoracic",
  },
  {
    id: "alongamento-hip-flexor",
    categoryId: "mobilidade",
    name: "Alongamento de Hip Flexor",
    level: "Iniciante",
    duration: "40 segundos cada lado",
    why: "Hip flexores encurtados causam inclinação pélvica anterior e sobrecarregam a lombar — problema clássico do corredor.",
    steps: [
      "Na posição de ajoelhado em meia-lua, joelho traseiro no chão.",
      "Avance levemente o quadril para frente até sentir o alongamento na frente da coxa traseira.",
      "Mantenha o tronco ereto e respire profundamente.",
      "Não deixe o joelho da frente ultrapassar o pé.",
    ],
    muscles: ["Iliopsoas", "Reto Femoral", "Lombar"],
    illustration: "hipflex",
  },

  /* ─── EDUCATIVOS & COORDENAÇÃO ─── */
  {
    id: "skipping",
    categoryId: "educativos",
    name: "Skipping",
    level: "Iniciante",
    duration: "30 segundos",
    why: "Treina elevação do joelho e cadência — base da técnica de corrida eficiente com menor impacto.",
    steps: [
      "Em pé, comece a marcha elevada no lugar.",
      "Eleve os joelhos até a altura do quadril com ritmo constante.",
      "Mantenha os cotovelos a 90° e balanço de braços natural.",
      "Aumente a velocidade progressivamente mantendo o controle.",
    ],
    muscles: ["Hip Flexores", "Quadríceps", "Core"],
    illustration: "skipping",
  },
  {
    id: "elevacao-joelhos",
    categoryId: "educativos",
    name: "A-Skip (Elevação de Joelhos)",
    level: "Iniciante",
    duration: "20 metros",
    why: "Desenvolve o padrão de passada ideal e sincroniza braços e pernas — melhora diretamente a economia de corrida.",
    steps: [
      "Ande para frente elevando o joelho direito e o braço esquerdo simultaneamente.",
      "O pé de apoio deve ficar na ponta (contato ativo com o solo).",
      "Mantenha ritmo controlado — técnica primeiro, velocidade depois.",
      "Alterne os lados de forma cadenciada.",
    ],
    muscles: ["Hip Flexores", "Panturrilha", "Core"],
    illustration: "knees",
  },
  {
    id: "calcanhares",
    categoryId: "educativos",
    name: "B-Skip (Calcanhares)",
    level: "Intermediário",
    duration: "20 metros",
    why: "Trabalha o retorno rápido do pé ao solo — fase de apoio mais eficiente e menos tempo de contato.",
    steps: [
      "Execute o A-Skip mas adicione uma extensão de joelho antes de pousar.",
      "Estenda a perna à frente e puxe o calcanhar de volta com força em direção ao glúteo.",
      "O movimento deve ser fluído e explosivo.",
      "Mantenha o tronco estável e os braços coordenados.",
    ],
    muscles: ["Isquiotibiais", "Glúteos", "Panturrilha"],
    illustration: "heels",
  },
  {
    id: "corrida-cruzada-lateral",
    categoryId: "educativos",
    name: "Corrida Cruzada Lateral",
    level: "Intermediário",
    duration: "20 metros cada lado",
    why: "Desenvolve coordenação neuromuscular e agilidade do quadril — melhora reatividade e controle na corrida.",
    steps: [
      "De lado, dê um passo cruzado com o pé da frente passando pela frente do outro.",
      "Depois, cruce o pé de trás.",
      "Alterne frente-e-atrás mantendo cadência constante.",
      "Mantenha o olhar na direção do movimento e braços relaxados.",
    ],
    muscles: ["Adutores", "Abdutores", "Core", "Coordenação"],
    illustration: "coordination",
  },
];

export function getExercisesByCategory(categoryId: string): Exercise[] {
  return EXERCISES.filter(e => e.categoryId === categoryId);
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}

export const CATEGORY_META: Record<string, { label: string; color: string; objective: string }> = {
  pernas:     { label: "Pernas & Estabilidade", color: "#C4622D", objective: "Fortalecer músculos envolvidos na passada" },
  nucleo:     { label: "Núcleo",                 color: "#3A5F6F", objective: "Controle e estabilidade durante a corrida" },
  mobilidade: { label: "Mobilidade do Corredor", color: "#5a8fa5", objective: "Melhorar movimento e eficiência" },
  educativos: { label: "Educativos & Coordenação",color: "#a07040", objective: "Melhorar técnica de corrida" },
};



