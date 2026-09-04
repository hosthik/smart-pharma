"use client";

import Link from "next/link";
import {
  Activity,
  BarChart3,
  Boxes,
  Check,
  CreditCard,
  MapPin,
  Pill,
  Search,
  ShoppingCart,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:4000";

const PHARMACY_ID = 1;

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Activity,
  },
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    icon: Boxes,
  },
  {
    name: "Medicines",
    href: "/dashboard/medicines",
    icon: Pill,
  },
  {
    name: "Sales",
    href: "/dashboard/sales",
    icon: ShoppingCart,
  },
  {
    name: "Find Medicine",
    href: "/find-medicine",
    icon: Search,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Subscription",
    href: "/dashboard/subscription",
    icon: CreditCard,
  },
  {
    name: "Location",
    href: "/dashboard/location",
    icon: MapPin,
  },
];

type Subscription = {
  id: number;
  pharmacyId: number;
  plan: string;
  status: string;
  startDate: string | null;
  renewalDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type Plan = {
  name: "Professional" | "Enterprise";
  price: number;
  description: string;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Professional",
    price: 100,
    description: "For pharmacies that need powerful everyday management tools.",
    features: [
      "Inventory management",
      "Medicine management",
      "Sales management",
      "Medicine search",
      "Analytics",
      "10 pieces maximum per medicine",
      "24-hour subscription",
    ],
  },
  {
    name: "Enterprise",
    price: 100,
    description: "For larger pharmacies requiring advanced management.",
    features: [
      "Everything in Professional",
      "Advanced analytics",
      "Priority support",
      "Advanced pharmacy management",
      "Enterprise features",
      "10 pieces maximum per medicine",
      "24-hour subscription",
    ],
  },
];

const telebirrPaymentName = "SmartPharma";
const telebirrPaymentNumber = "0973985357";

