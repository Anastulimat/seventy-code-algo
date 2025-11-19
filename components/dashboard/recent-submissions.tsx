import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { DIFFICULTY_BG_COLORS } from "@/types";

interface RecentSubmissionsProps {
    submissions: any[];
}

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
    if (submissions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Soumissions récentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Aucune soumission pour le moment
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Soumissions récentes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {submissions.map((submission) => (
                        <Link
                            key={submission.id}
                            href={`/problems/${submission.problem.slug}`}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {submission.status === "ACCEPTED" ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                )}
                                <div>
                                    <p className="font-medium text-sm">{submission.problem.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(submission.createdAt), {
                                            addSuffix: true,
                                            locale: fr,
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {submission.runtime && (
                                    <span className="text-xs text-muted-foreground">
                    {submission.runtime}ms
                  </span>
                                )}
                                <Badge className={DIFFICULTY_BG_COLORS[submission.problem.difficulty]}>
                                    {getDifficultyLabel(submission.problem.difficulty)}
                                </Badge>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
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
