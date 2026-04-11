"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Clock3, FileText, ShieldCheck, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NotificationAccent = "primary" | "red" | "teal" | "neutral";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: typeof Bell;
  unread?: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "claim-review",
    title: "Claim review started",
    body: "Your kitchen water damage claim was picked up by the review team.",
    time: "5 min ago",
    icon: ShieldCheck,
    unread: true,
  },
  {
    id: "estimate-uploaded",
    title: "Repair estimate uploaded",
    body: "Builder Northside Joinery attached a draft repair estimate for approval.",
    time: "22 min ago",
    icon: FileText,
    unread: true,
  },
  {
    id: "inspection-booked",
    title: "Inspection booked",
    body: "A site visit is scheduled for tomorrow between 10:00 and 12:00.",
    time: "Yesterday",
    icon: Clock3,
  },
  {
    id: "payout-cleared",
    title: "Payout cleared",
    body: "Your last approved reimbursement has been marked as complete.",
    time: "2 days ago",
    icon: CheckCircle2,
  },
];

const accentStyles: Record<NotificationAccent, { badge: string; dot: string; icon: string }> = {
  primary: {
    badge: "bg-primary/8 text-primary border-primary/10",
    dot: "bg-primary",
    icon: "text-primary",
  },
  red: {
    badge: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-600",
    icon: "text-red-600",
  },
  teal: {
    badge: "bg-[#1F7A6D]/10 text-[#1F7A6D] border-[#1F7A6D]/15",
    dot: "bg-[#1F7A6D]",
    icon: "text-[#1F7A6D]",
  },
  neutral: {
    badge: "bg-neutral-100 text-neutral-700 border-neutral-200",
    dot: "bg-neutral-900",
    icon: "text-neutral-700",
  },
};

export function MobileNotificationsSheet({
  accent = "primary",
  triggerClassName,
  triggerVariant = "outline",
}: {
  accent?: NotificationAccent;
  triggerClassName?: string;
  triggerVariant?: "outline" | "ghost";
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const styles = accentStyles[accent];
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={triggerVariant} size="icon" className={cn("rounded-xl relative", triggerClassName)}>
          <Bell className="size-5 text-neutral-500" />
          {unreadCount > 0 ? (
            <span className={cn("absolute top-2 right-2.5 size-2 rounded-full border border-white", styles.dot)} />
          ) : null}
          <span className="sr-only">Open notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex h-full flex-col p-0">
        <div className="border-b border-neutral-100 px-5 pt-6 pb-5">
          <SheetHeader className="pr-10">
            <div className="flex items-center gap-3">
              <div className={cn("flex size-10 items-center justify-center rounded-2xl border", styles.badge)}>
                <Bell className={cn("size-5", styles.icon)} />
              </div>
              <div>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  {unreadCount} unread updates across claims, reviews, and jobs.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const Icon = notification.icon;

              return (
                <article
                  key={notification.id}
                  className="relative rounded-3xl border border-neutral-200 bg-neutral-50/80 p-4 pr-14"
                >
                  <button
                    type="button"
                    onClick={() => handleDismissNotification(notification.id)}
                    className="absolute top-3 right-3 rounded-full border border-neutral-200 bg-white p-1.5 text-neutral-400 transition hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`Dismiss ${notification.title}`}
                  >
                    <X className="size-4" />
                  </button>
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white", styles.icon)}>
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-neutral-900">
                          {notification.title}
                        </h3>
                        {notification.unread ? (
                          <span className={cn("size-2 shrink-0 rounded-full", styles.dot)} />
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">
                        {notification.body}
                      </p>
                      <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 text-center">
              <Bell className={cn("size-10", styles.icon)} />
              <p className="mt-4 text-sm font-semibold text-neutral-900">
                No notifications left
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                You have cleared every dummy notification in this panel.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 px-5 py-4">
          <Button
            variant="outline"
            className="h-11 w-full rounded-2xl"
            onClick={handleMarkAllAsRead}
            disabled={notifications.length === 0 || unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
