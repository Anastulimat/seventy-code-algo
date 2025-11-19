"use server";

import {prisma} from "@/lib/prisma";
import {CodeExecutor} from "@/lib/code-execution/executor";
import type {ActionResponse, SubmissionResult} from "@/types";
import {revalidatePath} from "next/cache";
import {Language, SubmissionStatus} from "@/lib/generated/prisma/enums";

export async function runCode(
    problemId: string,
    code: string,
    language: Language,
    userId?: string
): Promise<ActionResponse<SubmissionResult>> {
    try {
        // Récupérer les test cases visibles
        const testCases = await prisma.testCase.findMany({
            where: {
                problemId,
                isHidden: false,
            },
            orderBy: {
                order: "asc",
            },
        });

        if (testCases.length === 0) {
            return {
                success: false,
                error: "Aucun test case disponible",
            };
        }

        // Exécuter les tests
        const result = await CodeExecutor.runTests(code, language, testCases);

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("Error running code:", error);
        return {
            success: false,
            error: "Erreur lors de l'exécution du code",
        };
    }
}

export async function submitCode(
    problemId: string,
    code: string,
    language: Language,
    userId: string
): Promise<ActionResponse<SubmissionResult & { submissionId: string }>> {
    try {
        // Récupérer TOUS les test cases (incluant les cachés)
        const testCases = await prisma.testCase.findMany({
            where: {
                problemId,
            },
            orderBy: {
                order: "asc",
            },
        });

        if (testCases.length === 0) {
            return {
                success: false,
                error: "Aucun test case disponible",
            };
        }

        // Exécuter tous les tests
        const result = await CodeExecutor.runTests(code, language, testCases);

        // Créer la soumission dans la base de données
        const submission = await prisma.submission.create({
            data: {
                userId,
                problemId,
                code,
                language,
                status: result.status,
                runtime: result.runtime,
                memory: result.memory,
                testsPassed: result.testsPassed,
                testsTotal: result.testsTotal,
                errorMessage: result.errorMessage,
            },
        });

        // Mettre à jour les statistiques si accepté
        if (result.status === SubmissionStatus.ACCEPTED) {
            await updateUserProblemStatus(userId, problemId);
            await updateProblemStats(problemId, true);
            await updateUserStats(userId);
        } else {
            await updateProblemStats(problemId, false);
        }

        revalidatePath(`/problems/${problemId}`);

        return {
            success: true,
            data: {
                ...result,
                submissionId: submission.id,
            },
        };
    } catch (error) {
        console.error("Error submitting code:", error);
        return {
            success: false,
            error: "Erreur lors de la soumission du code",
        };
    }
}

async function updateUserProblemStatus(userId: string, problemId: string) {
    const existingUserProblem = await prisma.userProblem.findUnique({
        where: {
            userId_problemId: {
                userId,
                problemId,
            },
        },
    });

    if (existingUserProblem) {
        await prisma.userProblem.update({
            where: {
                userId_problemId: {
                    userId,
                    problemId,
                },
            },
            data: {
                status: "SOLVED",
                solvedAt: new Date(),
                attempts: {
                    increment: 1,
                },
                lastAttempt: new Date(),
            },
        });
    } else {
        await prisma.userProblem.create({
            data: {
                userId,
                problemId,
                status: "SOLVED",
                solvedAt: new Date(),
                attempts: 1,
                lastAttempt: new Date(),
            },
        });
    }
}

async function updateProblemStats(problemId: string, accepted: boolean) {
    await prisma.problem.update({
        where: {id: problemId},
        data: {
            totalSubmissions: {
                increment: 1,
            },
            ...(accepted && {
                totalAccepted: {
                    increment: 1,
                },
            }),
        },
    });

    // Recalculer le taux d'acceptation
    const problem = await prisma.problem.findUnique({
        where: {id: problemId},
        select: {totalAccepted: true, totalSubmissions: true},
    });

    if (problem && problem.totalSubmissions > 0) {
        const acceptance = (problem.totalAccepted / problem.totalSubmissions) * 100;
        await prisma.problem.update({
            where: {id: problemId},
            data: {acceptance},
        });
    }
}

async function updateUserStats(userId: string) {
    const [solvedProblems, submissions] = await Promise.all([
        prisma.userProblem.findMany({
            where: {
                userId,
                status: "SOLVED",
            },
            include: {
                problem: {
                    select: {
                        difficulty: true,
                    },
                },
            },
        }),
        prisma.submission.findMany({
            where: {userId},
            select: {
                status: true,
            },
        }),
    ]);

    const easySolved = solvedProblems.filter((p) => p.problem.difficulty === "EASY").length;
    const mediumSolved = solvedProblems.filter((p) => p.problem.difficulty === "MEDIUM").length;
    const hardSolved = solvedProblems.filter((p) => p.problem.difficulty === "HARD").length;
    const totalSolved = solvedProblems.length;

    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter((s) => s.status === "ACCEPTED").length;

    // Calculer le streak
    const lastSolved = await prisma.userProblem.findFirst({
        where: {
            userId,
            status: "SOLVED",
        },
        orderBy: {
            solvedAt: "desc",
        },
    });

    await prisma.userStats.upsert({
        where: {userId},
        create: {
            userId,
            easySolved,
            mediumSolved,
            hardSolved,
            totalSolved,
            totalSubmissions,
            acceptedSubmissions,
            lastSolvedAt: lastSolved?.solvedAt,
        },
        update: {
            easySolved,
            mediumSolved,
            hardSolved,
            totalSolved,
            totalSubmissions,
            acceptedSubmissions,
            lastSolvedAt: lastSolved?.solvedAt,
        },
    });
}

export async function getUserSubmissions(
    userId: string,
    problemId?: string,
    limit = 20
): Promise<ActionResponse<any[]>> {
    try {
        const submissions = await prisma.submission.findMany({
            where: {
                userId,
                ...(problemId && {problemId}),
            },
            include: {
                problem: {
                    select: {
                        title: true,
                        slug: true,
                        difficulty: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        });

        return {
            success: true,
            data: submissions,
        };
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return {
            success: false,
            error: "Erreur lors de la récupération des soumissions",
        };
    }
}
