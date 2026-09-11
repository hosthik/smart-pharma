"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronRight,
  Clock,
  CreditCard,
  Info,
  MapPin,
  Pill,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";
import { getPharmacyId, getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type DashboardData = {
  pharmacy: {
    id: number;
    name: string;
    address: string;
    phone: string | null;
    email: string | null;
    verificationStatus: string;
  };

  summary: {
    totalMedicines: number;
    availableMedicines: number;
    stockAlerts: number;
    patientSearches: number;
  };

  inventoryStatus: {
    available: number;
    lowStock: number;
    outOfStock: number;
  };

  subscription: {
    plan: string | null;
    status: string | null;
    renewalDate: string | null;
  };

  medicineDemand?: Array<{
    medicineName: string;
    searchCount: number;
  }>;
};

function getSubscriptionStatusClasses(status: string | null) {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "bg-green-50 text-green-700 ring-green-600/20";

    case "PENDING":
      return "bg-yellow-50 text-yellow-700 ring-yellow-600/20";

    case "EXPIRED":
    case "CANCELLED":
      return "bg-red-50 text-red-700 ring-red-600/20";

    default:
      return "bg-slate-100 text-slate-700 ring-slate-500/20";
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      const pharmacyId = getPharmacyId();
      const token = getToken();

      if (pharmacyId === null) {
        if (!cancelled) {
          setError("No pharmacy is associated with this login.");
          setLoading(false);
        }

        return;
      }

      if (!token) {
        if (!cancelled) {
          setError("Authentication token is missing. Please log in again.");
          setLoading(false);
        }

        return;
      }

      try {
        setError("");

        const response = await fetch(`${API_URL}/dashboard/${pharmacyId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            Array.isArray(result?.message)
              ? result.message.join(", ")
              : result?.message || "Unable to load dashboard.",
          );
        }

        if (!cancelled) {
          setData(result as DashboardData);
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

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <PharmacyNavigation activePath="/dashboard" />

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="h-4 w-96 rounded bg-slate-200" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <PharmacyNavigation activePath="/dashboard" />

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

              <div>
                <h1 className="text-lg font-semibold">
                  Unable to load dashboard
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                  {error || "Dashboard information could not be loaded."}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const summaryCards = [
    {
      title: "Total Medicines",
      value: data.summary?.totalMedicines ?? 0,
      description: "Medicines in your inventory",
      icon: Pill,
    },
    {
      title: "Available",
      value: data.summary?.availableMedicines ?? 0,
      description: "Currently available medicines",
      icon: Boxes,
    },
    {
      title: "Stock Alerts",
      value: data.summary?.stockAlerts ?? 0,
      description: "Medicines needing attention",
      icon: AlertTriangle,
    },
    {
      title: "Patient Searches",
      value: data.summary?.patientSearches ?? 0,
      description: "Recent medicine searches",
      icon: Activity,
    },
  ];

  const managementLinks = [
    {
      title: "Inventory",
      description: "Manage stock, prices, and shelf locations.",
      href: "/dashboard/inventory",
      icon: Boxes,
    },
    {
      title: "Medicines",
      description: "View and manage your pharmacy medicines.",
      href: "/dashboard/medicines",
      icon: Pill,
    },
    {
      title: "Analytics",
      description: "Understand searches, demand, and inventory.",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Subscription",
      description: "View your plan and subscription status.",
      href: "/dashboard/subscription",
      icon: CreditCard,
    },
    {
      title: "Location",
      description: "Manage your pharmacy location information.",
      href: "/dashboard/location",
      icon: MapPin,
    },
    {
      title: "About Us",
      description: "Manage your pharmacy information page.",
      href: "/dashboard/about",
      icon: Info,
    },
    {
      title: "Contact Us",
      description: "Manage pharmacy contact information.",
      href: "/dashboard/contact",
      icon: Clock,
    },
    {
      title: "Account Settings",
      description: "View and update your pharmacy account.",
      href: "/dashboard/account",
      icon: UserRound,
    },
  ];

  const demand = data.medicineDemand ?? [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PharmacyNavigation activePath="/dashboard" />

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-14">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Activity className="h-7 w-7" />
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Pharmacy Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Welcome to {data.pharmacy.name}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Manage your pharmacy, medicines, inventory, and account from one
            place.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Summary Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <span className="text-3xl font-bold text-slate-900">
                    {card.value}
                  </span>
                </div>

                <h2 className="mt-5 font-semibold text-slate-900">
                  {card.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Inventory + Subscription */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Inventory Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Inventory Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current stock overview
                </p>
              </div>

              <Boxes className="h-6 w-6 text-slate-500" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {/* Available */}
              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  Available
                </p>

                <p className="mt-2 text-2xl font-bold text-green-800">
                  {data.inventoryStatus?.available ?? 0}
                </p>
              </div>

              {/* Low Stock */}
              <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">
                  Low Stock
                </p>

                <p className="mt-2 text-2xl font-bold text-yellow-800">
                  {data.inventoryStatus?.lowStock ?? 0}
                </p>
              </div>

              {/* Out of Stock */}
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Out of Stock
                </p>

                <p className="mt-2 text-2xl font-bold text-red-800">
                  {data.inventoryStatus?.outOfStock ?? 0}
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/inventory"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              Manage Inventory
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Subscription */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Subscription
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your current SmartPharma plan
                </p>
              </div>

              <CreditCard className="h-6 w-6 text-slate-500" />
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-500">Plan</span>

                <span className="font-semibold text-slate-900">
                  {data.subscription?.plan || "Not available"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-500">
                  Status
                </span>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getSubscriptionStatusClasses(
                    data.subscription?.status,
                  )}`}
                >
                  {data.subscription?.status || "Not available"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-500">
                  Renewal
                </span>

                <span className="font-semibold text-slate-900">
                  {data.subscription?.renewalDate
                    ? new Date(
                        data.subscription.renewalDate,
                      ).toLocaleDateString()
                    : "Not scheduled"}
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/subscription"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              Manage Subscription
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Patient Medicine Demand */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Patient Medicine Demand
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Medicines patients are searching for
              </p>
            </div>

            <BarChart3 className="h-6 w-6 text-slate-500" />
          </div>

          {demand.length > 0 ? (
            <div className="mt-6 divide-y divide-slate-100">
              {demand.slice(0, 8).map((item, index) => (
                <div
                  key={`${item.medicineName}-${index}`}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                      {index + 1}
                    </div>

                    <span className="text-sm font-medium text-slate-900">
                      {item.medicineName}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-slate-600">
                    {item.searchCount} searches
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">
                No patient medicine demand data is available yet.
              </p>
            </div>
          )}
        </div>

        {/* Pharmacy Management */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Pharmacy Management
          </h2>

          <p className="mt-2 text-slate-600">
            Quickly access the tools and settings for your pharmacy.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {managementLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              SmartPharma Pharmacy Portal
            </p>

            <div className="flex flex-wrap gap-5 text-sm">
              <Link
                href="/dashboard"
                className="text-slate-600 transition hover:text-slate-900"
              >
                Dashboard
              </Link>

              <Link
                href="/dashboard/inventory"
                className="text-slate-600 transition hover:text-slate-900"
              >
                Inventory
              </Link>

              <Link
                href="/dashboard/analytics"
                className="text-slate-600 transition hover:text-slate-900"
              >
                Analytics
              </Link>

              <Link
                href="/dashboard/account"
                className="text-slate-600 transition hover:text-slate-900"
              >
                Account
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
