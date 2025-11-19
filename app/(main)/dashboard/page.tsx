"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DifficultyProgress } from "@/components/dashboard/difficulty-progress";
import { RecentSubmissions } from "@/components/dashboard/recent-submissions";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserDashboardData } from "@/actions/dashboard";
import {
    Trophy,
    Target,
    TrendingUp,
    Flame,
    CheckCircle2,
    Award,
} from "lucide-react";
import type { UserStatsData, DifficultyStats } from "@/types";

export default function DashboardPage() {
    const [stats, setStats] = useState<UserStatsData | null>(null);
    const [difficultyStats, setDifficultyStats] = useState<DifficultyStats | null>(null);
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            // TODO: Récupérer le vrai userId depuis la session
            const userId = "temp-user-id";

            const result = await getUserDashboardData(userId);
            if (result.success && result.data) {
                setStats(result.data.stats);
                setDifficultyStats(result.data.difficultyStats);
                setRecentSubmissions(result.data.recentSubmissions);
            }
            setLoading(false);
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="container py-8 space-y-8">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    if (!stats || !difficultyStats) {
        return (
            <div className="container py-12 text-center">
                <p className="text-muted-foreground">
                    Erreur lors du chargement du dashboard
                </p>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
                <p className="text-muted-foreground">
                    Suivez votre progression et vos performances
                </p>
            </div>

            {/* Stats principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Problèmes résolus"
                    value={stats.totalSolved}
                    description={`${stats.easySolved} faciles, ${stats.mediumSolved} moyens, ${stats.hardSolved} difficiles`}
                    icon={CheckCircle2}
                    iconColor="text-green-500"
                />
                <StatsCard
                    title="Taux de réussite"
                    value={`${stats.acceptanceRate.toFixed(1)}%`}
                    description={`${stats.acceptedSubmissions} / ${stats.totalSubmissions} soumissions`}
                    icon={Target}
                    iconColor="text-blue-500"
                />
                <StatsCard
                    title="Série actuelle"
                    value={stats.currentStreak}
                    description={`Record: ${stats.maxStreak} jours`}
                    icon={Flame}
                    iconColor="text-orange-500"
                />
                <StatsCard
                    title="Classement"
                    value={stats.ranking || "N/A"}
                    description="Position globale"
                    icon={Award}
                    iconColor="text-yellow-500"
                />
            </div>

            {/* Grilles de progression */}
            <div className="grid gap-4 md:grid-cols-2">
                <DifficultyProgress stats={difficultyStats} />
                <RecentSubmissions submissions={recentSubmissions} />
            </div>
        </div>
    );
}
