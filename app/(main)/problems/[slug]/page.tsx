"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ProblemDescription} from "@/components/problems/problem-description";
import {CodeEditor} from "@/components/editor/code-editor";
import {TestConsole} from "@/components/editor/test-console";
import {Skeleton} from "@/components/ui/skeleton";
import {getProblemBySlug} from "@/actions/problems";
import {runCode, submitCode} from "@/actions/submissions";
import type {ProblemFull, SubmissionResult, TestCase} from "@/types";
import {toast} from "sonner";
import {Language} from "@prisma/client";

interface TestResult {
    testCase: TestCase;
    passed: boolean;
    actualOutput?: string;
    runtime?: number;
}

export default function ProblemPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [problem, setProblem] = useState<ProblemFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

    useEffect(() => {
        const loadProblem = async () => {
            setLoading(true);
            const result = await getProblemBySlug(slug);
            if (result.success && result.data) {
                setProblem(result.data);
            } else {
                toast.error(result.error || "Problème non trouvé");
            }
            setLoading(false);
        };

        loadProblem();
    }, [slug]);

    const handleRun = async (code: string, language: Language) => {
        if (!problem) return;

        setIsRunning(true);
        setTestResults([]);
        setSubmissionResult(null);

        try {
            const result = await runCode(problem.id, code, language);

            if (result.success && result.data) {
                setSubmissionResult(result.data);

                // Créer les résultats de test pour l'affichage
                const results: TestResult[] = problem.testCases.map((testCase, index) => ({
                    testCase,
                    passed: index < result.data.testsPassed,
                    runtime: result.data.runtime,
                }));

                setTestResults(results);

                if (result.data.status === "ACCEPTED") {
                    toast.success(`Tous les tests sont passés ! 🎉`);
                } else {
                    toast.error(`${result.data.testsPassed}/${result.data.testsTotal} tests passés`);
                }
            } else {
                toast.error(result.error || "Erreur lors de l'exécution");
            }
        } catch (error) {
            toast.error("Erreur lors de l'exécution du code");
            console.error(error);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async (code: string, language: Language) => {
        if (!problem) return;

        // TODO: Récupérer l'userId de la session
        const userId = "temp-user-id"; // À remplacer par la vraie session

        setIsSubmitting(true);
        setTestResults([]);
        setSubmissionResult(null);

        try {
            const result = await submitCode(problem.id, code, language, userId);

            if (result.success && result.data) {
                setSubmissionResult(result.data);

                if (result.data.status === "ACCEPTED") {
                    toast.success("Solution acceptée ! 🎉");
                } else {
                    toast.error(
                        `${result.data.testsPassed}/${result.data.testsTotal} tests passés`
                    );
                }
            } else {
                toast.error(result.error || "Erreur lors de la soumission");
            }
        } catch (error) {
            toast.error("Erreur lors de la soumission du code");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-4rem)] p-4">
                <Skeleton className="h-full w-full"/>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold">Problème non trouvé</h1>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex">
            {/* Panneau gauche - Description */}
            <div className="w-full lg:w-1/2 border-r overflow-y-auto">
                <div className="p-6">
                    <Tabs defaultValue="description">
                        <TabsList className="mb-4">
                            <TabsTrigger value="description">Description</TabsTrigger>
                            <TabsTrigger value="solutions">Solutions</TabsTrigger>
                            <TabsTrigger value="submissions">Soumissions</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description">
                            <ProblemDescription problem={problem}/>
                        </TabsContent>
                        <TabsContent value="solutions">
                            <p className="text-muted-foreground">À implémenter</p>
                        </TabsContent>
                        <TabsContent value="submissions">
                            <p className="text-muted-foreground">À implémenter</p>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Panneau droit - Éditeur */}
            <div className="hidden lg:flex lg:w-1/2 flex-col">
                {/* Éditeur */}
                <div className="flex-1 border-b">
                    <CodeEditor
                        onRun={handleRun}
                        onSubmit={handleSubmit}
                        isRunning={isRunning}
                        isSubmitting={isSubmitting}
                    />
                </div>

                {/* Console */}
                <div className="h-[300px] p-4 overflow-y-auto">
                    <TestConsole
                        results={testResults}
                        status={submissionResult?.status}
                        errorMessage={submissionResult?.errorMessage}
                        runtime={submissionResult?.runtime}
                        memory={submissionResult?.memory}
                    />
                </div>
            </div>
        </div>
    );
}
