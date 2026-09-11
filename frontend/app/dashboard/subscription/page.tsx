"use client";

import Link from "next/link";
import {
  Check,
  CircleAlert,
  Clipboard,
  ClipboardCheck,
  CreditCard,
  FileImage,
  Loader2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";
import { getCurrentUser, getPharmacyId, getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type PlanId =
  | "BASIC"
  | "ONE_WEEK"
  | "ONE_MONTH"
  | "6_MONTHS"
  | "1_YEAR"
  | "LIFETIME";

type BackendPlan =
  | "BASIC"
  | "ONE_WEEK"
  | "ONE_MONTH"
  | "STANDARD"
  | "PROFESSIONAL"
  | "ENTERPRISE";

type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";

type Subscription = {
  id: number;
  pharmacyId: number;
  plan: BackendPlan;
  status: SubscriptionStatus;
  startDate: string | null;
  renewalDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type BankAccount = {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string | null;
  instructions?: string | null;
};

type Plan = {
  id: PlanId;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
};

/*
 * =========================================================
 * SUBSCRIPTION PLANS
 * =========================================================
 */

const plans: Plan[] = [
  {
    id: "BASIC",
    name: "Basic",
    price: 0,
    duration: "Free",
    description: "Essential tools for getting started.",
    features: [
      "Medicine inventory management",
      "Basic pharmacy dashboard",
      "Medicine search",
      "Basic pharmacy management",
    ],
  },

  {
    id: "ONE_WEEK",
    name: "1 Week",
    price: 1000,
    duration: "7 days",
    description: "Short-term access for pharmacies.",
    features: [
      "All Basic features",
      "Full subscription access",
      "Inventory management",
      "Sales and pharmacy tools",
    ],
  },

  {
    id: "ONE_MONTH",
    name: "1 Month",
    price: 3000,
    duration: "30 days",
    description: "Flexible monthly subscription.",
    features: [
      "All Basic features",
      "Full subscription access",
      "Inventory management",
      "Sales and pharmacy tools",
    ],
  },

  {
    id: "6_MONTHS",
    name: "6 Months",
    price: 15000,
    duration: "6 months",
    description: "Extended access for growing pharmacies.",
    features: [
      "All Basic features",
      "Full subscription access",
      "Inventory management",
      "Sales and pharmacy tools",
      "Extended subscription period",
    ],
  },

  {
    id: "1_YEAR",
    name: "1 Year",
    price: 25000,
    duration: "12 months",
    description: "Best value for long-term pharmacy use.",
    popular: true,
    features: [
      "All Basic features",
      "Full subscription access",
      "Inventory management",
      "Sales and pharmacy tools",
      "Best long-term value",
    ],
  },

  {
    id: "LIFETIME",
    name: "Lifetime",
    price: 120000,
    duration: "Lifetime",
    description: "One payment with no expiration.",
    features: [
      "All Basic features",
      "Full subscription access",
      "Inventory management",
      "Sales and pharmacy tools",
      "No renewal required",
      "Lifetime access",
    ],
  },
];

/*
 * =========================================================
 * FRONTEND → BACKEND PLAN MAPPING
 * =========================================================
 *
 * BASIC       → handled separately
 * ONE_WEEK    → ONE_WEEK
 * ONE_MONTH   → ONE_MONTH
 * 6_MONTHS    → STANDARD
 * 1_YEAR      → PROFESSIONAL
 * LIFETIME     → ENTERPRISE
 */

const paymentPlanMap: Record<
  Exclude<PlanId, "BASIC">,
  Exclude<BackendPlan, "BASIC">
> = {
  ONE_WEEK: "ONE_WEEK",
  ONE_MONTH: "ONE_MONTH",
  "6_MONTHS": "STANDARD",
  "1_YEAR": "PROFESSIONAL",
  LIFETIME: "ENTERPRISE",
};

/*
 * =========================================================
 * STORAGE HELPERS
 * =========================================================
 */

function subscribeToStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
  };
}

function getStorageSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("smartpharma_user") || "";
}

function getServerSnapshot() {
  return "";
}

/*
 * =========================================================
 * PHARMACY HELPERS
 * =========================================================
 */

