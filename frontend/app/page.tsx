import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  ClipboardPlus,
  MapPin,
  Pill,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PatientNavigation from "@/components/patient/PatientNavigation";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PatientNavigation activePath="/" />

      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="max-w-4xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Pill className="h-7 w-7" />
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              SmartPharma
            </p>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Find the medicine you need.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Search medicine availability, compare pharmacy prices, find
              pharmacy locations, scan prescriptions, and manage your medicine
              needs from one simple platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/find-medicine">
                <Button size="lg" className="w-full sm:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Find Medicine
                </Button>
              </Link>

              <Link href="/pharmacies">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Find Pharmacies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Features */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            SmartPharma Tools
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Everything you need to find medicine information.
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            SmartPharma brings useful medicine and pharmacy tools together to
            make your search easier.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/find-medicine" className="group">
            <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Search className="h-5 w-5 text-slate-700" />
                </div>

                <CardTitle>Find Medicine</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Search for medicines and check their availability, prices, and
                pharmacies.
              </CardContent>
            </Card>
          </Link>

          <Link href="/pharmacies" className="group">
            <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>

                <CardTitle>Find Pharmacies</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Browse pharmacies, view available medicines, prices, addresses,
                opening hours, and contact information.
              </CardContent>
            </Card>
          </Link>

          <Link href="/scan-prescription" className="group">
            <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <ClipboardPlus className="h-5 w-5 text-slate-700" />
                </div>

                <CardTitle>Scan Prescription</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Upload a prescription image and let SmartPharma help identify
                medicines and available pharmacies.
              </CardContent>
            </Card>
          </Link>

          <Link href="/cost-estimation" className="group">
            <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Calculator className="h-5 w-5 text-slate-700" />
                </div>

                <CardTitle>Cost Estimation</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Estimate the total cost of the medicines you need before
                visiting a pharmacy.
              </CardContent>
            </Card>
          </Link>

          <Link href="/medicine-reminder" className="group">
            <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Pill className="h-5 w-5 text-slate-700" />
                </div>

                <CardTitle>Medicine Reminder</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Create reminders to help you keep track of your medicine
                schedule.
              </CardContent>
            </Card>
          </Link>

          <Link href="/about-us" className="group">
            <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <ArrowRight className="h-5 w-5 text-slate-700" />
                </div>

                <CardTitle>About SmartPharma</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                Learn more about SmartPharma, our mission, and how our platform
                helps patients.
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              How SmartPharma Works
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Find what you need in a few simple steps.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              SmartPharma helps you move from searching for a medicine to
              finding the right pharmacy information.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border bg-slate-50 p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                1
              </div>

              <h3 className="mt-5 font-semibold text-slate-900">Search</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search for the medicine you need by name, generic name, or
                category.
              </p>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                2
              </div>

              <h3 className="mt-5 font-semibold text-slate-900">Compare</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                See which pharmacies have the medicine available and compare
                prices and stock information.
              </p>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                3
              </div>

              <h3 className="mt-5 font-semibold text-slate-900">
                Visit the Pharmacy
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View the pharmacy location and contact information before
                visiting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Contact CTA */}
      <section className="border-t bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-3xl bg-slate-900 px-7 py-10 text-white sm:px-10 sm:py-12">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                SmartPharma
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Making your medicine search simpler.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-300">
                Learn more about SmartPharma or contact our support team if you
                have questions, need assistance, or want to share feedback.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/about-us">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    About SmartPharma
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/contact-us">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white sm:w-auto"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SmartPharma. All rights reserved.</p>

          <div className="flex flex-wrap gap-5">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>

            <Link href="/find-medicine" className="hover:text-slate-900">
              Find Medicine
            </Link>

            <Link href="/pharmacies" className="hover:text-slate-900">
              Pharmacies
            </Link>

            <Link href="/about-us" className="hover:text-slate-900">
              About Us
            </Link>

            <Link href="/contact-us" className="hover:text-slate-900">
              Contact Us
            </Link>

            <Link href="/pharmacy/login" className="hover:text-slate-900">
              Pharmacy Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
