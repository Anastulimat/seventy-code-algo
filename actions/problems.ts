"use server";

import {prisma} from "@/lib/prisma";
import type {ActionResponse, ProblemFilters, ProblemFull, ProblemListResult, ProblemWithTags} from "@/types";
import {UserProblemStatus} from "@/lib/generated/prisma/enums";


const ITEMS_PER_PAGE = 20;

export async function getProblems(
    filters: ProblemFilters = {},
    userId?: string
): Promise<ActionResponse<ProblemListResult>> {
    try {
        const {
            difficulty,
            tags = [],
            status,
            search = "",
            page = 1,
            limit = ITEMS_PER_PAGE,
        } = filters;

        // Construction de la requête WHERE
        const where: any = {
            isActive: true,
        };

        // Filtre par difficulté
        if (difficulty && difficulty !== "ALL") {
            where.difficulty = difficulty as Difficulty;
        }

        // Filtre par tags
        if (tags.length > 0) {
            where.tags = {
                some: {
                    tag: {
                        slug: {
                            in: tags,
                        },
                    },
                },
            };
        }

        // Filtre par recherche
        if (search) {
            where.OR = [
                {title: {contains: search, mode: "insensitive"}},
                {description: {contains: search, mode: "insensitive"}},
            ];
        }

        // Filtre par statut utilisateur
        if (userId && status && status !== "ALL") {
            if (status === UserProblemStatus.SOLVED) {
                where.userProblems = {
                    some: {
                        userId,
                        status: UserProblemStatus.SOLVED,
                    },
                };
            } else if (status === UserProblemStatus.ATTEMPTED) {
                where.userProblems = {
                    some: {
                        userId,
                        status: UserProblemStatus.ATTEMPTED,
                    },
                };
            } else if (status === UserProblemStatus.NOT_STARTED) {
                where.userProblems = {
                    none: {
                        userId,
                    },
                };
            }
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Requête parallèle pour compter et récupérer
        const [total, problemsData] = await Promise.all([
            prisma.problem.count({where}),
            prisma.problem.findMany({
                where,
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    ...(userId && {
                        userProblems: {
                            where: {
                                userId,
                            },
                            select: {
                                status: true,
                                isFavorite: true,
                            },
                        },
                    }),
                },
                orderBy: {
                    order: "asc",
                },
                skip,
                take: limit,
            }),
        ]);

        // Transformation des données
        const problems: ProblemWithTags[] = problemsData.map((problem) => ({
            id: problem.id,
            title: problem.title,
            slug: problem.slug,
            description: problem.description,
            difficulty: problem.difficulty,
            order: problem.order,
            constraints: problem.constraints,
            acceptance: problem.acceptance,
            totalSubmissions: problem.totalSubmissions,
            totalAccepted: problem.totalAccepted,
            isPremium: problem.isPremium,
            isActive: problem.isActive,
            createdAt: problem.createdAt,
            updatedAt: problem.updatedAt,
            tags: problem.tags,
        }));

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: {
                problems,
                total,
                page,
                totalPages,
            },
        };
    } catch (error) {
        console.error("Error fetching problems:", error);
        return {
            success: false,
            error: "Erreur lors de la récupération des problèmes",
        };
    }
}

export async function getAllTags(): Promise<ActionResponse<Array<{ id: string; name: string; slug: string }>>> {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: {
                name: "asc",
            },
        });

        return {
            success: true,
            data: tags,
        };
    } catch (error) {
        console.error("Error fetching tags:", error);
        return {
            success: false,
            error: "Erreur lors de la récupération des tags",
        };
    }
}

export async function getProblemStats() {
    try {
        const [total, easy, medium, hard] = await Promise.all([
            prisma.problem.count({where: {isActive: true}}),
            prisma.problem.count({where: {isActive: true, difficulty: "EASY"}}),
            prisma.problem.count({where: {isActive: true, difficulty: "MEDIUM"}}),
            prisma.problem.count({where: {isActive: true, difficulty: "HARD"}}),
        ]);

        return {
            success: true,
            data: {
                total,
                easy,
                medium,
                hard,
            },
        };
    } catch (error) {
        console.error("Error fetching problem stats:", error);
        return {
            success: false,
            error: "Erreur lors de la récupération des statistiques",
        };
    }
}

export async function getProblemBySlug(
    slug: string,
    userId?: string
): Promise<ActionResponse<ProblemFull>> {
    try {
        const problem = await prisma.problem.findUnique({
            where: {slug, isActive: true},
            include: {
                examples: {
                    orderBy: {order: "asc"},
                },
                testCases: {
                    where: {isHidden: false},
                    orderBy: {order: "asc"},
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
                ...(userId && {
                    userProblems: {
                        where: {userId},
                    },
                }),
            },
        });

        if (!problem) {
            return {
                success: false,
                error: "Problème non trouvé",
            };
        }

        // Transformation pour correspondre au type ProblemFull
        const problemData: ProblemFull = {
            id: problem.id,
            title: problem.title,
            slug: problem.slug,
            description: problem.description,
            difficulty: problem.difficulty,
            order: problem.order,
            constraints: problem.constraints,
            acceptance: problem.acceptance,
            totalSubmissions: problem.totalSubmissions,
            totalAccepted: problem.totalAccepted,
            isPremium: problem.isPremium,
            isActive: problem.isActive,
            createdAt: problem.createdAt,
            updatedAt: problem.updatedAt,
            examples: problem.examples,
            testCases: problem.testCases,
            tags: problem.tags,
        };

        return {
            success: true,
            data: problemData,
        };
    } catch (error) {
        console.error("Error fetching problem:", error);
        return {
            success: false,
            error: "Erreur lors de la récupération du problème",
        };
    }
}

export async function toggleFavorite(
    userId: string,
    problemId: string
): Promise<ActionResponse<{ isFavorite: boolean }>> {
    try {
        const existingUserProblem = await prisma.userProblem.findUnique({
            where: {
                userId_problemId: {
                    userId,
                    problemId,
                },
            },
        });

        if (existingUserProblem) {
            // Toggle favorite
            const updated = await prisma.userProblem.update({
                where: {
                    userId_problemId: {
                        userId,
                        problemId,
                    },
                },
                data: {
                    isFavorite: !existingUserProblem.isFavorite,
                },
            });

            return {
                success: true,
                data: {isFavorite: updated.isFavorite},
            };
        } else {
            // Créer avec favorite true
            await prisma.userProblem.create({
                data: {
                    userId,
                    problemId,
                    status: "NOT_STARTED",
                    isFavorite: true,
                },
            });

            return {
                success: true,
                data: {isFavorite: true},
            };
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return {
            success: false,
            error: "Erreur lors de la mise à jour des favoris",
        };
    }
}
