"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getConversations, getConversationMessages, sendMessage } from "@/actions/chat";
import { toast } from "sonner";
import {
  Send,
  MessagesSquare,
  Search,
  ExternalLink,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Building,
  User,
  Shield,
  Circle,
} from "lucide-react";

interface ChatInboxProps {
  currentUserId: string;
}

export function ChatInbox({ currentUserId }: ChatInboxProps) {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("id");

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    preselectedId || null
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      if (res.success && res.conversations) {
        setConversations(res.conversations);
        if (!selectedConversationId && res.conversations.length > 0) {
          setSelectedConversationId(res.conversations[0].id);
        }
      }
    } catch {
      // Background poll error
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async (convId: string, isSilent = false) => {
    if (!isSilent) setIsLoadingMessages(true);
    try {
      const res = await getConversationMessages(convId);
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch {
      if (!isSilent) toast.error("Could not load messages.");
    } finally {
      if (!isSilent) setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!selectedConversationId) return;
    loadMessages(selectedConversationId);

    const interval = setInterval(() => {
      loadMessages(selectedConversationId, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversationId || isSending) return;

    const messageContent = inputText.trim();
    setInputText("");

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      conversationId: selectedConversationId,
      senderId: currentUserId,
      text: messageContent,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUserId,
        name: "You",
        image: null,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      setIsSending(true);
      const res = await sendMessage(selectedConversationId, messageContent);
      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.message : m))
        );
        loadConversations();
      } else {
        toast.error(res.error || "Failed to send message.");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch {
      toast.error("Network error sending message.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const getCounterpart = (conv: any) => {
    if (conv.buyerId === currentUserId) {
      return {
        ...conv.seller,
        roleBadge: "Listing Agent / Seller",
      };
    }
    return {
      ...conv.buyer,
      roleBadge: "Verified Buyer",
    };
  };

  const filteredConversations = conversations.filter((c) => {
    const cp = getCounterpart(c);
    const titleMatch = c.property?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = cp?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || nameMatch;
  });

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden h-[720px] flex flex-col md:flex-row">
      {/* LEFT SIDEBAR: Active Conversations List */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-zinc-950 dark:text-white flex items-center gap-2">
              <MessagesSquare className="size-5 text-amber-500" />
              <span>Direct Messages</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
              {conversations.length}
            </span>
          </div>

          <div className="relative">
            <Search className="size-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent, buyer, property..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {isLoadingConversations ? (
            <div className="p-8 text-center text-xs text-zinc-400">Loading inbox...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <MessagesSquare className="size-8 mx-auto text-zinc-300 dark:text-zinc-700" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">No conversations yet.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const cp = getCounterpart(conv);
              const isSelected = conv.id === selectedConversationId;
              const unreadCount = conv._count?.messages || 0;
              const lastMsg = conv.messages?.[0];
              const propThumb = conv.property?.images?.[0] || "/assets/house.png";

              return (
                <button
                  type="button"
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-amber-500"
                      : "hover:bg-zinc-100/70 dark:hover:bg-zinc-850/50"
                  }`}
                >
                  <div className="relative size-12 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                    <Image src={propThumb} alt="" fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {cp?.name || "Client"}
                      </h4>
                      {lastMsg && (
                        <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                          {new Date(lastMsg.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate mb-1">
                      {conv.property?.title}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                        {lastMsg ? lastMsg.text : "No messages yet"}
                      </p>
                      {unreadCount > 0 && (
                        <span className="size-4 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Active Chat Thread */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/40 dark:bg-zinc-900/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative size-10 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                {getCounterpart(selectedConversation)?.image ? (
                  <Image
                    src={getCounterpart(selectedConversation).image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center font-bold text-sm text-zinc-700 dark:text-zinc-300">
                    {getCounterpart(selectedConversation)?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-sm text-zinc-950 dark:text-white truncate">
                    {getCounterpart(selectedConversation)?.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {getCounterpart(selectedConversation)?.roleBadge}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 truncate">
                  Property: {selectedConversation.property?.title}
                </p>
              </div>
            </div>

            <Link
              href={`/properties/${selectedConversation.property?.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors shrink-0"
            >
              <span>View Listing</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {isLoadingMessages ? (
              <div className="p-8 text-center text-xs text-zinc-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400 space-y-2">
                <MessagesSquare className="size-10 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm font-semibold">Start the conversation</p>
                <p className="text-xs max-w-xs">
                  Ask about private showings, pricing terms, or architectural details.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 rounded-br-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400 font-mono">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && (
                        <span>
                          {msg.isRead ? (
                            <CheckCheck className="size-3 text-amber-500" />
                          ) : (
                            <Check className="size-3 text-zinc-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 md:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center text-zinc-400 space-y-2">
          <MessagesSquare className="size-12 text-zinc-300 dark:text-zinc-700" />
          <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
            Select a conversation
          </h3>
          <p className="text-xs max-w-sm">
            Choose a buyer or agent thread from the list on the left to review messages and reply in real time.
          </p>
        </div>
      )}
    </div>
  );
}
