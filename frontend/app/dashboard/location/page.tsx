"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { getPharmacyId } from "@/lib/auth";
import { CheckCircle2, Loader2, MapPin, Navigation } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type LocationData = {
  latitude: number;
  longitude: number;
};

export default function LocationPage() {
  const [location, setLocation] = useState<LocationData | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const saveLocation = async (
    pharmacyId: number,
    newLocation: LocationData,
  ) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/pharmacies/${pharmacyId}/location`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message || "Failed to save pharmacy location.",
        );
      }

      setMessage("Your pharmacy location was detected and saved successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save pharmacy location.",
      );
    } finally {
      setSaving(false);
    }
  };

  const getLocation = () => {
    const pharmacyId = getPharmacyId();

    if (!pharmacyId) {
      setError(
        "Your pharmacy account could not be identified. Please log in again.",
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(newLocation);
        setLoading(false);

        await saveLocation(pharmacyId, newLocation);
      },
      (locationError) => {
        console.error(locationError);

        setError(
          "Unable to detect your location. Please allow location access in your browser.",
        );

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardNavbar />

      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <MapPin className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Pharmacy Location
              </h1>

              <p className="mt-1 text-slate-500">
                Set the exact location patients will use to find your pharmacy.
              </p>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Current Pharmacy Location
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Stand at your pharmacy and use the button below to capture its
              exact GPS coordinates.
            </p>
          </div>

          {/* Detect and Save */}
          <button
            type="button"
            onClick={getLocation}
            disabled={loading || saving}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading || saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}

            {loading
              ? "Detecting location..."
              : saving
                ? "Saving location..."
                : "Detect & Save Location"}
          </button>

          {/* Success */}
          {message && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <p className="text-sm font-medium text-emerald-700">{message}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Coordinates */}
          {location && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Latitude</p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {location.latitude.toFixed(6)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Longitude</p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        {location && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-900">
                Pharmacy Map Location
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Verify that the detected location is correct.
              </p>
            </div>

            <div className="p-5">
              <a
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
              </a>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">
            Why your location matters
          </h2>

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>
              Patients searching for medicine will be able to see your pharmacy
              address and location.
            </p>

            <p>
              Your coordinates also allow patients to open your pharmacy
              location in Google Maps.
            </p>

            <p>
              For the most accurate result, use this feature while physically at
              your pharmacy.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
