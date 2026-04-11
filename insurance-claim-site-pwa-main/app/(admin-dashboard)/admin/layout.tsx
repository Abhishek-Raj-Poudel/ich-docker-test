"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  HardHat,
  ShieldCheck,
  Headset,
  BarChart3,
  Settings,
  User,
  LogOut,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MobileNotificationsSheet } from "@/components/mobile-notifications-sheet";
import ProtectedRoute from "@/components/protected-route";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: HardHat, label: "Builders", href: "/admin/builders" },
  { icon: FileText, label: "Reports", href: "/admin/reports" },
  { icon: ShieldCheck, label: "KYC Queue", href: "/admin/kyc" },
  { icon: Headset, label: "Support", href: "/admin/support" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "super_admin", "claim_handler", "insurer"]}
    >
      <div className="min-h-screen bg-neutral-50 pb-24 lg:pb-0 lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 h-16 bg-white border-b border-neutral-100 px-6 flex items-center justify-between shadow-none">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold">
              <ShieldCheck className="size-4" />
            </div>
            <span className="font-bold text-xl tracking-tight text-neutral-900">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MobileNotificationsSheet accent="red" triggerVariant="ghost" />
            <div className="size-8 rounded-xl bg-neutral-100 border border-neutral-100 flex items-center justify-center">
              <User className="size-4 text-red-600" />
            </div>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-neutral-100 flex-col p-6 shadow-none">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="size-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              <ShieldCheck className="size-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-neutral-900 font-serif">
              ClaimHelp<span className="text-red-600">Admin</span>
            </span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4 pt-2">
              Platform Management
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 h-11 rounded-xl font-medium transition-all group text-sm",
                  isActive(item.href)
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4",
                    isActive(item.href)
                      ? "text-red-600"
                      : "text-neutral-400 group-hover:text-red-600",
                  )}
                />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-neutral-100 space-y-1">
            <Link
              href="/admin/profile"
              className={cn(
                "flex items-center gap-4 px-4 h-11 rounded-xl font-medium transition-all group text-sm",
                pathname === "/admin/profile"
                  ? "bg-red-50 text-red-700 border border-red-100"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
              )}
            >
              <User className="size-4 text-neutral-400 group-hover:text-red-600" />
              Profile
            </Link>
            <Button
              variant="ghost"
              className="w-full h-11 rounded-xl font-medium gap-4 justify-start px-4 hover:bg-red-50 hover:text-red-700 shadow-none text-neutral-700 text-sm"
              onClick={handleSignOut}
            >
              <LogOut className="size-4 text-neutral-400" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-neutral-100 px-6 z-50 flex items-center justify-between shadow-none">
          {[navItems[0], navItems[3], navItems[1]].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[60px] transition-all",
                  active ? "text-red-600" : "text-neutral-400",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    active
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "bg-transparent",
                  )}
                >
                  <item.icon className="size-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest hidden xs:block">
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button className="flex flex-col items-center gap-1 min-w-[60px] text-neutral-400">
            <div className="p-2">
              <MoreHorizontal className="size-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest hidden xs:block">
              More
            </span>
          </button>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
