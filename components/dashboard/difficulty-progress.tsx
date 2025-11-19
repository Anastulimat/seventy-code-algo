import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DifficultyStats } from "@/types";

interface DifficultyProgressProps {
    stats: DifficultyStats;
}

export function DifficultyProgress({ stats }: DifficultyProgressProps) {
    const difficulties = [
        {
            label: "Facile",
            solved: stats.easy.solved,
            total: stats.easy.total,
            color: "bg-green-500",
        },
        {
            label: "Moyen",
            solved: stats.medium.solved,
            total: stats.medium.total,
            color: "bg-yellow-500",
        },
        {
            label: "Difficile",
            solved: stats.hard.solved,
            total: stats.hard.total,
            color: "bg-red-500",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Progression par difficulté</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {difficulties.map((difficulty) => {
                    const percentage =
                        difficulty.total > 0
                            ? (difficulty.solved / difficulty.total) * 100
                            : 0;

                    return (
                        <div key={difficulty.label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{difficulty.label}</span>
                                <span className="text-muted-foreground">
                  {difficulty.solved} / {difficulty.total}
                </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
