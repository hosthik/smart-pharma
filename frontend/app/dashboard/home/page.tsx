"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  CreditCard,
  MapPin,
  Pill,
  Search,
  UserRound,
} from "lucide-react";

import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";

const quickActions = [
  {
    title: "Inventory",
    description: "Manage medicine stock, prices, and storage locations.",
    href: "/dashboard/inventory",
    icon: Boxes,
  },
  {
    title: "Medicines",
    description: "View and manage the medicines available in your pharmacy.",
    href: "/dashboard/medicines",
    icon: Pill,
  },
  {
    title: "Analytics",
    description: "Monitor medicine searches and pharmacy activity.",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Subscription",
    description: "View your current plan and subscription information.",
    href: "/dashboard/subscription",
    icon: CreditCard,
  },
  {
    title: "Location",
    description: "Manage your pharmacy address and map location.",
    href: "/dashboard/location",
    icon: MapPin,
  },
  {
    title: "Account Settings",
    description: "View and update your pharmacy account information.",
    href: "/dashboard/account",
    icon: UserRound,
  },
];

const benefits = [
  {
    title: "Reach more patients",
    description:
      "Make your pharmacy and available medicines easier for patients to discover.",
    icon: Search,
  },
  {
    title: "Manage inventory",
    description:
      "Keep medicine quantities, prices, and storage information organized.",
    icon: Boxes,
  },
  {
    title: "Track activity",
    description:
      "Use analytics to understand medicine demand and patient searches.",
    icon: Activity,
  },
];

export default function PharmacyHome() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PharmacyNavigation activePath="/dashboard/home" />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Pill className="h-7 w-7" />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Pharmacy Management
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Welcome to SmartPharma
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Manage your pharmacy, keep your medicine inventory up to date, and
              make it easier for patients to find the medicines they need.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard/inventory"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Manage Inventory
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Pharmacy tools
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Manage your pharmacy
          </h2>

          <p className="mt-3 max-w-2xl text-slate-600">
            Quickly access the tools you need to manage your pharmacy on
            SmartPharma.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="h-6 w-6" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Why SmartPharma
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Built to make pharmacy management simpler
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                SmartPharma gives pharmacies a central place to manage their
                information and medicine availability while helping patients
                discover the right pharmacy.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Getting started
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Keep your pharmacy information up to date
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                Make sure your pharmacy details and medicine inventory are
                accurate so patients can find useful information when searching
                through SmartPharma.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-slate-700" />
                  Keep medicine stock quantities updated
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-slate-700" />
                  Maintain accurate pharmacy information
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-slate-700" />
                  Review your pharmacy activity regularly
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/dashboard/account"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Account Settings
                <UserRound className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                View Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">SmartPharma</p>

            <p className="mt-1 text-sm text-slate-500">
              Pharmacy management platform
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <Link href="/dashboard/home" className="hover:text-slate-900">
              Home
            </Link>

            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>

            <Link href="/dashboard/inventory" className="hover:text-slate-900">
              Inventory
            </Link>

            <Link href="/dashboard/account" className="hover:text-slate-900">
              Account Settings
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
