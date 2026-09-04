"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Phone,
  Pill,
  PackageCheck,
  AlertTriangle,
  XCircle,
  Navigation,
  Home as HomeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchMedicines } from "@/lib/api";

type Pharmacy = {
  pharmacyId: number;
  pharmacyName: string;
  address: string;
  phone?: string;
  quantity: number;
  price: number;
  stockStatus: string;
  section?: string;
  shelf?: string;
  row?: string;
};

type Medicine = {
  id: number;
  name: string;
  genericName?: string;
  category?: string;
  pharmacies: Pharmacy[];
};

function getStockStatus(status: string) {
  switch (status) {
    case "AVAILABLE":
      return {
        label: "Available",
        className: "bg-green-100 text-green-700",
        icon: PackageCheck,
      };

    case "LOW_STOCK":
      return {
        label: "Low Stock",
        className: "bg-yellow-100 text-yellow-700",
        icon: AlertTriangle,
      };

    case "OUT_OF_STOCK":
      return {
        label: "Out of Stock",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      };

    default:
      return {
        label: status.replaceAll("_", " "),
        className: "bg-slate-100 text-slate-700",
        icon: PackageCheck,
      };
  }
}

export default function FindMedicinePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch(event?: React.FormEvent) {
    event?.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setSearched(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const data = await searchMedicines(trimmedQuery);

      setResults(data);
    } catch (err) {
      console.error(err);

      setResults([]);
      setError("Unable to search medicines right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setError("");
    setSearched(false);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Public Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-6">
          {/* Logo */}
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

          {/* Navigation */}
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
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            >
              Find Medicine
            </Link>

            <Link
              href="/pharmacies"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
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

          {/* Mobile Login */}
          <Link href="/pharmacy/login" className="md:hidden">
            <Button size="sm">Pharmacy Login</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Pill className="h-7 w-7" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              SmartPharma
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Find the medicine you need.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Search medicine availability, compare pharmacy prices, and find
              pharmacies near you.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search medicine, e.g. Paracetamol"
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-base outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search className="h-5 w-5" />

                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-4 text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {error && (
          <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-32 animate-pulse rounded-xl border bg-white" />
            <div className="h-32 animate-pulse rounded-xl border bg-white" />
          </div>
        )}

        {!loading && searched && !error && results.length === 0 && (
          <div className="mx-auto max-w-3xl rounded-2xl border border-dashed bg-white p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-5 w-5 text-slate-500" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No medicines found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              We could not find a medicine matching{" "}
              <span className="font-medium text-slate-700">
                &quot;{query.trim()}&quot;
              </span>
              .
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Try another medicine name or generic name.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Search results
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Medicines matching &quot;{query.trim()}&quot;
                </h2>
              </div>

              <p className="text-sm text-slate-500">
                {results.length} medicine
                {results.length === 1 ? "" : "s"} found
              </p>
            </div>

            {results.map((medicine) => (
              <article
                key={medicine.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                {/* Medicine Header */}
                <div className="border-b bg-slate-50 p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                          <Pill className="h-5 w-5 text-slate-700" />
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {medicine.name}
                          </h3>

                          {medicine.genericName && (
                            <p className="mt-1 text-sm text-slate-500">
                              Generic: {medicine.genericName}
                            </p>
                          )}
                        </div>
                      </div>

                      {medicine.category && (
                        <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                          {medicine.category}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-900">
                        {medicine.pharmacies.length}
                      </span>{" "}
                      pharmacy
                      {medicine.pharmacies.length === 1 ? "" : "ies"} found
                    </div>
                  </div>
                </div>

                {/* Pharmacy Results */}
                <div className="p-6">
                  {medicine.pharmacies.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                      <PackageCheck className="mx-auto h-7 w-7 text-slate-400" />

                      <p className="mt-3 font-medium text-slate-900">
                        No pharmacy has this medicine available.
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try searching again later.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                      {medicine.pharmacies.map((pharmacy) => {
                        const stock = getStockStatus(pharmacy.stockStatus);
                        const StockIcon = stock.icon;

                        return (
                          <div
                            key={pharmacy.pharmacyId}
                            className="rounded-xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
                          >
                            {/* Pharmacy Name */}
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-lg font-bold text-slate-900">
                                  {pharmacy.pharmacyName}
                                </h4>

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

                              {/* Stock */}
                              <span
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${stock.className}`}
                              >
                                <StockIcon className="h-3.5 w-3.5" />

                                {stock.label}
                              </span>
                            </div>

                            {/* Price + Quantity */}
                            <div className="mt-6 grid grid-cols-2 gap-3">
                              <div className="rounded-lg bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Price
                                </p>

                                <p className="mt-1 text-xl font-bold text-slate-900">
                                  {pharmacy.price.toFixed(2)} ETB
                                </p>
                              </div>

                              <div className="rounded-lg bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Stock
                                </p>

                                <p className="mt-1 text-xl font-bold text-slate-900">
                                  {pharmacy.quantity}
                                </p>

                                <p className="text-xs text-slate-500">
                                  units available
                                </p>
                              </div>
                            </div>

                            {/* Medicine Shelf Location */}
                            {(pharmacy.section ||
                              pharmacy.shelf ||
                              pharmacy.row) && (
                              <div className="mt-4 rounded-lg border bg-slate-50 p-4">
                                <div className="flex items-center gap-2">
                                  <Navigation className="h-4 w-4 text-slate-600" />

                                  <p className="text-sm font-semibold text-slate-900">
                                    Medicine location
                                  </p>
                                </div>

                                <p className="mt-2 text-sm text-slate-600">
                                  {pharmacy.section &&
                                    `Section ${pharmacy.section}`}

                                  {pharmacy.shelf &&
                                    ` • Shelf ${pharmacy.shelf}`}

                                  {pharmacy.row && ` • Row ${pharmacy.row}`}
                                </p>
                              </div>
                            )}

                            {/* Pharmacy Action */}
                            {pharmacy.phone && (
                              <a
                                href={`tel:${pharmacy.phone}`}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                <Phone className="h-4 w-4" />
                                Contact Pharmacy
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Initial State */}
        {!searched && !loading && (
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Search className="h-5 w-5 text-slate-700" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  Search Medicines
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Search by medicine name, generic name, or category.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <PackageCheck className="h-5 w-5 text-slate-700" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  Check Availability
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  See which pharmacies currently have your medicine in stock.
                </p>
              </div>

              <Link
                href="/pharmacies"
                className="rounded-xl border bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  Find a Pharmacy
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View pharmacy addresses and contact information.
                </p>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t bg-white">
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

            <Link href="/pharmacy/login" className="hover:text-slate-900">
              Pharmacy Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
