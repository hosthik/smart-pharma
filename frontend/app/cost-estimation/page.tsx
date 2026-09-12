"use client";

import { FormEvent, useEffect, useState } from "react";
import NextLink from "next/link";
import {
  AlertTriangle,
  Bike,
  Bus,
  Calculator,
  Car,
  CheckCircle2,
  Footprints,
  MapPin,
  PackageCheck,
  Phone,
  Pill,
  Search,
  XCircle,
} from "lucide-react";

import PatientNavigation from "@/components/patient/PatientNavigation";
import { Button } from "@/components/ui/button";
import { searchMedicines } from "@/lib/api";

type Pharmacy = {
  pharmacyId: number;
  pharmacyName: string;
  address: string;
  phone?: string | null;
  quantity: number;
  price: number;
  stockStatus: string;
  section?: string | null;
  shelf?: string | null;
  row?: string | null;
};

type Medicine = {
  id: number;
  name: string;
  genericName?: string | null;
  category?: string | null;
  pharmacies?: Pharmacy[];
};

type TransportationType =
  | "walking"
  | "motorcycle"
  | "bus"
  | "taxi"
  | "private-car";

type TransportationRate = {
  id: number;
  type: string;
  ratePerKm: number;
  active: boolean;
};

type TransportationOption = {
  value: TransportationType;
  backendType: string;
  label: string;
  rate: number;
  icon: typeof Footprints;
};

const transportationTypes: {
  value: TransportationType;
  backendType: string;
  label: string;
  icon: typeof Footprints;
}[] = [
  {
    value: "walking",
    backendType: "WALKING",
    label: "Walking",
    icon: Footprints,
  },
  {
    value: "motorcycle",
    backendType: "MOTORCYCLE",
    label: "Motorcycle",
    icon: Bike,
  },
  {
    value: "bus",
    backendType: "BUS",
    label: "Bus",
    icon: Bus,
  },
  {
    value: "taxi",
    backendType: "TAXI",
    label: "Taxi",
    icon: Car,
  },
  {
    value: "private-car",
    backendType: "PRIVATE_CAR",
    label: "Private Car",
    icon: Car,
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
function formatPrice(value: number) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "0.00";
  }

  return numberValue.toFixed(2);
}

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

