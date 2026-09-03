"use client";

import { useState } from "react";
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

export default function FindMedicinePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await searchMedicines(query);

      setResults(data);
    } catch (err) {
      console.error(err);
      setError("Unable to search medicines. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">

        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Find Medicine
          </h1>

          <p className="mt-3 text-muted-foreground">
            Search for medicine availability and prices at nearby pharmacies.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search medicine..."
            className="flex-1 rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-destructive p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="mt-10 space-y-6">
          {results.map((medicine) => (
            <div
              key={medicine.id}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div>
                <h2 className="text-2xl font-semibold">
                  {medicine.name}
                </h2>

                {medicine.genericName && (
                  <p className="text-muted-foreground">
                    Generic: {medicine.genericName}
                  </p>
                )}

                {medicine.category && (
                  <p className="text-sm text-muted-foreground">
                    Category: {medicine.category}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {medicine.pharmacies.length === 0 ? (
                  <p className="text-muted-foreground">
                    No pharmacy currently has this medicine listed.
                  </p>
                ) : (
                  medicine.pharmacies.map((pharmacy) => (
                    <div
                      key={pharmacy.pharmacyId}
                      className="rounded-lg border p-5"
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {pharmacy.pharmacyName}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            📍 {pharmacy.address}
                          </p>

                          {pharmacy.phone && (
                            <p className="text-sm text-muted-foreground">
                              ☎ {pharmacy.phone}
                            </p>
                          )}
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-xl font-bold">
                            {pharmacy.price}
                          </p>

                          <p className="text-sm">
                            Quantity: {pharmacy.quantity}
                          </p>

                          <p className="text-sm font-medium">
                            {pharmacy.stockStatus.replaceAll("_", " ")}
                          </p>
                        </div>
                      </div>

                      {(pharmacy.section ||
                        pharmacy.shelf ||
                        pharmacy.row) && (
                        <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                          <strong>Medicine location:</strong>{" "}
                          {pharmacy.section &&
                            `Section ${pharmacy.section} `}
                          {pharmacy.shelf &&
                            `• Shelf ${pharmacy.shelf} `}
                          {pharmacy.row &&
                            `• Row ${pharmacy.row}`}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

          {!loading &&
            query &&
            results.length === 0 &&
            !error && (
              <div className="text-center text-muted-foreground">
                No medicines found.
              </div>
            )}
        </div>
      </div>
    </main>
  );
}