"use client";

import { useSearchParams } from "next/navigation";

const plans = [
  {
    name: "BASIC",
    price: "Free",
    description: "For small pharmacies getting started.",
    features: ["Medicine inventory", "Medicine search", "Basic dashboard"],
  },
  {
    name: "STANDARD",
    price: "ETB 500 / month",
    description: "For growing pharmacies.",
    features: [
      "Everything in Basic",
      "Sales tracking",
      "Analytics",
      "Demand monitoring",
    ],
  },
  {
    name: "PROFESSIONAL",
    price: "ETB 1,000 / month",
    description: "For pharmacies needing advanced tools.",
    features: [
      "Everything in Standard",
      "Advanced analytics",
      "Detailed reports",
      "Priority support",
    ],
  },
];

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const pharmacyId = searchParams.get("pharmacyId");

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Subscription</h1>

          <p className="mt-2 text-muted-foreground">
            Manage your SmartPharma subscription plan.
          </p>

          {pharmacyId && (
            <p className="mt-1 text-sm text-muted-foreground">
              Pharmacy ID: {pharmacyId}
            </p>
          )}
        </div>

        {/* Current Plan */}
        <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>

              <h2 className="mt-1 text-2xl font-bold">BASIC</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your current subscription is active.
              </p>
            </div>

            <span className="w-fit rounded-full border px-4 py-2 text-sm font-medium">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="flex flex-col rounded-xl border bg-card p-6 shadow-sm"
            >
              <div>
                <h2 className="text-xl font-bold">{plan.name}</h2>

                <p className="mt-3 text-2xl font-bold">{plan.price}</p>

                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="my-6 h-px bg-border" />

              {/* Features */}
              <ul className="flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <span>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                type="button"
                className="mt-6 w-full rounded-md border px-4 py-2 font-medium hover:bg-muted"
                onClick={() =>
                  alert(
                    `${plan.name} plan selected. Payment integration will be added later.`,
                  )
                }
              >
                {plan.name === "BASIC" ? "Current Plan" : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Information */}
        <div className="mt-8 rounded-xl border p-5">
          <h3 className="font-semibold">Subscription Information</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Subscription management and payment processing will be connected to
            the backend later.
          </p>
        </div>
      </div>
    </main>
  );
}
