export interface Exercise {
  id: string;
  categoryId: string;
  name: string;
  level: "Iniciante" | "IntermediÃ¡rio" | "AvanÃ§ado";
  sets?: number;
  reps?: number;
  duration?: string; // ex: "30 segundos"
  why: string;
  steps: string[];
  muscles: string[];
  illustration: "squat" | "lunge" | "calf" | "bridge" | "plank" | "lateral" | "antirotation" | "deadbug" | "ankle" | "hip" | "thoracic" | "hipflex" | "skipping" | "knees" | "heels" | "coordination";
}

export const EXERCISES: Exercise[] = [
  /* â”€â”€â”€ PERNAS & ESTABILIDADE â”€â”€â”€ */
  {
    id: "agachamento",
    categoryId: "pernas",
    name: "Agachamento",
    level: "Iniciante",
    sets: 3,
    reps: 12,
    why: "Fortalece quadrÃ­ceps, glÃºteos e estabilizadores do joelho â€” mÃºsculos essenciais para cada passada na corrida.",
    steps: [
      "Em pÃ©, pÃ©s na largura dos ombros, dedos levemente abertos para fora.",
      "Empurre os quadris para trÃ¡s e dobre os joelhos descendo atÃ© a coxa ficar paralela ao chÃ£o.",
      "Mantenha o peito erguido, joelhos alinhados com os pÃ©s.",
      "Empurre o chÃ£o para subir, contraindo os glÃºteos no topo.",
    ],
    muscles: ["QuadrÃ­ceps", "GlÃºteos", "Isquiotibiais"],
    illustration: "squat",
  },
  {
    id: "avanco",
    categoryId: "pernas",
    name: "AvanÃ§o",
    level: "Iniciante",
    sets: 3,
    reps: 10,
    why: "Simula o movimento da passada e melhora equilÃ­brio e estabilidade unilateral â€” direto no padrÃ£o da corrida.",
    steps: [
      "Em pÃ©, pÃ©s juntos, postura ereta.",
      "DÃª um passo Ã  frente com um pÃ© e desÃ§a o joelho de trÃ¡s em direÃ§Ã£o ao chÃ£o.",
      "O joelho da frente nÃ£o deve ultrapassar o pÃ©.",
      "Empurre o chÃ£o para retornar Ã  posiÃ§Ã£o inicial e alterne os lados.",
    ],
    muscles: ["QuadrÃ­ceps", "GlÃºteos", "Core"],
    illustration: "lunge",
  },
  {
    id: "panturrilha",
    categoryId: "pernas",
    name: "ElevaÃ§Ã£o de Panturrilha",
    level: "Iniciante",
    sets: 3,
    reps: 20,
    why: "Panturrilhas fortes absorvem impacto e impulsionam a corrida. Reduz risco de lesÃµes no tendÃ£o de Aquiles.",
    steps: [
      "Em pÃ© com apoio de parede ou cadeira para equilÃ­brio.",
      "Suba nas pontas dos pÃ©s elevando os calcanhares ao mÃ¡ximo.",
      "Segure 1 segundo no topo.",
      "DesÃ§a de forma controlada atÃ© o calcanhar quase tocar o chÃ£o.",
    ],
    muscles: ["GastrocnÃªmio", "SÃ³leo", "TendÃ£o de Aquiles"],
    illustration: "calf",
  },
  {
    id: "ponte-gluteo",
    categoryId: "pernas",
    name: "Ponte de GlÃºteo",
    level: "Iniciante",
    sets: 3,
    reps: 15,
    why: "Ativa glÃºteos e estabiliza quadril â€” essencial para manter boa mecÃ¢nica de corrida e prevenir dor no joelho.",
    steps: [
      "Deite de costas, joelhos dobrados, pÃ©s no chÃ£o na largura do quadril.",
      "Contraia o core e eleve o quadril atÃ© formar uma linha reta de ombros a joelhos.",
      "Aperte os glÃºteos no topo por 2 segundos.",
      "DesÃ§a de forma controlada sem deixar o quadril tocar o chÃ£o entre as repetiÃ§Ãµes.",
    ],
    muscles: ["GlÃºteo MÃ©dio", "GlÃºteo MÃ¡ximo", "Isquiotibiais"],
    illustration: "bridge",
  },

  /* â”€â”€â”€ NÃšCLEO â”€â”€â”€ */
  {
    id: "prancha",
    categoryId: "nucleo",
    name: "Prancha IsomÃ©trica",
    level: "Iniciante",
    duration: "30 segundos",
    why: "Core estÃ¡vel significa menos oscilaÃ§Ã£o lateral na corrida â€” economia de energia e proteÃ§Ã£o da coluna.",
    steps: [
      "Apoio nos antebraÃ§os e pontas dos pÃ©s, corpo formando linha reta.",
      "Contraia o abdÃ´men, glÃºteos e quadrÃ­ceps simultaneamente.",
      "Mantenha o quadril neutro â€” nem elevado, nem afundando.",
      "Respire normalmente durante todo o tempo.",
    ],
    muscles: ["Transverso Abdominal", "OblÃ­quos", "MultÃ­fidos"],
    illustration: "plank",
  },
  {
    id: "elevacao-lateral",
    categoryId: "nucleo",
    name: "Prancha Lateral",
    level: "IntermediÃ¡rio",
    duration: "20 segundos cada lado",
    why: "Fortalece oblÃ­quos e glÃºteo mÃ©dio â€” controla a inclinaÃ§Ã£o do quadril que afeta diretamente a mecÃ¢nica da passada.",
    steps: [
      "Deite de lado apoiando no antebraÃ§o, pÃ©s empilhados ou um Ã  frente do outro.",
      "Eleve o quadril formando linha reta da cabeÃ§a aos pÃ©s.",
      "Mantenha o quadril elevado sem deixar rodar.",
      "Respire normalmente. Troque de lado.",
    ],
    muscles: ["OblÃ­quos", "GlÃºteo MÃ©dio", "Quadrado Lombar"],
    illustration: "lateral",
  },
  {
    id: "anti-rotacao",
    categoryId: "nucleo",
    name: "Anti-rotaÃ§Ã£o com ResistÃªncia",
    level: "IntermediÃ¡rio",
    sets: 3,
    reps: 10,
    why: "Treina a capacidade do core de resistir Ã  rotaÃ§Ã£o â€” crucial para manter eficiÃªncia nos braÃ§os durante a corrida.",
    steps: [
      "Em pÃ© lateral a uma parede ou ancoragem, segure as mÃ£os unidas Ã  frente do peito.",
      "Estenda os braÃ§os na horizontal sem deixar o tronco rotar.",
      "Mantenha a posiÃ§Ã£o por 2 segundos com mÃ¡xima tensÃ£o.",
      "Retorne devagar. Complete um lado antes de trocar.",
    ],
    muscles: ["OblÃ­quos", "Transverso", "GlÃºteos"],
    illustration: "antirotation",
  },
  {
    id: "dead-bug",
    categoryId: "nucleo",
    name: "Dead Bug",
    level: "Iniciante",
    sets: 3,
    reps: 8,
    why: "Coordena membros opostos mantendo o core estÃ¡vel â€” imita o padrÃ£o neuromotor da corrida no plano seguro.",
    steps: [
      "Deite de costas, braÃ§os apontados para o teto, joelhos a 90Â° no ar.",
      "Expire e estenda o braÃ§o direito e a perna esquerda simultaneamente atÃ© quase o chÃ£o.",
      "Retorne Ã  posiÃ§Ã£o inicial e repita no lado oposto.",
      "Mantenha a lombar colada no chÃ£o durante todo o movimento.",
    ],
    muscles: ["Transverso", "MultÃ­fidos", "Iliopsoas"],
    illustration: "deadbug",
  },

  /* â”€â”€â”€ MOBILIDADE â”€â”€â”€ */
  {
    id: "mobilidade-tornozelo",
    categoryId: "mobilidade",
    name: "Mobilidade de Tornozelo",
    level: "Iniciante",
    sets: 3,
    reps: 12,
    why: "Tornozelo rÃ­gido compromete o contato com o solo e aumenta sobrecarga no joelho e quadril durante a corrida.",
    steps: [
      "Em pÃ© perto de uma parede, pÃ© a 10 cm dela.",
      "Dobre o joelho em direÃ§Ã£o Ã  parede mantendo o calcanhar no chÃ£o.",
      "Tente tocar o joelho na parede sem levantar o calcanhar.",
      "Aumente a distÃ¢ncia progressivamente a cada sÃ©rie.",
    ],
    muscles: ["Tornozelo", "GÃªmeos", "FÃ¡scia Plantar"],
    illustration: "ankle",
  },
  {
    id: "mobilidade-quadril",
    categoryId: "mobilidade",
    name: "RotaÃ§Ã£o de Quadril",
    level: "Iniciante",
    duration: "45 segundos",
    why: "Quadril com boa mobilidade permite passada mais ampla e reduz tensÃ£o na lombar durante corridas longas.",
    steps: [
      "Deitado de costas, joelhos dobrados, pÃ©s no chÃ£o.",
      "Deixe os dois joelhos tombarem suavemente para um lado.",
      "Segure a posiÃ§Ã£o por 3 respiraÃ§Ãµes profundas.",
      "Retorne ao centro e vÃ¡ para o outro lado.",
    ],
    muscles: ["Piriforme", "Rotadores do Quadril", "Lombar"],
    illustration: "hip",
  },
  {
    id: "rotacao-toracica",
    categoryId: "mobilidade",
    name: "RotaÃ§Ã£o TorÃ¡cica",
    level: "Iniciante",
    sets: 2,
    reps: 10,
    why: "Melhora balanÃ§o de braÃ§os e reduz compensaÃ§Ãµes na lombar que surgem em corridas mais longas.",
    steps: [
      "Em quatro apoios, coloque uma mÃ£o atrÃ¡s da cabeÃ§a.",
      "Rotacione o cotovelo em direÃ§Ã£o ao teto abrindo o peito.",
      "Mantenha os quadris estÃ¡veis â€” o movimento Ã© sÃ³ na coluna torÃ¡cica.",
      "Retorne e repita. Alterne os lados.",
    ],
    muscles: ["Coluna TorÃ¡cica", "OblÃ­quos", "Romboides"],
    illustration: "thoracic",
  },
  {
    id: "alongamento-hip-flexor",
    categoryId: "mobilidade",
    name: "Alongamento de Hip Flexor",
    level: "Iniciante",
    duration: "40 segundos cada lado",
    why: "Hip flexores encurtados causam inclinaÃ§Ã£o pÃ©lvica anterior e sobrecarregam a lombar â€” problema clÃ¡ssico do corredor.",
    steps: [
      "Na posiÃ§Ã£o de ajoelhado em meia-lua, joelho traseiro no chÃ£o.",
      "Avance levemente o quadril para frente atÃ© sentir o alongamento na frente da coxa traseira.",
      "Mantenha o tronco ereto e respire profundamente.",
      "NÃ£o deixe o joelho da frente ultrapassar o pÃ©.",
    ],
    muscles: ["Iliopsoas", "Reto Femoral", "Lombar"],
    illustration: "hipflex",
  },

  /* â”€â”€â”€ EDUCATIVOS & COORDENAÃ‡ÃƒO â”€â”€â”€ */
  {
    id: "skipping",
    categoryId: "educativos",
    name: "Skipping",
    level: "Iniciante",
    duration: "30 segundos",
    why: "Treina elevaÃ§Ã£o do joelho e cadÃªncia â€” base da tÃ©cnica de corrida eficiente com menor impacto.",
    steps: [
      "Em pÃ©, comece a marcha elevada no lugar.",
      "Eleve os joelhos atÃ© a altura do quadril com ritmo constante.",
      "Mantenha os cotovelos a 90Â° e balanÃ§o de braÃ§os natural.",
      "Aumente a velocidade progressivamente mantendo o controle.",
    ],
    muscles: ["Hip Flexores", "QuadrÃ­ceps", "Core"],
    illustration: "skipping",
  },
  {
    id: "elevacao-joelhos",
    categoryId: "educativos",
    name: "A-Skip (ElevaÃ§Ã£o de Joelhos)",
    level: "Iniciante",
    duration: "20 metros",
    why: "Desenvolve o padrÃ£o de passada ideal e sincroniza braÃ§os e pernas â€” melhora diretamente a economia de corrida.",
    steps: [
      "Ande para frente elevando o joelho direito e o braÃ§o esquerdo simultaneamente.",
      "O pÃ© de apoio deve ficar na ponta (contato ativo com o solo).",
      "Mantenha ritmo controlado â€” tÃ©cnica primeiro, velocidade depois.",
      "Alterne os lados de forma cadenciada.",
    ],
    muscles: ["Hip Flexores", "Panturrilha", "Core"],
    illustration: "knees",
  },
  {
    id: "calcanhares",
    categoryId: "educativos",
    name: "B-Skip (Calcanhares)",
    level: "IntermediÃ¡rio",
    duration: "20 metros",
    why: "Trabalha o retorno rÃ¡pido do pÃ© ao solo â€” fase de apoio mais eficiente e menos tempo de contato.",
    steps: [
      "Execute o A-Skip mas adicione uma extensÃ£o de joelho antes de pousar.",
      "Estenda a perna Ã  frente e puxe o calcanhar de volta com forÃ§a em direÃ§Ã£o ao glÃºteo.",
      "O movimento deve ser fluÃ­do e explosivo.",
      "Mantenha o tronco estÃ¡vel e os braÃ§os coordenados.",
    ],
    muscles: ["Isquiotibiais", "GlÃºteos", "Panturrilha"],
    illustration: "heels",
  },
  {
    id: "corrida-cruzada-lateral",
    categoryId: "educativos",
    name: "Corrida Cruzada Lateral",
    level: "IntermediÃ¡rio",
    duration: "20 metros cada lado",
    why: "Desenvolve coordenaÃ§Ã£o neuromuscular e agilidade do quadril â€” melhora reatividade e controle na corrida.",
    steps: [
      "De lado, dÃª um passo cruzado com o pÃ© da frente passando pela frente do outro.",
      "Depois, cruce o pÃ© de trÃ¡s.",
      "Alterne frente-e-atrÃ¡s mantendo cadÃªncia constante.",
      "Mantenha o olhar na direÃ§Ã£o do movimento e braÃ§os relaxados.",
    ],
    muscles: ["Adutores", "Abdutores", "Core", "CoordenaÃ§Ã£o"],
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
  pernas:     { label: "Pernas & Estabilidade", color: "#C4622D", objective: "Fortalecer mÃºsculos envolvidos na passada" },
  nucleo:     { label: "NÃºcleo",                 color: "#3A5F6F", objective: "Controle e estabilidade durante a corrida" },
  mobilidade: { label: "Mobilidade do Corredor", color: "#5a8fa5", objective: "Melhorar movimento e eficiÃªncia" },
  educativos: { label: "Educativos & CoordenaÃ§Ã£o",color: "#a07040", objective: "Melhorar tÃ©cnica de corrida" },
};


