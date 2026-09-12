"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Car, Pencil, Plus, RefreshCw, Save, X } from "lucide-react";

type TransportationRate = {
  id: number;
  type: string;
  ratePerKm: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const transportationTypes = [
  {
    value: "WALKING",
    label: "Walking",
  },
  {
    value: "MOTORCYCLE",
    label: "Motorcycle",
  },
  {
    value: "BUS",
    label: "Bus",
  },
  {
    value: "TAXI",
    label: "Taxi",
  },
  {
    value: "PRIVATE_CAR",
    label: "Private Car",
  },
];

function getLabel(type: string) {
  const option = transportationTypes.find((item) => item.value === type);

  return option?.label || type;
}

function getInitial(type: string) {
  switch (type) {
    case "WALKING":
      return "W";
    case "MOTORCYCLE":
      return "M";
    case "BUS":
      return "B";
    case "TAXI":
      return "T";
    case "PRIVATE_CAR":
      return "C";
    default:
      return type.charAt(0).toUpperCase();
  }
}

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("smartpharma_token");
}

export default function TransportationRatesPage() {
  const [rates, setRates] = useState<TransportationRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [newType, setNewType] = useState("WALKING");
  const [newRate, setNewRate] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRate, setEditingRate] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadRates();
  }, []);

  async function loadRates(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_URL}/transportation/rates`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load transportation rates.");
      }

      const data = (await response.json()) as TransportationRate[];

      setRates(data);
    } catch (err) {
      console.error("Failed to load transportation rates:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transportation rates. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleAddRate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const rateValue = Number(newRate);

    if (!newType) {
      setError("Please select a transportation type.");
      return;
    }

    if (!Number.isFinite(rateValue) || rateValue < 0) {
      setError("Please enter a valid rate per kilometer.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(`${API_URL}/transportation/rates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: newType,
          ratePerKm: rateValue,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();

        throw new Error(responseText || "Failed to create rate.");
      }

      setNewType("WALKING");
      setNewRate("");
      setShowAddForm(false);

      await loadRates();
    } catch (err) {
      console.error("Failed to create rate:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create transportation rate.",
      );
    } finally {
      setSaving(false);
    }
  }

  function startEditing(rate: TransportationRate) {
    setEditingId(rate.id);
    setEditingRate(String(rate.ratePerKm));
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingRate("");
  }

  async function handleUpdateRate(id: number) {
    const rateValue = Number(editingRate);

    if (!Number.isFinite(rateValue) || rateValue < 0) {
      setError("Please enter a valid rate per kilometer.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(`${API_URL}/transportation/rates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ratePerKm: rateValue,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();

        throw new Error(responseText || "Failed to update rate.");
      }

      cancelEditing();

      await loadRates();
    } catch (err) {
      console.error("Failed to update rate:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update transportation rate.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNavigation activePath="/dashboard/admin/transportation-rates" />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Administration
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Transportation Rates
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Manage the transportation cost per kilometer used by patients when
              estimating medicine costs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadRates(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddForm((current) => !current);
                setError("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {showAddForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Rate
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {showAddForm && (
          <form
            onSubmit={handleAddRate}
            className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Add Transportation Rate
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the amount charged per kilometer.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="transportation-type"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Transportation Type
                </label>

                <select
                  id="transportation-type"
                  value={newType}
                  onChange={(event) => setNewType(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                >
                  {transportationTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="new-rate"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Rate per Kilometer (ETB)
                </label>

                <input
                  id="new-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newRate}
                  onChange={(event) => setNewRate(event.target.value)}
                  placeholder="e.g. 10"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />

                {saving ? "Saving..." : "Save Rate"}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Car className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Current Rates
                </h2>

                <p className="text-sm text-slate-500">
                  These rates are used for patient cost estimation.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

              <p className="mt-4 text-sm font-semibold text-slate-500">
                Loading transportation rates...
              </p>
            </div>
          ) : rates.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Car className="h-6 w-6" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-500">
                No transportation rates have been added yet.
              </p>

              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add First Rate
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {rates.map((rate) => {
                const isEditing = editingId === rate.id;

                return (
                  <div
                    key={rate.id}
                    className="flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                        {getInitial(rate.type)}
                      </div>

                      <div>
                        <p className="text-base font-bold text-slate-900">
                          {getLabel(rate.type)}
                        </p>

                        <p
                          className={`mt-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                            rate.active ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          {rate.active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {isEditing ? (
                        <>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editingRate}
                              onChange={(event) =>
                                setEditingRate(event.target.value)
                              }
                              className="w-40 rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-14 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                              autoFocus
                            />

                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                              ETB/km
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void handleUpdateRate(rate.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={cancelEditing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="min-w-32 text-left sm:text-right">
                            <p className="text-lg font-bold text-slate-900">
                              {rate.ratePerKm} ETB
                            </p>

                            <p className="text-xs font-semibold text-slate-500">
                              per kilometer
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => startEditing(rate)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">
            How these rates are used
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Patients enter their travel distance and select a transportation
            type on the Cost Estimation page. SmartPharma then calculates the
            estimated transportation cost using the rate configured here.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-700">
              Transportation cost = Distance × Rate per km
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SmartPharma Administration
          </p>
        </div>
      </footer>
    </main>
  );
}
