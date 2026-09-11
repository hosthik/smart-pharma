"use client";

import { useEffect, useMemo, useState } from "react";
import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";
import { getPharmacyId } from "@/lib/auth";

type LocationData = {
  address: string;
  phone: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  openingHours: string;
};

type SearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  category?: string;
};

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const possibleKeys = [
    "token",
    "authToken",
    "accessToken",
    "smartpharma_token",
    "smartpharmaToken",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission was denied. Allow location access in your browser and try again.";

    case error.POSITION_UNAVAILABLE:
      return "Your device could not determine its location. You can search for your pharmacy manually instead.";

    case error.TIMEOUT:
      return "Location detection timed out. Please try again.";

    default:
      return "Unable to detect your current location.";
  }
}

export default function LocationPage() {
  const pharmacyId = getPharmacyId();

  const [location, setLocation] = useState<LocationData>({
    address: "",
    phone: "",
    email: "",
    latitude: null,
    longitude: null,
    openingHours: "",
  });

  const [searchQuery, setSearchQuery] = useState("Bale Robe, Oromia, Ethiopia");

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [searching, setSearching] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadLocation() {
      if (!pharmacyId) {
        setError("Pharmacy information is unavailable.");
        setLoading(false);
        return;
      }

      const token = getAuthToken();

      if (!token) {
        setError("Authentication token is required. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setError("");

        const response = await fetch(
          `http://127.0.0.1:4000/pharmacies/${pharmacyId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            Array.isArray(data?.message)
              ? data.message.join(", ")
              : data?.message || "Failed to load pharmacy location.",
          );
        }

        setLocation({
          address: data.address ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          latitude:
            data.latitude === null || data.latitude === undefined
              ? null
              : Number(data.latitude),
          longitude:
            data.longitude === null || data.longitude === undefined
              ? null
              : Number(data.longitude),
          openingHours: data.openingHours ?? "",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load pharmacy location.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadLocation();
  }, [pharmacyId]);

  async function searchPlaces() {
    const query = searchQuery.trim();

    if (!query) {
      setError("Enter a place to search.");
      return;
    }

    try {
      setSearching(true);
      setError("");
      setSuccess("");
      setSearchResults([]);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1&q=${encodeURIComponent(
          query,
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Location search service is currently unavailable.");
      }

      const data = (await response.json()) as SearchResult[];

      if (!Array.isArray(data) || data.length === 0) {
        setError(
          `No locations were found for "${query}". Try "Bale Robe, Oromia, Ethiopia".`,
        );
        return;
      }

      setSearchResults(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to search for the location.",
      );
    } finally {
      setSearching(false);
    }
  }

  function selectSearchResult(result: SearchResult) {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("The selected location returned invalid coordinates.");
      return;
    }

    setLocation((current) => ({
      ...current,
      latitude,
      longitude,
      address: current.address.trim() || result.display_name,
    }));

    setSearchQuery(result.display_name);
    setSearchResults([]);
    setError("");

    setSuccess("Location selected. Review the map and address, then save.");
  }

  async function detectLocation() {
    setError("");
    setSuccess("");

    if (!navigator.geolocation) {
      setError(
        "Location detection is not supported by this browser. Use the location search instead.",
      );
      return;
    }

    try {
      setDetecting(true);

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0,
          });
        },
      );

      const latitude = Number(position.coords.latitude.toFixed(6));

      const longitude = Number(position.coords.longitude.toFixed(6));

      setLocation((current) => ({
        ...current,
        latitude,
        longitude,
      }));

      setSuccess(
        "Device location detected. Please confirm the marker on the map before saving.",
      );
    } catch (err) {
      if (typeof err === "object" && err !== null && "code" in err) {
        setError(getGeolocationErrorMessage(err as GeolocationPositionError));
      } else {
        setError("Unable to detect your current location.");
      }
    } finally {
      setDetecting(false);
    }
  }

  async function saveLocation() {
    if (!pharmacyId) {
      setError("Pharmacy information is unavailable.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setError("Authentication token is required. Please log in again.");
      return;
    }

    if (location.latitude === null || location.longitude === null) {
      setError(
        "Please search for and select the correct pharmacy location before saving.",
      );
      return;
    }

    if (
      !Number.isFinite(location.latitude) ||
      !Number.isFinite(location.longitude)
    ) {
      setError("Latitude and longitude must be valid numbers.");
      return;
    }

    if (location.latitude < -90 || location.latitude > 90) {
      setError("Latitude must be between -90 and 90.");
      return;
    }

    if (location.longitude < -180 || location.longitude > 180) {
      setError("Longitude must be between -180 and 180.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://127.0.0.1:4000/pharmacies/${pharmacyId}/location`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: location.address,
            phone: location.phone,
            email: location.email,
            latitude: location.latitude,
            longitude: location.longitude,
            openingHours: location.openingHours,
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

      setSuccess("Pharmacy location updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save pharmacy location.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof LocationData, value: string) {
    setLocation((current) => ({
      ...current,
      [field]:
        field === "latitude" || field === "longitude"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  }

  const mapUrl = useMemo(() => {
    if (location.latitude === null || location.longitude === null) {
      return null;
    }

    const latitude = location.latitude;
    const longitude = location.longitude;

    const offset = 0.02;

    const minLongitude = longitude - offset;
    const minLatitude = latitude - offset;
    const maxLongitude = longitude + offset;
    const maxLatitude = latitude + offset;

    return (
      "https://www.openstreetmap.org/export/embed.html?" +
      `bbox=${encodeURIComponent(
        `${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}`,
      )}` +
      "&layer=mapnik" +
      `&marker=${encodeURIComponent(`${latitude},${longitude}`)}`
    );
  }, [location.latitude, location.longitude]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        {" "}
        <PharmacyNavigation activePath="/dashboard/location" />
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading pharmacy location...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {" "}
      <PharmacyNavigation activePath="/dashboard/location" />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Pharmacy
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-950">
            Location & Contact
          </h1>

          <p className="mt-2 text-slate-600">
            Set your exact pharmacy location, contact details, and opening
            hours.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-5">
                <h2 className="font-serif text-xl font-semibold text-slate-950">
                  Find Pharmacy Location
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search for your city, town, street, or pharmacy area and
                  select the correct result.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void searchPlaces();
                    }
                  }}
                  placeholder="Bale Robe, Oromia, Ethiopia"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
                />

                <button
                  type="button"
                  onClick={() => void searchPlaces()}
                  disabled={searching}
                  className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Select a location
                  </p>

                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() => selectSearchResult(result)}
                      className="block w-full rounded-lg border border-slate-200 bg-white p-4 text-left hover:border-slate-950 hover:bg-slate-50"
                    >
                      <p className="text-sm font-medium text-slate-950">
                        {result.display_name}
                      </p>

                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {Number(result.lat).toFixed(6)},{" "}
                        {Number(result.lon).toFixed(6)}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 border-t border-slate-200 pt-5">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Or use your device location
                </p>

                <button
                  type="button"
                  onClick={() => void detectLocation()}
                  disabled={detecting || saving}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {detecting ? "Detecting..." : "Detect My Location"}
                </button>
              </div>
            </div>

            {location.latitude !== null && location.longitude !== null ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Selected Coordinates
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">Latitude</p>

                    <p className="mt-1 font-mono text-sm font-medium text-slate-950">
                      {location.latitude}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Longitude</p>

                    <p className="mt-1 font-mono text-sm font-medium text-slate-950">
                      {location.longitude}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Pharmacy address
                </label>

                <textarea
                  id="address"
                  value={location.address}
                  onChange={(event) =>
                    handleChange("address", event.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-slate-950"
                  placeholder="Bale Robe, Oromia, Ethiopia"
                />

                <p className="mt-1 text-xs text-slate-500">
                  This address is controlled by you and will not be overwritten
                  by GPS detection.
                </p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={location.phone}
                  onChange={(event) =>
                    handleChange("phone", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={location.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950"
                  placeholder="pharmacy@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="latitude"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Latitude
                </label>

                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={location.latitude ?? ""}
                  onChange={(event) =>
                    handleChange("latitude", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label
                  htmlFor="longitude"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Longitude
                </label>

                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={location.longitude ?? ""}
                  onChange={(event) =>
                    handleChange("longitude", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="opening-hours"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Opening hours
                </label>

                <input
                  id="opening-hours"
                  type="text"
                  value={location.openingHours}
                  onChange={(event) =>
                    handleChange("openingHours", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950"
                  placeholder="Monday - Saturday, 8:00 AM - 8:00 PM"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={() => void saveLocation()}
                disabled={saving || detecting || searching}
                className="rounded-lg bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Location"}
              </button>
            </div>
          </section>

          <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 px-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Map Preview
              </p>

              <h2 className="mt-1 font-serif text-xl font-semibold text-slate-950">
                Confirm Pharmacy Position
              </h2>
            </div>

            {mapUrl ? (
              <>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <iframe
                    title="SmartPharma pharmacy location"
                    src={mapUrl}
                    className="h-[480px] w-full"
                    loading="lazy"
                  />
                </div>

                <div className="mt-4 px-2">
                  <p className="text-xs text-slate-500">
                    Confirm that the marker is on or near your actual pharmacy
                    before saving.
                  </p>

                  <a
                    href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=18/${location.latitude}/${location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-slate-950 underline underline-offset-4 hover:text-slate-600"
                  >
                    Open full map
                  </a>
                </div>
              </>
            ) : (
              <div className="flex min-h-[480px] items-center justify-center rounded-xl bg-slate-50 px-6 text-center">
                <div>
                  <p className="font-medium text-slate-950">
                    No pharmacy location selected
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Search for Bale Robe or another location and select the
                    correct result.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
