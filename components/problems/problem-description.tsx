"use client";

import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import type {ProblemFull} from "@/types";
import {capitalize, getDifficultyColor} from "@/lib/utils";

interface ProblemDescriptionProps {
    problem: ProblemFull;
}

export function ProblemDescription({problem}: ProblemDescriptionProps) {
    return (
        <Card className="px-4 py-4 m-2 bg-muted/50 rounded-lg shadow-md border border-muted-foreground/10 h-full overflow-y-auto">
            {/* En-tête */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-lg font-bold">
                        {problem.order}. {problem.title}
                    </h1>
                    <Badge className={getDifficultyColor(problem.difficulty)}>
                        {capitalize(problem.difficulty)}
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
                        <div className="space-y-6">
                            {problem.examples.map((example, index) => (
                                <div key={index}>
                                    <div className="text-sm font-semibold">Exemple {index + 1}</div>
                                    <pre className="border-l-2 border-border pl-4 mt-2" key={example.id}>
                                        <div className="space-y-2">
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
                                        </div>
                                    </pre>
                                </div>
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
        </Card>
    );
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
