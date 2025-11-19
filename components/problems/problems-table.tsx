"use client";

import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {CheckCircle2, Circle, Clock} from "lucide-react";
import type {ProblemWithTags} from "@/types";
import {DIFFICULTY_BG_COLORS} from "@/types";

interface ProblemsTableProps {
    problems: ProblemWithTags[];
}

export function ProblemsTable({problems}: ProblemsTableProps) {
    if (problems.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun problème trouvé</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">Statut</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead className="hidden md:table-cell">Tags</TableHead>
                        <TableHead className="w-24">Difficulté</TableHead>
                        <TableHead className="w-24 text-right hidden sm:table-cell">
                            Acceptation
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {problems.map((problem) => (
                        <TableRow key={problem.id} className="hover:bg-muted/50">
                            <TableCell>
                                <StatusIcon status="NOT_STARTED"/>
                            </TableCell>
                            <TableCell>
                                <Link
                                    href={`/problems/${problem.slug}`}
                                    className="font-medium hover:text-primary transition-colors"
                                >
                                    {problem.order}. {problem.title}
                                </Link>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="flex flex-wrap gap-1">
                                    {problem.tags.slice(0, 3).map(({tag}) => (
                                        <Badge key={tag.id} variant="secondary" className="text-xs">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                    {problem.tags.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{problem.tags.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={DIFFICULTY_BG_COLORS[problem.difficulty]}>
                                    {getDifficultyLabel(problem.difficulty)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right hidden sm:table-cell">
                <span className="text-muted-foreground">
                  {problem.acceptance.toFixed(1)}%
                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function StatusIcon({status}: { status: string }) {
    switch (status) {
        case "SOLVED":
            return <CheckCircle2 className="h-5 w-5 text-green-500"/>;
        case "ATTEMPTED":
            return <Clock className="h-5 w-5 text-yellow-500"/>;
        default:
            return <Circle className="h-5 w-5 text-muted-foreground"/>;
    }
}

function getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
        case "EASY":
            return "Facile";
        case "MEDIUM":
            return "Moyen";
        case "HARD":
            return "Difficile";
        default:
            return difficulty;
    }
}
