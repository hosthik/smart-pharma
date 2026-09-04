"use client";

import { Suspense, useEffect, useMemo, useState } from "react";

import DashboardNavbar from "@/components/dashboard-navbar";
import { getPharmacyId } from "@/lib/auth";

const API_URL = "http://localhost:4000";

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
  medicine: Medicine;
};

type CartItem = {
  medicineId: number;
  name: string;
  genericName?: string | null;
  price: number;
  availableQuantity: number;
  quantity: number;
};

type SaleResponse = {
  success: boolean;
  message: string;
  sale?: {
    id: number;
    totalAmount: number;
  };
};

function formatCurrency(value: number) {
  return `ETB ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function SalesContent() {
  const [pharmacyId] = useState<number | null>(() => getPharmacyId());

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [completedSaleId, setCompletedSaleId] = useState<number | null>(null);

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

        const response = await fetch(
          `${API_URL}/inventory/pharmacy/${pharmacyId}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load pharmacy inventory.");
        }

        const result: InventoryItem[] = await response.json();

        if (!cancelled) {
          setInventory(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load inventory.",
          );
        }
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

  const filteredInventory = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return inventory;
    }

    return inventory.filter((item) => {
      const name = item.medicine.name.toLowerCase();

      const genericName = item.medicine.genericName?.toLowerCase() ?? "";

      const category = item.medicine.category?.toLowerCase() ?? "";

      return (
        name.includes(searchValue) ||
        genericName.includes(searchValue) ||
        category.includes(searchValue)
      );
    });
  }, [inventory, search]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const cartQuantity = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  function addToCart(item: InventoryItem) {
    setError("");
    setSuccessMessage("");

    if (item.quantity <= 0) {
      setError(`${item.medicine.name} is out of stock.`);
      return;
    }

    const existing = cart.find(
      (cartItem) => cartItem.medicineId === item.medicineId,
    );

    if (existing && existing.quantity >= item.quantity) {
      setError(
        `Only ${item.quantity} unit(s) of ${item.medicine.name} are available.`,
      );
      return;
    }

    setCart((currentCart) => {
      const currentExisting = currentCart.find(
        (cartItem) => cartItem.medicineId === item.medicineId,
      );

      if (currentExisting) {
        return currentCart.map((cartItem) =>
          cartItem.medicineId === item.medicineId
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem,
        );
      }

      return [
        ...currentCart,
        {
          medicineId: item.medicineId,
          name: item.medicine.name,
          genericName: item.medicine.genericName,
          price: item.price,
          availableQuantity: item.quantity,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(medicineId: number) {
    const currentItem = cart.find((item) => item.medicineId === medicineId);

    if (!currentItem) {
      return;
    }

    if (currentItem.quantity >= currentItem.availableQuantity) {
      setError(
        `Only ${currentItem.availableQuantity} unit(s) of ${currentItem.name} are available.`,
      );
      return;
    }

    setError("");

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.medicineId === medicineId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  }

  function decreaseQuantity(medicineId: number) {
    setError("");

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.medicineId === medicineId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(medicineId: number) {
    setError("");

    setCart((currentCart) =>
      currentCart.filter((item) => item.medicineId !== medicineId),
    );
  }

  async function completeSale() {
    if (pharmacyId === null) {
      setError("No pharmacy is associated with this login.");
      return;
    }

    if (cart.length === 0) {
      setError("Add at least one medicine to the cart.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");
      setCompletedSaleId(null);

      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pharmacyId,
          items: cart.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
          })),
        }),
      });

      const result: SaleResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to complete sale.");
      }

      setSuccessMessage(result.message || "Sale completed successfully.");

      setCompletedSaleId(result.sale?.id ?? null);
      setCart([]);

      const inventoryResponse = await fetch(
        `${API_URL}/inventory/pharmacy/${pharmacyId}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (inventoryResponse.ok) {
        const updatedInventory: InventoryItem[] =
          await inventoryResponse.json();

        setInventory(Array.isArray(updatedInventory) ? updatedInventory : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete sale.");
    } finally {
      setSubmitting(false);
    }
  }

  if (pharmacyId === null) {
    return (
      <main className="min-h-screen bg-background">
        <DashboardNavbar />

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold">Sales / POS</h1>

            <p className="mt-3 text-sm text-muted-foreground">
              No pharmacy is associated with this login.
            </p>

            <a
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales / POS</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Sell medicines and complete pharmacy transactions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/dashboard/sales/history"
              className="inline-flex items-center rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Sales History
            </a>

            <a
              href="/dashboard"
              className="inline-flex items-center rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              ← Dashboard
            </a>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <p className="font-medium text-green-700 dark:text-green-400">
              {successMessage}
            </p>

            {completedSaleId && (
              <p className="mt-1 text-sm text-muted-foreground">
                Sale #{completedSaleId} has been recorded successfully.
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="h-[600px] animate-pulse rounded-xl border bg-card" />

            <div className="h-[600px] animate-pulse rounded-xl border bg-card" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <section className="rounded-xl border bg-card shadow-sm">
              <div className="border-b p-6">
                <h2 className="text-xl font-semibold">Medicines</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Search your pharmacy inventory.
                </p>

                <div className="mt-5">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search medicine name, generic name, or category..."
                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="max-h-[650px] overflow-y-auto p-6">
                {filteredInventory.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-10 text-center">
                    <p className="font-medium">No medicines found</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Try a different search.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredInventory.map((item) => {
                      const cartItem = cart.find(
                        (cartItem) => cartItem.medicineId === item.medicineId,
                      );

                      const inCart = cartItem?.quantity ?? 0;

                      const canAdd = item.quantity > inCart;

                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border p-4 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">
                                {item.medicine.name}
                              </h3>

                              {item.medicine.genericName && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {item.medicine.genericName}
                                </p>
                              )}

                              {item.medicine.category && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {item.medicine.category}
                                </p>
                              )}
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                item.stockStatus === "AVAILABLE"
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                  : item.stockStatus === "LOW_STOCK"
                                    ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                    : "bg-red-500/10 text-red-700 dark:text-red-400"
                              }`}
                            >
                              {item.quantity} available
                            </span>
                          </div>

                          <div className="mt-4 flex items-end justify-between gap-3">
                            <div>
                              <p className="text-lg font-bold">
                                {formatCurrency(item.price)}
                              </p>

                              {inCart > 0 && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {inCart} in cart
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              disabled={!canAdd}
                              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {canAdd ? "Add to Cart" : "Max Stock"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="h-fit rounded-xl border bg-card shadow-sm lg:sticky lg:top-6">
              <div className="border-b p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Cart</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {cartQuantity} {cartQuantity === 1 ? "item" : "items"}
                    </p>
                  </div>

                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="text-sm font-medium text-destructive hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center">
                    <p className="font-medium">Your cart is empty</p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Search for a medicine and add it to the cart.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.medicineId}
                        className="rounded-xl border p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {item.name}
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatCurrency(item.price)} each
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.medicineId)}
                            className="text-sm text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.medicineId)}
                              className="px-3 py-2 text-lg hover:bg-muted"
                            >
                              −
                            </button>

                            <span className="min-w-10 border-x px-3 py-2 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.medicineId)}
                              disabled={item.quantity >= item.availableQuantity}
                              className="px-3 py-2 text-lg hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          <p className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>

                        <p className="mt-2 text-right text-xs text-muted-foreground">
                          Max: {item.availableQuantity}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 border-t pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium">Total</span>

                    <span className="text-2xl font-bold">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={completeSale}
                    disabled={submitting || cart.length === 0}
                    className="mt-5 w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Processing Sale..." : "Complete Sale"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function SalesLoading() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardNavbar />

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />

          <p className="mt-4 text-sm text-muted-foreground">Loading POS...</p>
        </div>
      </div>
    </main>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={<SalesLoading />}>
      <SalesContent />
    </Suspense>
  );
}
