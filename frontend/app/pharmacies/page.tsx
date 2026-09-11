"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, Mail, MapPin, Phone, Pill, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import PatientNavigation from "@/components/patient/PatientNavigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type InventoryItem = {
  id: number;
  quantity: number;
  price: number;
  stockStatus: string;
  medicine: {
    id: number;
    name: string;
    genericName?: string | null;
    category?: string | null;
  };
};

type Pharmacy = {
  id: number;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: string | null;
  inventory: InventoryItem[];
};

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPharmacies() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/pharmacies`);

        if (!response.ok) {
          throw new Error("Unable to load pharmacies");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid pharmacy data");
        }

        setPharmacies(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load pharmacies. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadPharmacies();
  }, []);

  const filteredPharmacies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return pharmacies;
    }

    return pharmacies.filter((pharmacy) => {
      const pharmacyName = pharmacy.name?.toLowerCase() ?? "";
      const address = pharmacy.address?.toLowerCase() ?? "";

      const medicineMatch = pharmacy.inventory?.some((item) => {
        const medicineName = item.medicine?.name?.toLowerCase() ?? "";
        const genericName = item.medicine?.genericName?.toLowerCase() ?? "";
        const category = item.medicine?.category?.toLowerCase() ?? "";

        return (
          medicineName.includes(query) ||
          genericName.includes(query) ||
          category.includes(query)
        );
      });

      return (
        pharmacyName.includes(query) || address.includes(query) || medicineMatch
      );
    });
  }, [pharmacies, search]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <PatientNavigation activePath="/pharmacies" />

      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              SmartPharma
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Find a Pharmacy
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Find nearby pharmacies, check medicine availability, compare
              prices, and get directions.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pharmacy, location, or medicine..."
                className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {!loading && !error && (
              <p className="mt-3 text-sm text-slate-500">
                {filteredPharmacies.length}{" "}
                {filteredPharmacies.length === 1 ? "pharmacy" : "pharmacies"}{" "}
                found
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Pharmacy List */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Loading */}
        {loading && (
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-6 w-48 rounded bg-slate-200" />
                <div className="mt-4 h-4 w-64 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-40 rounded bg-slate-200" />

                <div className="mt-6 h-32 rounded-xl bg-slate-100" />

                <div className="mt-6 h-10 rounded-lg bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-lg font-semibold text-red-900">
              Something went wrong
            </h2>

            <p className="mt-2 text-sm text-red-700">{error}</p>

            <Button className="mt-5" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* No pharmacies */}
        {!loading && !error && pharmacies.length === 0 && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <MapPin className="h-6 w-6 text-slate-600" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-950">
              No pharmacies available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no pharmacies registered in SmartPharma.
            </p>
          </div>
        )}

        {/* Search returned nothing */}
        {!loading &&
          !error &&
          pharmacies.length > 0 &&
          filteredPharmacies.length === 0 && (
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Search className="h-6 w-6 text-slate-600" />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-950">
                No pharmacies found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try searching for a different pharmacy, location, or medicine.
              </p>

              <Button
                variant="outline"
                className="mt-5"
                onClick={() => setSearch("")}
              >
                Clear Search
              </Button>
            </div>
          )}

        {/* Pharmacy Cards */}
        {!loading && !error && filteredPharmacies.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredPharmacies.map((pharmacy) => {
              const availableMedicines = pharmacy.inventory.filter(
                (item) => item.stockStatus === "AVAILABLE" && item.quantity > 0,
              );

              return (
                <article
                  key={pharmacy.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  {/* Pharmacy Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-slate-950">
                        {pharmacy.name}
                      </h2>

                      <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{pharmacy.address}</span>
                      </div>

                      {pharmacy.phone && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{pharmacy.phone}</span>
                        </div>
                      )}

                      {pharmacy.email && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="break-all">{pharmacy.email}</span>
                        </div>
                      )}

                      {pharmacy.openingHours && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4 shrink-0" />
                          <span>{pharmacy.openingHours}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <Pill className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Medicine Summary */}
                  <div className="mt-6 rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">
                        Available Medicines
                      </p>

                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                        {availableMedicines.length} available
                      </span>
                    </div>

                    {availableMedicines.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">
                        No medicines currently available.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {availableMedicines.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white px-3 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {item.medicine.name}
                              </p>

                              {item.medicine.genericName && (
                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  {item.medicine.genericName}
                                </p>
                              )}
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold text-slate-900">
                                {item.price} ETB
                              </p>

                              <p className="text-xs text-green-600">
                                {item.quantity} in stock
                              </p>
                            </div>
                          </div>
                        ))}

                        {availableMedicines.length > 5 && (
                          <p className="pt-1 text-xs text-slate-500">
                            + {availableMedicines.length - 5} more medicines
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/pharmacies/${pharmacy.id}`}
                      className="flex-1"
                    >
                      <Button className="w-full">View Pharmacy</Button>
                    </Link>

                    {pharmacy.latitude != null &&
                      pharmacy.longitude != null && (
                        <a
                          href={`https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full">
                            <MapPin className="mr-2 h-4 w-4" />
                            Get Directions
                          </Button>
                        </a>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SmartPharma. All rights reserved.</p>

          <div className="flex flex-wrap gap-5">
            <Link href="/" className="hover:text-slate-950">
              Home
            </Link>

            <Link href="/find-medicine" className="hover:text-slate-950">
              Find Medicine
            </Link>

            <Link href="/pharmacies" className="hover:text-slate-950">
              Pharmacies
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
