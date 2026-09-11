"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  User,
  X,
} from "lucide-react";

import AdminNavigation from "@/components/admin/AdminNavigation";
import { getToken } from "@/lib/auth";

const API_URL = "http://localhost:4000";

type SenderType = "PATIENT" | "PHARMACY";

type FeedbackStatus = "NEW" | "REVIEWING" | "RESPONDED" | "RESOLVED";

type Feedback = {
  id: number;
  senderType: SenderType;
  name: string | null;
  email: string | null;
  pharmacyId: number | null;
  category: string;
  message: string;
  status: FeedbackStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const statusOptions: Array<{
  value: "ALL" | FeedbackStatus;
  label: string;
}> = [
  { value: "ALL", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "RESPONDED", label: "Responded" },
  { value: "RESOLVED", label: "Resolved" },
];

const senderOptions: Array<{
  value: "ALL" | SenderType;
  label: string;
}> = [
  { value: "ALL", label: "All Senders" },
  { value: "PATIENT", label: "Patients" },
  { value: "PHARMACY", label: "Pharmacies" },
];

function getStatusStyle(status: FeedbackStatus) {
  switch (status) {
    case "NEW":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "REVIEWING":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "RESPONDED":
      return "border-green-200 bg-green-50 text-green-700";

    case "RESOLVED":
      return "border-slate-200 bg-slate-100 text-slate-700";

    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getStatusLabel(status: FeedbackStatus) {
  switch (status) {
    case "NEW":
      return "New";

    case "REVIEWING":
      return "Reviewing";

    case "RESPONDED":
      return "Responded";

    case "RESOLVED":
      return "Resolved";

    default:
      return status;
  }
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return parsedDate.toLocaleString();
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [senderFilter, setSenderFilter] = useState<"ALL" | SenderType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | FeedbackStatus>(
    "ALL",
  );

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );

  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const response = await fetch(`${API_URL}/feedback`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(getErrorMessage(data, "Failed to load feedback."));
        }

        setFeedback(Array.isArray(data) ? (data as Feedback[]) : []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading feedback.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadFeedback();
  }, []);

  const refreshFeedback = async () => {
    try {
      setRefreshing(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(`${API_URL}/feedback`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to refresh feedback."));
      }

      setFeedback(Array.isArray(data) ? (data as Feedback[]) : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh feedback.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  const filteredFeedback = useMemo(() => {
    const query = search.trim().toLowerCase();

    return feedback.filter((item) => {
      const matchesSender =
        senderFilter === "ALL" || item.senderType === senderFilter;

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesSearch =
        query.length === 0 ||
        item.message.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.name?.toLowerCase().includes(query) ?? false) ||
        (item.email?.toLowerCase().includes(query) ?? false) ||
        item.id.toString().includes(query);

      return matchesSender && matchesStatus && matchesSearch;
    });
  }, [feedback, search, senderFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: feedback.length,
      new: feedback.filter((item) => item.status === "NEW").length,
      reviewing: feedback.filter((item) => item.status === "REVIEWING").length,
      responded: feedback.filter((item) => item.status === "RESPONDED").length,
      resolved: feedback.filter((item) => item.status === "RESOLVED").length,
      patient: feedback.filter((item) => item.senderType === "PATIENT").length,
      pharmacy: feedback.filter((item) => item.senderType === "PHARMACY")
        .length,
    };
  }, [feedback]);

  const openFeedback = (item: Feedback) => {
    setSelectedFeedback(item);
    setReply(item.adminReply ?? "");
    setError("");
  };

  const closeFeedback = () => {
    if (replyLoading || actionLoading) {
      return;
    }

    setSelectedFeedback(null);
    setReply("");
  };

  const updateStatus = async (id: number, status: FeedbackStatus) => {
    try {
      setActionLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(`${API_URL}/feedback/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to update feedback status."),
        );
      }

      const updatedAt = new Date().toISOString();

      setFeedback((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                updatedAt,
              }
            : item,
        ),
      );

      setSelectedFeedback((current) =>
        current && current.id === id
          ? {
              ...current,
              status,
              updatedAt,
            }
          : current,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update feedback status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const submitReply = async () => {
    if (!selectedFeedback) {
      return;
    }

    const trimmedReply = reply.trim();

    if (trimmedReply.length < 2) {
      setError("Please enter a reply before sending.");
      return;
    }

    try {
      setReplyLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/feedback/${selectedFeedback.id}/reply`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adminReply: trimmedReply,
          }),
        },
      );

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to send reply."));
      }

      const updatedFeedback = data as Feedback;

      setFeedback((current) =>
        current.map((item) =>
          item.id === updatedFeedback.id ? updatedFeedback : item,
        ),
      );

      setSelectedFeedback(updatedFeedback);
      setReply(updatedFeedback.adminReply ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Admin Navigation */}
      <AdminNavigation activePath="/dashboard/admin/feedback" />

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              Feedback Management
            </h1>

            <p className="mt-2 text-slate-600">
              Manage feedback received from patients and pharmacies.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshFeedback()}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Feedback</p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {stats.total}
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm text-blue-600">New</p>

            <p className="mt-2 text-3xl font-bold text-blue-900">{stats.new}</p>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
            <p className="text-sm text-yellow-700">Reviewing</p>

            <p className="mt-2 text-3xl font-bold text-yellow-900">
              {stats.reviewing}
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm text-green-700">Resolved</p>

            <p className="mt-2 text-3xl font-bold text-green-900">
              {stats.resolved}
            </p>
          </div>
        </div>

        {/* Sender Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <User className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Patient Feedback</p>

                <p className="text-xl font-bold text-slate-950">
                  {stats.patient}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <MessageCircle className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Pharmacy Feedback</p>

                <p className="text-xl font-bold text-slate-950">
                  {stats.pharmacy}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search feedback..."
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <select
              value={senderFilter}
              onChange={(event) =>
                setSenderFilter(event.target.value as "ALL" | SenderType)
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            >
              {senderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "ALL" | FeedbackStatus)
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feedback List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Feedback</h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredFeedback.length} of {feedback.length} submissions
            </p>
          </div>

          {loading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-lg border border-slate-200 p-5"
                >
                  <div className="h-4 w-1/4 rounded bg-slate-200" />

                  <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />

                  <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-900">
                No feedback found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredFeedback.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openFeedback(item)}
                  className="block w-full p-5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            item.senderType === "PATIENT"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-purple-200 bg-purple-50 text-purple-700"
                          }`}
                        >
                          {item.senderType === "PATIENT"
                            ? "Patient"
                            : "Pharmacy"}
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                            item.status,
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>

                        <span className="text-xs text-slate-400">
                          #{item.id}
                        </span>
                      </div>

                      <h3 className="mt-3 font-semibold text-slate-950">
                        {item.category}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {item.message}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>
                          {item.name ||
                            (item.senderType === "PHARMACY"
                              ? "Pharmacy"
                              : "Anonymous")}
                        </span>

                        {item.email && <span>{item.email}</span>}

                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-sm font-medium text-slate-600">
                      View Details →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feedback Details Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeFeedback();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Feedback #{selectedFeedback.id}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(selectedFeedback.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFeedback}
                disabled={replyLoading || actionLoading}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close feedback"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Sender */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      selectedFeedback.senderType === "PATIENT"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-purple-200 bg-purple-50 text-purple-700"
                    }`}
                  >
                    {selectedFeedback.senderType === "PATIENT"
                      ? "Patient"
                      : "Pharmacy"}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      selectedFeedback.status,
                    )}`}
                  >
                    {getStatusLabel(selectedFeedback.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedFeedback.name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-900">
                      {selectedFeedback.email || "Not provided"}
                    </p>
                  </div>

                  {selectedFeedback.pharmacyId !== null && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Pharmacy ID
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        #{selectedFeedback.pharmacyId}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Category
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedFeedback.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  Feedback Message
                </h3>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {selectedFeedback.message}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Update Status
                </h3>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      void updateStatus(selectedFeedback.id, "NEW")
                    }
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                  >
                    New
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      void updateStatus(selectedFeedback.id, "REVIEWING")
                    }
                    className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-100 disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Reviewing
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      void updateStatus(selectedFeedback.id, "RESPONDED")
                    }
                    className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" />
                      Responded
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      void updateStatus(selectedFeedback.id, "RESOLVED")
                    }
                    className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolved
                    </span>
                  </button>
                </div>
              </div>

              {/* Previous Reply */}
              {selectedFeedback.adminReply && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">
                    Previous Admin Reply
                  </h3>

                  <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-green-900">
                      {selectedFeedback.adminReply}
                    </p>

                    {selectedFeedback.repliedAt && (
                      <p className="mt-3 text-xs text-green-700">
                        Replied on {formatDate(selectedFeedback.repliedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Reply */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  Admin Reply
                </h3>

                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Write a response to this feedback..."
                  maxLength={2000}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                />

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {reply.length}/2000
                  </span>

                  <button
                    type="button"
                    onClick={() => void submitReply()}
                    disabled={
                      replyLoading || actionLoading || reply.trim().length < 2
                    }
                    className="flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />

                    {replyLoading ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
