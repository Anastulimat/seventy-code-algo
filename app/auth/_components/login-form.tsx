"use client";

import {ComponentProps, useState, useTransition} from "react";
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import Link from "next/link";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {loginSchema, LoginSchemaType} from "@/schema/loginSchema";
import {authClient} from "@/lib/auth-client";
import {toast} from "sonner";

// ----------------------------------------------------------------------

export function LoginForm(
    {
        className,
        ...props
    }: ComponentProps<"div">) {
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginSchemaType) => {
        startTransition(async () => {
            try {
                setError("");

                const isEmail = data.emailOrUsername.includes("@");
                let result;

                if (isEmail) {
                    result = await authClient.signIn.email({
                        email: data.emailOrUsername,
                        password: data.password,
                    });
                } else {
                    result = await authClient.signIn.username({
                        username: data.emailOrUsername,
                        password: data.password,
                    });
                }

                if (result.error) {
                    setError("Invalid credentials. Please check your email/username and password.");
                    return;
                }

                toast.success(`Welcome back, ${result?.data?.user?.name}`);
                router.push("/");
            } catch (err) {
                setError("An unexpected error occurred. Please try again.");
                console.error(err);
            }
        });
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>
                            {error && (
                                <div className="text-sm text-red-500 text-center p-2 bg-red-50 rounded">
                                    {error}
                                </div>
                            )}

                            <Field>
                                <FieldLabel htmlFor="emailOrUsername">Email or Username</FieldLabel>
                                <Input
                                    id="emailOrUsername"
                                    type="text"
                                    placeholder="Enter your email or username"
                                    disabled={isPending}
                                    {...register("emailOrUsername")}
                                />
                                {errors.emailOrUsername && (
                                    <p className="text-sm text-red-500">{errors.emailOrUsername.message}</p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    disabled={isPending}
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password.message}</p>
                                )}
                            </Field>

                            <Field>
                                <div className="flex items-center justify-end">
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </Field>

                            <Field>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full"
                                >
                                    {isPending ? "Signing in..." : "Sign in"}
                                </Button>
                            </Field>

                            <FieldDescription className="text-center">
                                Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
