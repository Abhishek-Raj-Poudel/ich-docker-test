"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Camera,
  ClipboardCheck,
  User,
  HardHat,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileNotificationsSheet } from "@/components/mobile-notifications-sheet";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role?.role || "homeowner";
  const isBuilder = role === "builder";

  // Configuration based on role
  const navItems = isBuilder
    ? [
      { icon: Home, label: "Overview", href: "/dashboard" },
      { icon: MapPin, label: "Available Jobs", href: "/jobs" },
      { icon: ClipboardList, label: "My Projects", href: "/projects" },
      { icon: User, label: "Profile", href: "/profile" },
    ]
    : [
      { icon: Home, label: "Home", href: "/dashboard" },
      { icon: Camera, label: "Scan Rooms", href: "/scan" },
      { icon: ClipboardCheck, label: "Claims", href: "/claims" },
      { icon: User, label: "Profile", href: "/profile" },
    ];

  const primaryColor = isBuilder ? "bg-neutral-900" : "bg-primary";
  const primaryText = isBuilder ? "text-neutral-900" : "text-primary";

  return (
    <ProtectedRoute allowedRoles={["homeowner", "client", "builder"]}>
      <div className="min-h-screen bg-neutral-100 pb-24 lg:pb-0 lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 h-16 bg-white border-b border-neutral-100 px-6 flex items-center justify-between shadow-none">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "size-8 rounded-xl flex items-center justify-center text-white font-bold",
                primaryColor,
              )}
            >
              {isBuilder ? <HardHat className="size-4" /> : "I"}
            </div>
            <span className="font-bold text-xl tracking-tight text-neutral-900">
              {isBuilder ? "Partner" : "ClaimHelp"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MobileNotificationsSheet accent={isBuilder ? "neutral" : "primary"} triggerVariant="outline" />
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-neutral-100 flex-col p-6 shadow-none">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center text-white font-bold text-xl",
                primaryColor,
              )}
            >
              {isBuilder ? <HardHat className="size-5" /> : "I"}
            </div>
            <span className="font-bold text-2xl tracking-tight text-neutral-900">
              {isBuilder ? (
                <>
                  ClaimHelp
                  <span className="text-neutral-400 font-normal italic">
                    Pro
                  </span>
                </>
              ) : (
                <>
                  ClaimHelp
                  <span className={cn("font-normal", primaryText)}>UK</span>
                </>
              )}
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4 pt-2">
              {isBuilder ? "Partner Portal" : "Main Navigation"}
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 h-12 rounded-xl font-medium transition-all group",
                  pathname === item.href
                    ? isBuilder
                      ? "bg-neutral-900 text-white"
                      : "bg-primary text-white"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
                )}
              >
                <item.icon
                  className={cn(
                    "size-5",
                    pathname === item.href
                      ? "text-white"
                      : cn(
                        "text-neutral-400",
                        isBuilder
                          ? "group-hover:text-neutral-900"
                          : "group-hover:text-primary",
                      ),
                  )}
                />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* <div className="pt-6 border-t border-neutral-100 space-y-2">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border border-neutral-100 font-medium gap-3 justify-start px-4 bg-white hover:bg-neutral-50 shadow-none text-neutral-700"
            >
              <Settings className="size-5 text-neutral-400" />
              Settings
            </Button>
          </div> */}
        </aside>

        {/* Main Content */}
        <main className="bg-neutral-100 p-5 md:p-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-neutral-100 px-6 z-50 flex items-center justify-between shadow-none">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-15 transition-all",
                  isActive
                    ? isBuilder
                      ? "text-neutral-900"
                      : "text-primary"
                    : "text-neutral-400",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    isActive
                      ? isBuilder
                        ? "bg-neutral-900 text-white"
                        : "bg-primary/5 border border-primary/20"
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
