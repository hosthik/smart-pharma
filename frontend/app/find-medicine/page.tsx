"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  AlertTriangle,
  Home as HomeIcon,
  LocateFixed,
  MapPin,
  MapPinned,
  Navigation,
  PackageCheck,
  Phone,
  Pill,
  Search,
  XCircle,
} from "lucide-react";

import PatientNavigation from "@/components/patient/PatientNavigation";
import { Button } from "@/components/ui/button";
import { searchMedicines } from "@/lib/api";

const NearbyPharmacyMap = dynamic(
  () => import("@/components/NearbyPharmacyMap"),
  {
    ssr: false,
  },
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
  pharmacies?: Pharmacy[];
};

type NearbyPharmacy = {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  latitude: number;
  longitude: number;
  openingHours?: string;
  distanceKm: number;
};

function getStockStatus(quantity: number) {
  if (quantity <= 0) {
    return {
      label: "Out of stock",
      className: "bg-red-100 text-red-700",
      icon: XCircle,
    };
  }

  if (quantity <= 10) {
    return {
      label: "Low stock",
      className: "bg-yellow-100 text-yellow-700",
      icon: AlertTriangle,
    };
  }

  return {
    label: "Available",
    className: "bg-green-100 text-green-700",
    icon: PackageCheck,
  };
}

function formatPrice(value: number) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "0.00";
  }

  return numberValue.toFixed(2);
}

function formatDistance(distanceKm: number) {
  const distance = Number(distanceKm);

  if (!Number.isFinite(distance) || distance < 0) {
    return "Distance unavailable";
  }

  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    return `${meters} m away`;
  }

  return `${distance.toFixed(1)} km away`;
}

