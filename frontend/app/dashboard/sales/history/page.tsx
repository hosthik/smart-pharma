"use client";

import { Suspense, useEffect, useState } from "react";

import DashboardNavbar from "@/components/dashboard-navbar";
import { getPharmacyId } from "@/lib/auth";

const API_URL = "http://localhost:4000";

type Medicine = {
  id: number;
  name: string;
  genericName?: string | null;
};

type SaleItem = {
  id: number;
  medicineId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  medicine: Medicine;
};

type Sale = {
  id: number;
  pharmacyId: number;
  totalAmount: number;
  createdAt: string;
  items: SaleItem[];
};

function formatCurrency(value: number) {
  return `ETB ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SalesHistoryContent() {
  const [pharmacyId] = useState<number | null>(() => getPharmacyId());

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (pharmacyId === null) {
      queueMicrotask(() => {
        if (!cancelled) {
          setError("No pharmacy is associated with this login.");
          setLoading(false);
        }
      });

      return () => {
        cancelled = true;
      };
    }

    async function loadSales() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/sales/pharmacy/${pharmacyId}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          const result = await response.json().catch(() => null);

          throw new Error(result?.message || "Unable to load sales history.");
        }

        const result: Sale[] = await response.json();

        if (!cancelled) {
          setSales(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load sales history.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSales();

    return () => {
      cancelled = true;
    };
  }, [pharmacyId]);

  if (pharmacyId === null) {
    return (
      <main className="min-h-screen bg-background">
        <DashboardNavbar />

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold">Sales History</h1>

            <p className="mt-3 text-sm text-muted-foreground">
              No pharmacy is associated with this login.
            </p>

            <a
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales History</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              View all completed pharmacy transactions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/dashboard/sales"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              ← Back to POS
            </a>

            <a
              href="/dashboard"
              className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Dashboard
            </a>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-xl border bg-card" />
            <div className="h-32 animate-pulse rounded-xl border bg-card" />
            <div className="h-32 animate-pulse rounded-xl border bg-card" />
          </div>
        ) : sales.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-12 text-center">
            <h2 className="text-xl font-semibold">No sales yet</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Completed sales will appear here.
            </p>

            <a
              href="/dashboard/sales"
              className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Create a Sale
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="rounded-xl border bg-card shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold">Sale #{sale.id}</h2>

                      <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                        Completed
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(sale.createdAt)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground">Total</p>

                    <p className="text-2xl font-bold">
                      {formatCurrency(sale.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 font-medium text-muted-foreground">
                            Medicine
                          </th>

                          <th className="pb-3 text-center font-medium text-muted-foreground">
                            Quantity
                          </th>

                          <th className="pb-3 text-right font-medium text-muted-foreground">
                            Unit Price
                          </th>

                          <th className="pb-3 text-right font-medium text-muted-foreground">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {sale.items.map((item) => (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="py-4">
                              <p className="font-medium">
                                {item.medicine.name}
                              </p>

                              {item.medicine.genericName && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {item.medicine.genericName}
                                </p>
                              )}
                            </td>

                            <td className="py-4 text-center">
                              {item.quantity}
                            </td>

                            <td className="py-4 text-right">
                              {formatCurrency(item.unitPrice)}
                            </td>

                            <td className="py-4 text-right font-medium">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    <span className="text-sm text-muted-foreground">
                      {sale.items.length}{" "}
                      {sale.items.length === 1 ? "medicine" : "medicines"}
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SalesHistoryLoading() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardNavbar />

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />

          <p className="mt-4 text-sm text-muted-foreground">
            Loading sales history...
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SalesHistoryPage() {
  return (
    <Suspense fallback={<SalesHistoryLoading />}>
      <SalesHistoryContent />
    </Suspense>
  );
}
