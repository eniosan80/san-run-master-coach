import { describe, it, expect } from "vitest";
import {
  evaluateThreeKProgression,
  type ThreeKProgressionInput,
  type ThreeKProgressionResult,
} from "./3KProgression";

describe("evaluateThreeKProgression", () => {
  const baseInput: ThreeKProgressionInput = {
    programId: "PROGRAM_3K_EXTENSION",
    stage: 1,
    sessionId: "3K-S1-T1",
    completed: true,
    actualPse: 5,
  };

  describe("Decisões fundamentais", () => {
    /**
     * Teste 1: Treino não realizado
     * Esperado: not_done, mantém stage e sessionId
     */
    it("deve retornar not_done quando completed === false", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        completed: false,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("not_done");
      expect(result.currentStage).toBe(1);
      expect(result.nextStage).toBe(1);
      expect(result.nextSessionId).toBe("3K-S1-T1");
      expect(result.reason).toContain("não foi realizado");
    });

    /**
     * Teste 2: Treino realizado sem PSE
     * Esperado: consolidate, mantém stage e sessionId
     */
    it("deve retornar consolidate quando completed === true && actualPse === undefined", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        actualPse: undefined,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("consolidate");
      expect(result.currentStage).toBe(1);
      expect(result.nextStage).toBe(1);
      expect(result.nextSessionId).toBe("3K-S1-T1");
      expect(result.reason).toContain("PSE não foi registrado");
    });

    /**
     * Teste 3: PSE === 0
     * Esperado: advance
     */
    it("deve retornar advance quando PSE === 0", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        actualPse: 0,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.nextSessionId).toBe("3K-S1-T2");
      expect(result.reason).toContain("PSE 0");
    });

    /**
     * Teste 4: PSE === 4
     * Esperado: advance
     */
    it("deve retornar advance quando PSE === 4", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        actualPse: 4,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.nextSessionId).toBe("3K-S1-T2");
    });

    /**
     * Teste 5: PSE === 5
     * Esperado: advance
     */
    it("deve retornar advance quando PSE === 5", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.nextSessionId).toBe("3K-S1-T2");
    });

    /**
     * Teste 6: PSE === 6
     * Esperado: advance
     */
    it("deve retornar advance quando PSE === 6", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        actualPse: 6,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.nextSessionId).toBe("3K-S1-T2");
    });

    /**
     * Teste 7: PSE === 7
     * Esperado: consolidate
     */
    it("deve retornar consolidate quando PSE === 7", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        actualPse: 7,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("consolidate");
      expect(result.currentStage).toBe(1);
      expect(result.nextStage).toBe(1);
      expect(result.nextSessionId).toBe("3K-S1-T1");
    });

    /**
     * Teste 8: PSE === 8
     * Esperado: consolidate
     */
    it("deve retornar consolidate quando PSE === 8", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        actualPse: 8,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("consolidate");
      expect(result.nextSessionId).toBe("3K-S1-T1");
    });

    /**
     * Teste 9: PSE === 10
     * Esperado: consolidate
     */
    it("deve retornar consolidate quando PSE === 10", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        actualPse: 10,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("consolidate");
      expect(result.nextSessionId).toBe("3K-S1-T1");
    });

    /**
     * Teste 10: Consolidate mantém a mesma sessão
     * Esperado: nextSessionId === currentSessionId
     */
    it("deve manter mesma sessão quando consolidate", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 3,
        sessionId: "3K-S3-T4",
        actualPse: 7,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("consolidate");
      expect(result.nextSessionId).toBe("3K-S3-T4");
      expect(result.currentStage).toBe(3);
      expect(result.nextStage).toBe(3);
    });
  });

  describe("Progressão dentro de Stage", () => {
    /**
     * Teste 11: S1-T1 → S1-T2
     * Esperado: advance, nextStage = 1
     */
    it("deve avançar S1-T1 para S1-T2", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 1,
        sessionId: "3K-S1-T1",
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.currentStage).toBe(1);
      expect(result.nextStage).toBe(1);
      expect(result.nextSessionId).toBe("3K-S1-T2");
    });

    /**
     * Teste 12: S1-T2 → S1-T3
     * Esperado: advance, nextStage = 1
     */
    it("deve avançar S1-T2 para S1-T3", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 1,
        sessionId: "3K-S1-T2",
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.currentStage).toBe(1);
      expect(result.nextStage).toBe(1);
      expect(result.nextSessionId).toBe("3K-S1-T3");
    });
  });

  describe("Transição entre Stages", () => {
    /**
     * Teste 13: S1-T3 → S2-T1 e nextStage = 2
     * Esperado: advance, currentStage = 1, nextStage = 2
     */
    it("deve avançar S1-T3 para S2-T1 e atualizar nextStage para 2", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 1,
        sessionId: "3K-S1-T3",
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.currentStage).toBe(1);
      expect(result.nextStage).toBe(2);
      expect(result.nextSessionId).toBe("3K-S2-T1");
    });

    /**
     * Teste 14: S2-T1 → S2-T2
     * Esperado: advance, nextStage = 2
     */
    it("deve avançar S2-T1 para S2-T2", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 2,
        sessionId: "3K-S2-T1",
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.currentStage).toBe(2);
      expect(result.nextStage).toBe(2);
      expect(result.nextSessionId).toBe("3K-S2-T2");
    });

    /**
     * Teste 15: S2-T2 → S2-T3
     * Esperado: advance, nextStage = 2
     */
    it("deve avançar S2-T2 para S2-T3", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 2,
        sessionId: "3K-S2-T2",
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.currentStage).toBe(2);
      expect(result.nextStage).toBe(2);
      expect(result.nextSessionId).toBe("3K-S2-T3");
    });

    /**
     * Teste 16: S2-T3 → S3-T1 e nextStage = 3
     * Esperado: advance, currentStage = 2, nextStage = 3
     */
    it("deve avançar S2-T3 para S3-T1 e atualizar nextStage para 3", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 2,
        sessionId: "3K-S2-T3",
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.currentStage).toBe(2);
      expect(result.nextStage).toBe(3);
      expect(result.nextSessionId).toBe("3K-S3-T1");
    });

    /**
     * Teste 17: S3-T1 → S3-T2
     * Esperado: advance, nextStage = 3
     */
    it("deve avançar S3-T1 para S3-T2", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 3,
        sessionId: "3K-S3-T1",
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.currentStage).toBe(3);
      expect(result.nextStage).toBe(3);
      expect(result.nextSessionId).toBe("3K-S3-T2");
    });

    /**
     * Teste 18: S3-T6 → S4-T1 e nextStage = 4
     * Esperado: advance, currentStage = 3, nextStage = 4
     */
    it("deve avançar S3-T6 para S4-T1 e atualizar nextStage para 4", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 3,
        sessionId: "3K-S3-T6",
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.currentStage).toBe(3);
      expect(result.nextStage).toBe(4);
      expect(result.nextSessionId).toBe("3K-S4-T1");
    });
  });

  describe("Stage 4 - Fim da extensão", () => {
    /**
     * Teste 19: S4-T1 → S4-T2
     * Esperado: advance, nextStage = 4
     */
    it("deve avançar S4-T1 para S4-T2", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 4,
        sessionId: "3K-S4-T1",
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.currentStage).toBe(4);
      expect(result.nextStage).toBe(4);
      expect(result.nextSessionId).toBe("3K-S4-T2");
    });

    /**
     * Teste 20: S4-T2 → null (fim da extensão)
     * Esperado: advance, nextSessionId = null, nextStage = 4
     */
    it("deve terminar em S4-T2 com nextSessionId = null", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 4,
        sessionId: "3K-S4-T2",
        actualPse: 5,
      };

      const result = evaluateThreeKProgression(input);

      expect(result.decision).toBe("advance");
      expect(result.currentStage).toBe(4);
      expect(result.nextStage).toBe(4);
      expect(result.nextSessionId).toBeNull();
      expect(result.reason).toContain("próxima sessão");
    });
  });

  describe("Validação de entrada", () => {
    /**
     * Teste 21: ProgramId inválido
     * Esperado: erro explícito
     */
    it("deve lançar erro quando programId é inválido", () => {
      const input: any = {
        programId: "PROGRAM_INVALID",
        stage: 1,
        sessionId: "3K-S1-T1",
        completed: true,
        actualPse: 5,
      };

      expect(() => evaluateThreeKProgression(input)).toThrow(
        /ProgramId inválido/
      );
    });

    /**
     * Teste 22: SessionId inválida para o stage
     * Esperado: erro explícito
     */
    it("deve lançar erro quando sessionId não pertence ao stage", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 1,
        sessionId: "3K-S2-T1", // S2 session mas stage 1
      };

      expect(() => evaluateThreeKProgression(input)).toThrow(
        /Session inválida para o Stage informado/
      );
    });
  });

  describe("Propriedades de determinismo", () => {
    /**
     * Teste 23: control/tolerated não alteram a decisão
     * Esperado: mesma decisão com e sem control/tolerated
     */
    it("deve ignorar control e tolerated na decisão", () => {
      const baseInputWithoutFlags: ThreeKProgressionInput = {
        ...baseInput,
        stage: 1,
        sessionId: "3K-S1-T1",
        actualPse: 7,
      };

      const inputWithFlags: ThreeKProgressionInput = {
        ...baseInputWithoutFlags,
        control: "borderline",
        tolerated: false,
      };

      const result1 = evaluateThreeKProgression(baseInputWithoutFlags);
      const result2 = evaluateThreeKProgression(inputWithFlags);


      expect(result1.decision).toBe(result2.decision);
      expect(result1.nextSessionId).toBe(result2.nextSessionId);
      expect(result1.nextStage).toBe(result2.nextStage);
    });

    /**
     * Teste 24: Determinismo - mesma entrada produz mesma saída
     * Esperado: múltiplas chamadas com mesma entrada produzem resultado idêntico
     */
    it("deve ser determinístico: mesma entrada = mesma saída", () => {
      const input: ThreeKProgressionInput = {
        ...baseInput,
        stage: 2,
        sessionId: "3K-S2-T3",
        actualPse: 4,
      };

      const result1 = evaluateThreeKProgression(input);
      const result2 = evaluateThreeKProgression(input);
      const result3 = evaluateThreeKProgression(input);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });
});
