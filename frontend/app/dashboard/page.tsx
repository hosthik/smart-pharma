"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPharmacyId } from "@/lib/auth";
import {
  Activity,
  BarChart3,
  Boxes,
  CreditCard,
  MapPin,
  Pill,
  Search,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";

const API_URL = "http://localhost:4000";

type DashboardData = {
  pharmacy: {
    id?: number;
    name?: string;
  };

  summary: {
    medicines: number;
    available: number;
    lowStock: number;
    outOfStock: number;
    totalSales: number;
    totalRevenue: number;
  };

  topSelling: {
    medicine?: string;
    quantity: number;
    revenue: number;
  }[];

  demand: {
    medicine?: string;
    searches: number;
    supply: number;
    stockStatus: string;
  }[];

  subscription: {
    plan: string;
    status: string;
    renewalDate?: string | null;
  } | null;
};

function formatCurrency(value: number) {
  return `ETB ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getSubscriptionLabel(status?: string) {
  if (status === "ACTIVE") {
    return "Active";
  }

  if (status === "EXPIRED") {
    return "Expired";
  }

  if (status === "CANCELLED") {
    return "Cancelled";
  }

  if (status === "PENDING") {
    return "Pending";
  }

  return "No subscription";
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const pharmacyId = getPharmacyId();

      if (pharmacyId === null) {
        if (!cancelled) {
          setError("No pharmacy is associated with this login.");
          setLoading(false);
        }

        return;
      }

      try {
        const response = await fetch(`${API_URL}/dashboard/${pharmacyId}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);

          throw new Error(result?.message || "Unable to load dashboard.");
        }

        const result: DashboardData = await response.json();

        if (!cancelled) {
          setDashboard(result);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = dashboard?.summary;
  const subscription = dashboard?.subscription;

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Activity,
    },
    {
      name: "Inventory",
      href: "/dashboard/inventory",
      icon: Boxes,
    },
    {
      name: "Medicines",
      href: "/dashboard/medicines",
      icon: Pill,
    },
    {
      name: "Sales",
      href: "/dashboard/sales",
      icon: ShoppingCart,
    },
    {
      name: "Find Medicine",
      href: "/find-medicine",
      icon: Search,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      name: "Subscription",
      href: "/dashboard/subscription",
      icon: CreditCard,
    },
    {
      name: "Location",
      href: "/dashboard/location",
      icon: MapPin,
    },
  ];

  const dashboardCards = [
    {
      title: "Inventory",
      description:
        "Manage medicines, stock quantities, prices, and shelf locations.",
      href: "/dashboard/inventory",
      icon: Boxes,
    },
    {
      title: "Medicines",
      description: "Browse and manage your pharmacy medicine catalog.",
      href: "/dashboard/medicines",
      icon: Pill,
    },
    {
      title: "Sales / POS",
      description:
        "Sell medicines, manage the cart, and complete transactions.",
      href: "/dashboard/sales",
      icon: ShoppingCart,
    },
    {
      title: "Find Medicine",
      description:
        "Search for medicines and locate pharmacies that have stock.",
      href: "/find-medicine",
      icon: Search,
    },
    {
      title: "Analytics",
      description: "View sales, inventory, and pharmacy performance insights.",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Subscription",
      description:
        "Manage your SmartPharma subscription and payment verification.",
      href: "/dashboard/subscription",
      icon: CreditCard,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              SP
            </div>

            <div>
              <p className="font-bold text-slate-900">SmartPharma</p>

              <p className="hidden text-xs text-slate-500 sm:block">
                Pharmacy Management
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                Pharmacy Admin
              </p>

              <p className="text-xs text-slate-500">
                {dashboard?.pharmacy?.name || "SmartPharma"}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
              PA
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="overflow-x-auto border-t lg:hidden">
          <nav className="mx-auto flex min-w-max gap-1 px-4 py-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-slate-500">
            {dashboard?.pharmacy?.name || "Pharmacy Management"}
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Monitor your pharmacy sales, inventory, medicine demand, and
            subscription status.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Main Stats */}
        {loading ? (
          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl border bg-white"
              />
            ))}
          </section>
        ) : (
          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Total Revenue</p>

                <TrendingUp className="h-5 w-5 text-slate-500" />
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {formatCurrency(summary?.totalRevenue ?? 0)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                From completed sales
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Transactions</p>

                <ShoppingCart className="h-5 w-5 text-slate-500" />
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {summary?.totalSales ?? 0}
              </p>

              <p className="mt-1 text-xs text-slate-500">Completed sales</p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Medicines</p>

                <Pill className="h-5 w-5 text-slate-500" />
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {summary?.medicines ?? 0}
              </p>

              <p className="mt-1 text-xs text-slate-500">Inventory medicines</p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Stock Alerts</p>

                <AlertTriangle className="h-5 w-5 text-slate-500" />
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {(summary?.lowStock ?? 0) + (summary?.outOfStock ?? 0)}
              </p>

              <p className="mt-1 text-xs text-slate-500">Low or out of stock</p>
            </div>
          </section>
        )}

        {/* Inventory + Subscription */}
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Inventory Status */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Inventory Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current medicine stock levels.
                </p>
              </div>

              <Boxes className="h-5 w-5 text-slate-500" />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {summary?.available ?? 0}
                </p>

                <p className="mt-1 text-xs text-slate-500">Available</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {summary?.lowStock ?? 0}
                </p>

                <p className="mt-1 text-xs text-slate-500">Low Stock</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {summary?.outOfStock ?? 0}
                </p>

                <p className="mt-1 text-xs text-slate-500">Out of Stock</p>
              </div>
            </div>

            <Link
              href="/dashboard/inventory"
              className="mt-6 inline-flex rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Manage Inventory →
            </Link>
          </div>

          {/* Subscription */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Subscription
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current SmartPharma access.
                </p>
              </div>

              <CreditCard className="h-5 w-5 text-slate-500" />
            </div>

            {subscription ? (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Plan</p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {subscription.plan}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      subscription.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : subscription.status === "EXPIRED"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {getSubscriptionLabel(subscription.status)}
                  </span>
                </div>

                <div className="mt-5 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    Expires
                  </div>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(subscription.renewalDate)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-lg bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">
                  No active subscription
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Subscribe to manage pharmacy operations.
                </p>
              </div>
            )}

            <Link
              href="/dashboard/subscription"
              className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Manage Subscription →
            </Link>
          </div>
        </section>

        {/* Top Selling + Demand */}
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Top Selling */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Top Selling Medicines
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Medicines with the highest sales volume.
              </p>
            </div>

            {!dashboard?.topSelling?.length ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="font-medium text-slate-900">No sales data yet</p>

                <p className="mt-1 text-sm text-slate-500">
                  Completed sales will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.topSelling.map((item, index) => (
                  <div
                    key={`${item.medicine}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.medicine || "Unknown medicine"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {item.quantity} units sold
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold text-slate-900">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demand */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Medicine Demand
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Most searched medicines and their supply.
              </p>
            </div>

            {!dashboard?.demand?.length ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="font-medium text-slate-900">No demand data yet</p>

                <p className="mt-1 text-sm text-slate-500">
                  Medicine searches will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.demand.map((item, index) => (
                  <div
                    key={`${item.medicine}-${index}`}
                    className="rounded-lg bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.medicine || "Unknown medicine"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.searches} searches
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {item.supply} in stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Pharmacy Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a section to continue.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {card.description}
                  </p>

                  <p className="mt-5 text-sm font-semibold text-slate-900">
                    Open section →
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
