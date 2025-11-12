"use client";

import Link from "next/link";
import {ThemeToggle} from "@/components/ui/theme-toggle";
import {authClient} from "@/lib/auth-client";
import {buttonVariants} from "@/components/ui/button";
import {UserDropdown} from "@/app/(public)/_components/UserDropdown";

// ----------------------------------------------------------------------

const navLinks = [
    {
        name: 'Home',
        href: '/',
    },
    {
        name: 'Courses',
        href: '/courses',
    },
    {
        name: 'Dashboard',
        href: '/dashboard',
    }
]

// ----------------------------------------------------------------------

export function Navbar() {

    const {data: session, isPending} = authClient.useSession();

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60">
            <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
                <Link href="/public" className="flex items-center space-x-2 mr-4">
                    SeventyCode Algo.
                </Link>

                <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
                    <div className="flex items-center space-x-2">
                        {navLinks.map(link => (
                            <Link
                                href={link.href}
                                key={link.name}
                                className="text-sm font-medium hover:text-primary"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                        <ThemeToggle/>
                        {isPending ? null : session ? (
                            <UserDropdown
                                name={session?.user.name && session?.user.name.length > 0
                                    ? session?.user.name
                                    : session?.user.email.split("@")[0]}
                                email={session.user.email || ""}
                                image={session?.user.image ?? `https://avatar.vercel.sh/${session?.user.email}`}
                            />
                        ) : (
                            <>
                                <Link href="/auth/login" className={buttonVariants({
                                    variant: "secondary"
                                })}
                                >
                                    Login
                                </Link>

                                <Link href="/auth/login" className={buttonVariants()}>
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    )
}
