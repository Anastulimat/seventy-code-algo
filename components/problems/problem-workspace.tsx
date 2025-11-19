"use client";

import Split from "react-split";
import {ProblemDescription} from "@/components/problems/problem-description";
import {ProblemFull, SubmissionResult, TestCase} from "@/types";
import {useState} from "react";
import {Language} from "@/lib/generated/prisma/enums";
import {runCode, submitCode} from "@/actions/submissions";
import {toast} from "sonner";
import {CodeEditor} from "@/components/editor/code-editor";
import {TestConsole} from "@/components/editor/test-console";


// ----------------------------------------------------------------------

interface ProblemWorkspaceProps {
    problem: ProblemFull;
}

interface TestResult {
    testCase: TestCase;
    passed: boolean;
    actualOutput?: string;
    runtime?: number;
}

// ----------------------------------------------------------------------

export function ProblemWorkspace({problem}: ProblemWorkspaceProps) {

    const [loading, setLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

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

    return (
        <Split
            className="split flex-1 flex"
            sizes={[50, 50]}
            minSize={300}
            expandToMin={false}
            gutterSize={10}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
        >
            {/* Panneau gauche - Description */}
            <div className="overflow-y-auto">
                <ProblemDescription problem={problem}/>
            </div>

            {/* Panneau droit - Éditeur + Console */}
            <div className="flex flex-col">
                {/* Split vertical pour éditeur et console */}
                <Split
                    className="split flex flex-col flex-1"
                    sizes={[60, 40]}
                    minSize={100}
                    expandToMin={false}
                    gutterSize={10}
                    gutterAlign="center"
                    snapOffset={30}
                    dragInterval={1}
                    direction="vertical"
                    cursor="row-resize"
                >
                    {/* Éditeur */}
                    <div className="overflow-hidden">
                        <CodeEditor
                            onRun={handleRun}
                            onSubmit={handleSubmit}
                            isRunning={isRunning}
                            isSubmitting={isSubmitting}
                        />
                    </div>

                    {/* Console */}
                    <div className="overflow-y-auto bg-dark-layer-1">
                        <TestConsole
                            results={testResults}
                            status={submissionResult?.status}
                            errorMessage={submissionResult?.errorMessage}
                            runtime={submissionResult?.runtime}
                            memory={submissionResult?.memory}
                        />
                    </div>
                </Split>
            </div>
        </Split>
    );
}
