"use server";

import {prisma} from "@/lib/prisma";
import type {ActionResponse, DifficultyStats, UserStatsData} from "@/types";

export async function getUserDashboardData(
    userId: string
): Promise<ActionResponse<{
    stats: UserStatsData;
    difficultyStats: DifficultyStats;
    recentSubmissions: any[];
    recentActivity: any[];
}>> {
    try {
        // Récupérer les stats utilisateur
        const userStats = await prisma.userStats.findUnique({
            where: {userId},
        });

        // Récupérer les problèmes résolus par difficulté
        const [totalProblems, easySolved, mediumSolved, hardSolved] = await Promise.all([
            prisma.problem.count({where: {isActive: true}}),
            prisma.userProblem.count({
                where: {userId, status: "SOLVED", problem: {difficulty: "EASY"}},
            }),
            prisma.userProblem.count({
                where: {userId, status: "SOLVED", problem: {difficulty: "MEDIUM"}},
            }),
            prisma.userProblem.count({
                where: {userId, status: "SOLVED", problem: {difficulty: "HARD"}},
            }),
        ]);

        const [totalEasy, totalMedium, totalHard] = await Promise.all([
            prisma.problem.count({where: {isActive: true, difficulty: "EASY"}}),
            prisma.problem.count({where: {isActive: true, difficulty: "MEDIUM"}}),
            prisma.problem.count({where: {isActive: true, difficulty: "HARD"}}),
        ]);

        // Calculer le taux de réussite
        const acceptanceRate = userStats?.totalSubmissions
            ? (userStats.acceptedSubmissions / userStats.totalSubmissions) * 100
            : 0;

        // Stats principales
        const stats: UserStatsData = {
            easySolved: userStats?.easySolved || 0,
            mediumSolved: userStats?.mediumSolved || 0,
            hardSolved: userStats?.hardSolved || 0,
            totalSolved: userStats?.totalSolved || 0,
            totalSubmissions: userStats?.totalSubmissions || 0,
            acceptedSubmissions: userStats?.acceptedSubmissions || 0,
            acceptanceRate,
            currentStreak: userStats?.currentStreak || 0,
            maxStreak: userStats?.maxStreak || 0,
            ranking: userStats?.ranking || null,
        };

        // Stats par difficulté
        const difficultyStats: DifficultyStats = {
            easy: {solved: easySolved, total: totalEasy},
            medium: {solved: mediumSolved, total: totalMedium},
            hard: {solved: hardSolved, total: totalHard},
        };

        // Soumissions récentes
        const recentSubmissions = await prisma.submission.findMany({
            where: {userId},
            include: {
                problem: {
                    select: {
                        title: true,
                        slug: true,
                        difficulty: true,
                    },
                },
            },
            orderBy: {createdAt: "desc"},
            take: 10,
        });

        // Activité récente (problèmes résolus)
        const recentActivity = await prisma.userProblem.findMany({
            where: {
                userId,
                status: "SOLVED",
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
            orderBy: {solvedAt: "desc"},
            take: 10,
        });

        return {
            success: true,
            data: {
                stats,
                difficultyStats,
                recentSubmissions,
                recentActivity,
            },
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return {
            success: false,
            error: "Erreur lors de la récupération des données du dashboard",
        };
    }
}

export async function getProgressData(
    userId: string,
    days = 30
): Promise<ActionResponse<any[]>> {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const submissions = await prisma.submission.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                },
            },
            orderBy: {createdAt: "asc"},
        });

        // Grouper par jour
        const dataByDay = new Map<string, { submissions: number; accepted: number }>();

        submissions.forEach((submission) => {
            const date = submission.createdAt.toISOString().split("T")[0];
            const current = dataByDay.get(date) || {submissions: 0, accepted: 0};
            current.submissions++;
            if (submission.status === "ACCEPTED") {
                current.accepted++;
            }
            dataByDay.set(date, current);
        });

        // Convertir en tableau
        const progressData = Array.from(dataByDay.entries()).map(([date, data]) => ({
            date,
            submissions: data.submissions,
            accepted: data.accepted,
        }));

        return {
            success: true,
            data: progressData,
        };
    } catch (error) {
        console.error("Error fetching progress data:", error);
        return {
            success: false,
            error: "Erreur lors de la récupération des données de progression",
        };
    }
}


export async function getLeaderboard(
    limit = 50
): Promise<ActionResponse<any[]>> {
    try {
        const leaderboard = await prisma.userStats.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
            orderBy: [
                {totalSolved: "desc"},
                {acceptedSubmissions: "desc"},
            ],
            take: limit,
        });

        // Ajouter le rang
        const leaderboardWithRank = leaderboard.map((entry, index) => ({
            rank: index + 1,
            user: entry.user,
            stats: {
                totalSolved: entry.totalSolved,
                easySolved: entry.easySolved,
                mediumSolved: entry.mediumSolved,
                hardSolved: entry.hardSolved,
                acceptanceRate:
                    entry.totalSubmissions > 0
                        ? (entry.acceptedSubmissions / entry.totalSubmissions) * 100
                        : 0,
            },
        }));

        return {
            success: true,
            data: leaderboardWithRank,
        };
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return {
            success: false,
            error: "Erreur lors de la récupération du classement",
        };
    }
}
