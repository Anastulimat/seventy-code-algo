import {LoginForm} from "@/app/auth/_components/login-form";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
// ----------------------------------------------------------------------

export default async function SignupPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (session) {
        return redirect("/");
    }

    return (
        <LoginForm/>
    );
}
