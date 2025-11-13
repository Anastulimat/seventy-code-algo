import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function fuzzyMatch(text: string, search: string): boolean {
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();

    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
        if (textLower[i] === searchLower[searchIndex]) {
            searchIndex++;
        }
    }

    return searchIndex === searchLower.length;
}

export function highlightMatch(text: string, search: string): React.ReactNode {
    if (!search) return text;

    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
        regex.test(part) ? <mark key={i} className="bg-yellow-200"> {part} </mark> : part
    );
}

export function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
        case 'Easy':
            return 'text-green-600 bg-green-50';
        case 'Medium':
            return 'text-yellow-600 bg-yellow-50';
        case 'Hard':
            return 'text-red-600 bg-red-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
}
