"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {getAllTags} from "@/actions/problems";
import {Code2} from "lucide-react";

interface TagWithCount {
    id: string;
    name: string;
    slug: string;
    problemCount: number;
}

export default function TagsPage() {
    const [tags, setTags] = useState<TagWithCount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTags = async () => {
            setLoading(true);
            const result = await getAllTags();
            if (result.success && result.data) {
                // TODO: Ajouter le compte de problèmes par tag
                const tagsWithCount = result.data.map((tag) => ({
                    ...tag,
                    problemCount: Math.floor(Math.random() * 50) + 10, // Mock pour l'instant
                }));
                setTags(tagsWithCount);
            }
            setLoading(false);
        };

        loadTags();
    }, []);

    if (loading) {
        return (
            <div className="container py-8 space-y-8">
                <Skeleton className="h-12 w-64"/>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(9)].map((_, i) => (
                        <Skeleton key={i} className="h-32"/>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Tags</h1>
                <p className="text-muted-foreground">
                    Explorez les problèmes par catégorie et sujet
                </p>
            </div>

            {/* Grille de tags */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tags.map((tag) => (
                    <Link key={tag.id} href={`/problems?tags=${tag.slug}`}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                                    <Code2 className="h-5 w-5 text-primary"/>
                                </div>
                                <CardDescription>
                                    {tag.problemCount} problème{tag.problemCount > 1 ? "s" : ""}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="secondary">{tag.slug}</Badge>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
