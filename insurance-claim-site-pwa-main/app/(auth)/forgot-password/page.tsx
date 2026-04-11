"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <div className="space-y-10 text-center py-4">
        <div className="mx-auto size-28 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Mail className="size-14" />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-medium text-neutral-950">
            Check your email
          </h2>
          <p className="text-lg font-normal text-neutral-500">
            We&apos;ve sent a password reset link to your email address. Please check
            your inbox.
          </p>
        </div>

        <div className="space-y-6">
          <Link href="/login" className="block">
            <Button className="w-full h-12 rounded-xl text-base font-medium transition-all active:scale-[0.98] shadow-none">
              Back to Sign In
            </Button>
          </Link>
          <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
            Didn&apos;t receive the email?{" "}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="size-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
            I
          </div>
          <span className="font-bold text-xl tracking-tight">
            ClaimHelp<span className="text-primary">UK</span>
          </span>
        </div>

        <h1 className="text-4xl font-medium tracking-tight text-neutral-950 font-sans">
          Reset Password
        </h1>
        <p className="text-lg font-normal text-neutral-500 leading-relaxed">
          Enter your email address and we&apos;ll send <br />
          you a link to reset your password.
        </p>
      </div>

      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          setIsSubmitted(true);
        }}
      >
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
              required
              placeholder="name@example.com"
              className="pl-12 h-12 rounded-xl border-neutral-100 bg-neutral-50 focus-visible:bg-white focus-visible:border-primary transition-all shadow-none ring-offset-0 focus-visible:ring-0"
            />
          </div>
        </div>

        <Button className="w-full h-12 rounded-xl text-base font-medium transition-all active:scale-[0.98] shadow-none flex items-center justify-center gap-2">
          Send Reset Link
          <ArrowRight className="size-5" />
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-bold text-neutral-500 hover:text-primary transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
