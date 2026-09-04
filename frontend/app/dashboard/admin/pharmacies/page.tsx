"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

type PharmacyUser = {
  id: number;
  name: string;
  email: string;
  role: string;
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
  tinNumber?: string | null;

  businessRegistration?: string | null;
  businessLicense?: string | null;
  pharmacyLicense?: string | null;
  pharmacyPhoto?: string | null;

  ownerIdNumber?: string | null;
  ownerIdDocument?: string | null;

  verificationStatus: VerificationStatus;
  verificationReason?: string | null;

  createdAt: string;

  users?: PharmacyUser[];
};

type DocumentType =
  | "business-registration"
  | "business-license"
  | "pharmacy-license"
  | "pharmacy-photo"
  | "owner-id";

type ApiErrorResponse = {
  message?: string | string[];
};

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionId, setActionId] = useState<number | null>(null);

  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const [reason, setReason] = useState("");

  const [openingDocument, setOpeningDocument] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPendingPharmacies() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          throw new Error("Administrator authentication is required.");
        }

        const response = await fetch(`${API_URL}/pharmacies/pending`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, "Unable to load pending pharmacies."),
          );
        }

        if (cancelled) {
          return;
        }

        if (Array.isArray(data)) {
          setPharmacies(data as Pharmacy[]);
        } else {
          setPharmacies([]);
        }

        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load pending pharmacies.",
        );

        setLoading(false);
      }
    }

    void loadPendingPharmacies();

    return () => {
      cancelled = true;
    };
  }, []);

  async function approvePharmacy(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to approve this pharmacy?",
    );

    if (!confirmed) {
      return;
    }

    setActionId(id);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Administrator authentication is required.");
      }

      const response = await fetch(`${API_URL}/pharmacies/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Unable to approve pharmacy."));
      }

      setPharmacies((current) =>
        current.filter((pharmacy) => pharmacy.id !== id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to approve pharmacy.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function rejectPharmacy(id: number) {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Please provide a rejection reason.");
      return;
    }

    setActionId(id);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Administrator authentication is required.");
      }

      const response = await fetch(`${API_URL}/pharmacies/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: trimmedReason,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Unable to reject pharmacy."));
      }

      setPharmacies((current) =>
        current.filter((pharmacy) => pharmacy.id !== id),
      );

      setRejectingId(null);
      setReason("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reject pharmacy.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function viewDocument(pharmacyId: number, documentType: DocumentType) {
    const documentKey = `${pharmacyId}-${documentType}`;

    setOpeningDocument(documentKey);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Administrator authentication is required.");
      }

      const response = await fetch(
        `${API_URL}/admin/documents/${pharmacyId}/${documentType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const data = await readResponse(response);

        throw new Error(getErrorMessage(data, "Unable to open document."));
      }

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const newWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");

      if (!newWindow) {
        URL.revokeObjectURL(blobUrl);

        throw new Error(
          "The browser blocked the document window. Please allow pop-ups and try again.",
        );
      }

      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open document.");
    } finally {
      setOpeningDocument(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              SP
            </div>

            <div>
              <p className="font-bold text-slate-900">SmartPharma</p>

              <p className="text-xs text-slate-500">Administration</p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Pharmacy Verification
              </h1>

              <p className="mt-1 text-slate-500">
                Review pharmacy registration requests before they become visible
                to patients.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading pending pharmacies...
            </div>
          </div>
        )}

        {!loading && pharmacies.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No pending pharmacies
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              All pharmacy registration requests have been reviewed.
            </p>
          </div>
        )}

        {!loading && pharmacies.length > 0 && (
          <div className="space-y-6">
            {pharmacies.map((pharmacy) => {
              const owner = pharmacy.users?.find(
                (user) => user.role === "PHARMACY_OWNER",
              );

              const isActing = actionId === pharmacy.id;

              return (
                <article
                  key={pharmacy.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-slate-900">
                            {pharmacy.name}
                          </h2>

                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                            {pharmacy.verificationStatus}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {pharmacy.address}
                          </span>

                          {pharmacy.phone && (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-4 w-4" />
                              {pharmacy.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-medium text-slate-500">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatDate(pharmacy.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 p-6 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 p-5">
                      <h3 className="font-bold text-slate-900">
                        Business information
                      </h3>

                      <div className="mt-4 space-y-4">
                        <Info
                          label="TIN"
                          value={pharmacy.tinNumber || "Not provided"}
                        />

                        <Info
                          label="Pharmacy email"
                          value={pharmacy.email || "Not provided"}
                        />

                        <Info
                          label="Opening hours"
                          value={pharmacy.openingHours || "Not provided"}
                        />

                        <Info
                          label="Coordinates"
                          value={
                            pharmacy.latitude !== null &&
                            pharmacy.latitude !== undefined &&
                            pharmacy.longitude !== null &&
                            pharmacy.longitude !== undefined
                              ? `${pharmacy.latitude}, ${pharmacy.longitude}`
                              : "Not provided"
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-5">
                      <h3 className="font-bold text-slate-900">
                        Owner identity
                      </h3>

                      <div className="mt-4 space-y-4">
                        <Info
                          label="Owner"
                          value={owner?.name || "Not provided"}
                        />

                        <Info
                          label="Email"
                          value={owner?.email || "Not provided"}
                        />

                        <Info
                          label="ID number"
                          value={
                            pharmacy.ownerIdNumber
                              ? maskId(pharmacy.ownerIdNumber)
                              : "Not provided"
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-5">
                      <h3 className="font-bold text-slate-900">
                        Submitted documents
                      </h3>

                      <div className="mt-4 space-y-2">
                        <DocumentStatus
                          label="Business registration"
                          documentType="business-registration"
                          filename={pharmacy.businessRegistration}
                          openingDocument={openingDocument}
                          pharmacyId={pharmacy.id}
                          onView={viewDocument}
                        />

                        <DocumentStatus
                          label="Business license"
                          documentType="business-license"
                          filename={pharmacy.businessLicense}
                          openingDocument={openingDocument}
                          pharmacyId={pharmacy.id}
                          onView={viewDocument}
                        />

                        <DocumentStatus
                          label="Pharmacy license"
                          documentType="pharmacy-license"
                          filename={pharmacy.pharmacyLicense}
                          openingDocument={openingDocument}
                          pharmacyId={pharmacy.id}
                          onView={viewDocument}
                        />

                        <DocumentStatus
                          label="Pharmacy photo"
                          documentType="pharmacy-photo"
                          filename={pharmacy.pharmacyPhoto}
                          openingDocument={openingDocument}
                          pharmacyId={pharmacy.id}
                          onView={viewDocument}
                        />

                        <DocumentStatus
                          label="Owner ID document"
                          documentType="owner-id"
                          filename={pharmacy.ownerIdDocument}
                          openingDocument={openingDocument}
                          pharmacyId={pharmacy.id}
                          onView={viewDocument}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 px-6 py-5">
                    {rejectingId === pharmacy.id ? (
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Rejection reason
                        </label>

                        <textarea
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          placeholder="Explain why this pharmacy registration is being rejected..."
                          rows={3}
                          disabled={isActing}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => rejectPharmacy(pharmacy.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isActing && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Confirm rejection
                          </button>

                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => {
                              setRejectingId(null);

                              setReason("");

                              setError("");
                            }}
                            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => {
                            setRejectingId(pharmacy.id);

                            setReason("");

                            setError("");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>

                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => approvePharmacy(pharmacy.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isActing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Approve pharmacy
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DocumentStatus({
  label,
  documentType,
  filename,
  openingDocument,
  pharmacyId,
  onView,
}: {
  label: string;
  documentType: DocumentType;
  filename?: string | null;
  openingDocument: string | null;
  pharmacyId: number;
  onView: (pharmacyId: number, documentType: DocumentType) => void;
}) {
  const uploaded = Boolean(filename);

  const documentKey = `${pharmacyId}-${documentType}`;

  const opening = openingDocument === documentKey;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
      <span className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
        <FileText className="h-4 w-4 shrink-0" />

        <span className="truncate">{label}</span>
      </span>

      {uploaded ? (
        <button
          type="button"
          disabled={opening}
          onClick={() => onView(pharmacyId, documentType)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-blue-600 ring-1 ring-slate-200 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {opening ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          View
        </button>
      ) : (
        <span className="shrink-0 text-xs font-bold text-red-500">Missing</span>
      )}
    </div>
  );
}

function maskId(value: string): string {
  if (value.length <= 4) {
    return "••••";
  }

  return `${"•".repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString();
}

async function readResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    const message = (data as ApiErrorResponse).message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return fallback;
}
