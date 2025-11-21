"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ProblemDescription } from "@/components/problems/problem-description";
import { ProblemFull, SubmissionResult, TestCase } from "@/types";
import { useState } from "react";
import { Language } from "@/lib/generated/prisma/enums";
import { runCode, submitCode } from "@/actions/submissions";
import { toast } from "sonner";
import { CodeEditor } from "@/components/editor/code-editor";
import { TestConsole } from "@/components/editor/test-console";
import {
    BookOpen,
    Code2,
    Terminal,
    ChevronRight,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useRef } from "react";

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

export function ProblemWorkspace({ problem }: ProblemWorkspaceProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [submissionResult, setSubmissionResult] =
        useState<SubmissionResult | null>(null);

    // Refs pour contrôler les panels
    const descriptionPanelRef = useRef<ImperativePanelHandle>(null);
    const editorPanelRef = useRef<ImperativePanelHandle>(null);
    const consolePanelRef = useRef<ImperativePanelHandle>(null);

    // États pour savoir si les panels sont collapsés
    const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

    const handleRun = async (code: string, language: Language) => {
        if (!problem) return;

        setIsRunning(true);
        setTestResults([]);ResizableHandle
        setSubmissionResult(null);

        try {
            const result = await runCode(problem.id, code, language);

            if (result.success && result.data) {
                setSubmissionResult(result.data);

                const results: TestResult[] = problem.testCases.map(
                    (testCase, index) => ({
                        testCase,
                        passed: index < result.data.testsPassed,
                        runtime: result.data.runtime,
                    })
                );

                setTestResults(results);

                if (result.data.status === "ACCEPTED") {
                    toast.success(`Tous les tests sont passés ! 🎉`);
                } else {
                    toast.error(
                        `${result.data.testsPassed}/${result.data.testsTotal} tests passés`
                    );
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

        setIsSubmitting(true);
        setTestResults([]);
        setSubmissionResult(null);

        try {
            const result = await submitCode(problem.id, code, language);

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
                toast.error(
                    "error" in result ? result.error : "Erreur lors de la soumission"
                );
            }
        } catch (error) {
            toast.error("Erreur lors de la soumission du code");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
            {/* Panneau gauche - Description */}
            <ResizablePanel
                ref={descriptionPanelRef}
                defaultSize={45}
                minSize={20}
                collapsible={true}
                collapsedSize={3}
                onCollapse={() => setIsDescriptionCollapsed(true)}
                onExpand={() => setIsDescriptionCollapsed(false)}
            >
                {isDescriptionCollapsed ? (
                    <div
                        className="h-full flex items-center justify-center bg-dark-layer-2 cursor-pointer hover:bg-dark-layer-1 transition-colors group relative"
                        onClick={() => descriptionPanelRef.current?.expand()}
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-8">
                                <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                <div className="transform -rotate-90 whitespace-nowrap my-4">
                        <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors tracking-widest">
                            Description
                        </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors animate-pulse" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full px-2 pt-2">
                        <ProblemDescription problem={problem} />
                    </div>
                )}
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Panneau droit - Éditeur + Console */}
            <ResizablePanel defaultSize={55} minSize={30}>
                <ResizablePanelGroup direction="vertical">
                    {/* Éditeur */}
                    <ResizablePanel
                        ref={editorPanelRef}
                        defaultSize={65}
                        minSize={20}
                        collapsible={true}
                        collapsedSize={5}
                        onCollapse={() => setIsEditorCollapsed(true)}
                        onExpand={() => setIsEditorCollapsed(false)}
                    >
                        {isEditorCollapsed ? (
                            <div
                                className="h-full flex items-center justify-center bg-dark-layer-2 cursor-pointer hover:bg-dark-layer-1 transition-colors group"
                                onClick={() => editorPanelRef.current?.expand()}
                            >
                                <div className="flex items-center gap-3 text-gray-400 group-hover:text-white transition-colors">
                                    <ChevronDown className="w-4 h-4 animate-pulse" />
                                    <Code2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">Éditeur de code</span>
                                    <ChevronDown className="w-4 h-4 animate-pulse" />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full overflow-hidden">
                                <CodeEditor
                                    onRun={handleRun}
                                    onSubmit={handleSubmit}
                                    isRunning={isRunning}
                                    isSubmitting={isSubmitting}
                                />
                            </div>
                        )}
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Console */}
                    <ResizablePanel
                        ref={consolePanelRef}
                        defaultSize={35}
                        minSize={15}
                        collapsible={true}
                        collapsedSize={5}
                        onCollapse={() => setIsConsoleCollapsed(true)}
                        onExpand={() => setIsConsoleCollapsed(false)}
                    >
                        {isConsoleCollapsed ? (
                            <div
                                className="h-full flex items-center justify-center bg-dark-layer-1 cursor-pointer hover:bg-dark-layer-2 transition-colors group"
                                onClick={() => consolePanelRef.current?.expand()}
                            >
                                <div className="flex items-center gap-3 text-gray-400 group-hover:text-white transition-colors">
                                    <ChevronUp className="w-4 h-4 animate-pulse" />
                                    <Terminal className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                    Console {testResults.length > 0 && `(${testResults.length} tests)`}
                  </span>
                                    <ChevronUp className="w-4 h-4 animate-pulse" />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto bg-dark-layer-1">
                                <TestConsole
                                    results={testResults}
                                    status={submissionResult?.status}
                                    errorMessage={submissionResult?.errorMessage}
                                    runtime={submissionResult?.runtime}
                                    memory={submissionResult?.memory}
                                />
                            </div>
                        )}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