export default function FindMedicinePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [nearbyPharmacies, setNearbyPharmacies] = useState<NearbyPharmacy[]>(
    [],
  );

  const [userLatitude, setUserLatitude] = useState<number | null>(null);

  const [userLongitude, setUserLongitude] = useState<number | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationSearched, setLocationSearched] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter a medicine name.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const data = await searchMedicines(trimmedQuery);

      const normalizedResults: Medicine[] = Array.isArray(data)
        ? data.map((medicine) => ({
            ...medicine,
            pharmacies: Array.isArray(medicine?.pharmacies)
              ? medicine.pharmacies
              : [],
          }))
        : [];

      setResults(normalizedResults);
    } catch (err) {
      console.error(err);

      setError("Unable to search medicines. Please try again.");

      setResults([]);
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

  function findNearbyPharmacies() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Location detection is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setUserLatitude(latitude);
        setUserLongitude(longitude);

        try {
          const response = await fetch(
            `${API_URL}/pharmacies/nearby?latitude=${latitude}&longitude=${longitude}&radius=10`,
          );

          if (!response.ok) {
            throw new Error("Failed to find nearby pharmacies.");
          }

          const data = await response.json();

          setNearbyPharmacies(
            Array.isArray(data?.pharmacies) ? data.pharmacies : [],
          );

          setLocationSearched(true);
        } catch (err) {
          console.error(err);

          setLocationError(
            "Unable to load nearby pharmacies. Please make sure the backend is running.",
          );

          setNearbyPharmacies([]);
        } finally {
          setLocationLoading(false);
        }
      },
      (geoError) => {
        setLocationLoading(false);

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setLocationError(
              "Location permission was denied. Please allow location access and try again.",
            );
            break;

          case geoError.POSITION_UNAVAILABLE:
            setLocationError(
              "Your current location could not be determined. Please try again.",
            );
            break;

          case geoError.TIMEOUT:
            setLocationError("Location detection timed out. Please try again.");
            break;

          default:
            setLocationError("Unable to detect your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PatientNavigation activePath="/find-medicine" />

      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="max-w-4xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Pill className="h-7 w-7" />
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              SmartPharma
            </p>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Find the medicine you need.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Search medicine availability, compare pharmacy prices, and find
              pharmacies near your location.
            </p>

            {/* Medicine Search */}
            <form
              onSubmit={handleSearch}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search medicine name..."
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl px-7"
              >
                {loading ? "Searching..." : "Search"}
              </Button>

              {searched ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSearch}
                  className="h-12 rounded-xl"
                >
                  Clear
                </Button>
              ) : null}
            </form>

            {error ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {/* Nearby Pharmacies */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <MapPinned className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Nearby Pharmacies
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Find approved pharmacies near your current location.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={findNearbyPharmacies}
              disabled={locationLoading}
              className="rounded-xl"
            >
              <LocateFixed className="mr-2 h-4 w-4" />

              {locationLoading ? "Finding pharmacies..." : "Find Near Me"}
            </Button>
          </div>

          {locationError ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {locationError}
            </div>
          ) : null}

          {locationSearched &&
          userLatitude !== null &&
          userLongitude !== null ? (
            <div className="mt-6">
              <div className="mb-5 flex items-center gap-2 text-sm text-slate-600">
                <Navigation className="h-4 w-4 text-slate-700" />

                <span>
                  Showing pharmacies within{" "}
                  <strong className="text-slate-900">10 km</strong> of your
                  location.
                </span>
              </div>

              {/* Map */}
              <NearbyPharmacyMap
                latitude={userLatitude}
                longitude={userLongitude}
                pharmacies={nearbyPharmacies}
              />

              {/* No Pharmacies */}
              {nearbyPharmacies.length === 0 ? (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <MapPin className="mx-auto h-8 w-8 text-slate-500" />

                  <h3 className="mt-3 font-semibold text-slate-900">
                    No nearby pharmacies found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    There are no approved pharmacies with registered locations
                    within 10 km.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {nearbyPharmacies.map((pharmacy) => (
                    <div
                      key={pharmacy.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            <MapPin className="h-5 w-5 text-slate-700" />
                          </div>

                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {pharmacy.name}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {pharmacy.address}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {formatDistance(pharmacy.distanceKm)}
                        </span>
                      </div>

                      <div className="mt-5 space-y-3">
                        {pharmacy.phone ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span>{pharmacy.phone}</span>
                          </div>
                        ) : null}

                        {pharmacy.openingHours ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <HomeIcon className="h-4 w-4 text-slate-400" />
                            <span>{pharmacy.openingHours}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                        <Navigation className="h-3.5 w-3.5" />

                        <span>
                          Coordinates: {Number(pharmacy.latitude).toFixed(6)},{" "}
                          {Number(pharmacy.longitude).toFixed(6)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Medicine Search Results */}
        {searched ? (
          <div>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Search Results
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Medicine Results
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {results.length === 0
                  ? "No medicines found."
                  : `Found ${results.length} medicine${
                      results.length === 1 ? "" : "s"
                    } matching your search.`}
              </p>
            </div>

            {results.length === 0 && !loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <Pill className="h-7 w-7 text-slate-500" />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  No medicine found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another medicine name or check the spelling.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((medicine) => {
                  const pharmacies = medicine.pharmacies ?? [];

                  return (
                    <div
                      key={medicine.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                              <Pill className="h-5 w-5 text-slate-700" />
                            </div>

                            <div>
                              <h3 className="text-xl font-bold text-slate-900">
                                {medicine.name}
                              </h3>

                              {medicine.genericName ? (
                                <p className="text-sm text-slate-500">
                                  {medicine.genericName}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          {medicine.category ? (
                            <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {medicine.category}
                            </span>
                          ) : null}
                        </div>

                        <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                          <p className="text-xs text-slate-500">Pharmacies</p>

                          <p className="mt-1 text-xl font-bold text-slate-900">
                            {pharmacies.length}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <h4 className="mb-4 text-sm font-semibold text-slate-900">
                          Available at
                        </h4>

                        {pharmacies.length === 0 ? (
                          <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                            This medicine is currently not available at any
                            pharmacy.
                          </div>
                        ) : (
                          <div className="grid gap-4 md:grid-cols-2">
                            {pharmacies.map((pharmacy) => {
                              const stockStatus = getStockStatus(
                                pharmacy.quantity,
                              );

                              const StatusIcon = stockStatus.icon;

                              return (
                                <div
                                  key={`${medicine.id}-${pharmacy.pharmacyId}`}
                                  className="rounded-2xl border border-slate-200 p-5 transition hover:shadow-sm"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h5 className="font-semibold text-slate-900">
                                        {pharmacy.pharmacyName}
                                      </h5>

                                      <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                                        <span>{pharmacy.address}</span>
                                      </div>
                                    </div>

                                    <span
                                      className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${stockStatus.className}`}
                                    >
                                      <StatusIcon className="h-3.5 w-3.5" />

                                      {stockStatus.label}
                                    </span>
                                  </div>

                                  <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-slate-50 p-3">
                                      <p className="text-xs text-slate-500">
                                        Quantity
                                      </p>

                                      <p className="mt-1 font-semibold text-slate-900">
                                        {pharmacy.quantity}
                                      </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-3">
                                      <p className="text-xs text-slate-500">
                                        Price
                                      </p>

                                      <p className="mt-1 font-semibold text-slate-900">
                                        {formatPrice(pharmacy.price)} ETB
                                      </p>
                                    </div>
                                  </div>

                                  {pharmacy.phone ? (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                                      <Phone className="h-4 w-4 text-slate-400" />

                                      <span>{pharmacy.phone}</span>
                                    </div>
                                  ) : null}

                                  {pharmacy.section ||
                                  pharmacy.shelf ||
                                  pharmacy.row ? (
                                    <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                                      <strong className="text-slate-900">
                                        Location in pharmacy:
                                      </strong>{" "}
                                      {pharmacy.section
                                        ? `Section ${pharmacy.section}`
                                        : ""}
                                      {pharmacy.shelf
                                        ? ` • Shelf ${pharmacy.shelf}`
                                        : ""}
                                      {pharmacy.row
                                        ? ` • Row ${pharmacy.row}`
                                        : ""}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {/* Initial State */}
        {!searched && !locationSearched ? (
          <div>
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                SmartPharma
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Find what you need in a few steps.
              </h2>

              <p className="mt-3 text-slate-600">
                Search medicines, find nearby pharmacies, and check availability
                before you visit.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Search className="h-5 w-5 text-slate-700" />
                </div>

                <h3 className="mt-5 font-semibold text-slate-900">
                  Search Medicines
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Search for a medicine and see which pharmacies currently have
                  it available.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>

                <h3 className="mt-5 font-semibold text-slate-900">
                  Find Nearby Pharmacies
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Allow location access to see approved pharmacies near your
                  current location.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <PackageCheck className="h-5 w-5 text-slate-700" />
                </div>

                <h3 className="mt-5 font-semibold text-slate-900">
                  Check Availability
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View stock quantity, price, pharmacy address, and contact
                  information.
                </p>
              </div>
            </div>
          </div>
        ) : null}
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
