"use client";

import { useEffect, useState } from "react";

type Medicine = {
  id: number;
  name: string;
  genericName?: string;
  category?: string;
};

type InventoryItem = {
  id: number;
  medicineId: number;
  quantity: number;
  price?: number;
  medicine?: Medicine;
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get pharmacyId directly from the browser URL.
  const getPharmacyId = () => {
    if (typeof window === "undefined") {
      return 1;
    }

    const value = new URLSearchParams(window.location.search).get("pharmacyId");

    const id = Number(value);

    return id && !Number.isNaN(id) ? id : 1;
  };

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const pharmacyId = getPharmacyId();

      try {
        setLoading(true);
        setError("");

        const [inventoryResponse, medicinesResponse] = await Promise.all([
          fetch(`http://localhost:3000/dashboard/${pharmacyId}`, {
            cache: "no-store",
          }),

          fetch("http://localhost:3000/medicines/search", {
            cache: "no-store",
          }),
        ]);

        if (!inventoryResponse.ok) {
          throw new Error("Failed to load inventory");
        }

        if (!medicinesResponse.ok) {
          throw new Error("Failed to load medicines");
        }

        const inventoryData = await inventoryResponse.json();

        const medicinesData = await medicinesResponse.json();

        if (cancelled) return;

        setInventory(
          Array.isArray(inventoryData?.inventory)
            ? inventoryData.inventory
            : [],
        );

        setMedicines(
          Array.isArray(medicinesData)
            ? medicinesData
            : Array.isArray(medicinesData?.medicines)
              ? medicinesData.medicines
              : [],
        );
      } catch (err) {
        if (cancelled) return;

        console.error(err);

        setError(
          err instanceof Error ? err.message : "Unable to load inventory.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const medicineMap = new Map(
    medicines.map((medicine) => [medicine.id, medicine]),
  );

  const getMedicineName = (item: InventoryItem) => {
    if (item.medicine?.name) {
      return item.medicine.name;
    }

    return (
      medicineMap.get(item.medicineId)?.name ?? `Medicine #${item.medicineId}`
    );
  };

  const totalQuantity = inventory.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Inventory</h1>

          <p className="mt-2 text-muted-foreground">
            Manage your pharmacy medicine inventory.
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Pharmacy ID: {getPharmacyId()}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Inventory Items</p>

            <p className="mt-2 text-3xl font-bold">{inventory.length}</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Quantity</p>

            <p className="mt-2 text-3xl font-bold">{totalQuantity}</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Available Medicines</p>

            <p className="mt-2 text-3xl font-bold">{medicines.length}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border p-10 text-center">
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="rounded-xl border p-10 text-center">
            <h2 className="text-xl font-semibold">No inventory found</h2>

            <p className="mt-2 text-muted-foreground">
              There are currently no inventory records for this pharmacy.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="text-xl font-semibold">Medicine Inventory</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Medicine
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Price
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.map((item) => {
                    const medicine =
                      item.medicine ?? medicineMap.get(item.medicineId);

                    const quantity = Number(item.quantity || 0);

                    let status = "In Stock";

                    if (quantity === 0) {
                      status = "Out of Stock";
                    } else if (quantity <= 10) {
                      status = "Low Stock";
                    }

                    return (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {getMedicineName(item)}
                          </div>

                          {medicine?.genericName && (
                            <div className="text-sm text-muted-foreground">
                              {medicine.genericName}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {medicine?.category ?? "—"}
                        </td>

                        <td className="px-5 py-4">{quantity}</td>

                        <td className="px-5 py-4">
                          {item.price != null
                            ? `ETB ${Number(item.price).toFixed(2)}`
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full border px-3 py-1 text-xs font-medium">
                            {status}
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
