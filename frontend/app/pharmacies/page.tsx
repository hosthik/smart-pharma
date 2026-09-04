"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home as HomeIcon, MapPin, Phone, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = "http://localhost:4000";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPharmacies() {
      try {
        const response = await fetch(`${API_URL}/pharmacies`);

        if (!response.ok) {
          throw new Error("Unable to load pharmacies");
        }

        const data = await response.json();
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              SP
            </div>

            <div className="leading-none">
              <p className="text-lg font-bold tracking-tight text-slate-900">
                SmartPharma
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Medicine Discovery
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>

            <Link
              href="/find-medicine"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Find Medicine
            </Link>

            <Link
              href="/pharmacies"
              className="flex items-center gap-2 text-sm font-medium text-slate-900"
            >
              <MapPin className="h-4 w-4" />
              Pharmacies
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Contact
            </Link>

            <Link href="/pharmacy/login">
              <Button>Pharmacy Login</Button>
            </Link>
          </div>

          <Link href="/pharmacy/login" className="md:hidden">
            <Button size="sm">Pharmacy Login</Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            SmartPharma
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Find Pharmacies
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Browse pharmacies and see their available medicines, prices, stock,
            address, and contact information.
          </p>
        </div>
      </section>

      {/* Pharmacy List */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {loading && (
          <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
            Loading pharmacies...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && pharmacies.length === 0 && (
          <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
            No pharmacies found.
          </div>
        )}

        {!loading && !error && pharmacies.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {pharmacies.map((pharmacy) => {
              const availableMedicines = pharmacy.inventory.filter(
                (item) => item.stockStatus === "AVAILABLE" && item.quantity > 0,
              );

              return (
                <div
                  key={pharmacy.id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {pharmacy.name}
                      </h2>

                      <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{pharmacy.address}</span>
                      </div>

                      {pharmacy.phone && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <Phone className="h-4 w-4" />
                          <span>{pharmacy.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <Pill className="h-5 w-5 text-slate-700" />
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Available Medicines
                    </p>

                    {availableMedicines.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">
                        No medicines currently available.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {availableMedicines.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {item.medicine.name}
                              </p>

                              {item.medicine.genericName && (
                                <p className="text-xs text-slate-500">
                                  {item.medicine.genericName}
                                </p>
                              )}
                            </div>

                            <div className="text-right">
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SmartPharma. All rights reserved.</p>

          <div className="flex gap-5">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>

            <Link href="/find-medicine" className="hover:text-slate-900">
              Find Medicine
            </Link>

            <Link href="/pharmacies" className="hover:text-slate-900">
              Pharmacies
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
