"use client";

import Image from "next/image";
import {
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

const API_URL = "http://localhost:4000";

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

const suggestions = [
  "Where can I find paracetamol?",
  "Which pharmacies have ibuprofen?",
  "What is paracetamol used for?",
];

/* =========================================================
   INLINE MARKDOWN
========================================================= */

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-slate-100 px-1 py-0.5 text-[12px] font-medium text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/* =========================================================
   MARKDOWN MESSAGE RENDERER
========================================================= */

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let bulletItems: string[] = [];
  let numberedItems: string[] = [];

  const flushLists = () => {
    if (bulletItems.length > 0) {
      elements.push(
        <ul key={`bullet-${elements.length}`} className="my-2 space-y-1.5 pl-5">
          {bulletItems.map((item, index) => (
            <li key={index} className="list-disc pl-1">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>,
      );

      bulletItems = [];
    }

    if (numberedItems.length > 0) {
      elements.push(
        <ol
          key={`numbered-${elements.length}`}
          className="my-2 space-y-1.5 pl-5"
        >
          {numberedItems.map((item, index) => (
            <li key={index} className="list-decimal pl-1">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>,
      );

      numberedItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    /* Empty line */
    if (!trimmed) {
      flushLists();

      elements.push(<div key={`space-${index}`} className="h-2" />);

      return;
    }

    /* Horizontal rule */
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushLists();

      elements.push(
        <hr key={`hr-${index}`} className="my-3 border-slate-200" />,
      );

      return;
    }

    /* Heading 3 */
    if (trimmed.startsWith("### ")) {
      flushLists();

      elements.push(
        <h3
          key={`h3-${index}`}
          className="mb-1.5 mt-3 text-sm font-bold text-slate-900"
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>,
      );

      return;
    }

    /* Heading 2 */
    if (trimmed.startsWith("## ")) {
      flushLists();

      elements.push(
        <h2
          key={`h2-${index}`}
          className="mb-1.5 mt-3 text-base font-bold text-slate-900"
        >
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>,
      );

      return;
    }

    /* Heading 1 */
    if (trimmed.startsWith("# ")) {
      flushLists();

      elements.push(
        <h1
          key={`h1-${index}`}
          className="mb-2 mt-3 text-base font-bold text-slate-900"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>,
      );

      return;
    }

    /* Bullet list */
    if (
      trimmed.startsWith("* ") ||
      trimmed.startsWith("- ") ||
      trimmed.startsWith("• ")
    ) {
      if (numberedItems.length > 0) {
        flushLists();
      }

      bulletItems.push(trimmed.slice(2));
      return;
    }

    /* Numbered list */
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (numberedMatch) {
      if (bulletItems.length > 0) {
        flushLists();
      }

      numberedItems.push(numberedMatch[1]);
      return;
    }

    /* Normal paragraph */
    flushLists();

    elements.push(
      <p key={`paragraph-${index}`} className="mb-1.5 last:mb-0">
        {renderInlineMarkdown(trimmed)}
      </p>,
    );
  });

  flushLists();

  return elements;
}

/* =========================================================
   AI ASSISTANT
========================================================= */

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  /* Scroll to latest message */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [messages, loading, isOpen]);

  /* Focus input */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen]);

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

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

      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  /* =========================================================
     CLEAR CHAT
  ========================================================= */

  const clearChat = () => {
    setMessages([initialMessage]);
    setError("");
    setInput("");

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /* =========================================================
     SUGGESTION
  ========================================================= */

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] sm:bottom-6 sm:right-6">
      {/* =====================================================
          CHAT WINDOW
      ===================================================== */}

      {isOpen && (
        <div
          className="
            absolute bottom-16 right-0
            flex
            h-[min(650px,calc(100vh-110px))]
            w-[min(390px,calc(100vw-24px))]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="shrink-0 bg-primary px-4 py-3 text-primary-foreground">
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

                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-primary-foreground/80">
                    <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                    AI Assistant online
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground/80 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground/80 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  aria-label="Close AI assistant"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              ASSISTANT STATUS
          ================================================= */}

          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
                <Image
                  src="/images/smartpharma logo.png"
                  alt="SmartPharma"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
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

            <div className="hidden items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary sm:flex">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </div>
          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

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
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="break-words">
                          {renderMarkdown(message.content)}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* =================================================
                  LOADING
              ================================================= */}

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
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      SmartPharma AI is thinking...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* =================================================
              SUGGESTIONS
          ================================================= */}

          {messages.length === 1 && !loading && (
            <div className="shrink-0 border-t border-slate-200 bg-white px-3 pt-3 sm:px-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />

                <p className="text-[11px] font-semibold text-slate-500">
                  Try asking
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pb-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestion(suggestion)}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

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

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="shrink-0 border-t border-slate-200 bg-white p-3">
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
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

      {/* =====================================================
          FLOATING BUTTON
      ===================================================== */}

      {!isOpen && (
        <div className="flex items-center gap-3">
          {/* Desktop label */}
          <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:block">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />

              <div>
                <p className="text-xs font-bold text-slate-900">
                  SmartPharma AI
                </p>

                <p className="text-[10px] text-slate-500">How can I help?</p>
              </div>
            </div>
          </div>

          {/* AI Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-primary shadow-xl transition duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/20"
            aria-label="Open SmartPharma AI Assistant"
            title="SmartPharma AI Assistant"
          >
            {/* White logo container */}
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white p-1.5 shadow-sm">
              <Image
                src="/images/smartpharma logo.png"
                alt="SmartPharma AI"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
              />
            </span>

            {/* Online indicator */}
            <span className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-2 border-white bg-primary-foreground shadow-sm" />

            {/* Hover pulse */}
            <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary-foreground/60 opacity-0 transition group-hover:animate-ping group-hover:opacity-50" />
          </button>
        </div>
      )}
    </div>
  );
}
