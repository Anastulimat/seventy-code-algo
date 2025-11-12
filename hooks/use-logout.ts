"use client";

import {toast} from "sonner";
import {authClient} from "@/lib/auth-client";
import {useRouter} from "next/navigation";

// ----------------------------------------------------------------------

export function useLogout() {
    const router = useRouter();

    return async function () {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/");
                    toast.success("Logout successfully");
                },
                onError: () => {
                    toast.error("Failed to logout");
                }
            },
        });
    };
}
