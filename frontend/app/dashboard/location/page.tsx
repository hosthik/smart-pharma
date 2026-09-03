"use client";

import { useState } from "react";

type LocationData = {
  latitude: number;
  longitude: number;
};

export default function LocationPage() {
  const [location, setLocation] = useState<LocationData | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getLocation = () => {
    setLoading(true);
    setMessage("");
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(newLocation);
        setMessage("Your pharmacy location was detected successfully.");
        setLoading(false);
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
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Pharmacy Location</h1>

          <p className="mt-2 text-muted-foreground">
            Automatically detect your pharmacy location using your device.
          </p>
        </div>

        {/* Location Card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Current Location</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Click the button below to automatically detect your current
              location.
            </p>
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={getLocation}
            disabled={loading}
            className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Detecting location..." : "Detect My Location"}
          </button>

          {/* Success */}
          {message && (
            <div className="mt-6 rounded-lg border p-4">
              <p className="font-medium">{message}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Coordinates */}
          {location && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-5">
                <p className="text-sm text-muted-foreground">Latitude</p>

                <p className="mt-2 text-xl font-semibold">
                  {location.latitude.toFixed(6)}
                </p>
              </div>

              <div className="rounded-lg border p-5">
                <p className="text-sm text-muted-foreground">Longitude</p>

                <p className="mt-2 text-xl font-semibold">
                  {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        {location && (
          <div className="mt-6 overflow-hidden rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="text-xl font-semibold">Location Map</h2>
            </div>

            <div className="p-5">
              <a
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md border px-5 py-2.5 font-medium hover:bg-muted"
              >
                Open Location in Google Maps
              </a>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-6 rounded-xl border p-5">
          <h2 className="font-semibold">How location detection works</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            SmartPharma uses your browser&apos;s location permission to
            determine the pharmacy&apos;s current latitude and longitude.
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Make sure location access is enabled when your browser asks for
            permission.
          </p>
        </div>
      </div>
    </main>
  );
}
