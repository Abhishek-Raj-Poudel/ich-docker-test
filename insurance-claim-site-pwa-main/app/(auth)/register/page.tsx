"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  KeyRound,
  Home,
  HardHat,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { register as registerUser } from "@/lib/auth";
import { FieldError } from "@/components/ui/field";

type Step = "role" | "info";
type Role = "homeowner" | "builder";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const roles = [
    {
      id: "homeowner",
      title: "Homeowner",
      desc: "Protecting my home",
      icon: Home,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "builder",
      title: "Builder",
      desc: "Repairing damage",
      icon: HardHat,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const onSubmit = async (formData: RegisterFormValues) => {
    if (!role) return;

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await registerUser(
        `${formData.firstName} ${formData.lastName}`.trim(),
        formData.email,
        formData.password,
        role,
      );

      if (result.success) {
        const searchParams = new URLSearchParams();
        if (result.user_id) {
          searchParams.set("user_id", result.user_id.toString());
          sessionStorage.setItem(
            "pending_verify_user_id",
            result.user_id.toString(),
          );
        }
        searchParams.set("email", formData.email);
        sessionStorage.setItem("pending_verify_email", formData.email);

        router.push(`/verify-email?${searchParams.toString()}`);
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "role":
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
              <h1 className="text-4xl font-medium tracking-tight text-neutral-950">
                Join Us
              </h1>
              <p className="text-lg font-normal text-neutral-500">
                Select your role to get started with <br />
                Insurance Claim Help UK
              </p>
            </div>

            <div className="grid gap-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as Role)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group relative overflow-hidden",
                    role === r.id
                      ? "border-primary bg-primary/5"
                      : "border-neutral-100 bg-neutral-50 hover:border-neutral-200 hover:bg-neutral-100",
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-xl transition-colors",
                      r.bg,
                      r.color,
                    )}
                  >
                    <r.icon className="size-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900">{r.title}</h3>
                    <p className="text-sm font-normal text-neutral-500">
                      {r.desc}
                    </p>
                  </div>
                  {role === r.id && (
                    <CheckCircle2 className="size-6 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <Button
              type="button"
              disabled={!role}
              onClick={() => setStep("info")}
              className="w-full h-12 rounded-full text-base font-medium transition-all active:scale-[0.98]"
            >
              Continue
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
        );

      case "info":
        return (
          <div className="space-y-10">
            <button
              type="button"
              onClick={() => setStep("role")}
              className="flex items-center text-sm font-bold text-neutral-400 hover:text-primary transition-colors uppercase tracking-widest"
            >
              <ArrowLeft className="mr-2 size-4" />
              Change Role
            </button>

            <div className="space-y-4">
              <h2 className="text-3xl font-medium text-neutral-950 capitalize">
                {role} Details
              </h2>
              <p className="text-lg font-normal text-neutral-500">
                Please provide your account details
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold ml-0.5 text-neutral-700 uppercase tracking-widest">
                    First Name
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
                      <User className="size-4.5" />
                    </div>
                    <Input
                      placeholder="John"
                      {...register("firstName", {
                        required: "First name is required.",
                      })}
                      className="pl-12 h-12 rounded-xl border-neutral-100 bg-neutral-50 focus-visible:bg-white focus-visible:border-primary transition-all ring-offset-0 focus-visible:ring-0"
                    />
                  </div>
                  <FieldError errors={[errors.firstName]} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold ml-0.5 text-neutral-700 uppercase tracking-widest">
                    Last Name
                  </Label>
                  <Input
                    placeholder="Doe"
                    {...register("lastName", {
                      required: "Last name is required.",
                    })}
                    className="h-12 rounded-xl border-neutral-100 bg-neutral-50 focus-visible:bg-white focus-visible:border-primary transition-all ring-offset-0 focus-visible:ring-0"
                  />
                  <FieldError errors={[errors.lastName]} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold ml-0.5 text-neutral-700 uppercase tracking-widest">
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
                    <Mail className="size-4.5" />
                  </div>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...register("email", {
                      required: "Email is required.",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Enter a valid email address.",
                      },
                    })}
                    className="pl-12 h-12 rounded-xl border-neutral-100 bg-neutral-50 focus-visible:bg-white focus-visible:border-primary transition-all ring-offset-0 focus-visible:ring-0"
                  />
                </div>
                <FieldError errors={[errors.email]} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold ml-0.5 text-neutral-700 uppercase tracking-widest">
                  Password
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
                    <KeyRound className="size-4.5" />
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required.",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters.",
                      },
                    })}
                    className="pl-12 h-12 rounded-xl border-neutral-100 bg-neutral-50 focus-visible:bg-white focus-visible:border-primary transition-all ring-offset-0 focus-visible:ring-0"
                  />
                </div>
                <FieldError errors={[errors.password]} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold ml-0.5 text-neutral-700 uppercase tracking-widest">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
                    <KeyRound className="size-4.5" />
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword", {
                      required: "Please confirm your password.",
                      validate: (value) =>
                        value === watch("password") || "Passwords do not match",
                    })}
                    className="pl-12 h-12 rounded-xl border-neutral-100 bg-neutral-50 focus-visible:bg-white focus-visible:border-primary transition-all ring-offset-0 focus-visible:ring-0"
                  />
                </div>
                <FieldError errors={[errors.confirmPassword]} />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-full text-base font-medium transition-all active:scale-[0.98]"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {renderStep()}

      <p className="mt-12 text-center font-bold text-neutral-500">
        Already a partner?{" "}
        <Link
          href="/login"
          className="text-primary hover:underline underline-offset-8"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
