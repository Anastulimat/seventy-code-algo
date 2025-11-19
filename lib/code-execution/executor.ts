import type { TestCase, SubmissionResult } from "@/types";

interface ExecutionResult {
    output: string;
    runtime: number;
    memory: number;
    error?: string;
}

/**
 * Service mock pour l'exécution de code
 * À remplacer par une vraie intégration Judge0 en production
 */
export class CodeExecutor {
    /**
     * Exécute le code contre un seul test case
     */
    static async executeTestCase(
        code: string,
        language: string,
        testCase: TestCase
    ): Promise<ExecutionResult> {
        // Simulation d'un délai d'exécution
        await this.delay(Math.random() * 500 + 200);

        // Mock : validation basique du code
        if (code.trim().length === 0) {
            return {
                output: "",
                runtime: 0,
                memory: 0,
                error: "Le code est vide",
            };
        }

        if (code.includes("throw") || code.includes("raise")) {
            return {
                output: "",
                runtime: Math.floor(Math.random() * 100),
                memory: Math.floor(Math.random() * 10000),
                error: "Runtime Error: Exception thrown",
            };
        }

        // Mock : simulation d'un résultat
        // En production, ici on appellerait Judge0 API
        const mockOutput = this.generateMockOutput(code, testCase, language);

        return {
            output: mockOutput,
            runtime: Math.floor(Math.random() * 100) + 10, // 10-110ms
            memory: Math.floor(Math.random() * 5000) + 5000, // 5-10MB en KB
        };
    }

    /**
     * Exécute le code contre plusieurs test cases
     */
    static async runTests(
        code: string,
        language: string,
        testCases: TestCase[]
    ): Promise<SubmissionResult> {
        let testsPassed = 0;
        const testsTotal = testCases.length;
        let totalRuntime = 0;
        let totalMemory = 0;
        let firstFailedTest: TestCase | null = null;
        let actualOutput: string | undefined;

        for (const testCase of testCases) {
            try {
                const result = await this.executeTestCase(code, language, testCase);

                if (result.error) {
                    return {
                        status: "RUNTIME_ERROR",
                        testsPassed,
                        testsTotal,
                        errorMessage: result.error,
                    };
                }

                totalRuntime += result.runtime;
                totalMemory = Math.max(totalMemory, result.memory);

                // Comparer les sorties
                const passed = this.compareOutputs(result.output, testCase.expectedOutput);

                if (passed) {
                    testsPassed++;
                } else if (!firstFailedTest) {
                    firstFailedTest = testCase;
                    actualOutput = result.output;
                }
            } catch (error) {
                return {
                    status: "RUNTIME_ERROR",
                    testsPassed,
                    testsTotal,
                    errorMessage: error instanceof Error ? error.message : "Erreur inconnue",
                };
            }
        }

        // Déterminer le statut final
        if (testsPassed === testsTotal) {
            return {
                status: "ACCEPTED",
                runtime: Math.floor(totalRuntime / testsTotal),
                memory: totalMemory,
                testsPassed,
                testsTotal,
            };
        } else {
            return {
                status: "WRONG_ANSWER",
                runtime: Math.floor(totalRuntime / testsTotal),
                memory: totalMemory,
                testsPassed,
                testsTotal,
                failedTestCase: firstFailedTest
                    ? {
                        input: firstFailedTest.input,
                        expectedOutput: firstFailedTest.expectedOutput,
                        actualOutput: actualOutput || "",
                    }
                    : undefined,
            };
        }
    }

    /**
     * Génère une sortie mock basée sur une logique simple
     * En production, ceci sera remplacé par l'exécution réelle
     */
    private static generateMockOutput(
        code: string,
        testCase: TestCase,
        language: string
    ): string {
        try {
            const input = JSON.parse(testCase.input);

            // Mock spécifique pour Two Sum
            if (code.includes("twoSum") || code.includes("two_sum")) {
                const { nums, target } = input;

                // Simulation d'une solution correcte avec 80% de chance
                const shouldPass = Math.random() > 0.2;

                if (shouldPass) {
                    // Retourner la bonne réponse
                    return testCase.expectedOutput;
                } else {
                    // Retourner une mauvaise réponse
                    return JSON.stringify([0, 0]);
                }
            }

            // Par défaut, retourner la sortie attendue
            return testCase.expectedOutput;
        } catch (error) {
            return "[]";
        }
    }

    /**
     * Compare deux sorties
     */
    private static compareOutputs(actual: string, expected: string): boolean {
        // Normaliser les espaces
        const normalizedActual = actual.trim().replace(/\s+/g, "");
        const normalizedExpected = expected.trim().replace(/\s+/g, "");

        return normalizedActual === normalizedExpected;
    }

    /**
     * Utilitaire pour simuler un délai
     */
    private static delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
