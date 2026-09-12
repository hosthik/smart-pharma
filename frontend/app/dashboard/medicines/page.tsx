"use client";

import { useCallback, useEffect, useState } from "react";

import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";
import { getPharmacyId, getToken } from "@/lib/auth";

type Medicine = {
  id: number;
  name: string;
  genericName: string | null;
  category: string | null;
};

type PharmacyResult = {
  pharmacyId: number;
  pharmacyName: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  quantity: number;
  price: number;
  stockStatus: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
  section: string | null;
  shelf: string | null;
  row: string | null;
  updatedAt: string;
};

type MedicineSearchResult = Medicine & {
  pharmacies: PharmacyResult[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export default function MedicinesPage() {
  const [pharmacyId] = useState<number | null>(() => getPharmacyId());

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchResults, setSearchResults] = useState<MedicineSearchResult[]>(
    [],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");

  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [category, setCategory] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const loadMedicines = useCallback(async () => {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token is required.");
    }

    const response = await fetch(`${API_URL}/medicines`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let message = "Failed to load medicines.";

      try {
        const errorData = await response.json();

        if (typeof errorData?.message === "string") {
          message = errorData.message;
        } else if (Array.isArray(errorData?.message)) {
          message = errorData.message.join(", ");
        }
      } catch {
        // Ignore invalid error response.
      }

      if (response.status === 401) {
        message =
          "Your authentication session is invalid or expired. Please log in again.";
      }

      throw new Error(message);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid medicines response from server.");
    }

    return data as Medicine[];
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const data = await loadMedicines();

        if (cancelled) {
          return;
        }

        setMedicines(data);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Medicine loading error:", err);

        setError(
          err instanceof Error ? err.message : "Unable to load medicines.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [loadMedicines]);

  async function handleSearch(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    try {
      setSearching(true);
      setSearchError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token is required.");
      }

      if (pharmacyId === null) {
        throw new Error("No pharmacy is associated with this login.");
      }

      const response = await fetch(
        `${API_URL}/medicines/search?q=${encodeURIComponent(
          query,
        )}&pharmacyId=${pharmacyId}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to search medicines.");
      }

      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Medicine search error:", err);

      setSearchResults([]);

      setSearchError(
        err instanceof Error ? err.message : "Unable to search medicines.",
      );
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
  }

  function clearForm() {
    setName("");
    setGenericName("");
    setCategory("");
    setEditingId(null);
  }

  function startEdit(medicine: Medicine) {
    setEditingId(medicine.id);
    setName(medicine.name);
    setGenericName(medicine.genericName || "");
    setCategory(medicine.category || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Medicine name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token is required.");
      }

      const body = {
        name: name.trim(),
        genericName: genericName.trim() || undefined,
        category: category.trim() || undefined,
      };

      const url = editingId
        ? `${API_URL}/medicines/${editingId}`
        : `${API_URL}/medicines`;

      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to save medicine.");
      }

      clearForm();

      const updatedMedicines = await loadMedicines();
      setMedicines(updatedMedicines);
    } catch (err) {
      console.error("Medicine save error:", err);

      setError(err instanceof Error ? err.message : "Unable to save medicine.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medicine?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token is required.");
      }

      const response = await fetch(`${API_URL}/medicines/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to delete medicine.");
      }

      if (editingId === id) {
        clearForm();
      }

      const updatedMedicines = await loadMedicines();
      setMedicines(updatedMedicines);
    } catch (err) {
      console.error("Medicine delete error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to delete medicine.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PharmacyNavigation activePath="/dashboard/medicines" />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pharmacy Management
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            Medicine Management
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Search medicines, check pharmacy stock, and manage the SmartPharma
            medicine catalog.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Pharmacy ID: {pharmacyId ?? "Not available"}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}

            {error.toLowerCase().includes("authentication") && (
              <p className="mt-1 text-red-600">
                Please log out and log in again to refresh your authentication
                session.
              </p>
            )}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-semibold text-slate-950">
              Search Medicines
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search by medicine name, generic name, or category. Searches are
              recorded for demand analytics.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="e.g. Paracetamol"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />

            <button
              type="submit"
              disabled={searching}
              className="rounded-xl bg-slate-950 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>

            {searchResults.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </form>

          {searchError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {searchError}
            </div>
          )}

          {searchQuery.trim() &&
            !searching &&
            !searchError &&
            searchResults.length === 0 && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No medicines found for &quot;
                {searchQuery.trim()}&quot;.
              </div>
            )}

          {searchResults.length > 0 && (
            <div className="mt-6 space-y-4">
              {searchResults.map((medicine) => (
                <div
                  key={medicine.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-slate-950">
                        {medicine.name}
                      </h3>

                      <div className="mt-1 text-sm text-slate-500">
                        Generic: {medicine.genericName || "—"}
                      </div>

                      <div className="text-sm text-slate-500">
                        Category: {medicine.category || "—"}
                      </div>
                    </div>

                    <div className="text-sm font-medium text-slate-600">
                      {medicine.pharmacies.length} pharmacy
                      {medicine.pharmacies.length === 1 ? "" : "ies"}
                    </div>
                  </div>

                  {medicine.pharmacies.length === 0 ? (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No pharmacy currently has this medicine in inventory.
                    </div>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead className="border-b border-slate-200 text-left text-sm">
                          <tr>
                            <th className="px-3 py-3 font-semibold text-slate-700">
                              Pharmacy
                            </th>

                            <th className="px-3 py-3 font-semibold text-slate-700">
                              Address
                            </th>

                            <th className="px-3 py-3 font-semibold text-slate-700">
                              Stock
                            </th>

                            <th className="px-3 py-3 font-semibold text-slate-700">
                              Status
                            </th>

                            <th className="px-3 py-3 font-semibold text-slate-700">
                              Price
                            </th>

                            <th className="px-3 py-3 font-semibold text-slate-700">
                              Location
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {medicine.pharmacies.map((pharmacy) => (
                            <tr
                              key={`${medicine.id}-${pharmacy.pharmacyId}`}
                              className="border-b border-slate-100 last:border-0"
                            >
                              <td className="px-3 py-4 font-medium text-slate-950">
                                {pharmacy.pharmacyName}
                              </td>

                              <td className="px-3 py-4 text-sm text-slate-500">
                                {pharmacy.address}
                              </td>

                              <td className="px-3 py-4 text-slate-700">
                                {pharmacy.quantity}
                              </td>

                              <td className="px-3 py-4">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                    pharmacy.stockStatus === "AVAILABLE"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : pharmacy.stockStatus === "LOW_STOCK"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {pharmacy.stockStatus.replace("_", " ")}
                                </span>
                              </td>

                              <td className="px-3 py-4 font-medium text-slate-700">
                                {Number(pharmacy.price).toFixed(2)} ETB
                              </td>

                              <td className="px-3 py-4 text-sm text-slate-500">
                                {pharmacy.latitude !== null &&
                                pharmacy.longitude !== null
                                  ? `${pharmacy.latitude.toFixed(
                                      4,
                                    )}, ${pharmacy.longitude.toFixed(4)}`
                                  : "Not available"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-semibold text-slate-950">
              {editingId ? "Edit Medicine" : "Add Medicine"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingId
                ? "Update the medicine information."
                : "Add a new medicine to the catalog."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="medicine-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Medicine Name
              </label>

              <input
                id="medicine-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Paracetamol"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="generic-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Generic Name
              </label>

              <input
                id="generic-name"
                value={genericName}
                onChange={(event) => setGenericName(event.target.value)}
                placeholder="e.g. Acetaminophen"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="medicine-category"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Category
              </label>

              <input
                id="medicine-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. Pain Relief"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="flex gap-3 md:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-950 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Medicine"
                    : "Add Medicine"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="font-serif text-2xl font-semibold text-slate-950">
              Medicine Catalog
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {medicines.length} medicine
              {medicines.length === 1 ? "" : "s"} in catalog
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading medicines...
            </div>
          ) : medicines.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No medicines found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-sm">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700">
                      Name
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-700">
                      Generic Name
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-700">
                      Category
                    </th>

                    <th className="px-6 py-4 text-right font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {medicines.map((medicine) => (
                    <tr
                      key={medicine.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-950">
                        {medicine.name}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {medicine.genericName || "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {medicine.category || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(medicine)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDelete(medicine.id)}
                            disabled={deletingId === medicine.id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === medicine.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
