import {Badge} from "@/components/ui/badge";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

// ----------------------------------------------------------------------

interface featureProps {
    title: string;
    description: string;
    icon: string;
}

const features: featureProps[] = [
    {
        title: 'Comprehensive Courses',
        description: "Access a wide range of carefully curated courses designed by industry experts.",
        icon: '📚'
    },
    {
        title: 'Interactive Learning',
        description: "Engage with interactive content, quizzes, and assignments to enhance your learning experience",
        icon: '🎮'
    },
    {
        title: 'Progress Tracking',
        description: "Monitor your progress and achievements with detailed analytics and personalized dashboards",
        icon: '📈'
    },
    {
        title: 'Community Support',
        description: "Join a vibrant community of learners and instructors to collaborate and share knowledge",
        icon: '🧑‍🏫'
    },

];

// ----------------------------------------------------------------------

export default function Home() {

    return (
        <>
            <section className="relative py-20">
                <div className="flex flex-col items-center text-center space-y-8">
                    <Badge variant="outline">
                        The future for Online Education
                    </Badge>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        Elevate your learning experience
                    </h1>

                    <p className="max-w-[700px] text-muted-foreground md:text-lg">
                        Discover a new way to learn with our modern, interactive learning management system.
                        Access high-quality course anytime, anywhere.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link
                            className={buttonVariants({
                                size: "lg",
                            })}
                            href="/problemset"
                        >
                            Start practicing
                        </Link>

                        <Link
                            className={buttonVariants({
                                size: "lg",
                                variant: "outline",
                            })}
                            href="/login"
                        >
                            Learn more
                        </Link>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
                {features.map((feature, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </>
    );
}