export default function CostEstimationPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null,
  );

  const [quantity, setQuantity] = useState("1");

  // Transportation
  const [transportationRates, setTransportationRates] = useState<
    TransportationRate[]
  >([]);

  const [transportationLoading, setTransportationLoading] = useState(true);

  const [transportationError, setTransportationError] = useState("");

  const [distance, setDistance] = useState("");

  const [transportationType, setTransportationType] =
    useState<TransportationType>("walking");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  /*
   * Load transportation rates managed by the administrator.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchTransportationRates() {
      try {
        setTransportationLoading(true);
        setTransportationError("");

        const response = await fetch(`${API_URL}/transportation/rates`);

        if (!response.ok) {
          throw new Error("Failed to load transportation rates.");
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid transportation rate data.");
        }

        const normalizedRates: TransportationRate[] = data
          .filter(
            (rate): rate is Record<string, unknown> =>
              typeof rate === "object" && rate !== null,
          )
          .map((rate) => ({
            id: Number(rate.id),
            type: String(rate.type),
            ratePerKm: Number(rate.ratePerKm),
            active: Boolean(rate.active),
          }))
          .filter(
            (rate) =>
              Number.isFinite(rate.id) &&
              Number.isFinite(rate.ratePerKm) &&
              rate.active,
          );

        if (!cancelled) {
          setTransportationRates(normalizedRates);

          if (normalizedRates.length === 0) {
            setTransportationError(
              "No active transportation rates are currently available.",
            );
          }
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setTransportationRates([]);
          setTransportationError(
            "Unable to load transportation rates. Please try again later.",
          );
        }
      } finally {
        if (!cancelled) {
          setTransportationLoading(false);
        }
      }
    }

    void fetchTransportationRates();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Build the patient-facing transportation options
   * from the active rates returned by the backend.
   */
  const transportationOptions: TransportationOption[] = transportationTypes
    .map((transportation) => {
      const rate = transportationRates.find(
        (item) => item.type === transportation.backendType,
      );

      if (!rate) {
        return null;
      }

      return {
        value: transportation.value,
        backendType: transportation.backendType,
        label: transportation.label,
        rate: rate.ratePerKm,
        icon: transportation.icon,
      };
    })
    .filter((option): option is TransportationOption => option !== null);

  const selectedTransportation =
    transportationOptions.find(
      (option) => option.value === transportationType,
    ) ?? transportationOptions[0];

  const transportationRate = selectedTransportation?.rate ?? 0;

  const distanceValue = Math.max(0, Number(distance) || 0);

  const transportationCost = distanceValue * transportationRate;

  const TransportationIcon = selectedTransportation?.icon ?? Footprints;

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter a medicine name.");
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);
      setSelectedMedicine(null);

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

      if (normalizedResults.length === 0) {
        setError("No available medicine found.");
      }
    } catch (err) {
      console.error(err);

      setResults([]);
      setError("Unable to search medicines. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function selectMedicine(medicine: Medicine) {
    setSelectedMedicine(medicine);
    setResults([]);
    setError("");
    setQuantity("1");
    setDistance("");

    if (transportationOptions.length > 0) {
      setTransportationType(transportationOptions[0].value);
    } else {
      setTransportationType("walking");
    }
  }

  function clearSelection() {
    setSelectedMedicine(null);
    setResults([]);
    setQuery("");
    setQuantity("1");
    setDistance("");

    if (transportationOptions.length > 0) {
      setTransportationType(transportationOptions[0].value);
    } else {
      setTransportationType("walking");
    }

    setError("");
    setSearched(false);
  }

  function handleQuantityChange(value: string) {
    if (value === "") {
      setQuantity("");
      return;
    }

    const numericValue = Number(value);

    if (Number.isInteger(numericValue) && numericValue >= 1) {
      setQuantity(value);
    }
  }

  function handleDistanceChange(value: string) {
    if (value === "") {
      setDistance("");
      return;
    }

    const numericValue = Number(value);

    if (Number.isFinite(numericValue) && numericValue >= 0) {
      setDistance(value);
    }
  }

  const requestedQuantity = Math.max(1, Number(quantity) || 1);

  const pharmacies = selectedMedicine?.pharmacies ?? [];

  const eligiblePharmacies = pharmacies.filter(
    (pharmacy) => Number(pharmacy.quantity) >= requestedQuantity,
  );

  const cheapestPrice =
    eligiblePharmacies.length > 0
      ? Math.min(
          ...eligiblePharmacies.map((pharmacy) => Number(pharmacy.price)),
        )
      : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <PatientNavigation activePath="/cost-estimation" />

      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="max-w-4xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Calculator className="h-7 w-7" />
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              SmartPharma
            </p>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Estimate your medicine cost.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Search for a medicine, enter the quantity you need, add your
              travel distance and transportation type, and estimate your overall
              cost.
            </p>

            {/* Search */}
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
                  onClick={clearSelection}
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
        {/* Search Results */}
        {searched && !selectedMedicine ? (
          <div>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Search Results
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Select a Medicine
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Choose a medicine below to estimate its cost.
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
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {results.map((medicine) => {
                  const medicinePharmacies = medicine.pharmacies ?? [];

                  return (
                    <button
                      key={medicine.id}
                      type="button"
                      onClick={() => selectMedicine(medicine)}
                      className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <Pill className="h-5 w-5 text-slate-700" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900">
                            {medicine.name}
                          </h3>

                          {medicine.genericName ? (
                            <p className="mt-1 text-sm text-slate-500">
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

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-sm text-slate-500">
                          Available pharmacies
                        </span>

                        <span className="font-semibold text-slate-900">
                          {medicinePharmacies.length}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {/* Selected Medicine */}
        {selectedMedicine ? (
          <div>
            {/* Header */}
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Cost Estimation
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Pill className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                      {selectedMedicine.name}
                    </h2>

                    {selectedMedicine.genericName ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedMedicine.genericName}
                      </p>
                    ) : null}
                  </div>
                </div>

                {selectedMedicine.category ? (
                  <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {selectedMedicine.category}
                  </span>
                ) : null}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={clearSelection}
                className="rounded-xl"
              >
                Change Medicine
              </Button>
            </div>

            {/* Quantity Card */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    How many units do you need?
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the quantity you want to purchase.
                  </p>
                </div>

                <div className="w-full md:w-48">
                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Quantity
                  </label>

                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(event) =>
                      handleQuantityChange(event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Transportation Card */}
            <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <MapPin className="h-5 w-5 text-slate-700" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Transportation Estimate
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Enter your distance to estimate your transportation cost.
                    </p>
                  </div>
                </div>
              </div>

              {transportationLoading ? (
                <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Loading current transportation rates...
                </div>
              ) : null}

              {transportationError ? (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {transportationError}
                </div>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2">
                {/* Distance */}
                <div>
                  <label
                    htmlFor="distance"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Distance to pharmacy
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="distance"
                      type="number"
                      min="0"
                      step="0.1"
                      value={distance}
                      onChange={(event) =>
                        handleDistanceChange(event.target.value)
                      }
                      placeholder="Enter distance"
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-14 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                      km
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">Example: 5 km</p>
                </div>

                {/* Transportation Type */}
                <div>
                  <label
                    htmlFor="transportation"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Transportation type
                  </label>

                  <div className="relative">
                    <TransportationIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <select
                      id="transportation"
                      value={
                        selectedTransportation?.value ?? transportationType
                      }
                      disabled={
                        transportationLoading ||
                        transportationOptions.length === 0
                      }
                      onChange={(event) =>
                        setTransportationType(
                          event.target.value as TransportationType,
                        )
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      {transportationOptions.length === 0 ? (
                        <option value="walking">
                          No transportation rates available
                        </option>
                      ) : (
                        transportationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label} — {formatPrice(option.rate)} ETB/km
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {selectedTransportation
                      ? `Estimated rate: ${formatPrice(
                          transportationRate,
                        )} ETB/km`
                      : "No active transportation rate selected."}
                  </p>
                </div>
              </div>

              {/* Transportation Calculation */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Distance</p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatPrice(distanceValue)} km
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Transport rate</p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatPrice(transportationRate)} ETB/km
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 p-4 text-white">
                  <p className="text-xs text-slate-300">Transportation cost</p>

                  <p className="mt-1 text-xl font-bold">
                    {formatPrice(transportationCost)} ETB
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-500">
                    Transportation calculation
                  </span>

                  <span className="font-semibold text-slate-900">
                    {formatPrice(distanceValue)} km ×{" "}
                    {formatPrice(transportationRate)} ETB/km ={" "}
                    {formatPrice(transportationCost)} ETB
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs leading-5 text-yellow-800">
                Transportation prices are estimated rates for cost calculation
                only. Actual transportation fares may vary depending on the
                route, traffic, time, and transportation provider.
              </div>
            </div>

            {/* Pharmacy Comparison */}
            <div>
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Price Comparison
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Compare Pharmacy Prices
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Medicine cost is calculated from the pharmacy price and
                  requested quantity. Transportation is added to show your
                  estimated overall cost.
                </p>
              </div>

              {pharmacies.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <XCircle className="h-7 w-7 text-slate-500" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    No pharmacies available
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    This medicine is currently unavailable at all approved
                    pharmacies.
                  </p>
                </div>
              ) : (
                <>
                  {eligiblePharmacies.length === 0 ? (
                    <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                      None of the available pharmacies have enough stock for{" "}
                      {requestedQuantity} unit
                      {requestedQuantity === 1 ? "" : "s"}.
                    </div>
                  ) : (
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                      The cheapest pharmacy with enough stock is highlighted
                      below.
                    </div>
                  )}

                  <div className="grid gap-5 md:grid-cols-2">
                    {pharmacies.map((pharmacy) => {
                      const price = Number(pharmacy.price);

                      const stockQuantity = Number(pharmacy.quantity);

                      const medicineCost = price * requestedQuantity;

                      const totalCost = medicineCost + transportationCost;

                      const enoughStock = stockQuantity >= requestedQuantity;

                      const isCheapest =
                        enoughStock &&
                        cheapestPrice !== null &&
                        price === cheapestPrice;

                      const stockStatus = getStockStatus(stockQuantity);

                      const StatusIcon = stockStatus.icon;

                      return (
                        <div
                          key={`${selectedMedicine.id}-${pharmacy.pharmacyId}`}
                          className={`relative rounded-2xl border bg-white p-6 shadow-sm transition ${
                            isCheapest
                              ? "border-slate-900 ring-2 ring-slate-200"
                              : "border-slate-200"
                          }`}
                        >
                          {/* Cheapest Badge */}
                          {isCheapest ? (
                            <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Best Price
                            </div>
                          ) : null}

                          {/* Pharmacy Header */}
                          <div className="pr-24">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                <MapPin className="h-5 w-5 text-slate-700" />
                              </div>

                              <div>
                                <h3 className="font-bold text-slate-900">
                                  {pharmacy.pharmacyName}
                                </h3>

                                <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                                  <span>{pharmacy.address}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 p-4">
                              <p className="text-xs text-slate-500">
                                Medicine cost
                              </p>

                              <p className="mt-1 text-xl font-bold text-slate-900">
                                {formatPrice(medicineCost)} ETB
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-900 p-4 text-white">
                              <p className="text-xs text-slate-300">
                                Estimated total
                              </p>

                              <p className="mt-1 text-xl font-bold">
                                {formatPrice(totalCost)} ETB
                              </p>
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                            <p className="mb-3 text-sm font-semibold text-slate-900">
                              Cost breakdown
                            </p>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Medicine</span>

                                <span className="font-medium text-slate-900">
                                  {formatPrice(medicineCost)} ETB
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">
                                  Transportation
                                </span>

                                <span className="font-medium text-slate-900">
                                  {formatPrice(transportationCost)} ETB
                                </span>
                              </div>

                              <div className="border-t border-slate-100 pt-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-900">
                                    Total
                                  </span>

                                  <span className="font-bold text-slate-900">
                                    {formatPrice(totalCost)} ETB
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Calculation */}
                          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-col gap-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">
                                  Medicine calculation
                                </span>

                                <span className="font-semibold text-slate-900">
                                  {formatPrice(price)} × {requestedQuantity}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">
                                  Transport calculation
                                </span>

                                <span className="font-semibold text-slate-900">
                                  {formatPrice(distanceValue)} km ×{" "}
                                  {formatPrice(transportationRate)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stock */}
                          <div className="mt-5 flex flex-wrap items-center gap-3">
                            <span
                              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${stockStatus.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />

                              {stockStatus.label}
                            </span>

                            <span
                              className={`text-sm ${
                                enoughStock
                                  ? "text-slate-500"
                                  : "font-medium text-red-600"
                              }`}
                            >
                              {enoughStock
                                ? `${stockQuantity} unit${
                                    stockQuantity === 1 ? "" : "s"
                                  } in stock`
                                : `Only ${stockQuantity} unit${
                                    stockQuantity === 1 ? "" : "s"
                                  } available`}
                            </span>
                          </div>

                          {/* Insufficient Stock */}
                          {!enoughStock ? (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                              This pharmacy does not have enough stock for your
                              requested quantity.
                            </div>
                          ) : null}

                          {/* Pharmacy Location */}
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
                              {pharmacy.row ? ` • Row ${pharmacy.row}` : ""}
                            </div>
                          ) : null}

                          {/* Phone */}
                          {pharmacy.phone ? (
                            <div className="mt-5 border-t border-slate-100 pt-4">
                              <a
                                href={`tel:${pharmacy.phone}`}
                                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                              >
                                <Phone className="h-4 w-4 text-slate-400" />

                                <span>{pharmacy.phone}</span>
                              </a>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Estimation Explanation */}
            {eligiblePharmacies.length > 0 ? (
              <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <Calculator className="h-5 w-5 text-slate-700" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      How the estimate works
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      The medicine cost is calculated by multiplying the
                      pharmacy&apos;s current price per unit by the quantity
                      requested. The transportation estimate is calculated by
                      multiplying your distance by the administrator&apos;s
                      current rate for your selected transportation type. The
                      final estimated total combines both costs.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Initial State */}
        {!searched && !selectedMedicine ? (
          <div>
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                SmartPharma
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Know your estimated medicine cost before you visit.
              </h2>

              <p className="mt-3 text-slate-600">
                Search for a medicine, enter your required quantity, add your
                travel distance and transportation type, and estimate the
                overall cost.
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
                  Search for a medicine by name or generic name.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Calculator className="h-5 w-5 text-slate-700" />
                </div>

                <h3 className="mt-5 font-semibold text-slate-900">
                  Enter Quantity
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter how many units you need to estimate the medicine cost.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>

                <h3 className="mt-5 font-semibold text-slate-900">
                  Add Transportation
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your distance and transportation type to estimate your
                  travel cost.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
            SmartPharma. All rights reserved.
          </p>

          <div className="flex gap-5">
            <NextLink href="/" className="hover:text-slate-900">
              Home
            </NextLink>

            <NextLink href="/find-medicine" className="hover:text-slate-900">
              Find Medicine
            </NextLink>

            <NextLink href="/pharmacies" className="hover:text-slate-900">
              Pharmacies
            </NextLink>
          </div>
        </div>
      </footer>
    </main>
  );
}
