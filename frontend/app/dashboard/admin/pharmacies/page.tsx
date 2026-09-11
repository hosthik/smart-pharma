"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import AdminNavigation from "@/components/admin/AdminNavigation";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

type Pharmacy = {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: string | null;
  tinNumber: string | null;
  businessRegistration: string | null;
  businessLicense: string | null;
  pharmacyLicense: string | null;
  pharmacyPhoto: string | null;
  ownerIdNumber: string | null;
  ownerIdDocument: string | null;
  verificationStatus: VerificationStatus;
  verificationReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function getDocumentUrl(value: string | null) {
  if (!value) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${API_URL}/${value.replace(/^\/+/, "")}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm text-slate-900">{value || "—"}</p>
    </div>
  );
}

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  async function loadPharmacies(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication is required.");
      }

      const response = await fetch(`${API_URL}/pharmacies/pending`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        throw new Error(body?.message || "Failed to load pending pharmacies.");
      }

      const data = (await response.json()) as Pharmacy[];

      setPharmacies(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load pending pharmacies.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      await loadPharmacies();
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleApprove(pharmacy: Pharmacy) {
    const confirmed = window.confirm(`Approve ${pharmacy.name}?`);

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication is required.");
      }

      const response = await fetch(
        `${API_URL}/pharmacies/${pharmacy.id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        throw new Error(body?.message || "Failed to approve pharmacy.");
      }

      setSelectedPharmacy(null);
      setRejectionReason("");

      await loadPharmacies(true);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to approve pharmacy.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(pharmacy: Pharmacy) {
    const reason = rejectionReason.trim();

    if (!reason) {
      setActionError("Please provide a rejection reason.");
      return;
    }

    const confirmed = window.confirm(`Reject ${pharmacy.name}?`);

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication is required.");
      }

      const response = await fetch(
        `${API_URL}/pharmacies/${pharmacy.id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason,
          }),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        throw new Error(body?.message || "Failed to reject pharmacy.");
      }

      setSelectedPharmacy(null);
      setRejectionReason("");

      await loadPharmacies(true);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to reject pharmacy.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      pharmacy.name.toLowerCase().includes(search) ||
      pharmacy.address.toLowerCase().includes(search) ||
      pharmacy.email?.toLowerCase().includes(search) ||
      pharmacy.phone?.toLowerCase().includes(search) ||
      pharmacy.tinNumber?.toLowerCase().includes(search)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNavigation activePath="/dashboard/admin/pharmacies" />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Building2 className="h-7 w-7" />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Administration
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Pharmacy Verification
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Review pharmacy registration information and approve or reject
                pending pharmacy accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadPharmacies(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {actionError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Pending Pharmacies
              </p>
              <Clock3 className="h-5 w-5 text-slate-500" />
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {pharmacies.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Showing</p>
              <Search className="h-5 w-5 text-slate-500" />
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {filteredPharmacies.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Status</p>
              <CheckCircle2 className="h-5 w-5 text-slate-500" />
            </div>

            <p className="mt-3 text-lg font-bold text-slate-900">
              Awaiting Review
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by pharmacy, address, email, phone, or TIN..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              <p className="mt-4 text-sm text-slate-500">
                Loading pharmacies...
              </p>
            </div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Building2 className="mx-auto h-10 w-10 text-slate-300" />

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No pending pharmacies
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                There are no pharmacies matching your current search.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Pharmacy
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Registration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Submitted
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredPharmacies.map((pharmacy) => (
                      <tr
                        key={pharmacy.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                              <Building2 className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {pharmacy.name}
                              </p>

                              <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                                {pharmacy.address}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-900">
                            {pharmacy.email || "No email"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {pharmacy.phone || "No phone"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-medium text-slate-900">
                            {pharmacy.tinNumber || "No TIN"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {pharmacy.businessRegistration ||
                              "No registration number"}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {formatDate(pharmacy.createdAt)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPharmacy(pharmacy);
                              setRejectionReason("");
                              setActionError("");
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm text-slate-500">SmartPharma Administration</p>
        </div>
      </footer>

      {selectedPharmacy && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4 sm:p-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pharmacy Review
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedPharmacy.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPharmacy(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close review"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-8 p-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Pharmacy Information
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <DetailItem
                    label="Pharmacy Name"
                    value={selectedPharmacy.name}
                  />

                  <DetailItem
                    label="Address"
                    value={selectedPharmacy.address}
                  />

                  <DetailItem label="Phone" value={selectedPharmacy.phone} />

                  <DetailItem label="Email" value={selectedPharmacy.email} />

                  <DetailItem
                    label="Opening Hours"
                    value={selectedPharmacy.openingHours}
                  />

                  <DetailItem
                    label="TIN Number"
                    value={selectedPharmacy.tinNumber}
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-sm font-semibold text-slate-900">
                  Registration Information
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <DetailItem
                    label="Business Registration"
                    value={selectedPharmacy.businessRegistration}
                  />

                  <DetailItem
                    label="Business License"
                    value={
                      selectedPharmacy.businessLicense
                        ? "Document available"
                        : "Not provided"
                    }
                  />

                  <DetailItem
                    label="Pharmacy License"
                    value={
                      selectedPharmacy.pharmacyLicense
                        ? "Document available"
                        : "Not provided"
                    }
                  />

                  <DetailItem
                    label="Owner ID Number"
                    value={selectedPharmacy.ownerIdNumber}
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-sm font-semibold text-slate-900">
                  Documents
                </h3>

                <div className="mt-4 flex flex-wrap gap-3">
                  {[
                    {
                      label: "Business License",
                      value: selectedPharmacy.businessLicense,
                    },
                    {
                      label: "Pharmacy License",
                      value: selectedPharmacy.pharmacyLicense,
                    },
                    {
                      label: "Owner ID Document",
                      value: selectedPharmacy.ownerIdDocument,
                    },
                    {
                      label: "Pharmacy Photo",
                      value: selectedPharmacy.pharmacyPhoto,
                    },
                  ].map((document) => {
                    const url = getDocumentUrl(document.value);

                    if (!url) {
                      return (
                        <span
                          key={document.label}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500"
                        >
                          <FileText className="h-4 w-4" />
                          {document.label}: Not provided
                        </span>
                      );
                    }

                    return (
                      <a
                        key={document.label}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <FileText className="h-4 w-4" />
                        View {document.label}
                      </a>
                    );
                  })}
                </div>
              </div>

              {selectedPharmacy.latitude !== null &&
                selectedPharmacy.longitude !== null && (
                  <div className="border-t border-slate-200 pt-8">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Location
                    </h3>

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                      <MapPin className="h-5 w-5 text-slate-600" />

                      <p className="text-sm text-slate-700">
                        Latitude: {selectedPharmacy.latitude}, Longitude:{" "}
                        {selectedPharmacy.longitude}
                      </p>
                    </div>
                  </div>
                )}

              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-sm font-semibold text-slate-900">
                  Reject Pharmacy
                </h3>

                <textarea
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  rows={4}
                  placeholder="Enter a clear reason if this pharmacy should be rejected..."
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedPharmacy(null)}
                disabled={actionLoading}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleReject(selectedPharmacy)}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>

              <button
                type="button"
                onClick={() => void handleApprove(selectedPharmacy)}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
