"use client";

import Image from "next/image";
import {
  Bot,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type MessageRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  type?: string;
  data?: {
    searchTerm?: string;
    medicines?: Array<{
      id: number;
      name: string;
      genericName: string | null;
      category: string | null;
    }>;
    pharmacies?: Array<{
      pharmacyId: number;
      pharmacyName: string;
      address: string;
      phone: string | null;
      medicineId: number;
      medicineName: string;
      genericName: string | null;
      category: string | null;
      quantity: number;
      price: number;
      stockStatus: string;
      section: string | null;
      shelf: string | null;
      row: string | null;
    }>;
  };
};

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! 👋 I’m SmartPharma AI Assistant. I can help you learn about medicines, find medicine availability in SmartPharma pharmacies, and explain general pharmacy information.\n\nWhat would you like to know?",
};

export default function AiAssistantPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setError("");
    setInput("");

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: message,
    };

    const history = messages
      .filter((item) => item.id !== "welcome")
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    setMessages((current) => [...current, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history,
        }),
      });

      let result: ApiResponse | null = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          result?.message || "The AI assistant is temporarily unavailable.",
        );
      }

      const assistantMessage = result?.message?.trim();

      if (!assistantMessage) {
        throw new Error("The AI assistant did not return a response.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: assistantMessage,
        },
      ]);
    } catch (err) {
      console.error("AI Assistant error:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to connect to the AI assistant.";

      setError(errorMessage);
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const clearChat = () => {
    setMessages([initialMessage]);
    setError("");
    setInput("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <>
      {/* Floating AI Assistant */}
      <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
        {/* Chat Window */}
        {isOpen && (
          <div
            className="
              absolute bottom-16 right-0
              flex h-[min(650px,calc(100vh-110px))]
              w-[min(390px,calc(100vw-24px))]
              flex-col overflow-hidden
              rounded-2xl border border-slate-200
              bg-white shadow-2xl
            "
          >
            {/* Header */}
            <div className="shrink-0 bg-emerald-600 px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                    <Image
                      src="/images/smartpharma logo.png"
                      alt="SmartPharma"
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold">SmartPharma AI</p>

                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-100">
                      <span className="h-2 w-2 rounded-full bg-emerald-300" />
                      AI Assistant online
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={clearChat}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-100 transition hover:bg-emerald-700 hover:text-white"
                    aria-label="Clear chat"
                    title="Clear chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-100 transition hover:bg-emerald-700 hover:text-white"
                    aria-label="Close AI assistant"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Assistant Status */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Bot className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    SmartPharma Assistant
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock3 className="h-3 w-3" />
                    Usually responds quickly
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 xs:flex sm:flex">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </div>
            </div>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
                          <Image
                            src="/images/smartpharma logo.png"
                            alt="SmartPharma"
                            width={28}
                            height={28}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}

                      <div
                        className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 shadow-sm ${
                          isUser
                            ? "rounded-br-md bg-emerald-600 text-white"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                          <User className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading */}
                {loading && (
                  <div className="flex items-end gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
                      <Image
                        src="/images/smartpharma logo.png"
                        alt="SmartPharma"
                        width={28}
                        height={28}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                        SmartPharma AI is thinking...
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Suggestions */}
            {messages.length === 1 && !loading && (
              <div className="shrink-0 border-t border-slate-200 bg-white px-3 pt-3 sm:px-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />

                  <p className="text-[11px] font-semibold text-slate-500">
                    Try asking
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pb-3">
                  {[
                    "Where can I find paracetamol?",
                    "Which pharmacies have ibuprofen?",
                    "What is paracetamol used for?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestion(suggestion)}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="shrink-0 border-t border-red-100 bg-red-50 px-3 py-2.5 sm:px-4">
                <div className="flex items-start gap-2 text-xs text-red-700">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <div className="min-w-0">
                    <p className="font-semibold">Something went wrong</p>

                    <p className="mt-0.5 break-words text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 border-t border-slate-200 bg-white p-3">
              <form
                onSubmit={sendMessage}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100"
              >
                <MessageCircle className="ml-2 h-4 w-4 shrink-0 text-slate-400" />

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about a medicine..."
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-1.5 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  aria-label="Send message"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>

              <p className="mt-1.5 text-center text-[9px] leading-3 text-slate-400">
                SmartPharma AI provides general information and is not a
                substitute for professional medical advice.
              </p>
            </div>
          </div>
        )}

        {/* Floating Button */}
        {!isOpen && (
          <div className="flex items-center gap-3">
            <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:block">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    SmartPharma AI
                  </p>

                  <p className="text-[10px] text-slate-500">How can I help?</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-emerald-600 shadow-xl transition duration-200 hover:scale-105 hover:bg-emerald-700 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-200"
              aria-label="Open SmartPharma AI Assistant"
              title="SmartPharma AI Assistant"
            >
              <Image
                src="/images/smartpharma logo.png"
                alt="SmartPharma AI"
                width={56}
                height={56}
                className="h-full w-full object-contain p-1"
                priority
              />

              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />

              {/* Pulse */}
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400 opacity-0 transition group-hover:animate-ping group-hover:opacity-50" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
