"use client";

import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import type {ProblemFull} from "@/types";
import {DIFFICULTY_BG_COLORS} from "@/types";

interface ProblemDescriptionProps {
    problem: ProblemFull;
}

export function ProblemDescription({problem}: ProblemDescriptionProps) {
    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-2xl font-bold">
                        {problem.order}. {problem.title}
                    </h1>
                    <Badge className={DIFFICULTY_BG_COLORS[problem.difficulty]}>
                        {getDifficultyLabel(problem.difficulty)}
                    </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                    {problem.tags.map(({tag}) => (
                        <Badge key={tag.id} variant="secondary">
                            {tag.name}
                        </Badge>
                    ))}
                </div>
            </div>

            <Separator/>

            {/* Description */}
            <div>
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <div
                    className="prose prose-slate dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{__html: formatDescription(problem.description)}}
                />
            </div>

            {/* Exemples */}
            {problem.examples.length > 0 && (
                <>
                    <Separator/>
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Exemples</h2>
                        <div className="space-y-4">
                            {problem.examples.map((example, index) => (
                                <Card key={example.id}>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Exemple {index + 1}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <span className="font-semibold">Entrée : </span>
                                            <code className="bg-muted px-2 py-1 rounded text-sm">
                                                {example.input}
                                            </code>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Sortie : </span>
                                            <code className="bg-muted px-2 py-1 rounded text-sm">
                                                {example.output}
                                            </code>
                                        </div>
                                        {example.explanation && (
                                            <div>
                                                <span className="font-semibold">Explication : </span>
                                                <span className="text-muted-foreground">
                          {example.explanation}
                        </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Contraintes */}
            {problem.constraints && (
                <>
                    <Separator/>
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Contraintes</h2>
                        <code
                            className="prose prose-slate dark:prose-invert max-w-none text-sm"
                            dangerouslySetInnerHTML={{__html: formatConstraints(problem.constraints)}}
                        />
                    </div>
                </>
            )}
        </div>
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

function formatDescription(description: string): string {
    // Convertir les backticks en <code>
    return description
        .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
        .replace(/\n/g, "<br />");
}

function formatConstraints(constraints: string): string {
    // Convertir chaque ligne en liste
    const lines = constraints.split("\n").filter((line) => line.trim());
    return `<ul class="list-disc list-inside space-y-1">${lines
        .map((line) => `<li>${line.replace(/^-\s*/, "")}</li>`)
        .join("")}</ul>`;
}
