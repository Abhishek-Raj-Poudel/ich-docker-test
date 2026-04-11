"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDashboardPathForRole,
  getProfile,
  resendOTP,
  verifyEmailOTP,
} from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useAppStore((state) => state.setToken);
  const setUser = useAppStore((state) => state.setUser);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const rawUserId = searchParams.get("user_id");
    const queryEmail = searchParams.get("email");
    const storedUserId = sessionStorage.getItem("pending_verify_user_id");
    const storedEmail = sessionStorage.getItem("pending_verify_email");

    const resolvedUserId = rawUserId ?? storedUserId;
    const resolvedEmail = queryEmail ?? storedEmail;

    setEmail(resolvedEmail);
    setUserId(resolvedUserId ? Number(resolvedUserId) : null);
  }, [searchParams]);

  useEffect(() => {
    if (timer <= 0) return undefined;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || otp.length !== 6) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await verifyEmailOTP(email, otp);
      if (!result.success) {
        setError(result.message || "Invalid verification code. Please try again.");
        return;
      }

      setSuccess("Email verified. Redirecting to your workspace...");
      sessionStorage.removeItem("pending_verify_user_id");
      sessionStorage.removeItem("pending_verify_email");

      if (result.token) {
        setToken(result.token);

        const profileResult = await getProfile(result.token);
        if (profileResult.success && profileResult.data) {
          setUser(profileResult.data);
          router.push(getDashboardPathForRole(profileResult.data.role?.role));
          return;
        }
      }

      router.push(`/login?verified=true${email ? `&email=${encodeURIComponent(email)}` : ""}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || timer > 0) return;

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const result = await resendOTP(email);
      if (!result.success) {
        setError(result.message || "Failed to resend code. Please try again.");
        return;
      }

      setSuccess("Verification code resent.");
      setTimer(60);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </button>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <ShieldCheck className="size-3.5" />
          Secure Verification
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-medium tracking-tight text-neutral-950">
            Verify Email
          </h1>
          <p className="text-base leading-relaxed text-neutral-500">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-neutral-700">
              {email ?? "your email"}
            </span>
            . We&apos;ll activate your account and continue into the app.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {(error || (!email && !userId)) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {!email && !userId
                ? "Verification session is missing. Register or log in again."
                : error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="size-4" />
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="otp"
              className="text-xs font-bold uppercase tracking-widest text-neutral-700"
            >
              Verification Code
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary" />
              <Input
                id="otp"
                required
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="123456"
                className="h-14 rounded-xl border-neutral-200 bg-neutral-50 pl-12 text-2xl tracking-[0.45em] focus-visible:border-primary focus-visible:bg-white focus-visible:ring-0"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || otp.length !== 6 || !email}
            className="h-14 w-full rounded-full text-base font-medium"
          >
            {isLoading ? "Verifying..." : "Verify email"}
            <ArrowRight className="size-4" />
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || timer > 0 || !email}
            className={cn(
              "mx-auto flex items-center gap-2 text-sm font-semibold transition-colors",
              isResending || timer > 0 || !email
                ? "cursor-not-allowed text-neutral-400"
                : "text-primary hover:underline",
            )}
          >
            <RefreshCw className={cn("size-4", isResending && "animate-spin")} />
            {timer > 0 ? `Resend code in ${timer}s` : "Resend verification code"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
