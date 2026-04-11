"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  CircleHelp,
  Clock3,
  LifeBuoy,
  Loader2,
  MessageSquarePlus,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field";
import { useSupportStore } from "@/lib/support-store";

interface SupportTicketFormValues {
  subject: string;
  category: string;
  message: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const statusStyles = {
  open: "bg-amber-50 text-amber-700 border-amber-100",
  in_review: "bg-blue-50 text-blue-700 border-blue-100",
  resolved: "bg-teal-50 text-teal-700 border-teal-100",
};

const statusLabel = {
  open: "Open",
  in_review: "In Review",
  resolved: "Resolved",
};

export default function SupportPage() {
  const { user, isLoading: authLoading } = useAuth();
  const tickets = useSupportStore((state) => state.tickets);
  const hydrated = useSupportStore((state) => state.hydrated);
  const hydrate = useSupportStore((state) => state.hydrate);
  const createTicket = useSupportStore((state) => state.createTicket);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportTicketFormValues>({
    defaultValues: {
      subject: "",
      category: "General",
      message: "",
    },
  });

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  const myTickets = useMemo(() => {
    if (!user) return [];
    return tickets
      .filter((ticket) => ticket.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, user]);

  const handleCreateTicket = ({ subject, category, message }: SupportTicketFormValues) => {
    if (!user) {
      toast.error("Please sign in to create a support ticket.");
      return;
    }
    createTicket({
      userId: user.id,
      subject: subject.trim(),
      category,
      message: message.trim(),
    });
    reset();
    toast.success("Support ticket created.");
  };

  if (authLoading || !hydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
          Loading support desk...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8 md:space-y-10"
    >
      <motion.div
        variants={item}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif">
            Support
          </h1>
          <p className="text-base md:text-lg text-neutral-500 max-w-2xl">
            View your past support requests and send a new message to the team.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-3">
          <LifeBuoy className="size-5 text-primary" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Active Tickets
            </p>
            <p className="text-sm font-bold text-neutral-900">{myTickets.length}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <motion.div
          variants={item}
          className="xl:col-span-2 bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <MessageSquarePlus className="size-5 text-primary" />
              New Ticket
            </h2>
            <p className="text-sm text-neutral-500">
              Keep it short and clear. The team can follow up from here.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(handleCreateTicket)}>
            <div className="space-y-2">
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                {...register("subject", { required: "Subject is required." })}
                placeholder="Briefly describe the issue"
                className="h-12 rounded-xl border-neutral-100"
              />
              <FieldError errors={[errors.subject]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-category">Category</Label>
              <select
                id="ticket-category"
                {...register("category", { required: "Category is required." })}
                className="flex h-12 w-full rounded-xl border border-neutral-100 bg-white px-3 text-sm text-neutral-900 outline-none"
              >
                <option>General</option>
                <option>Claims</option>
                <option>Payments</option>
                <option>Properties</option>
                <option>KYC</option>
                <option>Technical</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-message">Message</Label>
              <Textarea
                id="ticket-message"
                {...register("message", {
                  required: "Message is required.",
                  minLength: {
                    value: 10,
                    message: "Message should be at least 10 characters.",
                  },
                })}
                placeholder="Tell support what happened and what you need help with."
                className="min-h-36 rounded-2xl border-neutral-100"
              />
              <FieldError errors={[errors.message]} />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-full"
            >
              <Send className="mr-2 size-4" />
              Submit Ticket
            </Button>
          </form>
        </motion.div>

        <motion.div variants={item} className="xl:col-span-3 space-y-4">
          {myTickets.length === 0 ? (
            <div className="bg-white border border-neutral-100 rounded-3xl p-10 text-center space-y-4">
              <div className="mx-auto size-16 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400">
                <CircleHelp className="size-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-900">No tickets yet</h2>
                <p className="text-neutral-500">
                  Create your first support request from the form on the left.
                </p>
              </div>
            </div>
          ) : (
            myTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-7 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                          statusStyles[ticket.status]
                        )}
                      >
                        {statusLabel[ticket.status]}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-neutral-100 bg-neutral-50 text-neutral-600">
                        {ticket.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900">{ticket.subject}</h2>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Clock3 className="size-4" />
                    {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                </div>

                <p className="text-neutral-600 leading-relaxed">{ticket.message}</p>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
