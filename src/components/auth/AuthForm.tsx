"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { paymentsService } from "@/services/payments";
import { loginSchema, registerSchema } from "@/lib/validation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

interface FormValues {
  fullName?: string;
  email: string;
  password: string;
}

/** Map a Supabase auth error to friendly, user-facing copy. */
function friendlyAuthError(error: unknown, isLogin: boolean): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("already registered") || message.includes("already been registered")) {
    return "That email is already registered. Try logging in instead.";
  }
  if (message.includes("invalid login credentials")) {
    return "Wrong email or password. Please try again.";
  }
  if (message.includes("email not confirmed")) {
    return "Please confirm your email address before logging in.";
  }
  if (message.includes("rate limit") || message.includes("over_email_send")) {
    return "Too many attempts just now. Please wait a minute and try again.";
  }
  if (message.includes("password")) {
    return "Password must be at least 6 characters.";
  }
  return isLogin
    ? "We couldn't log you in. Please try again."
    : "We couldn't create your account. Please try again.";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isLogin = mode === "login";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema) as Resolver<FormValues>,
  });

  const heading = isLogin ? "Welcome back" : "Create your account";
  const cta = isLogin ? "Log in" : "Sign up";

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      if (isLogin) {
        await login(values.email, values.password);
        const next = searchParams.get("next") || "/";
        router.push(next);
      } else {
        const session = await signUp(values.fullName ?? "", values.email, values.password);
        // Full navigation (not router.push) — leaving the app entirely for
        // Stripe's hosted subscription checkout.
        window.location.href = paymentsService.buildCheckoutUrl(
          session.user.id,
          session.user.email,
        );
      }
    } catch (error) {
      setSubmitError(friendlyAuthError(error, isLogin));
    }
  }

  return (
    <Card className="mx-auto max-w-md p-8">
      <h1 className="mb-1 font-serif text-2xl text-ink">{heading}</h1>
      <p className="mb-6 text-sm text-muted">
        {isLogin ? "Log in to try clothes on your own photo." : "Sign up to start trying pieces on."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {!isLogin && (
          <Input
            label="Full name"
            type="text"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
        )}
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
