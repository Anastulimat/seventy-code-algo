"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {AlertCircle, CheckCircle2, Clock, XCircle} from "lucide-react";
import type {TestCase} from "@/types";
import {SubmissionStatus} from "@/lib/generated/prisma/enums";

interface TestResult {
    testCase: TestCase;
    passed: boolean;
    actualOutput?: string;
    runtime?: number;
}

interface TestConsoleProps {
    results?: TestResult[];
    status?: SubmissionStatus;
    errorMessage?: string;
    runtime?: number;
    memory?: number;
}

export function TestConsole({
                                results,
                                status,
                                errorMessage,
                                runtime,
                                memory,
                            }: TestConsoleProps) {
    if (!results && !status) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-sm">Console de test</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Cliquez sur &quot;Tester&quot; pour exécuter votre code
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Résultats</CardTitle>
                    {status && <StatusBadge status={status}/>}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Erreur de compilation/runtime */}
                {errorMessage && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive mt-0.5"/>
                            <div>
                                <p className="font-semibold text-sm text-destructive">Erreur</p>
                                <pre className="text-xs mt-1 whitespace-pre-wrap">{errorMessage}</pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistiques */}
                {runtime !== undefined && memory !== undefined && (
                    <div className="flex gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Runtime: </span>
                            <span className="font-semibold">{runtime}ms</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Mémoire: </span>
                            <span className="font-semibold">{(memory / 1024).toFixed(2)}MB</span>
                        </div>
                    </div>
                )}

                {/* Résultats des tests */}
                {results && results.length > 0 && (
                    <div className="space-y-3">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border ${
                                    result.passed
                                        ? "bg-green-500/10 border-green-500/20"
                                        : "bg-red-500/10 border-red-500/20"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {result.passed ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500"/>
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-500"/>
                                    )}
                                    <span className="font-semibold text-sm">Test case {index + 1}</span>
                                    {result.runtime && (
                                        <span className="text-xs text-muted-foreground ml-auto">
                      {result.runtime}ms
                    </span>
                                    )}
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div>
                                        <span className="text-muted-foreground">Entrée: </span>
                                        <code className="bg-background px-1.5 py-0.5 rounded">
                                            {result.testCase.input}
                                        </code>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Sortie attendue: </span>
                                        <code className="bg-background px-1.5 py-0.5 rounded">
                                            {result.testCase.expectedOutput}
                                        </code>
                                    </div>
                                    {!result.passed && result.actualOutput && (
                                        <div>
                                            <span className="text-muted-foreground">Votre sortie: </span>
                                            <code className="bg-background px-1.5 py-0.5 rounded">
                                                {result.actualOutput}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function StatusBadge({status}: { status: SubmissionStatus }) {
    const config = {
        ACCEPTED: {
            label: "Accepté",
            className: "bg-green-500/10 text-green-500",
            icon: CheckCircle2,
        },
        WRONG_ANSWER: {
            label: "Mauvaise réponse",
            className: "bg-red-500/10 text-red-500",
            icon: XCircle,
        },
        TIME_LIMIT_EXCEEDED: {
            label: "Temps dépassé",
            className: "bg-orange-500/10 text-orange-500",
            icon: Clock,
        },
        RUNTIME_ERROR: {
            label: "Erreur d'exécution",
            className: "bg-red-500/10 text-red-500",
            icon: AlertCircle,
        },
        COMPILATION_ERROR: {
            label: "Erreur de compilation",
            className: "bg-red-500/10 text-red-500",
            icon: AlertCircle,
        },
        PENDING: {
            label: "En attente",
            className: "bg-gray-500/10 text-gray-500",
            icon: Clock,
        },
        MEMORY_LIMIT_EXCEEDED: {
            label: "Mémoire dépassée",
            className: "bg-orange-500/10 text-orange-500",
            icon: AlertCircle,
        },
    };

    const {label, className, icon: Icon} = config[status];

    return (
        <Badge className={className}>
            <Icon className="h-3 w-3 mr-1"/>
            {label}
        </Badge>
    );
}
