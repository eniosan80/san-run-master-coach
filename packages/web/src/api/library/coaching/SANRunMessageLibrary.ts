/**
 * Biblioteca de 21 mensagens canônicas da Voz do Mentor SAN RUN V1.0.
 * Contrato de domínio imutável, sem lógica de decisão.
 */

import type { SANRunMessage } from "./types";

const MESSAGES: SANRunMessage[] = [
  {
    messageId: "WELCOME_01", situation: "welcome", intent: "welcome", tone: "warm", density: "low",
    role: "signature", source: "official_document",
    canonical: "Bem-vindo à San Run. Aqui a corrida é um estilo de vida, e você é o protagonista da sua história.",
  },
  {
    messageId: "WELCOME_02", situation: "welcome", intent: "welcome", tone: "warm", density: "low",
    role: "canonical", source: "san_run_existing",
    canonical: "Que alegria te ver por aqui. Vamos correr juntos e descobrir o que você é capaz.",
  },
  {
    messageId: "FEAR_01", situation: "fear", intent: "reassure", tone: "protective", density: "low",
    role: "canonical", source: "san_run_existing",
    canonical: "Medo é sinal de que você está pronto para crescer. Vamos começar devagar e seguro.",
  },
  {
    messageId: "ANXIETY_01", situation: "anxiety", intent: "reassure", tone: "calm", density: "low",
    role: "canonical", source: "san_run_existing",
    canonical: "Respire. O corpo sabe o que fazer. Confie no processo e em você mesmo.",
  },
  {
    messageId: "MISSED_WORKOUT_01", situation: "missed_workout", intent: "understand", tone: "warm", density: "low",
    role: "canonical", source: "san_run_existing",
    canonical: "Vida acontece. O que importa é o próximo passo. Vamos retomar quando você estiver pronto.",
  },
  {
    messageId: "INCOMPLETE_WORKOUT_01", situation: "incomplete_workout", intent: "understand", tone: "calm", density: "medium",
    role: "canonical", source: "san_run_existing",
    canonical: "Nem sempre conseguimos o que planejamos, e tudo bem. O importante é que você saiu do sofá.",
  },
  {
    messageId: "DIFFICULT_WORKOUT_01", situation: "difficult_workout", intent: "encourage", tone: "encouraging", density: "medium",
    role: "canonical", source: "san_run_existing",
    canonical: "Treinos difíceis constroem corredores fortes. Você está no caminho certo.",
  },
  {
    messageId: "PAIN_01", situation: "pain", intent: "protect", tone: "protective", density: "medium",
    role: "canonical", source: "san_run_existing",
    canonical: "Dor é um sinal. Vamos ouvir o que seu corpo está dizendo e ajustar o plano com sabedoria.",
  },
  {
    messageId: "RECOVERY_01", situation: "recovery", intent: "explain", tone: "calm", density: "medium",
    role: "canonical", source: "san_run_existing",
    canonical: "Recuperação é onde o crescimento acontece. Respeite o descanso tanto quanto o treino.",
  },
  {
    messageId: "ACHIEVEMENT_01", situation: "achievement", intent: "celebrate", tone: "celebratory", density: "low",
    role: "signature", source: "san_run_existing",
    canonical: "Você conseguiu! Isso é só o começo. Você é mais forte do que imaginava.",
  },
  {
    messageId: "ADVANCE_01", situation: "advance", intent: "celebrate", tone: "celebratory", density: "low",
    decision: "advance", role: "canonical", source: "operational_definition",
    canonical: "Você avançou. Seu corpo e sua mente estão prontos para o próximo desafio.",
  },
  {
    messageId: "CONSOLIDATE_01", situation: "consolidate", intent: "consolidate", tone: "calm", density: "medium",
    decision: "consolidate", role: "canonical", source: "operational_definition",
    canonical: "Vamos consolidar essa base. Mais uma semana de treinos bem executados e você estará ainda mais forte.",
  },
  {
    messageId: "ADAPT_01", situation: "adapt", intent: "guide", tone: "calm", density: "medium",
    decision: "adapt", role: "canonical", source: "operational_definition",
    canonical: "Vamos adaptar o plano. Flexibilidade é inteligência de treinamento.",
  },
  {
    messageId: "REGRESS_1_01", situation: "regress_1", intent: "protect", tone: "protective", density: "medium",
    decision: "regress_1", role: "canonical", source: "operational_definition",
    canonical: "Vamos voltar um passo. Isso não é derrota — é sabedoria de treinamento.",
  },
  {
    messageId: "REGRESS_2_01", situation: "regress_2", intent: "protect", tone: "protective", density: "high",
    decision: "regress_2", role: "canonical", source: "operational_definition",
    canonical: "Precisamos reconstruir a base com cuidado. Isso é proteção e estratégia, não um passo para trás.",
  },
  {
    messageId: "NOT_DONE_01", situation: "not_done", intent: "understand", tone: "warm", density: "low",
    decision: "not_done", role: "canonical", source: "operational_definition",
    canonical: "O treino não foi realizado. Sem problema. Vamos tentar novamente.",
  },
  {
    messageId: "CORRECTION_01", situation: "correction", intent: "correct", tone: "firm", density: "medium",
    role: "canonical", source: "san_run_existing",
    canonical: "Vamos ajustar a técnica. Pequenas correções agora evitam grandes problemas depois.",
  },
  {
    messageId: "DISCOURAGEMENT_01", situation: "discouragement", intent: "encourage", tone: "encouraging", density: "medium",
    role: "canonical", source: "san_run_existing",
    canonical: "Desânimo é passageiro. Você já superou coisas mais difíceis. Vamos seguir juntos.",
  },
  {
    messageId: "QUIT_01", situation: "quit", intent: "invite_reflection", tone: "reflective", density: "medium",
    role: "canonical", source: "san_run_existing",
    canonical: "Antes de desistir, vamos conversar. Qual é o real obstáculo? Talvez a solução seja mais simples.",
  },
  {
    messageId: "RETURN_01", situation: "return", intent: "welcome", tone: "warm", density: "low",
    role: "canonical", source: "san_run_existing",
    canonical: "Você voltou. Isso é tudo o que importa. Vamos recomeçar de onde você está agora.",
  },
  {
    messageId: "AUTONOMY_01", situation: "autonomy", intent: "support_autonomy", tone: "reflective", density: "medium",
    role: "signature", source: "san_run_existing",
    canonical: "Você conhece seu corpo melhor do que ninguém. Confie em si mesmo. Eu estou aqui para apoiar, não para controlar.",
  },
];

export const SANRUN_MESSAGE_LIBRARY: ReadonlyMap<string, SANRunMessage> = new Map(
  MESSAGES.map((m) => [m.messageId, m] as const),
);