function getClientPharmacyId(): number | null {
  const value = getPharmacyId();

  if (value === null || value === undefined) {
    return null;
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function getClientPharmacyName(): string {
  const user = getCurrentUser();

  if (
    user &&
    typeof user === "object" &&
    "pharmacyName" in user &&
    typeof user.pharmacyName === "string"
  ) {
    return user.pharmacyName;
  }

  if (
    user &&
    typeof user === "object" &&
    "pharmacy" in user &&
    user.pharmacy &&
    typeof user.pharmacy === "object" &&
    "name" in user.pharmacy &&
    typeof user.pharmacy.name === "string"
  ) {
    return user.pharmacy.name;
  }

  return "Your Pharmacy";
}

/*
 * =========================================================
 * DISPLAY HELPERS
 * =========================================================
 */

function formatPrice(price: number) {
  if (price === 0) {
    return "Free";
  }

  return `${price.toLocaleString()} ETB`;
}

function getDisplayPlanName(plan: BackendPlan) {
  switch (plan) {
    case "BASIC":
      return "Basic";

    case "ONE_WEEK":
      return "1 Week";

    case "ONE_MONTH":
      return "1 Month";

    case "STANDARD":
      return "6 Months";

    case "PROFESSIONAL":
      return "1 Year";

    case "ENTERPRISE":
      return "Lifetime";

    default:
      return plan;
  }
}

function getDurationText(plan: BackendPlan) {
  switch (plan) {
    case "BASIC":
      return "No expiration";

    case "ONE_WEEK":
      return "7 days";

    case "ONE_MONTH":
      return "30 days";

    case "STANDARD":
      return "6 months";

    case "PROFESSIONAL":
      return "12 months";

    case "ENTERPRISE":
      return "Lifetime";

    default:
      return "";
  }
}

function isPaidPlan(plan: PlanId): plan is Exclude<PlanId, "BASIC"> {
  return plan !== "BASIC";
}

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function SubscriptionPage() {
  const rawUser = useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    getServerSnapshot,
  );

  const pharmacyId = useMemo(() => {
    void rawUser;

    return getClientPharmacyId();
  }, [rawUser]);

  const pharmacyName = useMemo(() => {
    void rawUser;

    return getClientPharmacyName();
  }, [rawUser]);

  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [banks, setBanks] = useState<BankAccount[]>([]);

  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);

  const [copiedBankId, setCopiedBankId] = useState<number | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<PlanId>("BASIC");

  const [transactionId, setTransactionId] = useState("");

  const [screenshot, setScreenshot] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [fileInputKey, setFileInputKey] = useState(0);

  const selectedPlanDetails =
    plans.find((plan) => plan.id === selectedPlan) || plans[0];

  /*
   * =========================================================
   * LOAD SUBSCRIPTION + BANK ACCOUNTS
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!pharmacyId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const token = getToken();

        const headers: HeadersInit = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};

        const [subscriptionResponse, banksResponse] = await Promise.all([
          fetch(`${API_URL}/payments/subscription/${pharmacyId}`, {
            headers,
            cache: "no-store",
          }),

          fetch(`${API_URL}/payments/banks`, {
            headers,
            cache: "no-store",
          }),
        ]);

        if (!subscriptionResponse.ok) {
          const data = await subscriptionResponse.json().catch(() => null);

          throw new Error(data?.message || "Unable to load your subscription.");
        }

        const subscriptionData = await subscriptionResponse.json();

        let banksData: BankAccount[] = [];

        if (banksResponse.ok) {
          const parsed = await banksResponse.json();

          if (Array.isArray(parsed)) {
            banksData = parsed;
          }
        }

        if (cancelled) {
          return;
        }

        setSubscription(subscriptionData || null);

        setBanks(banksData);

        /*
         * Automatically select the current plan.
         */

        switch (subscriptionData?.plan as BackendPlan) {
          case "BASIC":
            setSelectedPlan("BASIC");
            break;

          case "ONE_WEEK":
            setSelectedPlan("ONE_WEEK");
            break;

          case "ONE_MONTH":
            setSelectedPlan("ONE_MONTH");
            break;

          case "STANDARD":
            setSelectedPlan("6_MONTHS");
            break;

          case "PROFESSIONAL":
            setSelectedPlan("1_YEAR");
            break;

          case "ENTERPRISE":
            setSelectedPlan("LIFETIME");
            break;
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load subscription information.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [pharmacyId]);

  /*
   * =========================================================
   * SELECT PLAN
   * =========================================================
   */

  function handleSelectPlan(plan: PlanId) {
    setSelectedPlan(plan);

    setError("");
    setSuccess("");

    if (plan === "BASIC") {
      setSelectedBankId(null);
      setTransactionId("");
      setScreenshot(null);

      setFileInputKey((value) => value + 1);
    }
  }

  /*
   * =========================================================
   * SELECT BANK
   * =========================================================
   */

  function handleSelectBank(bankId: number) {
    setSelectedBankId(bankId);

    setError("");
    setSuccess("");
  }

  /*
   * =========================================================
   * COPY ACCOUNT NUMBER
   * =========================================================
   */

  async function copyAccountNumber(bank: BankAccount) {
    try {
      await navigator.clipboard.writeText(bank.accountNumber);

      setCopiedBankId(bank.id);

      setTimeout(() => {
        setCopiedBankId((current) => (current === bank.id ? null : current));
      }, 2000);
    } catch {
      setError("Unable to copy the account number.");
    }
  }

  /*
   * =========================================================
   * SCREENSHOT
   * =========================================================
   */

  function handleScreenshotChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setSuccess("");

    const file = event.target.files?.[0];

    if (!file) {
      setScreenshot(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setScreenshot(null);

      setFileInputKey((value) => value + 1);

      setError("Please upload a JPEG, PNG, or WebP image.");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setScreenshot(null);

      setFileInputKey((value) => value + 1);

      setError("Payment screenshot must be smaller than 5MB.");

      return;
    }

    setScreenshot(file);
  }

  /*
   * =========================================================
   * ACTIVATE BASIC
   * =========================================================
   */

  async function handleActivateBasic() {
    if (!pharmacyId) {
      setError("Pharmacy information could not be found.");

      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");

      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      /*
       * Pharmacy ID is NOT sent here.
       *
       * The backend controller gets the pharmacy ID
       * securely from request.user.pharmacyId.
       */

      const response = await fetch(`${API_URL}/payments/subscription/basic`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(message || "Unable to activate the Basic plan.");
      }

      /*
       * The backend normally returns the subscription
       * object directly.
       *
       * This also supports { subscription: {...} }
       * if the backend is changed later.
       */

      const newSubscription = data?.subscription ?? data;

      if (newSubscription && typeof newSubscription === "object") {
        setSubscription(newSubscription as Subscription);
      }

      setSelectedPlan("BASIC");

      setSuccess("Basic plan activated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to activate the Basic plan.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * =========================================================
   * PAYMENT SUBMISSION
   * =========================================================
   */

  async function handleSubmitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pharmacyId) {
      setError("Pharmacy information could not be found.");

      return;
    }

    /*
     * Basic does not use the payment endpoint.
     */

    if (selectedPlan === "BASIC") {
      await handleActivateBasic();
      return;
    }

    if (selectedBankId === null) {
      setError("Please select a bank account.");

      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter your transaction ID.");

      return;
    }

    if (!screenshot) {
      setError("Please upload your payment screenshot.");

      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");

      return;
    }

    const backendPlan = paymentPlanMap[selectedPlan];

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("pharmacyId", String(pharmacyId));

      formData.append("plan", backendPlan);

      formData.append("amount", String(selectedPlanDetails.price));

      formData.append("bankAccountId", String(selectedBankId));

      formData.append("transactionId", transactionId.trim());

      formData.append("screenshot", screenshot);

      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(message || "Unable to submit payment.");
      }

      setSuccess(
        "Payment submitted successfully. Please wait for admin verification.",
      );

      setTransactionId("");

      setScreenshot(null);

      setSelectedBankId(null);

      setFileInputKey((value) => value + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit payment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * =========================================================
   * NO PHARMACY
   * =========================================================
   */

  if (!pharmacyId && !loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <PharmacyNavigation />

        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <CircleAlert className="mx-auto mb-4 h-12 w-12 text-red-500" />

            <h1 className="text-2xl font-bold text-slate-900">
              Pharmacy account not found
            </h1>

            <p className="mt-3 text-slate-600">
              Please log in again to manage your subscription.
            </p>

            <Link
              href="/pharmacy/login"
              className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Pharmacy Login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-slate-50">
      <PharmacyNavigation />

      {/* HERO */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Subscription
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                Choose your pharmacy plan
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600">
                Select the subscription that best fits your pharmacy. Payments
                are verified by the SmartPharma admin.
              </p>
            </div>

            <div className="rounded-2xl border bg-slate-50 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pharmacy
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {pharmacyName}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* CURRENT SUBSCRIPTION */}
        <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />

                <h2 className="text-lg font-bold text-slate-900">
                  Current subscription
                </h2>
              </div>

              {loading ? (
                <div className="mt-3 h-5 w-48 animate-pulse rounded bg-slate-200" />
              ) : subscription ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-slate-900">
                    {getDisplayPlanName(subscription.plan)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      subscription.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : subscription.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {subscription.status}
                  </span>

                  <span className="text-sm text-slate-500">
                    {getDurationText(subscription.plan)}
                  </span>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No subscription has been activated yet.
                </p>
              )}
            </div>

            {subscription?.renewalDate && (
              <div className="text-left md:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Renewal date
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {new Date(subscription.renewalDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <Check className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* PLANS */}
        <div>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Subscription plans
            </h2>

            <p className="mt-1 text-slate-600">
              Choose a plan below to continue.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const selected = selectedPlan === plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                    selected
                      ? "border-blue-600 ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                      Popular
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">
                      {plan.name}
                    </h3>

                    {selected && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <span className="text-3xl font-bold text-slate-900">
                      {formatPrice(plan.price)}
                    </span>

                    <span className="ml-2 text-sm text-slate-500">
                      {plan.duration}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {plan.description}
                  </p>

                  <div className="mt-5 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />

                        <span className="text-sm text-slate-600">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTED PLAN */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {selectedPlan === "BASIC" ? (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Check className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Basic plan
                    </h2>

                    <p className="text-sm text-slate-500">
                      Free — no payment required
                    </p>
                  </div>
                </div>

                <p className="mt-5 leading-7 text-slate-600">
                  The Basic plan is completely free. You do not need to upload a
                  payment screenshot or provide a transaction ID.
                </p>

                <button
                  type="button"
                  onClick={handleActivateBasic}
                  disabled={submitting}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Activate Basic
                    </>
                  )}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitPayment}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="mb-7">
                  <h2 className="text-xl font-bold text-slate-900">
                    Complete payment
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Selected plan:{" "}
                    <span className="font-semibold text-slate-800">
                      {selectedPlanDetails.name}
                    </span>
                  </p>
                </div>

                {/* BANKS */}
                <div>
                  <div className="mb-3">
                    <h3 className="font-bold text-slate-900">
                      1. Select bank account
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Send the exact subscription amount to one of the active
                      accounts.
                    </p>
                  </div>

                  {banks.length === 0 ? (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                      No active bank accounts are currently available. Please
                      contact the administrator.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {banks.map((bank) => {
                        const selected = selectedBankId === bank.id;

                        return (
                          <div
                            key={bank.id}
                            className={`rounded-xl border p-4 transition ${
                              selected
                                ? "border-blue-600 bg-blue-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectBank(bank.id)}
                              className="w-full text-left"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {bank.bankName}
                                  </p>

                                  <p className="mt-1 text-sm text-slate-600">
                                    {bank.accountName}
                                  </p>

                                  <p className="mt-2 font-mono text-sm text-slate-900">
                                    {bank.accountNumber}
                                  </p>

                                  {bank.branch && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      Branch: {bank.branch}
                                    </p>
                                  )}
                                </div>

                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                    selected
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {selected && <Check className="h-4 w-4" />}
                                </span>
                              </div>
                            </button>

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={() => copyAccountNumber(bank)}
                                className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                {copiedBankId === bank.id ? (
                                  <>
                                    <ClipboardCheck className="h-4 w-4 text-green-600" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Clipboard className="h-4 w-4" />
                                    Copy account
                                  </>
                                )}
                              </button>
                            </div>

                            {bank.instructions && (
                              <p className="mt-3 rounded-lg bg-slate-100 p-3 text-xs leading-5 text-slate-600">
                                {bank.instructions}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* TRANSACTION ID */}
                <div className="mt-8">
                  <label
                    htmlFor="transactionId"
                    className="mb-2 block font-bold text-slate-900"
                  >
                    2. Transaction ID
                  </label>

                  <input
                    id="transactionId"
                    type="text"
                    value={transactionId}
                    onChange={(event) => setTransactionId(event.target.value)}
                    placeholder="Enter your bank transaction ID"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Enter the transaction/reference number from your bank
                    payment.
                  </p>
                </div>

                {/* SCREENSHOT */}
                <div className="mt-8">
                  <label
                    htmlFor="screenshot"
                    className="mb-2 block font-bold text-slate-900"
                  >
                    3. Payment screenshot
                  </label>

                  <div className="rounded-xl border-2 border-dashed border-slate-300 p-5">
                    <input
                      key={fileInputKey}
                      id="screenshot"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleScreenshotChange}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-slate-800"
                    />

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <FileImage className="h-4 w-4" />

                      <span>JPEG, PNG or WebP • Maximum 5MB</span>
                    </div>

                    {screenshot && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                        <Upload className="h-4 w-4" />

                        <span className="truncate">{screenshot.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={submitting || banks.length === 0}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Submit Payment
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* SELECTED PLAN SUMMARY */}
          <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-lg font-bold text-slate-900">Selected plan</h2>

            <div className="mt-5 rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">
                {selectedPlanDetails.name}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatPrice(selectedPlanDetails.price)}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {selectedPlanDetails.duration}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {selectedPlanDetails.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />

                  <span className="text-sm text-slate-600">{feature}</span>
                </div>
              ))}
            </div>

            {isPaidPlan(selectedPlan) && (
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                  <p className="text-xs leading-5 text-blue-800">
                    After submitting your payment, an administrator must verify
                    the transaction before your subscription becomes active.
                  </p>
                </div>
              </div>
            )}

            {selectedPlan === "BASIC" && (
              <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />

                  <p className="text-xs leading-5 text-green-800">
                    Basic is completely free. No bank transfer, transaction ID,
                    or payment screenshot is required.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} SmartPharma. All rights reserved.
            </p>

            <div className="flex gap-5">
              <Link href="/dashboard" className="hover:text-slate-900">
                Dashboard
              </Link>

              <Link
                href="/dashboard/subscription"
                className="font-semibold text-slate-900"
              >
                Subscription
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