export default function SubscriptionPage() {
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);

  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] =
    useState<Plan["name"]>("Professional");

  const [transactionId, setTransactionId] = useState("");

  const [screenshot, setScreenshot] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSubscription() {
      try {
        const response = await fetch(
          `${API_URL}/payments/subscription/${PHARMACY_ID}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load subscription.");
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        setCurrentSubscription(data.subscription ?? null);

        setSubscriptionLoading(false);
      } catch {
        if (cancelled) {
          return;
        }

        setCurrentSubscription(null);
        setSubscriptionLoading(false);
      }
    }

    loadSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlanDetails = useMemo(() => {
    return plans.find((plan) => plan.name === selectedPlan);
  }, [selectedPlan]);

  const isActive = currentSubscription?.status === "ACTIVE";

  function handleScreenshotChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    if (!file.type.startsWith("image/")) {
      setScreenshot(null);
      setPreview(null);
      setErrorMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setScreenshot(null);
      setPreview(null);
      setErrorMessage("Screenshot must be smaller than 5 MB.");
      return;
    }

    setScreenshot(file);

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!selectedPlanDetails) {
      setErrorMessage("Please select a subscription plan.");
      return;
    }

    if (!transactionId.trim()) {
      setErrorMessage("Please enter your TeleBirr transaction ID.");
      return;
    }

    if (!screenshot) {
      setErrorMessage("Please upload your payment screenshot.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("pharmacyId", String(PHARMACY_ID));

      formData.append("plan", selectedPlan);

      formData.append("amount", "100");

      formData.append("transactionId", transactionId.trim());

      formData.append("screenshot", screenshot);

      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Payment submission failed.",
        );
      }

      setSuccessMessage(
        "Payment submitted successfully. Your payment is now pending verification.",
      );

      setTransactionId("");
      setScreenshot(null);
      setPreview(null);

      const subscriptionResponse = await fetch(
        `${API_URL}/payments/subscription/${PHARMACY_ID}`,
      );

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();

        setCurrentSubscription(subscriptionData.subscription ?? null);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Payment submission failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              SP
            </div>

            <div>
              <p className="font-bold text-slate-900">SmartPharma</p>

              <p className="hidden text-xs text-slate-500 sm:block">
                Pharmacy Management
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active = item.href === "/dashboard/subscription";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                Pharmacy Admin
              </p>

              <p className="text-xs text-slate-500">Pharmacy #1</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
              PA
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-t lg:hidden">
          <nav className="mx-auto flex min-w-max gap-1 px-4 py-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active = item.href === "/dashboard/subscription";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-slate-500">
            Account & Billing
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Subscription
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Manage your SmartPharma subscription and submit TeleBirr payments
            for verification.
          </p>
        </section>

        {subscriptionLoading ? (
          <div className="mb-8 rounded-xl border bg-white p-8 shadow-sm">
            <p className="text-center text-sm text-slate-500">
              Checking your subscription...
            </p>
          </div>
        ) : isActive && currentSubscription ? (
          <div className="mb-8 overflow-hidden rounded-xl border border-green-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-green-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Current Subscription
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {currentSubscription.plan}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your pharmacy currently has an active SmartPharma
                  subscription.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                ACTIVE
              </span>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Plan</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {currentSubscription.plan}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Started</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {currentSubscription.startDate
                    ? new Date(currentSubscription.startDate).toLocaleString()
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Expires</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {currentSubscription.renewalDate
                    ? new Date(currentSubscription.renewalDate).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Current Subscription
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              No active subscription
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Choose a plan below and submit your TeleBirr payment.
            </p>
          </div>
        )}

        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Subscription Plans
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All SmartPharma plans cost 100 ETB and remain active for 24 hours
              after payment verification.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {plans.map((plan) => {
              const selected = selectedPlan === plan.name;

              const current =
                currentSubscription?.plan === plan.name.toUpperCase() &&
                isActive;

              return (
                <button
                  type="button"
                  key={plan.name}
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`rounded-xl border bg-white p-6 text-left shadow-sm transition ${
                    selected
                      ? "border-slate-900 ring-2 ring-slate-900"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {plan.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {plan.description}
                      </p>
                    </div>

                    {current && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <span className="text-3xl font-bold text-slate-900">
                      100 ETB
                    </span>

                    <span className="ml-2 text-sm text-slate-500">
                      / 24 hours
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-1">
            <h2 className="text-xl font-bold text-slate-900">
              TeleBirr Payment
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Send exactly 100 ETB to the SmartPharma TeleBirr account.
            </p>

            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Payment Name
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {telebirrPaymentName}
              </p>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                TeleBirr Number
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {telebirrPaymentNumber}
              </p>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Amount
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">100 ETB</p>

              <p className="mt-1 text-sm text-slate-500">
                Valid for 24 hours after verification
              </p>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p>
                <strong>1.</strong> Send exactly 100 ETB.
              </p>

              <p>
                <strong>2.</strong> Save your TeleBirr transaction ID.
              </p>

              <p>
                <strong>3.</strong> Take a screenshot of the successful payment.
              </p>

              <p>
                <strong>4.</strong> Submit the information using the form.
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">Submit Payment</h2>

            <p className="mt-2 text-sm text-slate-500">
              Your payment will remain pending until an administrator verifies
              it.
            </p>

            {successMessage && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Selected Plan
                </label>

                <div className="mt-2 rounded-lg border bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-900">
                      {selectedPlan}
                    </span>

                    <span className="font-bold text-slate-900">100 ETB</span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="transactionId"
                  className="text-sm font-medium text-slate-700"
                >
                  TeleBirr Transaction ID
                </label>

                <input
                  id="transactionId"
                  type="text"
                  value={transactionId}
                  onChange={(event) => setTransactionId(event.target.value)}
                  placeholder="Enter transaction ID"
                  autoComplete="off"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="screenshot"
                  className="text-sm font-medium text-slate-700"
                >
                  Payment Screenshot
                </label>

                <input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Image files only. Maximum size: 5 MB.
                </p>
              </div>

              {preview && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Screenshot Preview
                  </p>

                  <div className="overflow-hidden rounded-lg border bg-slate-50 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Payment screenshot preview"
                      className="max-h-80 w-full rounded-md object-contain"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting Payment..."
                  : "Submit 100 ETB Payment"}
              </button>
            </form>

            <div className="mt-6 rounded-lg border bg-slate-50 p-4">
              <p className="text-xs leading-5 text-slate-500">
                Never share your TeleBirr PIN, password, or OTP with anyone.
                SmartPharma only requires your transaction ID and payment
                screenshot for verification.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
