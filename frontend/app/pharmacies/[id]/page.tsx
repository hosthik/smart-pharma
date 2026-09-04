"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Mail,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  Pill,
  AlertTriangle,
  XCircle,
  Home as HomeIcon,
  Search,
  Info,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = "http://localhost:4000";

type Medicine = {
  id: number;
  name: string;
  genericName?: string;
  category?: string;
};

type InventoryItem = {
  id: number;
  quantity: number;
  price: number;
  stockStatus: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
  section?: string;
  shelf?: string;
  row?: string;
  medicine: Medicine;
};

type Pharmacy = {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  inventory: InventoryItem[];
};

function getStockStatus(status: InventoryItem["stockStatus"]) {
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
  }
}

function PublicNavbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            SP
          </div>

          <div className="hidden leading-none sm:block">
            <p className="text-lg font-bold tracking-tight text-slate-900">
              SmartPharma
            </p>

            <p className="mt-1 text-[11px] text-slate-500">
              Medicine Discovery
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <HomeIcon className="h-4 w-4" />
            Home
          </Link>

          <Link
            href="/find-medicine"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Search className="h-4 w-4" />
            Find Medicine
          </Link>

          <Link
            href="/pharmacies"
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            <MapPin className="h-4 w-4" />
            Pharmacies
          </Link>

          <Link
            href="/about"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Info className="h-4 w-4" />
            About
          </Link>

          <Link
            href="/contact"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <MessageCircle className="h-4 w-4" />
            Contact
          </Link>

          <Link href="/pharmacy/login" className="ml-2">
            <Button>Pharmacy Login</Button>
          </Link>
        </div>

        <Link href="/pharmacy/login" className="md:hidden">
          <Button size="sm">Pharmacy Login</Button>
        </Link>
      </div>

      <div className="border-t md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <HomeIcon className="h-4 w-4" />
            Home
          </Link>

          <Link
            href="/find-medicine"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <Search className="h-4 w-4" />
            Find Medicine
          </Link>

          <Link
            href="/pharmacies"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
          >
            <MapPin className="h-4 w-4" />
            Pharmacies
          </Link>

          <Link
            href="/about"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <Info className="h-4 w-4" />
            About
          </Link>

          <Link
            href="/contact"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <MessageCircle className="h-4 w-4" />
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function PharmacyDetailsPage() {
  const params = useParams();
  const pharmacyId = params.id;

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPharmacy() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/pharmacies/${pharmacyId}`);

        if (!response.ok) {
          throw new Error("Pharmacy not found");
        }

        const data = await response.json();
        setPharmacy(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load this pharmacy. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (pharmacyId) {
      loadPharmacy();
    }
  }, [pharmacyId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <PublicNavbar />

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="h-56 rounded-2xl bg-white" />
            <div className="h-80 rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !pharmacy) {
    return (
      <main className="min-h-screen bg-slate-50">
        <PublicNavbar />

        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-7 w-7 text-red-600" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Pharmacy not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "We could not find this pharmacy."}
          </p>

          <Link
            href="/pharmacies"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pharmacies
          </Link>
        </div>
      </main>
    );
  }

  const availableCount = pharmacy.inventory.filter(
    (item) => item.stockStatus === "AVAILABLE",
  ).length;

  const lowStockCount = pharmacy.inventory.filter(
    (item) => item.stockStatus === "LOW_STOCK",
  ).length;

  const outOfStockCount = pharmacy.inventory.filter(
    (item) => item.stockStatus === "OUT_OF_STOCK",
  ).length;

  const hasCoordinates =
    pharmacy.latitude != null && pharmacy.longitude != null;

  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <section className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
        <Link
          href="/pharmacies"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pharmacies
        </Link>

        {/* Pharmacy Header */}
        <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="bg-slate-900 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <MapPin className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Pharmacy #{pharmacy.id}
                  </p>

                  <h1 className="mt-1 text-3xl font-bold tracking-tight">
                    {pharmacy.name}
                  </h1>

                  <div className="mt-3 flex items-start gap-2 text-sm text-slate-300">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{pharmacy.address}</span>
                  </div>
                </div>
              </div>

              {hasCoordinates && (
                <a
                  href={`https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Phone
                </span>
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {pharmacy.phone || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Email
                </span>
              </div>

              <p className="mt-2 break-all font-semibold text-slate-900">
                {pharmacy.email || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Opening Hours
                </span>
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {pharmacy.openingHours || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Pill className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Medicines
                </span>
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {pharmacy.inventory.length} registered
              </p>
            </div>
          </div>

          {/* Contact Action */}
          {pharmacy.phone && (
            <div className="border-t px-6 py-5 sm:px-8">
              <a
                href={`tel:${pharmacy.phone}`}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Phone className="h-4 w-4" />
                Contact Pharmacy
              </a>
            </div>
          )}
        </div>

        {/* Stock Summary */}
        <div className="mt-8">
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-500">
              Inventory Overview
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Medicine Availability
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Available</p>
                <PackageCheck className="h-5 w-5 text-green-600" />
              </div>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {availableCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">medicines in stock</p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Low Stock</p>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {lowStockCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                medicines need attention
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Out of Stock
                </p>

                <XCircle className="h-5 w-5 text-red-600" />
              </div>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {outOfStockCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                currently unavailable
              </p>
            </div>
          </div>
        </div>

        {/* Medicines */}
        <div className="mt-8">
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-500">
              Pharmacy Inventory
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              All Medicines
            </h2>
          </div>

          {pharmacy.inventory.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
              <Pill className="mx-auto h-8 w-8 text-slate-400" />

              <h3 className="mt-4 font-semibold text-slate-900">
                No medicines registered
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                This pharmacy has not added any medicines yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {pharmacy.inventory.map((item) => {
                const stock = getStockStatus(item.stockStatus);
                const StockIcon = stock.icon;

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <Pill className="h-5 w-5 text-slate-700" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {item.medicine.name}
                          </h3>

                          {item.medicine.genericName && (
                            <p className="mt-1 text-sm text-slate-500">
                              {item.medicine.genericName}
                            </p>
                          )}

                          {item.medicine.category && (
                            <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {item.medicine.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${stock.className}`}
                      >
                        <StockIcon className="h-3.5 w-3.5" />
                        {stock.label}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Price
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          {item.price.toFixed(2)} ETB
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Stock
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          {item.quantity}
                        </p>

                        <p className="text-xs text-slate-500">units</p>
                      </div>
                    </div>

                    {(item.section || item.shelf || item.row) && (
                      <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-slate-600" />

                          <p className="text-sm font-semibold text-slate-900">
                            Medicine Location
                          </p>
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          {item.section && `Section ${item.section}`}
                          {item.shelf && ` • Shelf ${item.shelf}`}
                          {item.row && ` • Row ${item.row}`}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SmartPharma. All rights reserved.</p>

          <div className="flex flex-wrap gap-5">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>

            <Link href="/find-medicine" className="hover:text-slate-900">
              Find Medicine
            </Link>

            <Link href="/pharmacies" className="hover:text-slate-900">
              Pharmacies
            </Link>

            <Link href="/about" className="hover:text-slate-900">
              About
            </Link>

            <Link href="/contact" className="hover:text-slate-900">
              Contact
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
