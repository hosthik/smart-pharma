import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold">
            SmartPharma
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/find-medicine" className="text-sm font-medium">
              Find Medicine
            </Link>

            <Link href="/about" className="text-sm font-medium">
              About
            </Link>

            <Link href="/contact" className="text-sm font-medium">
              Contact
            </Link>

            <Link href="/pharmacy/login">
              <Button>
                Pharmacy Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider">
            SmartPharma
          </p>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Find the medicine you need.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            Search medicine availability, compare pharmacy prices,
            find pharmacy locations, and see where your medicine is available.
          </p>

          <div className="mt-8 flex gap-4">
            <Link href="/find-medicine">
              <Button size="lg">
                Find Medicine
              </Button>
            </Link>

            <Link href="/pharmacy/login">
              <Button size="lg" variant="outline">
                Pharmacy Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Find Medicine</CardTitle>
          </CardHeader>

          <CardContent className="text-muted-foreground">
            Search for medicines and check their availability.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compare Pharmacies</CardTitle>
          </CardHeader>

          <CardContent className="text-muted-foreground">
            Compare available pharmacies based on price and location.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pharmacy Dashboard</CardTitle>
          </CardHeader>

          <CardContent className="text-muted-foreground">
            Pharmacy owners can manage medicines, inventory, sales,
            and subscriptions.
          </CardContent>
        </Card>
      </section>
    </main>
  );
}