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
import {signupSchema, SignupSchemaType} from "@/schema/signupSchema";
import {authClient} from "@/lib/auth-client";
import {toast} from "sonner";
import {tryCatch} from "@/lib/try-catch";

// ----------------------------------------------------------------------

export function SignupForm(
    {
        className,
        ...props
    }
    : ComponentProps<"div">) {
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<SignupSchemaType>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = (data: SignupSchemaType) => {
        startTransition(async () => {
            setError("");

            const {data: result, error} = await tryCatch(
                authClient.signUp.email({
                    email: data.email,
                    password: data.password,
                    username: data.username,
                    name: data.username,
                    fetchOptions: {
                        onSuccess: async () => {
                            toast.success("Sign up successfully");
                            router.push("/");
                        }
                    }
                })
            );

            if (error) {
                setError("An unexpected error occurred");
                console.error(error);
                return;
            }

            if (result?.error) {
                setError(result.error.message || "An error occurred during signup");
                return;
            }
        });
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Create your account</CardTitle>
                    <CardDescription>
                        Enter your information below to create your account
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
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <Input
                                    id="username"
                                    type="text"
                                    disabled={isPending}
                                    {...register("username")}
                                />
                                {errors.username && (
                                    <p className="text-sm text-red-500">{errors.username.message}</p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    disabled={isPending}
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
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
                                <FieldLabel htmlFor="confirm-password">
                                    Confirm Password
                                </FieldLabel>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    disabled={isPending}
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                                )}
                            </Field>

                            <Field>
                                <Button type="submit" disabled={isPending} className="w-full">
                                    {isPending ? "Creating account..." : "Create Account"}
                                </Button>
                            </Field>

                            <FieldDescription className="text-center">
                                Already have an account? <Link href="/auth/login">Sign in</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    );
}
