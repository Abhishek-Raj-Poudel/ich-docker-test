"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Mail, ArrowRight } from "lucide-react";
import {
  getDashboardPathForRole,
  login,
  normalizeAuthUser,
} from "@/lib/auth";
import { FieldError } from "@/components/ui/field";
import { useAppStore } from "@/lib/app-store";

interface LoginFormValues {
  email: string;
  password: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useAppStore((state) => state.setToken);
  const setUser = useAppStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>("");
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: searchParams.get("email") ?? "",
      password: "",
    },
  });

  // Disabled for now because the current backend does not expose `/api/v1/me`.
  useEffect(() => {}, []);

  useEffect(() => {
    if (searchParams.get("verified")) {
      setSuccess("Email verified successfully! You can now sign in.");
    }
  }, [searchParams]);

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await login(email, password);

      if (result.success) {
        if (result.token) {
          setToken(result.token);
        }

        const userData = normalizeAuthUser(result.user);
        if (userData) {
          setUser(userData);
        }

        router.push(getDashboardPathForRole(userData?.role.role));
      } else {
        if (result.verification_required) {
          if (result.user_id) {
            sessionStorage.setItem(
              "pending_verify_user_id",
              result.user_id.toString(),
            );
          }
          sessionStorage.setItem("pending_verify_email", email);
          router.push(
            `/verify-email?email=${encodeURIComponent(email)}${
              result.user_id ? `&user_id=${result.user_id}` : ""
            }`,
          );
          return;
        }

        setError(
          result.message || "Login failed. Please check your credentials.",
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="size-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
            I
          </div>
          <span className="font-bold text-xl tracking-tight">
            ClaimHelp<span className="text-primary">UK</span>
          </span>
        </div>

        <h1 className="text-4xl font-medium tracking-tight text-neutral-950 font-sans">
          Welcome Back
        </h1>
        <p className="text-lg font-normal text-neutral-500 leading-relaxed">
          Sign in to your account to manage <br />
          property insurance claims
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            {success}
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-bold ml-0.5 text-neutral-700 uppercase tracking-widest"
          >
            Email Address
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
              <Mail className="size-4.5" />
            </div>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Enter a valid email address.",
                },
              })}
              placeholder="name@example.com"
              className="pl-12 h-12 rounded-xl border-neutral-100 bg-neutral-50 focus-visible:bg-white focus-visible:border-primary transition-all ring-offset-0 focus-visible:ring-0"
            />
          </div>
          <FieldError errors={[errors.email]} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-0.5">
            <Label
              htmlFor="password"
              title="Password"
              className="text-xs font-bold text-neutral-700 uppercase tracking-widest"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-primary hover:underline underline-offset-4"
            >
              Forget password?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
              <KeyRound className="size-4.5" />
            </div>
            <Input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required.",
              })}
              placeholder="••••••••"
              className="pl-12 h-12 rounded-xl border-neutral-100 bg-neutral-50 focus-visible:bg-white focus-visible:border-primary transition-all ring-offset-0 focus-visible:ring-0"
            />
          </div>
          <FieldError errors={[errors.password]} />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-full text-base font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? "Signing In..." : "Sign In"}
          <ArrowRight className="size-5" />
        </Button>
      </form>

      <div className="space-y-6 pt-4 border-t border-neutral-100 mt-6">
        <p className="text-center font-bold text-neutral-500">
          New here?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline underline-offset-8"
          >
            Create an account
          </Link>
        </p>

        <p className="text-center">
          <Link
            href="/admin-login"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 hover:text-neutral-900 transition-colors"
          >
            Admin Gateway
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-medium">Loading...</h1>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
