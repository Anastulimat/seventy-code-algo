"use client";

import {useState, useEffect} from "react";
import Editor, {loader} from "@monaco-editor/react";
import {useTheme} from "next-themes";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Play, RotateCcw, Send, Palette} from "lucide-react";
import {Language} from "@/lib/generated/prisma/enums";

interface CodeEditorProps {
    initialCode?: string;
    language?: Language;
    onRun?: (code: string, language: Language) => void;
    onSubmit?: (code: string, language: Language) => void;
    isRunning?: boolean;
    isSubmitting?: boolean;
}

const LANGUAGE_MAP: Record<Language, string> = {
    JAVASCRIPT: "javascript",
    TYPESCRIPT: "typescript",
    PYTHON: "python",
    JAVA: "java",
    CPP: "cpp",
    C: "c",
    CSHARP: "csharp",
    GO: "go",
    RUST: "rust",
    PHP: "php",
    SWIFT: "swift",
    KOTLIN: "kotlin",
    RUBY: "ruby",
};

// 10 Thèmes pour Monaco Editor
const EDITOR_THEMES = [
    { value: "vs-dark", label: "VS Dark", icon: "🌙" },
    { value: "light", label: "Light", icon: "☀️" },
    { value: "hc-black", label: "High Contrast Dark", icon: "⚫" },
    { value: "monokai", label: "Monokai", icon: "🎨" },
    { value: "github", label: "GitHub", icon: "🐙" },
    { value: "dracula", label: "Dracula", icon: "🧛" },
    { value: "nord", label: "Nord", icon: "❄️" },
    { value: "solarized-dark", label: "Solarized Dark", icon: "🌅" },
    { value: "cobalt", label: "Cobalt", icon: "💎" },
    { value: "night-owl", label: "Night Owl", icon: "🦉" },
] as const;

type EditorTheme = typeof EDITOR_THEMES[number]["value"];

const DEFAULT_CODE_TEMPLATES: Record<Language, string> = {
    JAVASCRIPT: `function twoSum(nums, target) {
    // Votre code ici
}`,
    TYPESCRIPT: `function twoSum(nums: number[], target: number): number[] {
    // Votre code ici
}`,
    PYTHON: `def twoSum(nums, target):
    # Votre code ici
    pass`,
    JAVA: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Votre code ici
    }
}`,
    CPP: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Votre code ici
    }
};`,
    C: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Votre code ici
}`,
    CSHARP: `public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        // Votre code ici
    }
}`,
    GO: `func twoSum(nums []int, target int) []int {
    // Votre code ici
}`,
    RUST: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Votre code ici
    }
}`,
    PHP: `class Solution {
    function twoSum($nums, $target) {
        // Votre code ici
    }
}`,
    SWIFT: `class Solution {
    func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
        // Votre code ici
    }
}`,
    KOTLIN: `class Solution {
    fun twoSum(nums: IntArray, target: Int): IntArray {
        // Votre code ici
    }
}`,
    RUBY: `def two_sum(nums, target)
    # Votre code ici
end`,
};

// ----------------------------------------------------------------------

