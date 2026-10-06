import { describe, test, expect } from "bun:test";
import { SANRUN_MESSAGE_LIBRARY } from "./SANRunMessageLibrary";
import { selectMentorMessage } from "./SANRunMessageSelector";
import { validateSANRunMessage } from "./SANRunMessageValidator";
import type { MentorSituation } from "./types";

const ALL_SITUATIONS: MentorSituation[] = [
  "welcome", "fear", "anxiety", "missed_workout", "incomplete_workout",
  "difficult_workout", "pain", "recovery", "achievement", "advance",
  "consolidate", "adapt", "regress_1", "regress_2", "not_done",
  "correction", "discouragement", "quit", "return", "autonomy",
];

const validBase = {
  messageId: "TEST_01",
  situation: "advance",
  intent: "celebrate",
  tone: "celebratory",
  density: "low",
  canonical: "Você avançou.",
  role: "canonical",
  source: "operational_definition",
};

describe("SAN RUN Message Layer V1.0", () => {
  describe("Biblioteca", () => {
    test("1. contém exatamente 21 mensagens", () => {
      expect(SANRUN_MESSAGE_LIBRARY.size).toBe(21);
    });

    test("2. cobre exatamente as 20 situações únicas", () => {
      const situations = new Set(Array.from(SANRUN_MESSAGE_LIBRARY.values()).map((m) => m.situation));
      expect(situations.size).toBe(20);
      for (const s of ALL_SITUATIONS) expect(situations.has(s)).toBe(true);
    });

    test("3. a chave do Map é igual ao messageId de cada mensagem", () => {
      for (const [key, msg] of SANRUN_MESSAGE_LIBRARY) expect(msg.messageId).toBe(key);
    });

    test("4. todas as 21 mensagens passam no validador", () => {
      for (const msg of SANRUN_MESSAGE_LIBRARY.values()) {
        const result = validateSANRunMessage(msg);
        expect(result.violations).toEqual([]);
        expect(result.valid).toBe(true);
      }
    });

    test("5. nenhuma mensagem contém a palavra fracasso", () => {
      for (const msg of SANRUN_MESSAGE_LIBRARY.values()) {
        expect(msg.canonical.toLowerCase()).not.toContain("fracasso");
      }
    });

    test("6. WELCOME_01 e WELCOME_02 são as únicas mensagens de welcome", () => {
      const ids = Array.from(SANRUN_MESSAGE_LIBRARY.values())
        .filter((m) => m.situation === "welcome")
        .map((m) => m.messageId);
      expect(ids).toEqual(["WELCOME_01", "WELCOME_02"]);
    });
  });

  describe("Seletor", () => {
    test("7. welcome sem histórico retorna WELCOME_01", () => {
      expect(selectMentorMessage({ situation: "welcome" }).messageId).toBe("WELCOME_01");
    });

    test("8. welcome com recentMessageIds [WELCOME_01] retorna WELCOME_02", () => {
      const result = selectMentorMessage({ situation: "welcome", recentMessageIds: ["WELCOME_01"] });
      expect(result.messageId).toBe("WELCOME_02");
    });

    test("9. welcome com ambas recentes retorna WELCOME_01 (sem randomização)", () => {
      const result = selectMentorMessage({
        situation: "welcome",
        recentMessageIds: ["WELCOME_01", "WELCOME_02"],
      });
      expect(result.messageId).toBe("WELCOME_01");
    });

    test("10. cada uma das 20 situações retorna mensagem da própria situação", () => {
      for (const situation of ALL_SITUATIONS) {
        expect(selectMentorMessage({ situation }).situation).toBe(situation);
      }
    });

    test("11. é determinístico: mesma entrada produz mesma saída", () => {
      const input = { situation: "fear" as const, emotionalContext: "frustrated" as const };
      const first = selectMentorMessage(input);
      for (let i = 0; i < 10; i++) expect(selectMentorMessage(input)).toEqual(first);
    });

    test("12. painReported tem prioridade e seleciona PAIN_01", () => {
      const result = selectMentorMessage({ situation: "advance", painReported: true });
      expect(result.messageId).toBe("PAIN_01");
      expect(result.situation).toBe("pain");
    });

    test("13. achievement + frustrated => tone calm", () => {
      const result = selectMentorMessage({ situation: "achievement", emotionalContext: "frustrated" });
      expect(result.tone).toBe("calm");
    });

    test("14. achievement + frustrated => density low ou medium", () => {
      const result = selectMentorMessage({ situation: "achievement", emotionalContext: "frustrated" });
      expect(["low", "medium"]).toContain(result.density);
    });

    test("15. achievement + frustrated => messageId preservado", () => {
      const result = selectMentorMessage({ situation: "achievement", emotionalContext: "frustrated" });
      expect(result.messageId).toBe("ACHIEVEMENT_01");
    });

    test("16. achievement + frustrated => canonical, intent, role e situation preservados", () => {
      const original = selectMentorMessage({ situation: "achievement" });
      const result = selectMentorMessage({ situation: "achievement", emotionalContext: "frustrated" });
      expect(result.canonical).toBe(original.canonical);
      expect(result.intent).toBe(original.intent);
      expect(result.role).toBe(original.role);
      expect(result.situation).toBe(original.situation);
    });

    test("17. frustrated com density high (regress_2) => tone calm e density medium", () => {
      const result = selectMentorMessage({ situation: "regress_2", emotionalContext: "frustrated" });
      expect(result.messageId).toBe("REGRESS_2_01");
      expect(result.tone).toBe("calm");
      expect(result.density).toBe("medium");
    });

    test("18. painReported + frustrated => PAIN_01 com tone calm e canonical original", () => {
      const result = selectMentorMessage({
        situation: "advance",
        painReported: true,
        emotionalContext: "frustrated",
      });
      expect(result.messageId).toBe("PAIN_01");
      expect(result.situation).toBe("pain");
      expect(result.tone).toBe("calm");
      expect(["low", "medium"]).toContain(result.density);
      expect(result.canonical).toBe(SANRUN_MESSAGE_LIBRARY.get("PAIN_01")?.canonical);
    });

    test("19. sem frustrated o tone original é mantido (achievement => celebratory)", () => {
      const result = selectMentorMessage({ situation: "achievement", emotionalContext: "neutral" });
      expect(result.tone).toBe("celebratory");
    });

    test("20. situação inválida lança erro", () => {
      const invalid = "banana" as unknown as MentorSituation;
      expect(() => selectMentorMessage({ situation: invalid })).toThrow();
    });
  });

  describe("Validador", () => {
    test("21. rejeita entrada que não é objeto", () => {
      expect(validateSANRunMessage(null).valid).toBe(false);
      expect(validateSANRunMessage("texto").valid).toBe(false);
      expect(validateSANRunMessage([]).valid).toBe(false);
    });

    test("22. rejeita situation inválida", () => {
      const result = validateSANRunMessage({ ...validBase, situation: "banana" });
      expect(result.valid).toBe(false);
      expect(result.violations).toContain("situation inválida");
    });

    test("23. rejeita intent inválido", () => {
      const result = validateSANRunMessage({ ...validBase, intent: "xyz" });
      expect(result.valid).toBe(false);
      expect(result.violations).toContain("intent inválido");
    });

    test("24. rejeita tone inválido", () => {
      const result = validateSANRunMessage({ ...validBase, tone: "purple" });
      expect(result.valid).toBe(false);
      expect(result.violations).toContain("tone inválido");
    });

    test("25. rejeita density inválida", () => {
      const result = validateSANRunMessage({ ...validBase, density: "gigantic" });
      expect(result.valid).toBe(false);
      expect(result.violations).toContain("density inválida");
    });

    test("26. rejeita role e source inválidos", () => {
      const result = validateSANRunMessage({ ...validBase, role: "invalid", source: "unknown" });
      expect(result.valid).toBe(false);
      expect(result.violations).toContain("role inválido");
      expect(result.violations).toContain("source inválido");
    });

    test("27. rejeita decision inválida e aceita decision válida ou ausente", () => {
      const wrong = validateSANRunMessage({ ...validBase, decision: "wrong" });
      expect(wrong.valid).toBe(false);
      expect(wrong.violations).toContain("decision inválida");
      expect(validateSANRunMessage({ ...validBase, decision: "advance" }).valid).toBe(true);
      expect(validateSANRunMessage(validBase).valid).toBe(true);
    });

    test("28. rejeita canonical com mais de um '?' e aceita exatamente um", () => {
      const two = validateSANRunMessage({ ...validBase, canonical: "Está bem? Pronto para correr?" });
      expect(two.valid).toBe(false);
      expect(two.violations).toContain("canonical deve conter no máximo 1 caractere '?'");
      expect(validateSANRunMessage({ ...validBase, canonical: "Está bem?" }).valid).toBe(true);
    });

    test("29. rejeita canonical com '?' quando questions está definido", () => {
      const result = validateSANRunMessage({
        ...validBase,
        canonical: "Está bem?",
        questions: ["Como você se sente?"],
      });
      expect(result.valid).toBe(false);
      expect(result.violations).toContain("canonical com '?' não pode ter questions definido");
      const withoutMark = validateSANRunMessage({ ...validBase, questions: ["Como você se sente?"] });
      expect(withoutMark.valid).toBe(true);
    });

    test("30. rejeita questions que não seja array de strings", () => {
      const notArray = validateSANRunMessage({ ...validBase, questions: "texto" });
      expect(notArray.violations).toContain("questions deve ser undefined ou array");
      const notStrings = validateSANRunMessage({ ...validBase, questions: ["ok", 42] });
      expect(notStrings.violations).toContain("todos os elementos de questions devem ser string");
    });
  });
});
