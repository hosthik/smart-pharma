"use client";

import { useEffect, useState } from "react";

import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";
import { getPharmacyId, getToken } from "@/lib/auth";

type Medicine = {
  id: number;
  name: string;
  genericName?: string | null;
  category?: string | null;
};

type InventoryItem = {
  id: number;
  pharmacyId: number;
  medicineId: number;
  quantity: number;
  price: number;
  stockStatus: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
  section?: string | null;
  shelf?: string | null;
  row?: string | null;
  updatedAt?: string;
  medicine?: Medicine;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export default function InventoryPage() {
  const [pharmacyId] = useState<number | null>(() => getPharmacyId());

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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

    async function loadInventory() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          throw new Error("Authentication token is required.");
        }

        const response = await fetch(
          `${API_URL}/inventory/pharmacy/${pharmacyId}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          let message = "Failed to load inventory.";

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

          if (response.status === 403) {
            try {
              const errorData = await response.json();

              if (typeof errorData?.message === "string") {
                message = errorData.message;
              } else if (Array.isArray(errorData?.message)) {
                message = errorData.message.join(", ");
              }
            } catch {
              // Keep the default 403 message.
            }
          }

          throw new Error(message);
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        setInventory(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Inventory loading error:", err);

        setError(
          err instanceof Error ? err.message : "Unable to load inventory.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, [pharmacyId]);

  const totalQuantity = inventory.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const lowStockCount = inventory.filter(
    (item) => item.stockStatus === "LOW_STOCK",
  ).length;

  const outOfStockCount = inventory.filter(
    (item) => item.stockStatus === "OUT_OF_STOCK",
  ).length;

  function getStatusLabel(status: InventoryItem["stockStatus"]) {
    switch (status) {
      case "AVAILABLE":
        return "Available";

      case "LOW_STOCK":
        return "Low Stock";

      case "OUT_OF_STOCK":
        return "Out of Stock";

      default:
        return "Unknown";
    }
  }

  function getStatusClasses(status: InventoryItem["stockStatus"]) {
    switch (status) {
      case "AVAILABLE":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "LOW_STOCK":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "OUT_OF_STOCK":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PharmacyNavigation activePath="/dashboard/inventory" />

      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pharmacy Management
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            Inventory
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Manage your pharmacy medicine inventory and monitor current stock
            levels.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Pharmacy ID: {pharmacyId ?? "Not available"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>

            {error.toLowerCase().includes("authentication") && (
              <p className="mt-1 text-sm text-red-600">
                Please log out and log in again to refresh your authentication
                session.
              </p>
            )}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Inventory Items
            </p>

            <p className="mt-2 font-serif text-3xl font-semibold text-slate-950">
              {inventory.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Quantity</p>

            <p className="mt-2 font-serif text-3xl font-semibold text-slate-950">
              {totalQuantity}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Low Stock</p>

            <p className="mt-2 font-serif text-3xl font-semibold text-amber-600">
              {lowStockCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Out of Stock</p>

            <p className="mt-2 font-serif text-3xl font-semibold text-red-600">
              {outOfStockCount}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

            <p className="mt-4 text-slate-500">Loading inventory...</p>
          </div>
        ) : inventory.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-slate-950">
              No inventory found
            </h2>

            <p className="mt-2 text-slate-500">
              There are currently no inventory records for this pharmacy.
            </p>
          </div>
        ) : (
          /* Inventory Table */
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="font-serif text-2xl font-semibold text-slate-950">
                Medicine Inventory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current medicine stock, pricing, and storage locations.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Medicine
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Price
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Location
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.map((item) => {
                    const medicine = item.medicine;

                    const location = [item.section, item.shelf, item.row]
                      .filter(Boolean)
                      .join(" / ");

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        {/* Medicine */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-950">
                            {medicine?.name ?? `Medicine #${item.medicineId}`}
                          </div>

                          {medicine?.genericName && (
                            <div className="mt-1 text-sm text-slate-500">
                              {medicine.genericName}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {medicine?.category ?? "—"}
                        </td>

                        {/* Quantity */}
                        <td className="px-5 py-4 font-medium text-slate-950">
                          {item.quantity}
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4 text-slate-700">
                          {item.price != null
                            ? `ETB ${Number(item.price).toFixed(2)}`
                            : "—"}
                        </td>

                        {/* Location */}
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {location || "—"}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                              item.stockStatus,
                            )}`}
                          >
                            {getStatusLabel(item.stockStatus)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
