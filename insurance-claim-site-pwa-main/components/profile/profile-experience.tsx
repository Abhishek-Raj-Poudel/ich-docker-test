"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  HardHat,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppUser, useAppStore } from "@/lib/app-store";
import { getProfile, logout } from "@/lib/auth";
import { getKYCStatus, KycStatusResponse } from "@/lib/kyc";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { KYCStatusBanner } from "@/components/dashboard/kyc-status-banner";

type ProfileAudience = "homeowner" | "builder" | "handler";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function getUserDisplayName(user: AppUser): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.name || "User";
}

function getAudienceFromRole(role: string): ProfileAudience {
  if (role === "builder") return "builder";
  if (role === "claim_handler" || role === "handler") return "handler";
  return "homeowner";
}

function getProfileConfig(audience: ProfileAudience) {
  if (audience === "builder") {
    return {
      roleLabel: "Certified Partner",
      icon: HardHat,
      accentBox: "bg-neutral-50 border-neutral-100 text-neutral-900",
      accentText: "text-neutral-900",
      links: [
        {
          href: "/projects",
          label: "My Projects",
          description: "Track assigned work and timelines",
          icon: ClipboardList,
        },
        {
          href: "/jobs",
          label: "Available Jobs",
          description: "Review open opportunities",
          icon: Building2,
        },
      ],
      helperTitle: "Builder Access",
      helperText: "Same profile shell, builder-safe navigation and work controls.",
    };
  }

  if (audience === "handler") {
    return {
      roleLabel: "Claim Handler",
      icon: ShieldCheck,
      accentBox: "bg-emerald-50 border-emerald-100 text-emerald-700",
      accentText: "text-emerald-700",
      links: [
        {
          href: "/handler",
          label: "Handler Overview",
          description: "Return to your review dashboard",
          icon: Bell,
        },
        {
          href: "/handler/claims",
          label: "Claims Queue",
          description: "Process and route claims",
          icon: ClipboardCheck,
        },
      ],
      helperTitle: "Restricted Internal Access",
      helperText: "Same profile shell, with internal claims operations and routing tools.",
    };
  }

  return {
    roleLabel: "Homeowner",
    icon: User,
    accentBox: "bg-primary/5 border-primary/10 text-primary",
    accentText: "text-primary",
    links: [
      {
        href: "/properties",
        label: "Connected Properties",
        description: "Manage insured addresses and details",
        icon: Building2,
      },
    ],
    helperTitle: "Client Access",
    helperText: "Same profile shell, with client-safe actions and support links.",
  };
}

export function ProfileExperience({ forcedAudience }: { forcedAudience?: ProfileAudience }) {
  const { token, user: authUser, isLoading: authLoading } = useAuth();
  const clearSession = useAppStore((state) => state.clearSession);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatusResponse | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const profileRes = await getProfile(token);

        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data);
          const isBuilder = getAudienceFromRole(profileRes.data.role.role) === "builder";
          if (isBuilder) {
            const kycRes = await getKYCStatus(token).catch(() => null);
            if (kycRes) {
              setKycStatus(kycRes);
            }
          } else {
            setKycStatus(null);
          }
        } else {
          toast.error("Failed to load profile");
        }
      } catch {
        toast.error("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [authLoading, router, token]);

  const handleLogout = async () => {
    if (token) {
      await logout(token);
    }
    clearSession();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500">Unable to load profile</p>
      </div>
    );
  }

  const audience = forcedAudience ?? getAudienceFromRole(authUser?.role?.role || user.role.role);
  const config = getProfileConfig(audience);
  const Icon = config.icon;
  const isBuilder = audience === "builder";
  const isKycVerified =
    isBuilder && ["approved", "submitted"].includes(kycStatus?.kyc_status || "");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-10 pb-24 md:px-0">
      <motion.div variants={item} className="bg-white border border-neutral-100 rounded-3xl p-8 md:p-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className={cn("size-32 rounded-3xl flex items-center justify-center relative border shrink-0", config.accentBox)}>
            <Icon className="size-16" />
            {isKycVerified ? (
              <div className="absolute -bottom-2 -right-2 size-8 bg-teal-500 rounded-xl border-2 border-white flex items-center justify-center text-white">
                <BadgeCheck className="size-5" />
              </div>
            ) : null}
          </div>
          <div className="flex-1 text-center md:text-left space-y-5 pt-2">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif">{getUserDisplayName(user)}</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <Badge variant="secondary" className="rounded-xl font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 border-none bg-neutral-100 text-neutral-600">
                  {config.roleLabel}
                </Badge>
                {audience === "handler" ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 px-4 py-1 bg-emerald-50 rounded-xl border border-emerald-100">
                    <ShieldCheck className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Internal Access</span>
                  </div>
                ) : isBuilder && isKycVerified ? (
                  <div className="flex items-center gap-1.5 text-teal-600 px-4 py-1 bg-teal-50 rounded-xl border border-teal-100">
                    <ShieldCheck className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Builder KYC On File</span>
                  </div>
                ) : isBuilder ? (
                  <Link href="/kyc">
                    <div className="flex items-center gap-1.5 text-primary px-4 py-1 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer">
                      <ShieldCheck className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Set Up Builder KYC</span>
                    </div>
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
              <div className="flex items-center gap-2 text-neutral-500">
                <Mail className="size-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.contact_number ? (
                <div className="flex items-center gap-2 text-neutral-500">
                  <Phone className="size-4" />
                  <span className="text-sm">{user.contact_number}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>

      {audience === "builder" ? (
        <KYCStatusBanner status={kycStatus} itemVariants={item} />
      ) : (
        <></>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={item} className="space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 pl-1">Workspace</h2>
          <div className="grid gap-4">
            {config.links.map((entry) => (
              <Link key={entry.href} href={entry.href}>
                <button className="w-full bg-white border border-neutral-100 rounded-3xl p-6 flex items-center justify-between group transition-all hover:border-neutral-900">
                  <div className="flex items-center gap-6">
                    <div className="size-14 rounded-2xl flex items-center justify-center text-neutral-400 border border-neutral-100 transition-all duration-500 shrink-0 group-hover:bg-neutral-900 group-hover:text-white">
                      <entry.icon className="size-7" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-neutral-900 leading-none mb-1.5 text-lg">{entry.label}</p>
                      <p className="text-sm font-normal text-neutral-500">{entry.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-neutral-300 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 pl-1">Account</h2>
          <div className="bg-white border border-neutral-100 rounded-3xl p-8 space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Profile Summary</p>
              <div className="grid gap-4">
                <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Member Since</p>
                  <p className="text-base font-medium text-neutral-900">{new Date(user.created_at).toLocaleDateString("en-GB")}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 text-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{config.helperTitle}</p>
              <p className="text-sm text-neutral-200 mt-2 leading-relaxed">{config.helperText}</p>
            </div>

            <Button onClick={handleLogout} className="w-full h-12 rounded-full bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 shadow-none">
              <LogOut className="mr-2 size-4" />
              Logout Account
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
