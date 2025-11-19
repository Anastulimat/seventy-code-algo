"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Search, X} from "lucide-react";
import type {ProblemFilters} from "@/types";
import {Difficulty, UserProblemStatus} from "@/lib/generated/prisma/enums";

// ----------------------------------------------------------------------

interface ProblemFiltersComponentProps {
    filters: ProblemFilters;
    onFiltersChange: (filters: ProblemFilters) => void;
    availableTags: Array<{ id: string; name: string; slug: string }>;
    isAuthenticated?: boolean;
}

// ----------------------------------------------------------------------

export function ProblemFiltersComponent({
                                            filters,
                                            onFiltersChange,
                                            availableTags,
                                            isAuthenticated,
                                        }: ProblemFiltersComponentProps) {
    const [searchInput, setSearchInput] = useState(filters.search || "");

    const handleDifficultyChange = (value: string) => {
        onFiltersChange({
            ...filters,
            difficulty: value === "ALL" ? undefined : (value as Difficulty),
            page: 1,
        });
    };

    const handleStatusChange = (value: string) => {
        onFiltersChange({
            ...filters,
            status: value as UserProblemStatus | "ALL",
            page: 1,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFiltersChange({
            ...filters,
            search: searchInput,
            page: 1,
        });
    };

    const handleTagToggle = (tagSlug: string) => {
        const currentTags = filters.tags || [];
        const newTags = currentTags.includes(tagSlug)
            ? currentTags.filter((t) => t !== tagSlug)
            : [...currentTags, tagSlug];

        onFiltersChange({
            ...filters,
            tags: newTags,
            page: 1,
        });
    };

    const handleClearFilters = () => {
        setSearchInput("");
        onFiltersChange({
            page: 1,
            limit: filters.limit,
        });
    };

    const hasActiveFilters =
        filters.difficulty ||
        (filters.tags && filters.tags.length > 0) ||
        filters.status ||
        filters.search;

    return (
        <div className="space-y-4">
            {/* Recherche */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input
                        placeholder="Rechercher un problème..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button type="submit">Rechercher</Button>
            </form>

            {/* Filtres */}
            <div className="flex flex-wrap gap-4">
                {/* Difficulté */}
                <div className="flex-1 min-w-[150px]">
                    <Label htmlFor="difficulty" className="text-xs mb-2 block">
                        Difficulté
                    </Label>
                    <Select
                        value={filters.difficulty || "ALL"}
                        onValueChange={handleDifficultyChange}
                    >
                        <SelectTrigger id="difficulty">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Toutes</SelectItem>
                            <SelectItem value="EASY">Facile</SelectItem>
                            <SelectItem value="MEDIUM">Moyen</SelectItem>
                            <SelectItem value="HARD">Difficile</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Statut (uniquement si authentifié) */}
                {isAuthenticated && (
                    <div className="flex-1 min-w-[150px]">
                        <Label htmlFor="status" className="text-xs mb-2 block">
                            Statut
                        </Label>
                        <Select
                            value={filters.status || "ALL"}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger id="status">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tous</SelectItem>
                                <SelectItem value="SOLVED">Résolus</SelectItem>
                                <SelectItem value="ATTEMPTED">Tentés</SelectItem>
                                <SelectItem value="NOT_STARTED">Non commencés</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Clear filters */}
                {hasActiveFilters && (
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            onClick={handleClearFilters}
                            className="gap-2"
                        >
                            <X className="h-4 w-4"/>
                            Réinitialiser
                        </Button>
                    </div>
                )}
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
                <div>
                    <Label className="text-xs mb-2 block">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                            const isSelected = filters.tags?.includes(tag.slug);
                            return (
                                <Badge
                                    key={tag.id}
                                    variant={isSelected ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => handleTagToggle(tag.slug)}
                                >
                                    {tag.name}
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
