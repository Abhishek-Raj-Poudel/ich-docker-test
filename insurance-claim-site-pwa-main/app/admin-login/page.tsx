"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, ChevronLeft } from "lucide-react";
import { login, normalizeAuthUser } from "@/lib/auth";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/app-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const setToken = useAppStore((state) => state.setToken);
  const setUser = useAppStore((state) => state.setUser);
  const clearSession = useAppStore((state) => state.clearSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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

        const role = userData?.role.role || "";
        
        // Specifically check for administrative/professional gate roles
        if (["admin", "super_admin", "insurer", "claim_handler"].includes(role)) {
          // Redirecting to specialized panels based on the professional role
          if (role === "claim_handler") {
            router.push("/handler");
          } else {
            router.push("/admin");
          }
        } else if (role === "builder" || role === "homeowner" || role === "client") {
          // Regular users should go to their dashboard, not admin
          router.push("/dashboard");
        } else {
          setError("Access denied. You do not have administrator privileges.");
          // Clear credentials for security
          clearSession();
        }
      } else {
        setError(result.message || "Invalid administrator credentials.");
      }
    } catch {
      setError("An internal error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Subtle Elements */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-neutral-900" />
      <div className="absolute -top-24 -right-24 size-96 bg-neutral-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 size-96 bg-neutral-200/50 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] space-y-8"
      >
        {/* Navigation back */}
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 group text-neutral-400 hover:text-neutral-900 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Standard Login
        </Link>

        {/* Branding & Header */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-3">
             <div className="size-12 bg-neutral-900 rounded-xl flex items-center justify-center text-white">
                <ShieldCheck className="size-6" />
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                    Administrator Gate
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">
                    Secure Control Panel Access
                </p>
             </div>
          </div>
          <p className="text-neutral-500 text-sm font-normal leading-relaxed pt-2">
            This portal is restricted to authorised personnel only. <br />
            Unauthorised access attempts are logged and monitored.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-neutral-100 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
                    >
                        <div className="size-5 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold">!</span>
                        </div>
                        <p className="text-xs font-medium text-red-600 leading-normal">
                            {error}
                        </p>
                    </motion.div>
                )}

                <div className="space-y-2">
                    <Label 
                        htmlFor="email"
                        className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 ml-1"
                    >
                        Admin Email
                    </Label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                        <Input 
                            id="email"
                            type="email"
                            required
                            placeholder="admin@claimhelp.pro"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-14 pl-12 bg-neutral-50/50 border-neutral-100 rounded-xl focus-visible:bg-white focus-visible:border-neutral-900 transition-all shadow-none ring-offset-0 focus-visible:ring-0 text-neutral-900"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                        <Label 
                            htmlFor="password"
                            className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400"
                        >
                            Security Key
                        </Label>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                        <Input 
                            id="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-14 pl-12 bg-neutral-50/50 border-neutral-100 rounded-xl focus-visible:bg-white focus-visible:border-neutral-900 transition-all shadow-none ring-offset-0 focus-visible:ring-0 text-neutral-900"
                        />
                    </div>
                </div>

                <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-neutral-900 text-white hover:bg-neutral-800 rounded-full font-bold uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-none hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Authorizing...
                        </>
                    ) : (
                        <>
                            Open Gate
                            <ArrowRight className="size-4" />
                        </>
                    )}
                </Button>
            </form>
        </div>

        {/* Support Links */}
        <div className="text-center space-y-4">
            <p className="text-neutral-400 text-xs font-normal">
                Forgot your admin credentials? Contact the <br /> 
                <span className="text-neutral-600 font-bold hover:text-neutral-900 cursor-pointer">Security Operations Center</span>
            </p>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-0 w-full text-center">
            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.4em]">
                Secure System Core v4.0.2
            </p>
      </div>
    </div>
  );
}