export function CodeEditor({
                               initialCode,
                               language: initialLanguage = Language.JAVASCRIPT,
                               onRun,
                               onSubmit,
                               isRunning = false,
                               isSubmitting = false,
                           }: CodeEditorProps) {
    const {theme: systemTheme} = useTheme();
    const [code, setCode] = useState(initialCode || DEFAULT_CODE_TEMPLATES[initialLanguage]);
    const [language, setLanguage] = useState(initialLanguage);
    const [editorTheme, setEditorTheme] = useState<EditorTheme>("vs-dark");
    const [isEditorReady, setIsEditorReady] = useState(false);

    // Charger les thèmes personnalisés
    useEffect(() => {
        const loadThemes = async () => {
            const monaco = await loader.init();

            // Importer les thèmes depuis monaco-themes
            const themes = await import('monaco-themes/themes/themelist.json');

            // Définir les thèmes personnalisés
            const themeImports: Record<string, () => Promise<any>> = {
                'monokai': () => import('monaco-themes/themes/Monokai.json'),
                'github': () => import('monaco-themes/themes/GitHub.json'),
                'dracula': () => import('monaco-themes/themes/Dracula.json'),
                'nord': () => import('monaco-themes/themes/Nord.json'),
                'solarized-dark': () => import('monaco-themes/themes/Solarized-dark.json'),
                'cobalt': () => import('monaco-themes/themes/Cobalt.json'),
                'night-owl': () => import('monaco-themes/themes/Night Owl.json'),
            };

            for (const [name, importFn] of Object.entries(themeImports)) {
                try {
                    const themeData = await importFn();
                    monaco.editor.defineTheme(name, themeData.default || themeData);
                } catch (error) {
                    console.warn(`Failed to load theme ${name}:`, error);
                }
            }

            setIsEditorReady(true);
        };

        loadThemes();
    }, []);

    const handleLanguageChange = (newLanguage: Language) => {
        setLanguage(newLanguage);
        setCode(DEFAULT_CODE_TEMPLATES[newLanguage]);
    };

    const handleReset = () => {
        setCode(DEFAULT_CODE_TEMPLATES[language]);
    };

    const handleThemeChange = (value: EditorTheme) => {
        setEditorTheme(value);
        if (typeof window !== "undefined") {
            localStorage.setItem("editorTheme", value);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Barre d'outils */}
            <div className="flex items-center justify-between gap-2 p-2 border-b bg-muted/30">
                {/* Gauche - Sélecteurs */}
                <div className="flex items-center gap-2">
                    {/* Sélecteur de langage */}
                    <Select value={language} onValueChange={(value) => handleLanguageChange(value as Language)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={Language.JAVASCRIPT}>JavaScript</SelectItem>
                            <SelectItem value={Language.TYPESCRIPT}>TypeScript</SelectItem>
                            <SelectItem value={Language.PYTHON}>Python</SelectItem>
                            <SelectItem value={Language.JAVA}>Java</SelectItem>
                            <SelectItem value={Language.CPP}>C++</SelectItem>
                            <SelectItem value={Language.C}>C</SelectItem>
                            <SelectItem value={Language.CSHARP}>C#</SelectItem>
                            <SelectItem value={Language.GO}>Go</SelectItem>
                            <SelectItem value={Language.RUST}>Rust</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sélecteur de thème */}
                    <Select value={editorTheme} onValueChange={handleThemeChange}>
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Palette className="h-4 w-4 flex-shrink-0" />
                                <SelectValue className="truncate" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {EDITOR_THEMES.map((theme) => (
                                <SelectItem key={theme.value} value={theme.value}>
                                    <div className="flex items-center gap-2">
                                        <span className="flex-shrink-0">{theme.icon}</span>
                                        <span className="truncate">{theme.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Droite - Boutons d'action */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        disabled={isRunning || isSubmitting}
                        className="gap-2"
                    >
                        <RotateCcw className="h-4 w-4"/>
                        Réinitialiser
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRun?.(code, language)}
                        disabled={isRunning}
                        className="gap-2"
                    >
                        <Play className="h-4 w-4"/>
                        {isRunning ? "Exécution..." : "Tester"}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onSubmit?.(code, language)}
                        disabled={isSubmitting || isRunning}
                        className="gap-2"
                    >
                        <Send className="h-4 w-4"/>
                        {isSubmitting ? "Soumission..." : "Soumettre"}
                    </Button>
                </div>
            </div>

            {/* Éditeur */}
            <div className="flex-1">
                {isEditorReady ? (
                    <Editor
                        height="100%"
                        language={LANGUAGE_MAP[language]}
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        theme={editorTheme}
                        options={{
                            minimap: {enabled: false},
                            fontSize: 14,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            wordWrap: "on",
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                            fontLigatures: true,
                            cursorBlinking: "smooth",
                            smoothScrolling: true,
                            padding: { top: 16, bottom: 16 },
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Chargement de l'éditeur...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
