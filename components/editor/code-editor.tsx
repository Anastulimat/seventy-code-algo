"use client";

import {useState} from "react";
import Editor from "@monaco-editor/react";
import {useTheme} from "next-themes";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Play, RotateCcw, Send} from "lucide-react";
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

export function CodeEditor({
                               initialCode,
                               language: initialLanguage = Language.JAVASCRIPT,
                               onRun,
                               onSubmit,
                               isRunning = false,
                               isSubmitting = false,
                           }: CodeEditorProps) {
    const {theme} = useTheme();
    const [code, setCode] = useState(initialCode || DEFAULT_CODE_TEMPLATES[initialLanguage]);
    const [language, setLanguage] = useState(initialLanguage);

    const handleLanguageChange = (newLanguage: Language) => {
        setLanguage(newLanguage);
        setCode(DEFAULT_CODE_TEMPLATES[newLanguage]);
    };

    const handleReset = () => {
        setCode(DEFAULT_CODE_TEMPLATES[language]);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Barre d'outils */}
            <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <Select value={language} onValueChange={(value) => handleLanguageChange(value as Language)}>
                    <SelectTrigger className="w-[180px]">
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

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4 mr-2"/>
                        Réinitialiser
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRun?.(code, language)}
                        disabled={isRunning}
                    >
                        <Play className="h-4 w-4 mr-2"/>
                        {isRunning ? "Exécution..." : "Tester"}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onSubmit?.(code, language)}
                        disabled={isSubmitting}
                    >
                        <Send className="h-4 w-4 mr-2"/>
                        {isSubmitting ? "Soumission..." : "Soumettre"}
                    </Button>
                </div>
            </div>

            {/* Éditeur */}
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={LANGUAGE_MAP[language]}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                        minimap: {enabled: false},
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: "on",
                    }}
                />
            </div>
        </div>
    );
}
