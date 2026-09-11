"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ClipboardPlus,
  HeartPulse,
  MapPin,
  Pill,
  Search,
  ShieldCheck,
} from "lucide-react";

import PatientNavigation from "@/components/patient/PatientNavigation";

const features = [
  {
    icon: Search,
    title: "Find Medicines",
    description:
      "Search for medicines and see which pharmacies have them available, including prices and stock information.",
    href: "/find-medicine",
  },
  {
    icon: MapPin,
    title: "Find Pharmacies",
    description:
      "Discover pharmacies, view their information, check available medicines, and get directions.",
    href: "/pharmacies",
  },
  {
    icon: ClipboardPlus,
    title: "Scan Prescriptions",
    description:
      "Upload a prescription image and let SmartPharma help identify medicines available in registered pharmacies.",
    href: "/scan-prescription",
  },
  {
    icon: Calculator,
    title: "Estimate Costs",
    description:
      "Select medicines and quantities to get an estimated total cost before visiting a pharmacy.",
    href: "/cost-estimation",
  },
  {
    icon: Pill,
    title: "Medicine Reminders",
    description:
      "Create medicine reminders to help you keep track of when you need to take your medicines.",
    href: "/medicine-reminder",
  },
  {
    icon: ShieldCheck,
    title: "Reliable Information",
    description:
      "Access organized medicine and pharmacy information through one simple platform.",
    href: "/pharmacies",
  },
];

const benefits = [
  "Search for medicines easily",
  "Check pharmacy availability and prices",
  "Find pharmacy locations and contact information",
  "Scan prescriptions for easier medicine identification",
  "Estimate medicine costs",
  "Keep track of medicine reminders",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PatientNavigation activePath="/about-us" />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              About SmartPharma
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Making it easier to find the medicines you need.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              SmartPharma is a digital platform that connects patients with
              medicine and pharmacy information. Our goal is to make it easier
              to search for medicines, find pharmacies, check availability,
              estimate costs, and manage everyday medicine needs.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/find-medicine"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Find Medicine
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/pharmacies"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Find a Pharmacy
                <MapPin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-7 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Our Mission
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Helping people access medicine information more easily.
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-600">
                Finding the right medicine is not always simple. Patients may
                need to search through different pharmacies, check whether a
                medicine is available, compare prices, or find a convenient
                pharmacy location.
              </p>

              <p className="mt-4 text-base leading-7 text-slate-600">
                SmartPharma brings these important pieces of information
                together in one platform. We aim to give patients a clearer way
                to explore medicines and pharmacies before making a visit.
              </p>
            </div>

            <div className="flex flex-col justify-center bg-slate-950 p-7 text-white sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <HeartPulse className="h-7 w-7 text-slate-200" />
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                Built with patients in mind
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                From medicine search to pharmacy discovery, SmartPharma is
                designed to make common healthcare information easier to access
                and understand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How SmartPharma Helps */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              What We Offer
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Useful tools for everyday medicine needs.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              SmartPharma brings several practical tools together so patients
              can spend less time searching for information and more time making
              informed decisions.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Why SmartPharma
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              One place for important medicine information.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              SmartPharma is designed to simplify the process of finding
              medicines and pharmacies by bringing useful information and
              practical tools together in one place.
            </p>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Whether you are searching for a specific medicine, looking for a
              nearby pharmacy, checking availability, or planning your medicine
              expenses, SmartPharma helps you start with the information you
              need.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-xl font-bold text-slate-950">
              SmartPharma helps you
            </h3>

            <div className="mt-6 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-700" />
                  </div>

                  <p className="text-sm leading-6 text-slate-600">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Simple steps to get started.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              SmartPharma makes it simple to move from searching for a medicine
              to finding useful pharmacy information.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white">
                1
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-950">Search</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search for the medicine you need using the SmartPharma medicine
                search.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white">
                2
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-950">Compare</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Review pharmacies, medicine availability, prices, locations, and
                other available information.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white">
                3
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-950">Choose</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose the pharmacy and information that best fits your needs
                before making your visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
        <div className="rounded-3xl bg-slate-950 px-7 py-10 text-center text-white sm:px-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            SmartPharma
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Start finding the medicine information you need today.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Search medicines, discover pharmacies, check availability, and use
            SmartPharma&apos;s tools to make your medicine journey easier.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/find-medicine"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Find Medicine
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} SmartPharma. All rights reserved.</p>

          <div className="flex flex-wrap gap-5">
            <Link href="/" className="transition hover:text-slate-950">
              Home
            </Link>

            <Link
              href="/find-medicine"
              className="transition hover:text-slate-950"
            >
              Find Medicine
            </Link>

            <Link
              href="/pharmacies"
              className="transition hover:text-slate-950"
            >
              Pharmacies
            </Link>

            <Link
              href="/scan-prescription"
              className="transition hover:text-slate-950"
            >
              Scan Prescription
            </Link>

            <Link
              href="/contact-us"
              className="transition hover:text-slate-950"
            >
              Contact Us
            </Link>

            <Link
              href="/pharmacy/login"
              className="transition hover:text-slate-950"
            >
              Pharmacy Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
