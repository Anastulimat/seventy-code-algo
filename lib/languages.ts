// lib/languages.ts
export const SUPPORTED_LANGUAGES = {
    javascript: '18.15.0',
    typescript: '5.0.3',
    python: '3.10.0',
    java: '15.0.2',
    cpp: '10.2.0',
    c: '10.2.0',
    csharp: '6.12.0',
    rust: '1.68.2',
    go: '1.16.2',
    ruby: '3.0.1',
    php: '8.2.3',
    swift: '5.3.3',
    kotlin: '1.8.20',
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;
