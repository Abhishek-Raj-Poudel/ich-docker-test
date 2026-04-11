"use client";

import { create } from "zustand";

export interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  category: string;
  message: string;
  status: "open" | "in_review" | "resolved";
  createdAt: string;
}

interface SupportState {
  tickets: SupportTicket[];
  hydrated: boolean;
  hydrate: () => void;
  createTicket: (ticket: Omit<SupportTicket, "id" | "createdAt" | "status">) => void;
}

const STORAGE_KEY = "claimhelp.supportTickets";

function getSeededTickets(): SupportTicket[] {
  return [
    {
      id: 1,
      userId: 1,
      subject: "Need help understanding my approved claim",
      category: "Claims",
      message: "I can see the report was approved, but I am not sure what the next step is for scheduling works.",
      status: "in_review",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      userId: 1,
      subject: "Address update on second property",
      category: "Properties",
      message: "I want to confirm whether I can edit the postcode after submitting the property details.",
      status: "resolved",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function readTickets(): SupportTicket[] {
  if (typeof window === "undefined") return getSeededTickets();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = getSeededTickets();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as SupportTicket[];
  } catch {
    return getSeededTickets();
  }
}

function writeTickets(tickets: SupportTicket[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export const useSupportStore = create<SupportState>((set, get) => ({
  tickets: getSeededTickets(),
  hydrated: false,
  hydrate: () => {
    set({
      tickets: readTickets(),
      hydrated: true,
    });
  },
  createTicket: (ticket) => {
    const currentTickets = get().tickets;
    const nextId = currentTickets.reduce((maxId, current) => Math.max(maxId, current.id), 0) + 1;
    const nextTickets: SupportTicket[] = [
      {
        id: nextId,
        createdAt: new Date().toISOString(),
        status: "open",
        ...ticket,
      },
      ...currentTickets,
    ];
    writeTickets(nextTickets);
    set({ tickets: nextTickets, hydrated: true });
  },
}));
