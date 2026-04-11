"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  User,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MobileNotificationsSheet } from "@/components/mobile-notifications-sheet";
import ProtectedRoute from "@/components/protected-route";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/handler" },
  { icon: ClipboardList, label: "Claims", href: "/handler/claims" },
  { icon: User, label: "Profile", href: "/handler/profile" },
];

export default function HandlerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/handler") return pathname === "/handler";
    return pathname?.startsWith(href);
  };

  return (
    <ProtectedRoute allowedRoles={["handler", "claim_handler", "insurer"]}>
      <div className="min-h-screen bg-neutral-50 pb-24 lg:pb-0 lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 h-16 bg-white border-b border-neutral-100 px-6 flex items-center justify-between shadow-none">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-[#1F7A6D] rounded-xl flex items-center justify-center text-white font-bold">
              <ShieldCheck className="size-4" />
            </div>
            <span className="font-bold text-xl tracking-tight text-neutral-900">
              Handler
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MobileNotificationsSheet accent="teal" triggerVariant="ghost" />
            <div className="size-8 rounded-xl bg-neutral-100 border border-neutral-100 flex items-center justify-center">
              <User className="size-4 text-[#1F7A6D]" />
            </div>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-neutral-100 flex-col p-6 shadow-none">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="size-10 bg-[#1F7A6D] rounded-xl flex items-center justify-center text-white font-bold text-xl">
              <ShieldCheck className="size-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-neutral-900 font-serif">
              Claim<span className="text-[#1F7A6D]">Handler</span>
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4 pt-2">Adjustment Portal</p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 h-12 rounded-xl font-medium transition-all group",
                  isActive(item.href)
                    ? "bg-[#1F7A6D] text-white"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
                )}
              >
                <item.icon
                  className={cn(
                    "size-5",
                    isActive(item.href)
                      ? "text-white"
                      : "text-neutral-400 group-hover:text-[#1F7A6D]",
                  )}
                />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-neutral-100 space-y-2">
            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl font-medium gap-3 justify-start px-4 hover:bg-neutral-50 shadow-none text-neutral-700"
            >
              <Settings className="size-5 text-neutral-400" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl font-medium gap-3 justify-start px-4 hover:bg-red-50 hover:text-red-700 shadow-none text-neutral-700"
            >
              <LogOut className="size-5 text-neutral-400" />
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
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[60px] transition-all",
                  active ? "text-[#1F7A6D]" : "text-neutral-400",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    active
                      ? "bg-[#1F7A6D] text-white"
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
        </nav>
      </div>
    </ProtectedRoute>
  );
}
