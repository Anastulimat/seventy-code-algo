"use client";

import {useEffect, useState} from "react";
import {ProblemFiltersComponent} from "@/components/problems/problem-filters";
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {getAllTags, getProblems, getProblemStats} from "@/actions/problems";
import {DIFFICULTY_COLORS, ProblemFilters, ProblemWithTags} from "@/types";
import {Check, Lock, LockKeyhole, Star} from "lucide-react";
import {capitalize, cn, getDifficultyColor} from "@/lib/utils";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";

// ----------------------------------------------------------------------

export default function ProblemsPage() {
    const [problems, setProblems] = useState<ProblemWithTags[]>([]);
    const [tags, setTags] = useState<Array<{ id: string; name: string; slug: string }>>([]);
    const [stats, setStats] = useState({total: 0, easy: 0, medium: 0, hard: 0});
    const [filters, setFilters] = useState<ProblemFilters>({page: 1, limit: 20});
    const [pagination, setPagination] = useState({total: 0, totalPages: 0});
    const [loading, setLoading] = useState(true);

    // Chargement des données en fonction des filtres
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const result = await getProblems(filters);
            if (result.success && result.data) {
                setProblems(result.data.problems);
                setPagination({
                    total: result.data.total,
                    totalPages: result.data.totalPages,
                });
            }
            setLoading(false);
        };

        loadData();
    }, [filters]);

    // Chargement initial des tags et statistiques
    useEffect(() => {
        const loadTagsAndStats = async () => {
            const [tagsResult, statsResult] = await Promise.all([
                getAllTags(),
                getProblemStats(),
            ]);

            if (tagsResult.success && tagsResult.data) {
                setTags(tagsResult.data);
            }

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }
        };

        loadTagsAndStats();
    }, []);

    const handleFiltersChange = (newFilters: ProblemFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page: number) => {
        setFilters({...filters, page});
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    return (
        <TooltipProvider>
            <div className="container py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filtres - 4 colonnes sur grand écran */}
                    <aside className="w-full lg:w-1/3 xl:w-1/4">
                        <Card className="lg:sticky lg:top-8">
                            <CardContent>
                                <ProblemFiltersComponent
                                    filters={filters}
                                    onFiltersChange={handleFiltersChange}
                                    availableTags={tags}
                                />
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Contenu principal - 8 colonnes sur grand écran */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full"/>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {problems.map((problem) => (
                                    <Link href={`/problems/${problem.slug}`}
                                          key={problem.id}
                                          className={cn(
                                              'flex items-center gap-2 p-4 bg-muted hover:bg-secondary transition-colors rounded-lg cursor-pointer',
                                          )}
                                    >
                                        {/* Check icon for solved problems */}
                                        <div className="flex-shrink-0 w-5">
                                            <Check className="w-5 h-5 text-green-500"/>
                                        </div>

                                        {/* Problem number and title */}
                                        <div className="flex-1 min-w-0">
                                            <span className="font-semibold text-sm block truncate dark:text-primary-foreground">
                                              {problem.order}. {problem.title}
                                            </span>
                                        </div>

                                        {/* Acceptance rate with tooltip */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex-shrink-0 text-right">
                                                    <span className="text-sm">{problem.acceptance}%</span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Taux d&apos;acceptation</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        {/* Difficulty */}
                                        <div className="flex-shrink-0 w-16 text-right">
                                            <Badge className={getDifficultyColor(problem.difficulty)}>{capitalize(problem.difficulty)}</Badge>
                                        </div>

                                        {/* Lock icon with tooltip */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex-shrink-0 w-12 flex items-center justify-center gap-2">
                                                    <LockKeyhole className="w-4 h-4 text-gray-500"/>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Problème premium</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        {/* Star icon with tooltip */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex-shrink-0 w-8 flex items-center justify-center">
                                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500"/>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Problème favori</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
