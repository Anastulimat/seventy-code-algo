import {ReactNode} from "react";
import {Navbar} from "@/components/layout/navbar";

// ----------------------------------------------------------------------

export default function PublicLayout({children}: { children: ReactNode }) {
    return (
        <>
            <Navbar/>
            <main className="mx-auto px-4">
                {children}
            </main>
        </>
    );
}
