"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {getUserSubmissions} from "@/actions/submissions";
import {AlertCircle, CheckCircle2, Clock, XCircle} from "lucide-react";
import {formatDistanceToNow} from "date-fns";
import {fr} from "date-fns/locale";
import {DIFFICULTY_BG_COLORS} from "@/types";

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSubmissions = async () => {
            setLoading(true);
            // TODO: Récupérer le vrai userId
            const userId = "temp-user-id";
            const result = await getUserSubmissions(userId, undefined, 50);
            if (result.success && result.data) {
                setSubmissions(result.data);
            }
            setLoading(false);
        };

        loadSubmissions();
    }, []);

    if (loading) {
        return (
            <div className="container py-8 space-y-8">
                <Skeleton className="h-12 w-64"/>
                <Skeleton className="h-96 w-full"/>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Mes soumissions</h1>
                <p className="text-muted-foreground">
                    Historique complet de vos {submissions.length} soumissions
                </p>
            </div>

            {/* Tableau */}
            <Card>
                <CardContent className="pt-6">
                    {submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                Aucune soumission pour le moment
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">Statut</TableHead>
                                    <TableHead>Problème</TableHead>
                                    <TableHead className="hidden md:table-cell">Langage</TableHead>
                                    <TableHead className="text-center hidden sm:table-cell">
                                        Runtime
                                    </TableHead>
                                    <TableHead className="text-center hidden lg:table-cell">
                                        Mémoire
                                    </TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell>
                                            <StatusIcon status={submission.status}/>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/problems/${submission.problem.slug}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium">{submission.problem.title}</p>
                                                    <Badge
                                                        className={`${
                                                            DIFFICULTY_BG_COLORS[submission.problem.difficulty]
                                                        } text-xs`}
                                                    >
                                                        {getDifficultyLabel(submission.problem.difficulty)}
                                                    </Badge>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="outline">{submission.language}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center hidden sm:table-cell">
                                            {submission.runtime ? `${submission.runtime}ms` : "-"}
                                        </TableCell>
                                        <TableCell className="text-center hidden lg:table-cell">
                                            {submission.memory
                                                ? `${(submission.memory / 1024).toFixed(2)}MB`
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(submission.createdAt), {
                                                addSuffix: true,
                                                locale: fr,
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function StatusIcon({status}: { status: string }) {
    switch (status) {
        case "ACCEPTED":
            return <CheckCircle2 className="h-5 w-5 text-green-500"/>;
        case "WRONG_ANSWER":
            return <XCircle className="h-5 w-5 text-red-500"/>;
        case "TIME_LIMIT_EXCEEDED":
            return <Clock className="h-5 w-5 text-orange-500"/>;
        case "RUNTIME_ERROR":
        case "COMPILATION_ERROR":
            return <AlertCircle className="h-5 w-5 text-red-500"/>;
        default:
            return <Clock className="h-5 w-5 text-gray-500"/>;
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
