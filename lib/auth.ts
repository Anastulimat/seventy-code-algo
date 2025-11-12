import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import {prisma} from "@/lib/prisma";
import {admin, username} from "better-auth/plugins";

// ----------------------------------------------------------------------

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders: {
        github: {
            clientId: '',
            clientSecret: '',
        },
    },
    plugins: [
        admin(),
        username(),
    ],
});
