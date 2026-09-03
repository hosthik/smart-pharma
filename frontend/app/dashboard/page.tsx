"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getDashboard } from "@/lib/api";
import { DashboardData } from "@/lib/type/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pharmacyId = searchParams.get("pharmacyId");

  const [data, setData] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pharmacyId) {
      router.push("/pharmacy/login");
      return;
    }

    async function loadDashboard() {
      try {
        const result = await getDashboard(Number(pharmacyId));

        setData(result);
      } catch (error) {
        console.error(error);
        setError("Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [pharmacyId, router]);

  function logout() {
    localStorage.removeItem("smartpharma_token");
    localStorage.removeItem("smartpharma_user");

    router.push("/pharmacy/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{error || "Dashboard unavailable"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">{data.pharmacy.name}</h1>

            <p className="text-sm text-muted-foreground">Pharmacy Dashboard</p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="mb-6 text-3xl font-bold">Overview</h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Medicines"
            value={data.inventory?.totalMedicines}
          />

          <DashboardCard title="Available" value={data.inventory?.available} />

          <DashboardCard title="Low Stock" value={data.inventory?.lowStock} />

          <DashboardCard
            title="Out of Stock"
            value={data.inventory?.outOfStock}
          />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <DashboardCard title="Total Sales" value={data.sales?.totalSales} />

          <DashboardCard
            title="Total Revenue"
            value={data.sales?.totalRevenue}
          />
        </div>

        {data.subscription && (
          <div className="mt-8 rounded-xl border bg-background p-6">
            <h3 className="text-xl font-semibold">Subscription</h3>

            <div className="mt-4 space-y-2">
              <p>
                Plan: <strong>{data.subscription?.plan}</strong>
              </p>

              <p>
                Status: <strong>{data.subscription?.status}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function DashboardCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>

      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
