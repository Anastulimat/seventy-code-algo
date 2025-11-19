"use client";

import {useEffect, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {getLeaderboard} from "@/actions/dashboard";
import {Award, Medal, Trophy} from "lucide-react";

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            const result = await getLeaderboard(50);
            if (result.success && result.data) {
                setLeaderboard(result.data);
            }
            setLoading(false);
        };

        loadLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="container py-8 space-y-8">
                <Skeleton className="h-12 w-64"/>
                <Skeleton className="h-96 w-full"/>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Classement</h1>
                <p className="text-muted-foreground">
                    Top {leaderboard.length} développeurs
                </p>
            </div>

            {/* Top 3 */}
            {leaderboard.length >= 3 && (
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    {/* 2ème place */}
                    <Card className="border-2 border-muted">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="flex justify-center">
                                <Medal className="h-12 w-12 text-gray-400"/>
                            </div>
                            <Avatar className="h-20 w-20 mx-auto">
                                <AvatarImage src={leaderboard[1].user.image || ""}/>
                                <AvatarFallback>
                                    {leaderboard[1].user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-lg">
                                    {leaderboard[1].user.name || leaderboard[1].user.username}
                                </p>
                                <p className="text-3xl font-bold text-muted-foreground">2</p>
                                <Badge variant="secondary" className="mt-2">
                                    {leaderboard[1].stats.totalSolved} problèmes
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 1ère place */}
                    <Card className="border-2 border-yellow-500 relative -mt-4">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="flex justify-center">
                                <Trophy className="h-16 w-16 text-yellow-500"/>
                            </div>
                            <Avatar className="h-24 w-24 mx-auto">
                                <AvatarImage src={leaderboard[0].user.image || ""}/>
                                <AvatarFallback>
                                    {leaderboard[0].user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-xl">
                                    {leaderboard[0].user.name || leaderboard[0].user.username}
                                </p>
                                <p className="text-4xl font-bold text-yellow-500">1</p>
                                <Badge className="mt-2 bg-yellow-500">
                                    {leaderboard[0].stats.totalSolved} problèmes
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3ème place */}
                    <Card className="border-2 border-muted">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="flex justify-center">
                                <Award className="h-12 w-12 text-amber-600"/>
                            </div>
                            <Avatar className="h-20 w-20 mx-auto">
                                <AvatarImage src={leaderboard[2].user.image || ""}/>
                                <AvatarFallback>
                                    {leaderboard[2].user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-lg">
                                    {leaderboard[2].user.name || leaderboard[2].user.username}
                                </p>
                                <p className="text-3xl font-bold text-muted-foreground">3</p>
                                <Badge variant="secondary" className="mt-2">
                                    {leaderboard[2].stats.totalSolved} problèmes
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tableau complet */}
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Rang</TableHead>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead className="text-center">Total</TableHead>
                                <TableHead className="text-center hidden sm:table-cell">
                                    Facile
                                </TableHead>
                                <TableHead className="text-center hidden sm:table-cell">
                                    Moyen
                                </TableHead>
                                <TableHead className="text-center hidden md:table-cell">
                                    Difficile
                                </TableHead>
                                <TableHead className="text-center hidden lg:table-cell">
                                    Taux
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboard.map((entry) => (
                                <TableRow key={entry.user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {entry.rank <= 3 && (
                                                <RankIcon rank={entry.rank}/>
                                            )}
                                            <span className="font-semibold">#{entry.rank}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={entry.user.image || ""}/>
                                                <AvatarFallback>
                                                    {entry.user.name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">
                        {entry.user.name || entry.user.username || "Anonyme"}
                      </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-semibold">
                                        {entry.stats.totalSolved}
                                    </TableCell>
                                    <TableCell className="text-center hidden sm:table-cell">
                    <span className="text-green-500">
                      {entry.stats.easySolved}
                    </span>
                                    </TableCell>
                                    <TableCell className="text-center hidden sm:table-cell">
                    <span className="text-yellow-500">
                      {entry.stats.mediumSolved}
                    </span>
                                    </TableCell>
                                    <TableCell className="text-center hidden md:table-cell">
                    <span className="text-red-500">
                      {entry.stats.hardSolved}
                    </span>
                                    </TableCell>
                                    <TableCell className="text-center hidden lg:table-cell">
                                        {entry.stats.acceptanceRate.toFixed(1)}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function RankIcon({rank}: { rank: number }) {
    switch (rank) {
        case 1:
            return <Trophy className="h-5 w-5 text-yellow-500"/>;
        case 2:
            return <Medal className="h-5 w-5 text-gray-400"/>;
        case 3:
            return <Award className="h-5 w-5 text-amber-600"/>;
        default:
            return null;
    }
}
