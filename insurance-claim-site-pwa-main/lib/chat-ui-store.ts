"use client";

import { create } from "zustand";

interface ChatUiEntry {
  isOpen: boolean;
  isMinimized: boolean;
  inputValue: string;
  unreadCount: number;
}

interface ChatUiState {
  chats: Record<string, ChatUiEntry>;
  ensureChat: (jobId: string) => void;
  setOpen: (jobId: string, isOpen: boolean) => void;
  setMinimized: (jobId: string, isMinimized: boolean) => void;
  setInputValue: (jobId: string, inputValue: string) => void;
  setUnreadCount: (jobId: string, unreadCount: number) => void;
}

const defaultChatState: ChatUiEntry = {
  isOpen: false,
  isMinimized: false,
  inputValue: "",
  unreadCount: 0,
};

export const useChatUiStore = create<ChatUiState>((set, get) => ({
  chats: {},
  ensureChat: (jobId) => {
    if (get().chats[jobId]) return;
    set((state) => ({
      chats: {
        ...state.chats,
        [jobId]: defaultChatState,
      },
    }));
  },
  setOpen: (jobId, isOpen) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [jobId]: {
          ...(state.chats[jobId] ?? defaultChatState),
          isOpen,
        },
      },
    })),
  setMinimized: (jobId, isMinimized) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [jobId]: {
          ...(state.chats[jobId] ?? defaultChatState),
          isMinimized,
        },
      },
    })),
  setInputValue: (jobId, inputValue) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [jobId]: {
          ...(state.chats[jobId] ?? defaultChatState),
          inputValue,
        },
      },
    })),
  setUnreadCount: (jobId, unreadCount) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [jobId]: {
          ...(state.chats[jobId] ?? defaultChatState),
          unreadCount,
        },
      },
    })),
}));
