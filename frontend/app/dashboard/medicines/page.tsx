"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
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

const API_URL = "http://localhost:4000";

const PHARMACY_ID = 1;

export default function MedicinesPage() {
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
    try {
      setError("");

      const response = await fetch(`${API_URL}/medicines`);

      if (!response.ok) {
        throw new Error("Failed to load medicines");
      }

      const data: Medicine[] = await response.json();

      setMedicines(data);
    } catch (error) {
      console.error(error);

      setError("Unable to load medicines.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialMedicines() {
      try {
        const response = await fetch(`${API_URL}/medicines`);

        if (!response.ok) {
          throw new Error("Failed to load medicines");
        }

        const data: Medicine[] = await response.json();

        if (!cancelled) {
          setMedicines(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setError("Unable to load medicines.");
          setLoading(false);
        }
      }
    }

    void loadInitialMedicines();

    return () => {
      cancelled = true;
    };
  }, []);

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

      const response = await fetch(
        `${API_URL}/medicines/search?q=${encodeURIComponent(
          query,
        )}&pharmacyId=${PHARMACY_ID}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to search medicines.");
      }

      setSearchResults(data);
    } catch (error) {
      console.error(error);

      setSearchResults([]);

      setSearchError(
        error instanceof Error ? error.message : "Unable to search medicines.",
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save medicine");
      }

      clearForm();

      await loadMedicines();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Unable to save medicine.",
      );
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

      const response = await fetch(`${API_URL}/medicines/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete medicine");
      }

      if (editingId === id) {
        clearForm();
      }

      await loadMedicines();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Unable to delete medicine.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardNavbar />
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-2xl font-bold">Medicine Management</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Search medicines, check pharmacy stock, and manage the SmartPharma
            catalog.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* General Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Medicine Search */}
        <section className="rounded-xl border bg-background p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Search Medicines</h2>

            <p className="mt-1 text-sm text-muted-foreground">
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
              className="min-w-0 flex-1 rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
            />

            <button
              type="submit"
              disabled={searching}
              className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>

            {searchResults.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-lg border px-6 py-3 font-medium hover:bg-muted"
              >
                Clear
              </button>
            )}
          </form>

          {searchError && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {searchError}
            </div>
          )}

          {searchQuery.trim() &&
            !searching &&
            !searchError &&
            searchResults.length === 0 && (
              <div className="mt-6 rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No medicines found for &quot;
                {searchQuery.trim()}&quot;.
              </div>
            )}

          {searchResults.length > 0 && (
            <div className="mt-6 space-y-4">
              {searchResults.map((medicine) => (
                <div key={medicine.id} className="rounded-lg border p-5">
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <h3 className="text-lg font-semibold">{medicine.name}</h3>

                      <div className="mt-1 text-sm text-muted-foreground">
                        Generic: {medicine.genericName || "—"}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Category: {medicine.category || "—"}
                      </div>
                    </div>

                    <div className="text-sm font-medium">
                      {medicine.pharmacies.length} pharmacy
                      {medicine.pharmacies.length === 1 ? "" : "ies"}
                    </div>
                  </div>

                  {medicine.pharmacies.length === 0 ? (
                    <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                      No pharmacy currently has this medicine in inventory.
                    </div>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead>
                          <tr className="border-b text-left text-sm">
                            <th className="px-3 py-3 font-medium">Pharmacy</th>

                            <th className="px-3 py-3 font-medium">Address</th>

                            <th className="px-3 py-3 font-medium">Stock</th>

                            <th className="px-3 py-3 font-medium">Status</th>

                            <th className="px-3 py-3 font-medium">Price</th>

                            <th className="px-3 py-3 font-medium">Location</th>
                          </tr>
                        </thead>

                        <tbody>
                          {medicine.pharmacies.map((pharmacy) => (
                            <tr
                              key={`${medicine.id}-${pharmacy.pharmacyId}`}
                              className="border-b last:border-0"
                            >
                              <td className="px-3 py-4 font-medium">
                                {pharmacy.pharmacyName}
                              </td>

                              <td className="px-3 py-4 text-sm text-muted-foreground">
                                {pharmacy.address}
                              </td>

                              <td className="px-3 py-4">{pharmacy.quantity}</td>

                              <td className="px-3 py-4">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                    pharmacy.stockStatus === "AVAILABLE"
                                      ? "bg-green-100 text-green-700"
                                      : pharmacy.stockStatus === "LOW_STOCK"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {pharmacy.stockStatus.replace("_", " ")}
                                </span>
                              </td>

                              <td className="px-3 py-4 font-medium">
                                {pharmacy.price.toFixed(2)} ETB
                              </td>

                              <td className="px-3 py-4 text-sm text-muted-foreground">
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

        {/* Add / Edit Form */}
        <section className="mt-8 rounded-xl border bg-background p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Medicine" : "Add Medicine"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {editingId
                ? "Update the medicine information."
                : "Add a new medicine to the catalog."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="medicine-name"
                className="mb-2 block text-sm font-medium"
              >
                Medicine Name
              </label>

              <input
                id="medicine-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Paracetamol"
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <div>
              <label
                htmlFor="generic-name"
                className="mb-2 block text-sm font-medium"
              >
                Generic Name
              </label>

              <input
                id="generic-name"
                value={genericName}
                onChange={(event) => setGenericName(event.target.value)}
                placeholder="e.g. Acetaminophen"
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <div>
              <label
                htmlFor="medicine-category"
                className="mb-2 block text-sm font-medium"
              >
                Category
              </label>

              <input
                id="medicine-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. Pain Relief"
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <div className="flex gap-3 md:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="rounded-lg border px-6 py-3 font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Catalog */}
        <section className="mt-8 rounded-xl border bg-background shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">Medicine Catalog</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {medicines.length} medicine
              {medicines.length === 1 ? "" : "s"} in catalog
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading medicines...
            </div>
          ) : medicines.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No medicines found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="px-6 py-4 font-medium">Name</th>

                    <th className="px-6 py-4 font-medium">Generic Name</th>

                    <th className="px-6 py-4 font-medium">Category</th>

                    <th className="px-6 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {medicines.map((medicine) => (
                    <tr key={medicine.id} className="border-b last:border-0">
                      <td className="px-6 py-4 font-medium">{medicine.name}</td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {medicine.genericName || "—"}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {medicine.category || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(medicine)}
                            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDelete(medicine.id)}
                            disabled={deletingId === medicine.id}
                            className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
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
