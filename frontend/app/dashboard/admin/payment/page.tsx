"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  RefreshCw,
  XCircle,
} from "lucide-react";

import AdminNavigation from "@/components/admin/AdminNavigation";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type SubscriptionPlan = "BASIC" | "STANDARD" | "PROFESSIONAL" | "ENTERPRISE";

type PaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";

type Payment = {
  id: number;
  pharmacyId: number;
  plan: SubscriptionPlan;
  amount: number;
  transactionId: string;
  status: PaymentStatus;
  screenshotName: string | null;
  screenshotMimeType: string | null;
  screenshotSize: number | null;
  verifiedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;

  pharmacy?: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
  };
};

type Subscription = {
  id: number;
  pharmacyId: number;
  plan: SubscriptionPlan;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
  startDate: string | null;
  renewalDate: string | null;
  createdAt: string;
  updatedAt: string;

  pharmacy?: {
    id: number;
    name: string;
    email: string | null;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function formatPlan(plan: SubscriptionPlan) {
  switch (plan) {
    case "BASIC":
      return "Basic";

    case "STANDARD":
      return "Standard";

    case "PROFESSIONAL":
      return "Professional";

    case "ENTERPRISE":
      return "Enterprise";

    default:
      return plan;
  }
}

function getSubscriptionStatusClasses(status: Subscription["status"]) {
  switch (status) {
    case "ACTIVE":
      return {
        badge: "bg-green-100 text-green-700",
        dot: "bg-green-600",
      };

    case "PENDING":
      return {
        badge: "bg-yellow-100 text-yellow-700",
        dot: "bg-yellow-500",
      };

    case "EXPIRED":
      return {
        badge: "bg-slate-100 text-slate-700",
        dot: "bg-slate-500",
      };

    case "CANCELLED":
      return {
        badge: "bg-slate-100 text-slate-700",
        dot: "bg-slate-500",
      };

    default:
      return {
        badge: "bg-slate-100 text-slate-700",
        dot: "bg-slate-500",
      };
  }
}

export default function AdminPaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  async function loadPayments(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication is required.");
      }

      const [paymentsResponse, subscriptionsResponse] = await Promise.all([
        fetch(`${API_URL}/payments/pending`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }),

        fetch(`${API_URL}/payments/subscriptions/active`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }),
      ]);

      if (!paymentsResponse.ok) {
        const body = await paymentsResponse.json().catch(() => null);

        throw new Error(body?.message || "Failed to load pending payments.");
      }

      if (!subscriptionsResponse.ok) {
        const body = await subscriptionsResponse.json().catch(() => null);

        throw new Error(
          body?.message || "Failed to load active subscriptions.",
        );
      }

      const paymentsData = (await paymentsResponse.json()) as Payment[];

      const subscriptionsData =
        (await subscriptionsResponse.json()) as Subscription[];

      setPayments(Array.isArray(paymentsData) ? paymentsData : []);

      setSubscriptions(
        Array.isArray(subscriptionsData) ? subscriptionsData : [],
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load payment information.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      await loadPayments();
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadScreenshot() {
      if (!selectedPayment) {
        setScreenshotUrl(null);
        setScreenshotLoading(false);
        setScreenshotError("");
        return;
      }

      setScreenshotLoading(true);
      setScreenshotError("");
      setScreenshotUrl(null);

      try {
        const token = getToken();

        if (!token) {
          throw new Error("Authentication is required.");
        }

        const response = await fetch(
          `${API_URL}/payments/${selectedPayment.id}/screenshot`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          const body = await response.json().catch(() => null);

          throw new Error(
            body?.message || "Failed to load payment screenshot.",
          );
        }

        const blob = await response.blob();

        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setScreenshotUrl(objectUrl);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setScreenshotError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load payment screenshot.",
        );
      } finally {
        if (!cancelled) {
          setScreenshotLoading(false);
        }
      }
    }

    void loadScreenshot();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedPayment]);

  async function handleVerify(payment: Payment) {
    const confirmed = window.confirm(
      `Verify payment ${payment.transactionId} for ${formatPlan(
        payment.plan,
      )}?`,
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication is required.");
      }

      const response = await fetch(`${API_URL}/payments/${payment.id}/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        throw new Error(body?.message || "Failed to verify payment.");
      }

      setSelectedPayment(null);

      await loadPayments(true);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to verify payment.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(payment: Payment) {
    const confirmed = window.confirm(
      `Reject payment ${payment.transactionId}?`,
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication is required.");
      }

      const response = await fetch(`${API_URL}/payments/${payment.id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        throw new Error(body?.message || "Failed to reject payment.");
      }

      setSelectedPayment(null);

      await loadPayments(true);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to reject payment.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNavigation activePath="/dashboard/admin/payment" />

      {/* Page Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <CreditCard className="h-7 w-7" />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Administration
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Payment Verification
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Review subscription payments, verify valid payments, and monitor
                active pharmacy subscriptions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadPayments(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {actionError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Pending Payments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Pending Payments
              </p>

              <Clock3 className="h-5 w-5 text-slate-500" />
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {payments.length}
            </p>
          </div>

          {/* Active Subscriptions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Active Subscriptions
              </p>

              {/* Green because this represents ACTIVE */}
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {subscriptions.length}
            </p>
          </div>

          {/* Pending Value */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Pending Value
              </p>

              <CreditCard className="h-5 w-5 text-slate-500" />
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {formatCurrency(
                payments.reduce((total, payment) => total + payment.amount, 0),
              )}
            </p>
          </div>
        </div>

        {/* Pending Payments */}
        <section className="mt-10">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Verification Queue
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Pending Payments
            </h2>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

              <p className="mt-4 text-sm text-slate-500">
                Loading payment information...
              </p>
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No pending payments
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                There are currently no payments waiting for verification.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Pharmacy
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Plan
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Transaction
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Submitted
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-900">
                            {payment.pharmacy?.name ||
                              `Pharmacy #${payment.pharmacyId}`}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {payment.pharmacy?.email || "No email"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {formatPlan(payment.plan)}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-slate-900">
                          {formatCurrency(payment.amount)}
                        </td>

                        <td className="px-6 py-5">
                          <p className="max-w-[180px] truncate font-mono text-xs text-slate-700">
                            {payment.transactionId}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {formatDate(payment.createdAt)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setActionError("");
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Active Subscriptions */}
        <section id="subscriptions" className="mt-14 scroll-mt-8">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Subscription Overview
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Active Subscriptions
            </h2>
          </div>

          {subscriptions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <CreditCard className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-4 text-sm text-slate-500">
                No active subscriptions found.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Pharmacy
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Plan
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Started
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Renewal
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.map((subscription) => {
                      const statusClasses = getSubscriptionStatusClasses(
                        subscription.status,
                      );

                      return (
                        <tr key={subscription.id}>
                          <td className="px-6 py-5">
                            <p className="font-semibold text-slate-900">
                              {subscription.pharmacy?.name ||
                                `Pharmacy #${subscription.pharmacyId}`}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {subscription.pharmacy?.email || "No email"}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {formatPlan(subscription.plan)}
                            </span>
                          </td>

                          {/* Subscription Status */}
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses.badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusClasses.dot}`}
                              />

                              {subscription.status}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {formatDate(subscription.startDate)}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {formatDate(subscription.renewalDate)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm text-slate-500">SmartPharma Administration</p>
        </div>
      </footer>

      {/* Payment Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4 sm:p-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment Review
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedPayment.pharmacy?.name ||
                    `Pharmacy #${selectedPayment.pharmacyId}`}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close payment review"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-8 p-6">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Plan
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatPlan(selectedPayment.plan)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Amount
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Transaction ID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-slate-900">
                    {selectedPayment.transactionId}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Submitted
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(selectedPayment.createdAt)}
                  </p>
                </div>
              </div>

              {/* Screenshot */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-sm font-semibold text-slate-900">
                  Payment Screenshot
                </h3>

                <div className="mt-4 flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  {screenshotLoading ? (
                    <div className="text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

                      <p className="mt-4 text-sm text-slate-500">
                        Loading screenshot...
                      </p>
                    </div>
                  ) : screenshotError ? (
                    <div className="max-w-md text-center">
                      <XCircle className="mx-auto h-10 w-10 text-slate-400" />

                      <p className="mt-4 text-sm font-medium text-slate-700">
                        {screenshotError}
                      </p>
                    </div>
                  ) : screenshotUrl ? (
                    <Image
                      src={screenshotUrl}
                      alt="Payment screenshot"
                      width={1200}
                      height={800}
                      unoptimized
                      className="max-h-[500px] w-auto max-w-full rounded-xl object-contain"
                    />
                  ) : (
                    <p className="text-sm text-slate-500">
                      No screenshot available.
                    </p>
                  )}
                </div>
              </div>

              {/* Screenshot Information */}
              <div className="grid gap-5 border-t border-slate-200 pt-8 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Screenshot Name
                  </p>

                  <p className="mt-1 text-sm text-slate-900">
                    {selectedPayment.screenshotName || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Screenshot Type
                  </p>

                  <p className="mt-1 text-sm text-slate-900">
                    {selectedPayment.screenshotMimeType || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                disabled={actionLoading}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Reject = Red */}
              <button
                type="button"
                onClick={() => void handleReject(selectedPayment)}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject Payment
              </button>

              {/* Verify = Keep Primary Color */}
              <button
                type="button"
                onClick={() => void handleVerify(selectedPayment)}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Verify Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
