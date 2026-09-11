"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";

import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";
import { getAnalytics } from "@/lib/api";
import { getPharmacyId } from "@/lib/auth";

type DemandItem = {
  medicineId: number;
  medicineName: string;
  searchCount: number;
  pharmacyStock: number;
  pharmacyPrice: number;
  stockStatus: string;
};

type AnalyticsData = {
  pharmacy: {
    id: number;
    name: string;
    address: string;
    phone?: string | null;
    email?: string | null;
    verificationStatus: string;
  };

  period: {
    startDate: string | null;
    endDate: string | null;
  };

  summary: {
    totalMedicines: number;
    available: number;
    lowStock: number;
    outOfStock: number;
    totalUnits: number;
    patientSearches: number;
  };

  inventory: {
    totalMedicines: number;
    available: number;
    lowStock: number;
    outOfStock: number;
    totalUnits: number;
  };

  demand: DemandItem[];
  patientDemand: DemandItem[];
  mostSearchedMedicine: DemandItem | null;
};

function formatNumber(value: unknown): string {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "0";
  }

  return numberValue.toLocaleString("en-US");
}

function formatPrice(value: unknown): string {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "0.00";
  }

  return numberValue.toFixed(2);
}

const emptySubscribe = () => {
  return () => {};
};

const getServerSnapshot = () => false;

const getClientSnapshot = () => true;

export default function AnalyticsPage() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const pharmacyId = mounted ? getPharmacyId() : null;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(
    async (selectedStartDate?: string, selectedEndDate?: string) => {
      if (!pharmacyId) {
        setError("Pharmacy information is unavailable. Please log in again.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await getAnalytics(
          Number(pharmacyId),
          selectedStartDate || undefined,
          selectedEndDate || undefined,
        );

        setData(result as AnalyticsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load analytics.",
        );
      } finally {
        setLoading(false);
      }
    },
    [pharmacyId],
  );

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadAnalytics();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mounted, loadAnalytics]);

  function applyFilters() {
    void loadAnalytics(startDate || undefined, endDate || undefined);
  }

  function clearFilters() {
    setStartDate("");
    setEndDate("");
    void loadAnalytics();
  }

  if (!mounted || loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <PharmacyNavigation activePath="/dashboard/analytics" />

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">Loading analytics...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50">
        <PharmacyNavigation activePath="/dashboard/analytics" />

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <h1 className="font-serif text-2xl font-semibold text-slate-950">
              Analytics unavailable
            </h1>

            <p className="mt-3 text-sm text-red-600">
              {error || "Unable to load analytics data."}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadAnalytics(startDate || undefined, endDate || undefined)
              }
              className="mt-6 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const inventory = data.inventory ?? {
    totalMedicines: 0,
    available: 0,
    lowStock: 0,
    outOfStock: 0,
    totalUnits: 0,
  };

  const demand = Array.isArray(data.demand) ? data.demand : [];

  const mostSearched = data.mostSearchedMedicine ?? demand[0] ?? null;

  return (
    <main className="min-h-screen bg-slate-50">
      <PharmacyNavigation activePath="/dashboard/analytics" />

      {/* Page Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Analytics
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-950">
            Pharmacy Insights
          </h1>

          <p className="mt-2 text-slate-600">
            Inventory and patient-search insights for {data.pharmacy.name}.
          </p>

          {data.period.startDate || data.period.endDate ? (
            <p className="mt-3 text-sm text-slate-500">
              Showing filtered analytics.
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Analytics Period */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="font-serif text-xl font-semibold text-slate-950">
              Analytics Period
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Filter public patient searches by date.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="analytics-start-date"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Start date
              </label>

              <input
                id="analytics-start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950"
              />
            </div>

            <div>
              <label
                htmlFor="analytics-end-date"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                End date
              </label>

              <input
                id="analytics-end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950"
              />
            </div>

            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Total Medicines
            </p>

            <p className="mt-3 font-serif text-3xl font-semibold text-slate-950">
              {formatNumber(inventory.totalMedicines)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Medicine records in inventory.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
              Available
            </p>

            <p className="mt-3 font-serif text-3xl font-semibold text-emerald-600">
              {formatNumber(inventory.available)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Medicines currently available.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">
              Low Stock
            </p>

            <p className="mt-3 font-serif text-3xl font-semibold text-amber-600">
              {formatNumber(inventory.lowStock)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Medicines needing attention.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Patient Searches
            </p>

            <p className="mt-3 font-serif text-3xl font-semibold text-slate-950">
              {formatNumber(data.summary.patientSearches)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Actual public medicine searches.
            </p>
          </div>
        </section>

        {/* Inventory Health + Most Searched */}
        <section className="mb-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Inventory Health
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Available</p>

                <p className="mt-1 text-2xl font-semibold text-emerald-700">
                  {formatNumber(inventory.available)}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-sm text-amber-700">Low Stock</p>

                <p className="mt-1 text-2xl font-semibold text-amber-700">
                  {formatNumber(inventory.lowStock)}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-sm text-red-700">Out of Stock</p>

                <p className="mt-1 text-2xl font-semibold text-red-700">
                  {formatNumber(inventory.outOfStock)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total Units</p>

                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {formatNumber(inventory.totalUnits)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Most Searched Medicine
            </p>

            {mostSearched ? (
              <div className="mt-4">
                <h2 className="font-serif text-2xl font-semibold text-slate-950">
                  {mostSearched.medicineName}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {formatNumber(mostSearched.searchCount)} public searches
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-700">Your Stock</p>

                    <p className="mt-1 text-2xl font-semibold text-emerald-700">
                      {formatNumber(mostSearched.pharmacyStock)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Price</p>

                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                      {formatPrice(mostSearched.pharmacyPrice)} ETB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  No medicine searches recorded.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Patient Demand */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Patient Demand
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-slate-950">
              What patients are searching for
            </h2>
          </div>

          {demand.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Medicine
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Searches
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Stock
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Price
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {demand.map((item) => (
                    <tr
                      key={item.medicineId}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-4 font-medium text-slate-950">
                        {item.medicineName}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatNumber(item.searchCount)}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatNumber(item.pharmacyStock)}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatPrice(item.pharmacyPrice)} ETB
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            item.stockStatus === "AVAILABLE"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.stockStatus === "LOW_STOCK"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.stockStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">
                No patient demand data is available for this period.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
