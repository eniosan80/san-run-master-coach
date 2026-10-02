import { describe, it, expect } from "vitest";
import {
  evaluateTwoKTransition,
  type TwoKTransitionInput,
  type TwoKTransitionResult,
} from "./2KTo3K";

describe("evaluateTwoKTransition", () => {
  /**
   * Teste 1: Treino não realizado
   * Esperado: not_done, targetProgramId: null
   */
  it("deve retornar not_done quando completed === false", () => {
    const input: TwoKTransitionInput = {
      sourceProgramId: "2K_CONTINUOUS",
      completed: false,
      objective: {
        achieved: false,
        continuous: false,
      },
      actualPse: undefined,
    };

    const result = evaluateTwoKTransition(input);

    expect(result.decision).toBe("not_done");
    expect(result.targetProgramId).toBeNull();
    expect(result.reason).toContain("não foi realizado");
  });

  /**
   * Teste 2: Treino realizado mas sem continuidade
   * Esperado: not_achieved, targetProgramId: null
   */
  it("deve retornar not_achieved quando completed === true && continuous === false", () => {
    const input: TwoKTransitionInput = {
      sourceProgramId: "2K_CONTINUOUS",
      completed: true,
      objective: {
        achieved: true,
        continuous: false,
        durationSeconds: 90,
        distanceKm: 1.8,
      },
      actualPse: 5,
    };

    const result = evaluateTwoKTransition(input);

    expect(result.decision).toBe("not_achieved");
    expect(result.targetProgramId).toBeNull();
    expect(result.reason).toContain("não foi contínuo");
  });

  /**
   * Teste 3: Treino realizado e contínuo mas objetivo não atingido
   * Esperado: not_achieved, targetProgramId: null
   */
  it("deve retornar not_achieved quando completed === true && achieved === false", () => {
    const input: TwoKTransitionInput = {
      sourceProgramId: "2K_CONTINUOUS_2X",
      completed: true,
      objective: {
        achieved: false,
        continuous: true,
        durationSeconds: 90,
        distanceKm: 1.5,
      },
      actualPse: 5,
    };

    const result = evaluateTwoKTransition(input);

    expect(result.decision).toBe("not_achieved");
    expect(result.targetProgramId).toBeNull();
    expect(result.reason).toContain("não atingiu");
  });

  /**
   * Teste 4: Objetivo realizado sem PSE registrado
   * Esperado: consolidate_2k, targetProgramId: null
   */
  it("deve retornar consolidate_2k quando objetivo atingido mas PSE === undefined", () => {
    const input: TwoKTransitionInput = {
      sourceProgramId: "2K_CONTINUOUS",
      completed: true,
      objective: {
        achieved: true,
        continuous: true,
        durationSeconds: 120,
        distanceKm: 2.0,
      },
      actualPse: undefined,
    };

    const result = evaluateTwoKTransition(input);

    expect(result.decision).toBe("consolidate_2k");
    expect(result.targetProgramId).toBeNull();
    expect(result.reason).toContain("PSE não foi registrado");
  });

  /**
   * Teste 5: Objetivo realizado com PSE 7 (tolerância baixa)
   * Esperado: consolidate_2k, targetProgramId: null
   */
  it("deve retornar consolidate_2k quando PSE === 7", () => {
    const input: TwoKTransitionInput = {
      sourceProgramId: "2K_CONTINUOUS_2X",
      completed: true,
      objective: {
        achieved: true,
        continuous: true,
        durationSeconds: 120,
        distanceKm: 2.0,
      },
      actualPse: 7,
    };

    const result = evaluateTwoKTransition(input);

    expect(result.decision).toBe("consolidate_2k");
    expect(result.targetProgramId).toBeNull();
    expect(result.reason).toContain("PSE 7");
    expect(result.reason).toContain("tolerância baixa");
  });

  /**
   * Teste 6: Objetivo realizado com PSE 5 (tolerância ótima)
   * Esperado: advance_to_3k, targetProgramId: "PROGRAM_3K_EXTENSION"
   */
  it("deve retornar advance_to_3k quando PSE === 5", () => {
    const input: TwoKTransitionInput = {
      sourceProgramId: "2K_CONTINUOUS",
      completed: true,
      objective: {
        achieved: true,
        continuous: true,
        durationSeconds: 120,
        distanceKm: 2.0,
      },
      actualPse: 5,
    };

    const result = evaluateTwoKTransition(input);

    expect(result.decision).toBe("advance_to_3k");
    expect(result.targetProgramId).toBe("PROGRAM_3K_EXTENSION");
    expect(result.reason).toContain("PSE 5");
    expect(result.reason).toContain("tolerância ótima");
  });

  /**
   * Teste 7: Objetivo realizado com PSE 4 (tolerância excelente)
   * Esperado: advance_to_3k, targetProgramId: "PROGRAM_3K_EXTENSION"
   */
  it("deve retornar advance_to_3k quando PSE === 4", () => {
    const input: TwoKTransitionInput = {
      sourceProgramId: "2K_CONTINUOUS_2X",
      completed: true,
      objective: {
        achieved: true,
        continuous: true,
        durationSeconds: 120,
        distanceKm: 2.0,
      },
      actualPse: 4,
    };

    const result = evaluateTwoKTransition(input);

    expect(result.decision).toBe("advance_to_3k");
    expect(result.targetProgramId).toBe("PROGRAM_3K_EXTENSION");
    expect(result.reason).toContain("PSE 4");
    expect(result.reason).toContain("tolerância excelente");
  });

  describe("Edge cases adicionais", () => {
    it("deve retornar advance_to_3k quando PSE === 6 (limite superior ótimo)", () => {
      const input: TwoKTransitionInput = {
        sourceProgramId: "2K_CONTINUOUS",
        completed: true,
        objective: { achieved: true, continuous: true },
        actualPse: 6,
      };

      const result = evaluateTwoKTransition(input);
      expect(result.decision).toBe("advance_to_3k");
      expect(result.targetProgramId).toBe("PROGRAM_3K_EXTENSION");
    });

    it("deve retornar consolidate_2k quando PSE === 8 (bem acima do limite)", () => {
      const input: TwoKTransitionInput = {
        sourceProgramId: "2K_CONTINUOUS_2X",
        completed: true,
        objective: { achieved: true, continuous: true },
        actualPse: 8,
      };

      const result = evaluateTwoKTransition(input);
      expect(result.decision).toBe("consolidate_2k");
      expect(result.targetProgramId).toBeNull();
    });

    it("deve retornar advance_to_3k quando PSE === 0 (mínimo teórico)", () => {
      const input: TwoKTransitionInput = {
        sourceProgramId: "2K_CONTINUOUS",
        completed: true,
        objective: { achieved: true, continuous: true },
        actualPse: 0,
      };

      const result = evaluateTwoKTransition(input);
      expect(result.decision).toBe("advance_to_3k");
      expect(result.targetProgramId).toBe("PROGRAM_3K_EXTENSION");
    });

    it("deve aceitar ambos os programas 2K (CONTINUOUS e 2X)", () => {
      const input1: TwoKTransitionInput = {
        sourceProgramId: "2K_CONTINUOUS",
        completed: true,
        objective: { achieved: true, continuous: true },
        actualPse: 5,
      };

      const input2: TwoKTransitionInput = {
        sourceProgramId: "2K_CONTINUOUS_2X",
        completed: true,
        objective: { achieved: true, continuous: true },
        actualPse: 5,
      };

      const result1 = evaluateTwoKTransition(input1);
      const result2 = evaluateTwoKTransition(input2);

      expect(result1.decision).toBe("advance_to_3k");
      expect(result2.decision).toBe("advance_to_3k");
    });
  });
});
