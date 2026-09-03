"use client";

import { useEffect, useState } from "react";

type Medicine = {
  id: number;
  name: string;
  genericName: string | null;
  category: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [category, setCategory] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadMedicines() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/medicines`);

        if (!response.ok) {
          throw new Error("Failed to load medicines");
        }

        const data = await response.json();

        setMedicines(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load medicines.");
      } finally {
        setLoading(false);
      }
    }

    loadMedicines();
  }, []);

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

      //   await loadMedicines();
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

      //   await loadMedicines();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Unable to delete medicine.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">Medicine Management</h1>

            <p className="text-sm text-muted-foreground">
              Add and manage medicines in the SmartPharma catalog.
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Add / Edit Form */}
        <section className="rounded-xl border bg-background p-6 shadow-sm">
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
            {/* Medicine Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Medicine Name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Paracetamol"
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            {/* Generic Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Generic Name
              </label>

              <input
                value={genericName}
                onChange={(event) => setGenericName(event.target.value)}
                placeholder="e.g. Acetaminophen"
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>

              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. Pain Relief"
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 md:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground disabled:opacity-50"
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
                  className="rounded-lg border px-6 py-3 font-medium hover:bg-muted"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Medicine List */}
        <section className="mt-8 rounded-xl border bg-background shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">Medicines</h2>

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
                            onClick={() => startEdit(medicine)}
                            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(medicine.id)}
                            className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                          >
                            Delete
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
