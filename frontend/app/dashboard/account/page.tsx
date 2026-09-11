"use client";

import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";

import { FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";
import { getPharmacyId, getToken, logout } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type PharmacyAccount = {
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
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  verificationReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [account, setAccount] = useState<PharmacyAccount | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // =========================
  // Load account
  // =========================

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        const token = getToken();
        const pharmacyId = getPharmacyId();

        if (!token || !pharmacyId) {
          router.push("/pharmacy/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/pharmacies/${pharmacyId}/account`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            router.push("/pharmacy/login");
            return;
          }

          throw new Error("Failed to load pharmacy account.");
        }

        const data = (await response.json()) as PharmacyAccount;

        if (cancelled) return;

        setAccount(data);
        setName(data.name || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setOpeningHours(data.openingHours || "");
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load pharmacy account.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // =========================
  // Save account
  // =========================

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token = getToken();
      const pharmacyId = getPharmacyId();

      if (!token || !pharmacyId) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/pharmacies/${pharmacyId}/account`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            address,
            phone,
            email,
            openingHours,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update pharmacy account.");
      }

      setAccount(data);
      setName(data.name || "");
      setAddress(data.address || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setOpeningHours(data.openingHours || "");

      setSuccess("Pharmacy account information updated successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update pharmacy account.",
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // Logout
  // =========================

  function handleLogout() {
    logout();
    router.push("/pharmacy/login");
  }

  // =========================
  // Delete account
  // =========================

  async function handleDeleteAccount() {
    setError("");
    setSuccess("");
    setDeleting(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(`${API_URL}/pharmacies/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete pharmacy account.");
      }

      logout();
      router.push("/pharmacy/login");
    } catch (deleteError) {
      setDeleting(false);
      setShowDeleteConfirm(false);

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete pharmacy account.",
      );
    }
  }

  // =========================
  // Loading state
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <PharmacyNavigation activePath="/dashboard/account" />

        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

            <p className="mt-4 text-sm text-slate-500">
              Loading account information...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PharmacyNavigation activePath="/dashboard/account" />

      {/* Hero */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <UserRound className="h-7 w-7" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Pharmacy Account
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Account Settings
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Manage your pharmacy information, verification details, and account
            access.
          </p>
        </div>
      </section>

      {/* Main content */}

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="space-y-8">
          {/* Error */}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {/* Pharmacy information */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Pharmacy Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update the information displayed for your pharmacy.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="mt-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Pharmacy Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Address
                </label>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="openingHours"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Opening Hours
                  </label>

                  <input
                    id="openingHours"
                    type="text"
                    value={openingHours}
                    onChange={(event) => setOpeningHours(event.target.value)}
                    placeholder="Example: Mon-Sat, 8:00 AM - 8:00 PM"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Verification */}

          {account && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Verification Status
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current verification status of your pharmacy.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                {account.verificationStatus === "APPROVED" && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="font-semibold text-slate-900">
                        Pharmacy Approved
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Your pharmacy has been verified and approved.
                      </p>

                      {account.verifiedAt && (
                        <p className="mt-2 text-xs text-slate-500">
                          Verified on{" "}
                          {new Date(account.verifiedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {account.verificationStatus === "PENDING" && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                    <div>
                      <p className="font-semibold text-slate-900">
                        Verification Pending
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Your pharmacy information is currently being reviewed.
                      </p>
                    </div>
                  </div>
                )}

                {account.verificationStatus === "REJECTED" && (
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <div>
                      <p className="font-semibold text-slate-900">
                        Verification Rejected
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Your pharmacy verification was rejected.
                      </p>

                      {account.verificationReason && (
                        <p className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                          {account.verificationReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registration information */}

          {account && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Registration Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Pharmacy registration and licensing information.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="TIN Number" value={account.tinNumber} />

                <InfoItem
                  label="Business Registration"
                  value={account.businessRegistration}
                />

                <InfoItem
                  label="Business License"
                  value={account.businessLicense}
                />

                <InfoItem
                  label="Pharmacy License"
                  value={account.pharmacyLicense}
                />

                <InfoItem
                  label="Owner ID Number"
                  value={account.ownerIdNumber}
                />

                <InfoItem
                  label="Account Created"
                  value={
                    account.createdAt
                      ? new Date(account.createdAt).toLocaleDateString()
                      : null
                  }
                />
              </div>
            </div>
          )}

          {/* Location */}

          {account && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Location
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current saved coordinates for your pharmacy.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Latitude"
                  value={
                    account.latitude !== null ? String(account.latitude) : null
                  }
                />

                <InfoItem
                  label="Longitude"
                  value={
                    account.longitude !== null
                      ? String(account.longitude)
                      : null
                  }
                />
              </div>
            </div>
          )}

          {/* Session */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <LogOut className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900">
                  Session
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Sign out of your SmartPharma pharmacy account on this device.
                </p>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}

          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-700">
                  Danger Zone
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Deleting your pharmacy account is permanent. Your pharmacy
                  profile, users, inventory, subscription, and payment records
                  will be removed.
                </p>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Pharmacy Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delete confirmation */}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Delete pharmacy account?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              This action cannot be undone. Your pharmacy account and its
              associated data will be permanently deleted.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />

                {deleting ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-slate-500">
            SmartPharma Pharmacy Management
          </p>
        </div>
      </footer>
    </main>
  );
}

// =========================
// Reusable information item
// =========================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}
