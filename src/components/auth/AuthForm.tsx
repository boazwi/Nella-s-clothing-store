"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, type LoginFormValues } from "@/lib/validation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const isLogin = mode === "login";
  const heading = isLogin ? "Welcome back" : "Create your account";
  const cta = isLogin ? "Log in" : "Sign up";

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);
    try {
      if (isLogin) {
        await login(values.email, values.password);
      } else {
        await signUp(values.email, values.password);
      }
      const next = searchParams.get("next") || "/";
      router.push(next);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
  }

  return (
    <Card className="mx-auto max-w-md p-8">
      <h1 className="mb-1 font-serif text-2xl text-ink">{heading}</h1>
      <p className="mb-6 text-sm text-muted">
        {isLogin ? "Log in to try clothes on your own photo." : "Sign up to start trying pieces on."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          error={errors.password?.message}
          {...register("password")}
        />

        {submitError && <Alert tone="error">{submitError}</Alert>}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Please wait…" : cta}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? (
          <>
            New here?{" "}
            <Link href="/register" className="text-brand hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-brand hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}
