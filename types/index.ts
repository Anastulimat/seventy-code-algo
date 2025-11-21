import {Difficulty, Language, SubmissionStatus, UserProblemStatus} from "@/lib/generated/prisma/enums";
import {ReactNode} from "react";

// ============================================
// TYPES DE BASE
// ============================================

export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string | null;
    username: string | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
}

export interface Example {
    id: string;
    problemId: string;
    input: string;
    output: string;
    explanation: string | null;
    order: number;
}

export interface TestCase {
    id: string;
    problemId: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    order: number;
}

export interface Problem {
    id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: Difficulty;
    order: number;
    constraints: string | null;
    acceptance: number;
    totalSubmissions: number;
    totalAccepted: number;
    isPremium: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Submission {
    id: string;
    userId: string;
    problemId: string;
    code: string;
    language: Language;
    status: SubmissionStatus;
    runtime: number | null;
    memory: number | null;
    testsPassed: number;
    testsTotal: number;
    errorMessage: string | null;
    createdAt: Date;
}

export interface UserProblem {
    id: string;
    userId: string;
    problemId: string;
    status: UserProblemStatus;
    attempts: number;
    solvedAt: Date | null;
    lastAttempt: Date;
    isFavorite: boolean;
    notes: string | null;
}

export interface UserStats {
    id: string;
    userId: string;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalSolved: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    currentStreak: number;
    maxStreak: number;
    lastSolvedAt: Date | null;
    ranking: number | null;
    updatedAt: Date;
}

export interface Solution {
    id: string;
    problemId: string;
    title: string;
    description: string;
    code: string;
    language: Language;
    upvotes: number;
    downvotes: number;
    isOfficial: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// TYPES AVEC RELATIONS
// ============================================

export interface ProblemWithTags extends Problem {
    tags: Array<{
        tag: Tag;
    }>;
}

export interface ProblemWithExamples extends Problem {
    examples: Example[];
    tags: Array<{
        tag: Tag;
    }>;
}

export interface ProblemWithTestCases extends Problem {
    testCases: TestCase[];
    examples: Example[];
}

export interface ProblemFull extends Problem {
    examples: Example[];
    testCases: TestCase[];
    tags: Array<{
        tag: Tag;
    }>;
}

export interface SubmissionWithDetails extends Submission {
    user: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    };
    problem: {
        id: string;
        title: string;
        slug: string;
        difficulty: Difficulty;
    };
}

export interface UserWithStats extends User {
    stats: UserStats | null;
}

export interface UserProblemWithDetails extends UserProblem {
    problem: ProblemWithTags;
}

// ============================================
// TYPES POUR LES FILTRES ET RECHERCHE
// ============================================

export interface ProblemFilters {
    difficulty?: Difficulty;
    tags?: string[];
    status?: UserProblemStatus | "ALL";
    search?: string;
    page?: number;
    limit?: number;
}

export interface ProblemListResult {
    problems: ProblemWithTags[];
    total: number;
    page: number;
    totalPages: number;
}

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

// ============================================
// TYPES POUR LES SOUMISSIONS
// ============================================

export interface SubmissionResult {
    status: SubmissionStatus;
    runtime?: number;
    memory?: number;
    testsPassed: number;
    testsTotal: number;
    errorMessage?: string;
    failedTestCase?: {
        input: string;
        expectedOutput: string;
        actualOutput: string;
    };
}

export interface CodeExecutionRequest {
    code: string;
    language: Language;
    problemId: string;
}

export interface TestCaseResult {
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    runtime?: number;
    memory?: number;
}

// ============================================
// TYPES POUR LES STATISTIQUES
// ============================================

export interface UserStatsData {
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalSolved: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
    currentStreak: number;
    maxStreak: number;
    ranking: number | null;
}

export interface DifficultyStats {
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
}

export interface ProgressData {
    date: string;
    problemsSolved: number;
    submissions: number;
}

// ============================================
// TYPES POUR LES RÉPONSES API/SERVER ACTIONS
// ============================================

export interface ActionResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ApiError {
    message: string;
    code?: string;
    field?: string;
}

// ============================================
// TYPES POUR LE CODE EDITOR
// ============================================

export interface CodeTemplate {
    language: Language;
    code: string;
}

export interface EditorSettings {
    theme: "vs-dark" | "light";
    fontSize: number;
    tabSize: number;
    minimap: boolean;
    wordWrap: "on" | "off";
    language: Language;
}

export interface EditorTab {
    id: string;
    label: string;
    content: React.ReactNode;
}

// ============================================
// TYPES POUR LES FORMULAIRES
// ============================================

export interface LoginFormData {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterFormData {
    name: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

export interface SubmitCodeFormData {
    code: string;
    language: Language;
}

// ============================================
// TYPES POUR LES COMPOSANTS UI
// ============================================

export interface TableColumn<T, K extends keyof T = keyof T> {
    key: K;
    label: string;
    sortable?: boolean;
    render?: (value: T[K], row: T) => ReactNode;
}

export interface SortConfig {
    key: string;
    direction: "asc" | "desc";
}

// ============================================
// TYPES UTILITAIRES
// ============================================

export type DifficultyColor = {
    [key in Difficulty]: string;
};

export type LanguageExtension = {
    [key in Language]: string;
};

export type StatusColor = {
    [key in SubmissionStatus]: string;
};

// ============================================
// CONSTANTES TYPÉES
// ============================================

export const DIFFICULTY_COLORS: DifficultyColor = {
    Easy: "text-green-500",
    Medium: "text-yellow-500",
    Hard: "text-red-500",
};

export const DIFFICULTY_BG_COLORS: DifficultyColor = {
    Easy: "bg-green-500/10 text-green-500",
    Medium: "bg-yellow-500/10 text-yellow-500",
    Hard: "bg-red-500/10 text-red-500",
};

export const STATUS_COLORS: StatusColor = {
    ACCEPTED: "text-green-500",
    WRONG_ANSWER: "text-red-500",
    TIME_LIMIT_EXCEEDED: "text-orange-500",
    MEMORY_LIMIT_EXCEEDED: "text-orange-500",
    RUNTIME_ERROR: "text-red-500",
    COMPILATION_ERROR: "text-red-500",
    PENDING: "text-gray-500",
};

export const LANGUAGE_EXTENSIONS: LanguageExtension = {
    JAVASCRIPT: "js",
    TYPESCRIPT: "ts",
    PYTHON: "py",
    JAVA: "java",
    CPP: "cpp",
    C: "c",
    CSHARP: "cs",
    GO: "go",
    RUST: "rs",
    PHP: "php",
    SWIFT: "swift",
    KOTLIN: "kt",
    RUBY: "rb",
};

// lib/piston/types.ts
export interface PistonExecuteOptions {
    language: string;
    version: string;
    files: Array<{
        name?: string;
        content: string;
    }>;
    stdin?: string;
    args?: string[];
    compile_timeout?: number;
    run_timeout?: number;
}

export interface PistonExecuteResult {
    language: string;
    version: string;
    run: {
        stdout: string;
        stderr: string;
        output: string;
        code: number;
        signal: string | null;
    };
    compile?: {
        stdout: string;
        stderr: string;
        output: string;
        code: number;
    };
}

export interface CodeExecutionResult {
    success: boolean;
    output?: string;
    stderr?: string;
    stdout?: string;
    exitCode?: number;
    error?: string;
    executionTime?: number;
}

export interface ExecuteOptions {
    language: string;
    version: string;
    files: Array<{
        name?: string;
        content: string;
    }>;
    stdin?: string;
    args?: string[];
    compile_timeout?: number;
    run_timeout?: number;
}

export interface ExecuteResult {
    language: string;
    version: string;
    run: {
        stdout: string;
        stderr: string;
        output: string;
        code: number;
        signal: string | null;
    };
    compile?: {
        stdout: string;
        stderr: string;
        output: string;
        code: number;
    };
}

export interface Runtime {
    language: string;
    version: string;
    aliases: string[];
}

export const ITEMS_PER_PAGE = 20;
export const MAX_CODE_LENGTH = 50000;
export const MAX_SUBMISSION_ATTEMPTS = 100;
