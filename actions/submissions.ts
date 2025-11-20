// actions/submissions.ts
"use server";

import { executeCode } from "@/lib/piston";
import { LANGUAGE_VERSIONS } from "@/lib/language-versions";
import { Language, SubmissionStatus } from "@/lib/generated/prisma/enums";
import { SubmissionResult } from "@/types";
import {prisma} from "@/lib/prisma";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

export async function runCode(
    problemId: string,
    code: string,
    language: Language
) {
    try {
        // Récupérer les test cases du problème
        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
            include: { testCases: true },
        });

        if (!problem) {
            return { success: false, error: "Problème non trouvé" };
        }

        const { language: pistonLang, version } = LANGUAGE_VERSIONS[language];

        let testsPassed = 0;
        const testsTotal = problem.testCases.length;
        let firstError: string | null = null;
        let totalRuntime = 0;

        // Exécuter chaque test case
        for (const testCase of problem.testCases) {
            const startTime = Date.now();

            // Préparer le code avec l'appel de fonction
            const wrappedCode = wrapCodeForExecution(code, language, testCase.input);

            const result = await executeCode(pistonLang, version, wrappedCode);
            const runtime = Date.now() - startTime;
            totalRuntime += runtime;

            if (!result.success) {
                firstError = result.error || result.stderr || "Erreur d'exécution";
                break;
            }

            // Comparer la sortie
            const actualOutput = result.output?.trim() || result.stdout?.trim() || "";
            const expectedOutput = testCase.expectedOutput.trim();

            if (actualOutput === expectedOutput) {
                testsPassed++;
            } else {
                firstError = `Sortie attendue: ${expectedOutput}\nSortie obtenue: ${actualOutput}`;
                break;
            }
        }

        const status = testsPassed === testsTotal ? SubmissionStatus.ACCEPTED : SubmissionStatus.WRONG_ANSWER;

        const submissionResult: SubmissionResult = {
            status,
            testsPassed,
            testsTotal,
            runtime: Math.round(totalRuntime / testsTotal),
            memory: 0, // Piston ne fournit pas cette info facilement
            errorMessage: firstError ?? undefined,
        };

        return { success: true, data: submissionResult };
    } catch (error) {
        console.error("Error running code:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
        };
    }
}

export async function submitCode(
    problemId: string,
    code: string,
    language: Language,
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return redirect("/login");
    }

    try {
        // Exécuter d'abord le code
        const runResult = await runCode(problemId, code, language);

        if (!runResult.success || !runResult.data) {
            return runResult;
        }

        // Sauvegarder la soumission en base de données
        const submission = await prisma.submission.create({
            data: {
                problemId,
                userId: session?.user.id,
                code,
                language,
                status: runResult.data.status,
                runtime: runResult.data.runtime,
                memory: runResult.data.memory,
                testsPassed: runResult.data.testsPassed,
                testsTotal: runResult.data.testsTotal,
                errorMessage: runResult.data.errorMessage,
            },
        });

        return { success: true, data: { ...runResult.data, id: submission.id } };
    } catch (error) {
        console.error("Error submitting code:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
        };
    }
}

// Fonction helper pour wrapper le code avec l'appel de fonction
function wrapCodeForExecution(
    code: string,
    language: Language,
    input: string
): string {
    switch (language) {
        case Language.JAVASCRIPT:
        case Language.TYPESCRIPT:
            return `${code}

// Test
const result = twoSum(${input});
console.log(JSON.stringify(result));`;

        case Language.PYTHON:
            return `${code}

# Test
result = twoSum(${input})
print(result)`;

        case Language.JAVA:
            return `${code}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] result = solution.twoSum(${input});
        System.out.println(java.util.Arrays.toString(result));
    }
}`;

        case Language.CPP:
            return `#include <iostream>
#include <vector>
using namespace std;

${code}

int main() {
    Solution solution;
    vector<int> result = solution.twoSum(${input});
    cout << "[";
    for(int i = 0; i < result.size(); i++) {
        cout << result[i];
        if(i < result.size()-1) cout << ",";
    }
    cout << "]" << endl;
    return 0;
}`;

        default:
            return code;
    }
}
