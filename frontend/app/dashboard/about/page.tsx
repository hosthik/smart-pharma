"use client";

import Link from "next/link";
import { BarChart3, HeartPulse, Package, ShieldCheck } from "lucide-react";

import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";

const values = [
  {
    icon: HeartPulse,
    title: "Better Healthcare",
    description:
      "We help pharmacies organize their operations so they can focus more on serving patients and their communities.",
  },
  {
    icon: Package,
    title: "Smarter Inventory",
    description:
      "SmartPharma makes it easier to monitor medicines, quantities, prices, locations, and stock levels.",
  },
  {
    icon: BarChart3,
    title: "Useful Insights",
    description:
      "Clear analytics help pharmacy owners understand sales, inventory performance, demand, and business trends.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Management",
    description:
      "We provide a structured platform designed to keep pharmacy information organized and accessible.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PharmacyNavigation activePath="/dashboard/about" />

      {/* Main */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Page Heading */}
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            About SmartPharma
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Technology built for better pharmacy management.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            SmartPharma is a pharmacy management platform designed to help
            pharmacies manage medicines, inventory, business information,
            analytics, subscriptions, and day-to-day operations from one
            organized system.
          </p>
        </div>

        {/* Mission */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Our Mission
              </p>

              <h2 className="mt-3 font-serif text-3xl font-bold text-slate-950">
                Making pharmacy operations simpler.
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                Pharmacies manage important information every day. Medicines
                need to be tracked, stock needs to be monitored, sales need to
                be understood, and customers need reliable access to the
                products they need.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                SmartPharma brings these activities together into a single
                platform, giving pharmacy teams a clearer view of their
                operations and helping them make better-informed decisions.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-7 text-white">
              <HeartPulse className="h-8 w-8 text-slate-300" />

              <h3 className="mt-6 font-serif text-2xl font-semibold">
                Built around pharmacies
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Our goal is to provide practical tools that fit naturally into
                the daily workflow of pharmacy owners and their teams.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            What We Focus On
          </p>

          <h2 className="mt-3 max-w-3xl font-serif text-3xl font-bold text-slate-950">
            A platform designed around real pharmacy needs.
          </h2>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <h3 className="mt-5 font-serif text-xl font-semibold text-slate-950">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closing */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            SmartPharma
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-semibold text-slate-950">
            Helping pharmacies work smarter, stay organized, and serve their
            communities better.
          </h2>

          <Link
            href="/dashboard/contact"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} SmartPharma. All rights reserved.
          </span>

          <Link
            href="/dashboard/contact"
            className="font-medium text-slate-900 hover:underline"
          >
            Contact Support
          </Link>
        </div>
      </footer>
    </main>
  );
}
