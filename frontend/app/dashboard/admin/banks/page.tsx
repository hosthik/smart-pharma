"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Landmark,
  Loader2,
  Pencil,
  Plus,
  Power,
  Trash2,
  X,
} from "lucide-react";

import AdminNavigation from "@/components/admin/AdminNavigation";
import { getToken } from "@/lib/auth";

const API_URL = "http://localhost:4000";

type BankAccount = {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string | null;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type BankForm = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  instructions: string;
  isActive: boolean;
};

const emptyForm: BankForm = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  branch: "",
  instructions: "",
  isActive: true,
};

export default function AdminBanksPage() {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);

  const [form, setForm] = useState<BankForm>(emptyForm);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  function getHeaders(): HeadersInit {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  }

  function showSuccess(message: string) {
    setSuccess(message);
    setError("");

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  function showError(message: string) {
    setError(message);
    setSuccess("");
  }

  async function refreshBanks() {
    try {
      const response = await fetch(`${API_URL}/payments/admin/banks`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load bank accounts.");
      }

      setBanks(Array.isArray(data) ? data : []);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to load bank accounts.",
      );
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialBanks() {
      try {
        const response = await fetch(`${API_URL}/payments/admin/banks`, {
          method: "GET",
          headers: getHeaders(),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load bank accounts.");
        }

        if (!cancelled) {
          setBanks(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load bank accounts.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialBanks();

    return () => {
      cancelled = true;
    };
  }, []);

  function openAddModal() {
    setEditingBank(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(bank: BankAccount) {
    setEditingBank(bank);

    setForm({
      bankName: bank.bankName,
      accountName: bank.accountName,
      accountNumber: bank.accountNumber,
      branch: bank.branch || "",
      instructions: bank.instructions || "",
      isActive: bank.isActive,
    });

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingBank(null);
    setForm(emptyForm);
  }

  function updateForm(field: keyof BankForm, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.bankName.trim()) {
      showError("Bank name is required.");
      return;
    }

    if (!form.accountName.trim()) {
      showError("Account holder name is required.");
      return;
    }

    if (!form.accountNumber.trim()) {
      showError("Account number is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        bankName: form.bankName.trim(),
        accountName: form.accountName.trim(),
        accountNumber: form.accountNumber.trim(),
        branch: form.branch.trim() || undefined,
        instructions: form.instructions.trim() || undefined,
        isActive: form.isActive,
      };

      const url = editingBank
        ? `${API_URL}/payments/admin/banks/${editingBank.id}`
        : `${API_URL}/payments/admin/banks`;

      const response = await fetch(url, {
        method: editingBank ? "PATCH" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to ${editingBank ? "update" : "create"} bank account.`,
        );
      }

      await refreshBanks();

      closeModal();

      showSuccess(
        editingBank
          ? "Bank account updated successfully."
          : "Bank account added successfully.",
      );
    } catch (err) {
      showError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleBank(bank: BankAccount) {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/payments/admin/banks/${bank.id}`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            isActive: !bank.isActive,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to update bank account status.",
        );
      }

      await refreshBanks();

      showSuccess(
        bank.isActive ? "Bank account deactivated." : "Bank account activated.",
      );
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update bank account.",
      );
    }
  }

  async function deleteBank(bank: BankAccount) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${bank.bankName} (${bank.accountNumber})?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(bank.id);
      setError("");

      const response = await fetch(
        `${API_URL}/payments/admin/banks/${bank.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete bank account.");
      }

      await refreshBanks();

      showSuccess("Bank account deleted successfully.");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to delete bank account.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function copyAccountNumber(bank: BankAccount) {
    try {
      await navigator.clipboard.writeText(bank.accountNumber);

      setCopiedId(bank.id);

      window.setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch {
      showError("Could not copy account number.");
    }
  }

  const activeCount = banks.filter((bank) => bank.isActive).length;
  const inactiveCount = banks.length - activeCount;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Admin Navigation */}
      <AdminNavigation />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-white">
                <Landmark className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Bank Accounts
                </h1>

                <p className="text-sm text-slate-500">
                  Manage bank accounts used for subscription payments.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            <Plus className="h-4 w-4" />
            Add Bank Account
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">Total Accounts</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {banks.length}
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-medium text-green-700">
              Active Accounts
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {activeCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">
              Inactive Accounts
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-700">
              {inactiveCount}
            </p>
          </div>
        </div>

        {/* Accounts */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />

              <span className="text-sm font-medium">
                Loading bank accounts...
              </span>
            </div>
          </div>
        ) : banks.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Landmark className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No bank accounts
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Add a bank account so pharmacies can select it when making
              subscription payments.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              <Plus className="h-4 w-4" />
              Add Bank Account
            </button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {banks.map((bank) => (
              <div
                key={bank.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Card Header */}
                <div className="flex items-start gap-4 border-b border-slate-100 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Landmark className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-slate-900">
                      {bank.bankName}
                    </h2>

                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          bank.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            bank.isActive ? "bg-green-600" : "bg-slate-500"
                          }`}
                        />

                        {bank.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Account Holder
                    </p>

                    <p className="mt-1 font-medium text-slate-900">
                      {bank.accountName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Account Number
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <p className="font-mono text-base font-semibold text-slate-900">
                        {bank.accountNumber}
                      </p>

                      <button
                        type="button"
                        onClick={() => copyAccountNumber(bank)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        title="Copy account number"
                      >
                        {copiedId === bank.id ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {copiedId === bank.id && (
                      <p className="mt-1 text-xs font-medium text-green-600">
                        Account number copied.
                      </p>
                    )}
                  </div>

                  {bank.branch && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Branch
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {bank.branch}
                      </p>
                    </div>
                  )}

                  {bank.instructions && (
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Payment Instructions
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {bank.instructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50 p-4">
                  <button
                    type="button"
                    onClick={() => openEditModal(bank)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleBank(bank)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      bank.isActive
                        ? "border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                        : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    <Power className="h-4 w-4" />

                    {bank.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteBank(bank)}
                    disabled={deletingId === bank.id}
                    className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === bank.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingBank ? "Edit Bank Account" : "Add Bank Account"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingBank
                    ? "Update the bank account information."
                    : "Add a bank account for pharmacy payments."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Bank Name */}
                <div>
                  <label
                    htmlFor="bankName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Bank Name
                  </label>

                  <input
                    id="bankName"
                    type="text"
                    value={form.bankName}
                    onChange={(event) =>
                      updateForm("bankName", event.target.value)
                    }
                    placeholder="e.g. Commercial Bank"
                    maxLength={100}
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </div>

                {/* Account Holder */}
                <div>
                  <label
                    htmlFor="accountName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Account Holder Name
                  </label>

                  <input
                    id="accountName"
                    type="text"
                    value={form.accountName}
                    onChange={(event) =>
                      updateForm("accountName", event.target.value)
                    }
                    placeholder="e.g. SmartPharma"
                    maxLength={150}
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label
                    htmlFor="accountNumber"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Account Number
                  </label>

                  <input
                    id="accountNumber"
                    type="text"
                    value={form.accountNumber}
                    onChange={(event) =>
                      updateForm("accountNumber", event.target.value)
                    }
                    placeholder="Enter account number"
                    maxLength={100}
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition placeholder:font-sans placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </div>

                {/* Branch */}
                <div>
                  <label
                    htmlFor="branch"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Branch
                    <span className="ml-1 font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="branch"
                    type="text"
                    value={form.branch}
                    onChange={(event) =>
                      updateForm("branch", event.target.value)
                    }
                    placeholder="Enter branch"
                    maxLength={100}
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label
                  htmlFor="instructions"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Payment Instructions
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="instructions"
                  value={form.instructions}
                  onChange={(event) =>
                    updateForm("instructions", event.target.value)
                  }
                  placeholder="Example: Transfer the exact subscription amount and use your pharmacy name as the payment reference."
                  maxLength={1000}
                  rows={4}
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.instructions.length}/1000
                </p>
              </div>

              {/* Active */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateForm("isActive", event.target.checked)
                  }
                  disabled={saving}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Active bank account
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Active accounts are visible to pharmacies when they select a
                    bank for payment.
                  </span>
                </span>
              </label>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}

                  {editingBank ? "Save Changes" : "Add Bank Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
