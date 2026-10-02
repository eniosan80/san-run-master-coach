import { describe, it, expect } from "bun:test";
import {
  createAthleteProgramState,
  applyProgressionToAthleteProgramState,
  type AthleteProgramState,
  type GenericProgression,
} from "./AthleteProgramState";

describe("AthleteProgramState", () => {
  describe("createAthleteProgramState", () => {
    /**
     * Teste 1: Criação de estado inicial
     */
    it("deve criar um estado inicial válido", () => {
      const state = createAthleteProgramState({
        athleteId: "athlete-001",
        programId: "PROGRAM_3K_EXTENSION",
        sessionsPerWeek: 3,
        currentStage: 1,
        currentSessionId: "3K-S1-T1",
        startedAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      });

      expect(state.athleteId).toBe("athlete-001");
      expect(state.programId).toBe("PROGRAM_3K_EXTENSION");
      expect(state.status).toBe("active");
      expect(state.sessionsPerWeek).toBe(3);
      expect(state.currentStage).toBe(1);
      expect(state.currentSessionId).toBe("3K-S1-T1");
      expect(state.sourceProgramId).toBeUndefined();
      expect(state.startedAt).toBe("2025-01-01T00:00:00Z");
      expect(state.updatedAt).toBe("2025-01-01T00:00:00Z");
    });

    /**
     * Teste 2: Criação com sourceProgramId
     */
    it("deve criar um estado com sourceProgramId", () => {
      const state = createAthleteProgramState({
        athleteId: "athlete-002",
        programId: "PROGRAM_3K_EXTENSION",
        sessionsPerWeek: 3,
        currentStage: 1,
        currentSessionId: "3K-S1-T1",
        sourceProgramId: "2K_CONTINUOUS_2X",
        startedAt: "2025-01-15T00:00:00Z",
        updatedAt: "2025-01-15T00:00:00Z",
      });

      expect(state.sourceProgramId).toBe("2K_CONTINUOUS_2X");
      expect(state.programId).toBe("PROGRAM_3K_EXTENSION");
    });

    /**
     * Teste 3: athleteId vazio deve gerar erro
     */
    it("deve lançar erro quando athleteId está vazio", () => {
      expect(() => {
        createAthleteProgramState({
          athleteId: "",
          programId: "PROGRAM_3K_EXTENSION",
          sessionsPerWeek: 3,
          currentStage: 1,
          currentSessionId: "3K-S1-T1",
          startedAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        });
      }).toThrow("athleteId não pode estar vazio");
    });

    /**
     * Teste 4: programId vazio deve gerar erro
     */
    it("deve lançar erro quando programId está vazio", () => {
      expect(() => {
        createAthleteProgramState({
          athleteId: "athlete-001",
          programId: "",
          sessionsPerWeek: 3,
          currentStage: 1,
          currentSessionId: "3K-S1-T1",
          startedAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        });
      }).toThrow("programId não pode estar vazio");
    });

    /**
     * Teste 5: currentSessionId vazio deve gerar erro
     */
    it("deve lançar erro quando currentSessionId está vazio", () => {
      expect(() => {
        createAthleteProgramState({
          athleteId: "athlete-001",
          programId: "PROGRAM_3K_EXTENSION",
          sessionsPerWeek: 3,
          currentStage: 1,
          currentSessionId: "",
          startedAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        });
      }).toThrow("currentSessionId não pode estar vazio");
    });

    /**
     * Teste 6: sessionsPerWeek inválido deve gerar erro
     */
    it("deve lançar erro quando sessionsPerWeek não é 2 ou 3", () => {
      expect(() => {
        createAthleteProgramState({
          athleteId: "athlete-001",
          programId: "PROGRAM_3K_EXTENSION",
          sessionsPerWeek: 4 as any,
          currentStage: 1,
          currentSessionId: "3K-S1-T1",
          startedAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        });
      }).toThrow("sessionsPerWeek deve ser 2 ou 3");
    });

    /**
     * Teste 7: currentStage inválido deve gerar erro
     */
    it("deve lançar erro quando currentStage < 1", () => {
      expect(() => {
        createAthleteProgramState({
          athleteId: "athlete-001",
          programId: "PROGRAM_3K_EXTENSION",
          sessionsPerWeek: 3,
          currentStage: 0,
          currentSessionId: "3K-S1-T1",
          startedAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        });
      }).toThrow("currentStage deve ser >= 1");
    });

    /**
     * Teste 8: startedAt vazio deve gerar erro
     */
    it("deve lançar erro quando startedAt está vazio", () => {
      expect(() => {
        createAthleteProgramState({
          athleteId: "athlete-001",
          programId: "PROGRAM_3K_EXTENSION",
          sessionsPerWeek: 3,
          currentStage: 1,
          currentSessionId: "3K-S1-T1",
          startedAt: "",
          updatedAt: "2025-01-01T00:00:00Z",
        });
      }).toThrow("startedAt não pode estar vazio");
    });

    /**
     * Teste 9: updatedAt vazio deve gerar erro
     */
    it("deve lançar erro quando updatedAt está vazio", () => {
      expect(() => {
        createAthleteProgramState({
          athleteId: "athlete-001",
          programId: "PROGRAM_3K_EXTENSION",
          sessionsPerWeek: 3,
          currentStage: 1,
          currentSessionId: "3K-S1-T1",
          startedAt: "2025-01-01T00:00:00Z",
          updatedAt: "",
        });
      }).toThrow("updatedAt não pode estar vazio");
    });

    /**
     * Teste 10: Mesma entrada produz mesma saída
     */
    it("deve ser determinístico: mesma entrada produz mesma saída", () => {
      const input = {
        athleteId: "athlete-001",
        programId: "PROGRAM_3K_EXTENSION",
        sessionsPerWeek: 3 as const,
        currentStage: 1,
        currentSessionId: "3K-S1-T1",
        sourceProgramId: "2K_CONTINUOUS_2X",
        startedAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      };

      const state1 = createAthleteProgramState(input);
      const state2 = createAthleteProgramState(input);

      expect(state1).toEqual(state2);
    });
  });

  describe("applyProgressionToAthleteProgramState", () => {
    const baseState: AthleteProgramState = {
      athleteId: "athlete-001",
      programId: "PROGRAM_3K_EXTENSION",
      status: "active",
      sessionsPerWeek: 3,
      currentStage: 1,
      currentSessionId: "3K-S1-T1",
      sourceProgramId: "2K_CONTINUOUS_2X",
      startedAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    };

    /**
     * Teste 11: advance atualiza stage e session
     */
    it("deve atualizar stage e session quando decision === advance", () => {
      const progression: GenericProgression = {
        decision: "advance",
        nextStage: 1,
        nextSessionId: "3K-S1-T2",
      };

      const result = applyProgressionToAthleteProgramState(baseState, progression);

      expect(result.currentStage).toBe(1);
      expect(result.currentSessionId).toBe("3K-S1-T2");
      expect(result.status).toBe("active");
    });

    /**
     * Teste 12: consolidate mantém stage e session
     */
    it("deve manter stage e session quando decision === consolidate", () => {
      const progression: GenericProgression = {
        decision: "consolidate",
        nextStage: 1,
        nextSessionId: "3K-S1-T1",
      };

      const result = applyProgressionToAthleteProgramState(baseState, progression);

      expect(result.currentStage).toBe(1);
      expect(result.currentSessionId).toBe("3K-S1-T1");
      expect(result.status).toBe("active");
    });

    /**
     * Teste 13: not_done mantém stage e session
     */
    it("deve manter stage e session quando decision === not_done", () => {
      const progression: GenericProgression = {
        decision: "not_done",
        nextStage: 1,
        nextSessionId: "3K-S1-T1",
      };

      const result = applyProgressionToAthleteProgramState(baseState, progression);

      expect(result.currentStage).toBe(1);
      expect(result.currentSessionId).toBe("3K-S1-T1");
      expect(result.status).toBe("active");
    });

    /**
     * Teste 14: advance com nextSessionId null marca como completed
     */
    it("deve marcar como completed quando advance e nextSessionId === null", () => {
      const progression: GenericProgression = {
        decision: "advance",
        nextStage: 4,
        nextSessionId: null,
      };

      const result = applyProgressionToAthleteProgramState(baseState, progression);

      expect(result.status).toBe("completed");
      expect(result.currentStage).toBe(1);
      expect(result.currentSessionId).toBe("3K-S1-T1");
    });

    /**
     * Teste 15: sourceProgramId permanece imutável
     */
    it("deve manter sourceProgramId imutável após progressão", () => {
      const progression: GenericProgression = {
        decision: "advance",
        nextStage: 1,
        nextSessionId: "3K-S1-T2",
      };

      const result = applyProgressionToAthleteProgramState(baseState, progression);

      expect(result.sourceProgramId).toBe("2K_CONTINUOUS_2X");
    });

    /**
     * Teste 16: Estado original não é mutado
     */
    it("não deve mutar o estado original", () => {
      const originalState = { ...baseState };
      const progression: GenericProgression = {
        decision: "advance",
        nextStage: 2,
        nextSessionId: "3K-S2-T1",
      };

      applyProgressionToAthleteProgramState(baseState, progression);

      expect(baseState).toEqual(originalState);
    });

    /**
     * Teste 17: Estado paused gera erro
     */
    it("deve lançar erro ao tentar aplicar progressão em estado paused", () => {
      const pausedState: AthleteProgramState = {
        ...baseState,
        status: "paused",
      };

      const progression: GenericProgression = {
        decision: "advance",
        nextStage: 1,
        nextSessionId: "3K-S1-T2",
      };

      expect(() => {
        applyProgressionToAthleteProgramState(pausedState, progression);
      }).toThrow("Não é possível aplicar progressão a um programa pausado");
    });

    /**
     * Teste 18: Estado completed gera erro
     */
    it("deve lançar erro ao tentar aplicar progressão em estado completed", () => {
      const completedState: AthleteProgramState = {
        ...baseState,
        status: "completed",
      };

      const progression: GenericProgression = {
        decision: "advance",
        nextStage: 1,
        nextSessionId: "3K-S1-T2",
      };

      expect(() => {
        applyProgressionToAthleteProgramState(completedState, progression);
      }).toThrow("Não é possível aplicar progressão a um programa completado");
    });

    /**
     * Teste 19: control não altera a decisão em V1
     */
    it("não deve alterar decisão quando progressão contém control", () => {
      const progressionWithControl: GenericProgression & { control: "controlled" | "borderline" | "poor" } = {
        decision: "advance",
        nextStage: 1,
        nextSessionId: "3K-S1-T2",
        control: "poor",
      };

      const progressionWithoutControl: GenericProgression = {
        decision: "advance",
        nextStage: 1,
        nextSessionId: "3K-S1-T2",
      };

      const resultWith = applyProgressionToAthleteProgramState(baseState, progressionWithControl);
      const resultWithout = applyProgressionToAthleteProgramState(baseState, progressionWithoutControl);

      expect(resultWith.currentStage).toBe(resultWithout.currentStage);
      expect(resultWith.currentSessionId).toBe(resultWithout.currentSessionId);
      expect(resultWith.status).toBe(resultWithout.status);
    });

    /**
     * Teste 20: tolerated não altera a decisão em V1
     */
    it("não deve alterar decisão quando progressão contém tolerated", () => {
      const progressionWithTolerated: GenericProgression & { tolerated: boolean } = {
        decision: "advance",
        nextStage: 1,
        nextSessionId: "3K-S1-T2",
        tolerated: true,
      };

      const progressionWithoutTolerated: GenericProgression = {
        decision: "advance",
        nextStage: 1,
        nextSessionId: "3K-S1-T2",
      };

      const resultWith = applyProgressionToAthleteProgramState(baseState, progressionWithTolerated);
      const resultWithout = applyProgressionToAthleteProgramState(baseState, progressionWithoutTolerated);

      expect(resultWith.currentStage).toBe(resultWithout.currentStage);
      expect(resultWith.currentSessionId).toBe(resultWithout.currentSessionId);
      expect(resultWith.status).toBe(resultWithout.status);
    });

    describe("Conceitual: Transição genérica 2K → 3K", () => {
      /**
       * Teste 21: Um estado com sourceProgramId = 2K pode avançar para 3K
       * sem nenhuma lógica especial de 2K/3K no contrato
       */
      it("deve permitir transição genérica de 2K para 3K sem lógica específica", () => {
        // Estado que representa um atleta que veio de 2K e agora está em 3K
        const stateAfter2KCompletion: AthleteProgramState = {
          athleteId: "athlete-001",
          programId: "PROGRAM_3K_EXTENSION",
          status: "active",
          sessionsPerWeek: 3,
          currentStage: 1,
          currentSessionId: "3K-S1-T1",
          sourceProgramId: "2K_CONTINUOUS_2X", // Veio de 2K
          startedAt: "2025-01-15T00:00:00Z",
          updatedAt: "2025-01-15T00:00:00Z",
        };

        // Aplicar uma progressão genérica (sem conhecer 2K ou 3K)
        const progression: GenericProgression = {
          decision: "advance",
          nextStage: 1,
          nextSessionId: "3K-S1-T2",
        };

        const result = applyProgressionToAthleteProgramState(
          stateAfter2KCompletion,
          progression
        );

        // O contrato não precisa saber sobre 2K ou 3K
        // Apenas aplicou a progressão de forma genérica
        expect(result.programId).toBe("PROGRAM_3K_EXTENSION");
        expect(result.sourceProgramId).toBe("2K_CONTINUOUS_2X");
        expect(result.currentSessionId).toBe("3K-S1-T2");
        expect(result.status).toBe("active");
      });

      /**
       * Teste 22: Determinismo: mesma entrada produz mesma saída
       */
      it("deve ser determinístico em applyProgression: mesma entrada produz mesma saída", () => {
        const progression: GenericProgression = {
          decision: "advance",
          nextStage: 1,
          nextSessionId: "3K-S1-T2",
        };

        const result1 = applyProgressionToAthleteProgramState(baseState, progression);
        const result2 = applyProgressionToAthleteProgramState(baseState, progression);

        expect(result1).toEqual(result2);
      });
    });
  });
});
