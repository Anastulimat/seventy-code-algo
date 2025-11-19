import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {Difficulty} from "@/lib/generated/prisma/enums";

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


export function getDifficultyColor(difficulty: Difficulty): string {
    difficulty = capitalize(difficulty) as Difficulty;
    switch (difficulty) {
        case 'Easy':
            return 'text-green-600 bg-green-600/10';
        case 'Medium':
            return 'text-yellow-600 bg-yellow-600/10';
        case 'Hard':
            return 'text-red-600 bg-red-600/10 dark:text-red-500';
        default:
            return 'text-gray-600 bg-gray-600/10';
    }
}

export function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
