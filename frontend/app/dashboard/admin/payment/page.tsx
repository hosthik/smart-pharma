"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Payment = {
  id: number;
  pharmacyId: number;
  plan: string;
  amount: number;
  transactionId: string;
  status: string;
  screenshotName?: string | null;
  screenshotMimeType?: string | null;
  screenshotSize?: number | null;
  screenshotUrl?: string | null;
  createdAt: string;
  verifiedAt?: string | null;
  rejectedAt?: string | null;
  pharmacy?: {
    id: number;
    name: string;
    address?: string;
    phone?: string | null;
    email?: string | null;
  };
};

type Subscription = {
  id: number;
  pharmacyId: number;
  plan: string;
  status: string;
  startDate?: string | null;
  renewalDate?: string | null;
  pharmacy?: {
    id: number;
    name: string;
    address?: string;
    phone?: string | null;
    email?: string | null;
  };
};

const API_URL = "http://localhost:4000";

function formatDate(date?: string | null) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date?: string | null) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAmount(amount: number) {
  return `ETB ${amount.toLocaleString()}`;
}

function formatPlan(plan: string) {
  if (!plan) {
    return "—";
  }

  return plan.charAt(0) + plan.slice(1).toLowerCase();
}

function formatFileSize(size?: number | null) {
  if (!size) {
    return "—";
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

function getScreenshotUrl(screenshotUrl?: string | null) {
  if (!screenshotUrl) {
    return null;
  }

  if (screenshotUrl.startsWith("http")) {
    return screenshotUrl;
  }

  return `${API_URL}${screenshotUrl}`;
}

export default function AdminPaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [loadingPayments, setLoadingPayments] = useState(true);

  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [actionId, setActionId] = useState<number | null>(null);

  const [actionType, setActionType] = useState<"verify" | "reject" | null>(
    null,
  );

  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadPayments() {
      try {
        const response = await fetch(`${API_URL}/payments/pending`);

        if (!response.ok) {
          throw new Error("Failed to load pending payments.");
        }

        const data = await response.json();

        setPayments(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load pending payments.");
      } finally {
        setLoadingPayments(false);
      }
    }

    loadPayments();
  }, []);

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const response = await fetch(
          `${API_URL}/payments/subscriptions/active`,
        );

        if (!response.ok) {
          throw new Error("Failed to load active subscriptions.");
        }

        const data = await response.json();

        setSubscriptions(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load active subscriptions.");
      } finally {
        setLoadingSubscriptions(false);
      }
    }

    loadSubscriptions();
  }, []);

  async function refreshData() {
    setError("");
    setSuccessMessage("");

    setLoadingPayments(true);
    setLoadingSubscriptions(true);

    try {
      const [paymentsResponse, subscriptionsResponse] = await Promise.all([
        fetch(`${API_URL}/payments/pending`),
        fetch(`${API_URL}/payments/subscriptions/active`),
      ]);

      if (!paymentsResponse.ok) {
        throw new Error("Failed to load pending payments.");
      }

      if (!subscriptionsResponse.ok) {
        throw new Error("Failed to load active subscriptions.");
      }

      const paymentsData = await paymentsResponse.json();

      const subscriptionsData = await subscriptionsResponse.json();

      setPayments(Array.isArray(paymentsData) ? paymentsData : []);

      setSubscriptions(
        Array.isArray(subscriptionsData) ? subscriptionsData : [],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh data.");
    } finally {
      setLoadingPayments(false);
      setLoadingSubscriptions(false);
    }
  }

  async function verifyPayment(id: number) {
    setActionId(id);
    setActionType("verify");
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/payments/${id}/verify`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to verify payment.");
      }

      setPayments((current) => current.filter((payment) => payment.id !== id));

      setSuccessMessage("Payment verified and subscription activated.");

      const subscriptionsResponse = await fetch(
        `${API_URL}/payments/subscriptions/active`,
      );

      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json();

        setSubscriptions(
          Array.isArray(subscriptionsData) ? subscriptionsData : [],
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to verify payment.",
      );
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  async function rejectPayment(id: number) {
    setActionId(id);
    setActionType("reject");
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/payments/${id}/reject`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to reject payment.");
      }

      setPayments((current) => current.filter((payment) => payment.id !== id));

      setSuccessMessage("Payment has been rejected.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject payment.",
      );
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Payment Verification
            </h1>

            <p className="mt-2 text-muted-foreground">
              Review TeleBirr payments and manage pharmacy subscriptions.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={refreshData}
            disabled={loadingPayments || loadingSubscriptions}
          >
            {loadingPayments || loadingSubscriptions
              ? "Refreshing..."
              : "Refresh"}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* Pending Payments */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Pending Payments</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  {payments.length} payment
                  {payments.length === 1 ? "" : "s"} waiting for verification
                </p>
              </div>

              <Badge variant="secondary">{payments.length} Pending</Badge>
            </div>
          </CardHeader>

          <CardContent>
            {loadingPayments ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading pending payments...
              </div>
            ) : payments.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-3 text-4xl">✓</div>

                <h3 className="text-lg font-semibold">No pending payments</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  All submitted payments have been processed.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {payments.map((payment) => {
                  const screenshotUrl = getScreenshotUrl(payment.screenshotUrl);

                  return (
                    <div
                      key={payment.id}
                      className="overflow-hidden rounded-xl border"
                    >
                      <div className="p-5">
                        <div className="grid gap-6 xl:grid-cols-[1fr_280px_auto]">
                          {/* Payment Information */}
                          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Pharmacy
                              </p>

                              <p className="mt-1 font-semibold">
                                {payment.pharmacy?.name ||
                                  `Pharmacy #${payment.pharmacyId}`}
                              </p>

                              {payment.pharmacy?.phone && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {payment.pharmacy.phone}
                                </p>
                              )}

                              {payment.pharmacy?.address && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {payment.pharmacy.address}
                                </p>
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Plan
                              </p>

                              <p className="mt-1 font-semibold">
                                {formatPlan(payment.plan)}
                              </p>

                              <Badge variant="outline" className="mt-2">
                                {payment.status}
                              </Badge>
                            </div>

                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Amount
                              </p>

                              <p className="mt-1 text-lg font-bold">
                                {formatAmount(payment.amount)}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Payment ID: {payment.id}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Transaction ID
                              </p>

                              <p className="mt-1 break-all font-mono text-sm font-semibold">
                                {payment.transactionId}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Submitted {formatDateTime(payment.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* Screenshot */}
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Payment Screenshot
                            </p>

                            {screenshotUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedScreenshot(screenshotUrl)
                                }
                                className="group block w-full overflow-hidden rounded-lg border bg-muted text-left"
                              >
                                <Image
                                  src={screenshotUrl}
                                  alt={`Payment screenshot for ${payment.transactionId}`}
                                  width={400}
                                  height={300}
                                  unoptimized
                                  className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                />

                                <div className="border-t bg-background px-3 py-2 text-center text-xs font-medium">
                                  Click to view full screenshot
                                </div>
                              </button>
                            ) : (
                              <div className="flex h-48 items-center justify-center rounded-lg border bg-muted px-4 text-center text-sm text-muted-foreground">
                                No screenshot available
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col justify-center gap-2">
                            <Button
                              onClick={() => verifyPayment(payment.id)}
                              disabled={actionId === payment.id}
                              className="min-w-28"
                            >
                              {actionId === payment.id &&
                              actionType === "verify"
                                ? "Verifying..."
                                : "✓ Verify"}
                            </Button>

                            <Button
                              variant="destructive"
                              onClick={() => rejectPayment(payment.id)}
                              disabled={actionId === payment.id}
                              className="min-w-28"
                            >
                              {actionId === payment.id &&
                              actionType === "reject"
                                ? "Rejecting..."
                                : "✕ Reject"}
                            </Button>
                          </div>
                        </div>

                        {/* Screenshot Details */}
                        {payment.screenshotName && (
                          <div className="mt-5 border-t pt-4">
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                              <span>
                                File: <strong>{payment.screenshotName}</strong>
                              </span>

                              <span className="text-muted-foreground">
                                Type: {payment.screenshotMimeType || "Image"}
                              </span>

                              <span className="text-muted-foreground">
                                Size: {formatFileSize(payment.screenshotSize)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Active Subscriptions</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Pharmacies with currently active SmartPharma plans.
                </p>
              </div>

              <Badge variant="secondary">{subscriptions.length} Active</Badge>
            </div>
          </CardHeader>

          <CardContent>
            {loadingSubscriptions ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading active subscriptions...
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-3 text-4xl">—</div>

                <h3 className="text-lg font-semibold">
                  No active subscriptions
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  No pharmacies currently have an active paid subscription.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Pharmacy</th>

                      <th className="px-4 py-3 font-medium">Plan</th>

                      <th className="px-4 py-3 font-medium">Status</th>

                      <th className="px-4 py-3 font-medium">Start Date</th>

                      <th className="px-4 py-3 font-medium">Renewal Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr
                        key={subscription.id}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold">
                            {subscription.pharmacy?.name ||
                              `Pharmacy #${subscription.pharmacyId}`}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            ID: {subscription.pharmacyId}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <Badge variant="outline">
                            {formatPlan(subscription.plan)}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <Badge>{subscription.status}</Badge>
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {formatDate(subscription.startDate)}
                        </td>

                        <td className="px-4 py-4 text-sm font-medium">
                          {formatDate(subscription.renewalDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className="relative max-h-[95vh] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedScreenshot(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-3 py-1 text-xl text-white hover:bg-black"
              aria-label="Close screenshot"
            >
              ×
            </button>

            <Image
              src={selectedScreenshot}
              alt="Payment screenshot"
              width={1200}
              height={900}
              unoptimized
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
}
