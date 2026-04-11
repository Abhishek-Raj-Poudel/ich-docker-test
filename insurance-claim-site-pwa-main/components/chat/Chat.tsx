"use client";

import React, { useState, useEffect, useRef, useEffectEvent } from "react";
import { Send, User, HardHat, X, Minimize2, Maximize2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { getChatHistory, sendMessage, Message, getUnreadCount } from "@/lib/chat";
import { toast } from "sonner";
import { useChatUiStore } from "@/lib/chat-ui-store";

interface ChatProps {
  jobId: number | string;
  currentUserRole: "client" | "builder" | "admin";
  otherPartyName: string;
  otherPartyRole: "client" | "builder" | "admin";
}

export function Chat({ jobId, currentUserRole, otherPartyName, otherPartyRole }: ChatProps) {
  const { user } = useAuth();
  const chatKey = String(jobId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const ensureChat = useChatUiStore((state) => state.ensureChat);
  const inputValue = useChatUiStore((state) => state.chats[chatKey]?.inputValue ?? "");
  const isOpen = useChatUiStore((state) => state.chats[chatKey]?.isOpen ?? false);
  const isMinimized = useChatUiStore((state) => state.chats[chatKey]?.isMinimized ?? false);
  const unreadCount = useChatUiStore((state) => state.chats[chatKey]?.unreadCount ?? 0);
  const setInputValue = useChatUiStore((state) => state.setInputValue);
  const setOpen = useChatUiStore((state) => state.setOpen);
  const setMinimized = useChatUiStore((state) => state.setMinimized);
  const setUnreadCount = useChatUiStore((state) => state.setUnreadCount);

  useEffect(() => {
    ensureChat(chatKey);
  }, [ensureChat, chatKey]);

  const fetchMessages = useEffectEvent(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const result = await getChatHistory(jobId);
      if (result.success && result.data) {
        if (JSON.stringify(result.data) !== JSON.stringify(messages)) {
          setMessages(result.data);
          // If chat is open, we can assume messages are being read (though better to have a mark-as-read API)
          if (isOpen && !isMinimized) {
            setUnreadCount(chatKey, 0);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  });

  const fetchUnreadCount = useEffectEvent(async () => {
    if (isOpen && !isMinimized) return;
    try {
      const result = await getUnreadCount(jobId);
      if (result.success && result.count !== undefined) {
        setUnreadCount(chatKey, result.count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  });

  // Initial load and polling setup
  useEffect(() => {
    if (isOpen) {
      fetchMessages(true);
      setUnreadCount(chatKey, 0);
    } else {
      fetchUnreadCount();
    }
    
    pollingInterval.current = setInterval(() => {
      if (isOpen) {
        fetchMessages();
      } else {
        fetchUnreadCount();
      }
    }, 5000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isOpen, jobId, isMinimized, chatKey, setUnreadCount]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const content = inputValue;
    setInputValue(chatKey, "");

    const tempId = Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      job_details_id: Number(jobId),
      user_id: user?.id || 0,
      sender_name: (user?.first_name && user?.last_name) 
        ? `${user.first_name} ${user.last_name}` 
        : user?.name || "You",
      sender_role: ((user?.role?.role as "client" | "builder" | "admin" | undefined) || currentUserRole),
      message: content,
      type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const result = await sendMessage(jobId, {
      message: content,
      type: "text"
    });

    if (result.success && result.data) {
      setMessages((prev) => 
        prev.map((msg) => msg.id === tempId ? result.data! : msg)
      );
    } else {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      toast.error(result.message || "Failed to send message");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? "64px" : "500px" 
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "w-[380px] bg-white border border-neutral-100 rounded-2xl overflow-hidden flex flex-col pointer-events-auto transition-all duration-300",
              isMinimized ? "h-16" : "h-[500px]"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-white/10 rounded-md flex items-center justify-center text-white border border-white/10 font-bold">
                  {otherPartyRole === "builder" ? <HardHat className="size-4" /> : <User className="size-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest leading-none mb-1">{otherPartyRole}</p>
                  <p className="text-sm font-medium opacity-80">{otherPartyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 text-neutral-400 hover:text-white hover:bg-white/10 p-0"
                  onClick={() => setMinimized(chatKey, !isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 text-neutral-400 hover:text-white hover:bg-white/10 p-0"
                  onClick={() => setOpen(chatKey, false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50"
                >
                  {isLoading && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                      <div className="size-4 bg-neutral-900 animate-pulse rounded-full" />
                      <p className="text-[10px] uppercase font-bold tracking-widest">Loading history...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30 text-center px-8">
                       <MessageCircle className="size-8 opacity-20" />
                       <p className="text-xs font-medium">No messages yet. Send a message to start the conversation.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.user_id === user?.id;
                      return (
                        <div 
                          key={msg.id}
                          className={cn(
                            "flex flex-col max-w-[80%]",
                            isMe ? "ml-auto items-end" : "mr-auto items-start"
                          )}
                        >
                          <div className={cn(
                            "p-3 rounded-xl text-sm",
                            isMe 
                                ? "bg-neutral-900 text-white rounded-br-none" 
                                : "bg-white border border-neutral-100 text-neutral-900 rounded-bl-none"
                          )}>
                            {msg.message}
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-1">
                            {isMe ? "You" : msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Area */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 bg-white border-t border-neutral-100 flex items-center gap-2"
                >
                  <Input 
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(chatKey, e.target.value)}
                    className="h-10 border-neutral-100 bg-neutral-50 focus-visible:bg-white focus-visible:border-neutral-900 transition-all text-sm"
                  />
                  <Button 
                    type="submit"
                    size="icon"
                    className="size-10 shrink-0 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl"
                    disabled={!inputValue.trim()}
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => {
          setOpen(chatKey, !isOpen);
          setMinimized(chatKey, false);
        }}
        className={cn(
          "size-14 rounded-2xl pointer-events-auto transition-all relative",
          isOpen ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" : "bg-neutral-900 text-white hover:bg-neutral-800"
        )}
      >
        {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </div>

  );
}
