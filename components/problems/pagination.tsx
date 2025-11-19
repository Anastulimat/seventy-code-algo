"use client";

import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,} from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
                               currentPage,
                               totalPages,
                               onPageChange,
                           }: PaginationProps) {
    const pages = generatePageNumbers(currentPage, totalPages);

    return (
        <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
            </div>

            <div className="flex items-center gap-2">
                {/* Première page */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                >
                    <ChevronsLeft className="h-4 w-4"/>
                </Button>

                {/* Page précédente */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4"/>
                </Button>

                {/* Numéros de page */}
                <div className="hidden sm:flex gap-1">
                    {pages.map((page, index) =>
                            page === "..." ? (
                                <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
                            ) : (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => onPageChange(page as number)}
                                >
                                    {page}
                                </Button>
                            )
                    )}
                </div>

                {/* Page suivante */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4"/>
                </Button>

                {/* Dernière page */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronsRight className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
}

function generatePageNumbers(
    currentPage: number,
    totalPages: number
): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) {
                pages.push(i);
            }
            pages.push("...");
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1);
            pages.push("...");
            for (let i = totalPages - 3; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push("...");
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push("...");
            pages.push(totalPages);
        }
    }

    return pages;
}
