"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  CalendarDays,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = "http://localhost:4000";
const PHARMACY_ID = 1;

type AnalyticsData = {
  pharmacy: {
    id: number;
    name: string;
  };
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  summary: {
    sales: number;
    totalRevenue: number;
    totalUnitsSold: number;
    averageSaleValue: number;
  };
  inventory: {
    totalMedicines: number;
    available: number;
    lowStock: number;
    outOfStock: number;
    totalUnits: number;
  };
  topSelling: {
    medicineId: number;
    medicine: string;
    quantity: number;
    revenue: number;
  }[];
  demand: {
    medicineId: number;
    medicine: string;
    searches: number;
    supply: number;
    stockStatus: string;
  }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const fetchAnalytics = useCallback(
    async (selectedStartDate = startDate, selectedEndDate = endDate) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (selectedStartDate) {
          params.set("startDate", selectedStartDate);
        }

        if (selectedEndDate) {
          params.set("endDate", selectedEndDate);
        }

        const query = params.toString();

        const response = await fetch(
          `${API_URL}/analytics/${PHARMACY_ID}${query ? `?${query}` : ""}`,
        );

        if (!response.ok) {
          throw new Error("Unable to load analytics.");
        }

        const result = (await response.json()) as AnalyticsData;

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load analytics.",
        );
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAnalytics("", "");
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchAnalytics]);

  function applyDateFilter() {
    void fetchAnalytics(startDate, endDate);
  }

  function clearDateFilter() {
    setStartDate("");
    setEndDate("");
    void fetchAnalytics("", "");
  }

  if (loading && !data) {
    return (
      <main className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border p-8 text-center">
            <p className="mb-4 text-destructive">{error}</p>

            <button
              type="button"
              onClick={() => void fetchAnalytics()}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

            <p className="mt-1 text-muted-foreground">
              Business performance for {data.pharmacy.name}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchAnalytics()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Date filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Analytics Period
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium"
                >
                  Start date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex-1">
                <label
                  htmlFor="endDate"
                  className="mb-2 block text-sm font-medium"
                >
                  End date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={applyDateFilter}
                className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={clearDateFilter}
                className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-muted"
              >
                Clear
              </button>
            </div>

            {data.period.startDate || data.period.endDate ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Showing filtered analytics.
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Showing all available analytics data.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>

                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-3 text-3xl font-bold">
                {data.summary.totalRevenue.toFixed(2)} ETB
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Transactions
                </p>

                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-3 text-3xl font-bold">{data.summary.sales}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Units Sold
                </p>

                <Package className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-3 text-3xl font-bold">
                {data.summary.totalUnitsSold}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Average Sale
                </p>

                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-3 text-3xl font-bold">
                {data.summary.averageSaleValue.toFixed(2)} ETB
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              Inventory Health
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Medicine Records
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {data.inventory.totalMedicines}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="mt-2 text-2xl font-bold">
                  {data.inventory.available}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="mt-2 text-2xl font-bold">
                  {data.inventory.lowStock}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="mt-2 text-2xl font-bold">
                  {data.inventory.outOfStock}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="mt-2 text-2xl font-bold">
                  {data.inventory.totalUnits}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top selling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Selling Medicines
              </CardTitle>
            </CardHeader>

            <CardContent>
              {data.topSelling.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No sales found for this period.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topSelling.map((item, index) => (
                    <div
                      key={item.medicineId}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                          {index + 1}
                        </div>

                        <div>
                          <p className="font-medium">{item.medicine}</p>

                          <p className="text-sm text-muted-foreground">
                            {item.quantity} unit
                            {item.quantity !== 1 ? "s" : ""} sold
                          </p>
                        </div>
                      </div>

                      <p className="font-semibold">
                        {item.revenue.toFixed(2)} ETB
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demand */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Medicine Demand
              </CardTitle>
            </CardHeader>

            <CardContent>
              {data.demand.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No medicine searches found for this period.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.demand.map((item, index) => (
                    <div
                      key={item.medicineId}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                          {index + 1}
                        </div>

                        <div>
                          <p className="font-medium">{item.medicine}</p>

                          <p className="text-sm text-muted-foreground">
                            {item.searches} search
                            {item.searches !== 1 ? "es" : ""}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          item.stockStatus === "AVAILABLE"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {item.supply} in stock
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 border-t pt-6">
          <Link
            href="/dashboard"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/sales"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Point of Sale
          </Link>

          <Link
            href="/dashboard/sales/history"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Sales History
          </Link>

          <Link
            href="/dashboard/inventory"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Inventory
          </Link>
        </div>
      </div>
    </main>
  );
}
