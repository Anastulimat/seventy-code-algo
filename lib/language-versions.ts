import { Language } from "@/lib/generated/prisma/enums";

export const LANGUAGE_VERSIONS: Record<Language, { language: string; version: string }> = {
    JAVASCRIPT: { language: "javascript", version: "18.15.0" },
    TYPESCRIPT: { language: "typescript", version: "5.0.3" },
    PYTHON: { language: "python", version: "3.10.0" },
    JAVA: { language: "java", version: "15.0.2" },
    CPP: { language: "cpp", version: "10.2.0" },
    C: { language: "c", version: "10.2.0" },
    CSHARP: { language: "csharp", version: "6.12.0" },
    GO: { language: "go", version: "1.16.2" },
    RUST: { language: "rust", version: "1.68.2" },
    PHP: { language: "php", version: "8.2.3" },
    SWIFT: { language: "swift", version: "5.3.3" },
    KOTLIN: { language: "kotlin", version: "1.8.20" },
    RUBY: { language: "ruby", version: "3.0.1" },
};
