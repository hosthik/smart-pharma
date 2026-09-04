import Link from "next/link";
import { MapPin, Pill, Store, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              SP
            </div>

            <div className="leading-none">
              <p className="text-lg font-bold tracking-tight text-slate-900">
                SmartPharma
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Medicine Discovery
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-slate-900"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>

            <Link
              href="/find-medicine"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Find Medicine
            </Link>

            <Link
              href="/pharmacies"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Pharmacies
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Contact
            </Link>

            <Link href="/pharmacy/login">
              <Button>Pharmacy Login</Button>
            </Link>
          </div>

          <Link href="/pharmacy/login" className="md:hidden">
            <Button size="sm">Pharmacy Login</Button>
          </Link>
        </div>
      </nav>

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
              pharmacy locations, and see where your medicine is available.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/find-medicine">
                <Button size="lg" className="w-full sm:w-auto">
                  <Pill className="mr-2 h-5 w-5" />
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

      {/* Features */}
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3">
        <Link href="/find-medicine" className="group">
          <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-md">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Pill className="h-5 w-5 text-slate-700" />
              </div>

              <CardTitle>Find Medicine</CardTitle>
            </CardHeader>

            <CardContent className="text-muted-foreground">
              Search for medicines and check their availability at pharmacies.
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
              and contact information.
            </CardContent>
          </Card>
        </Link>

        <Link href="/pharmacy/login" className="group">
          <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-md">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Store className="h-5 w-5 text-slate-700" />
              </div>

              <CardTitle>Pharmacy Dashboard</CardTitle>
            </CardHeader>

            <CardContent className="text-muted-foreground">
              Pharmacy owners and staff can manage medicines, inventory, sales,
              analytics, and subscriptions.
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* How it works */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              How SmartPharma works
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Find what you need in a few steps.
            </h2>
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
                prices and stock.
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
                View the pharmacy address and contact information before
                visiting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SmartPharma. All rights reserved.</p>

          <div className="flex gap-5">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>

            <Link href="/find-medicine" className="hover:text-slate-900">
              Find Medicine
            </Link>

            <Link href="/pharmacies" className="hover:text-slate-900">
              Pharmacies
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
