"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDashboard } from "@/lib/api";

type TopSellingMedicine = {
  medicineId: number;
  medicineName: string;
  quantitySold: number;
  revenue: number;
};

type DashboardData = {
  pharmacy?: {
    id: number;
    name: string;
  };

  sales?: {
    totalSales?: number;
    totalRevenue?: number;
  };

  totalSales?: number;
  totalRevenue?: number;

  topSelling?: TopSellingMedicine[];
  topSellingMedicines?: TopSellingMedicine[];
};

export default function SalesPage() {
  const searchParams = useSearchParams();

  const pharmacyId = searchParams.get("pharmacyId");

  const [data, setData] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pharmacyId) {
      setError("Pharmacy ID is missing.");
      setLoading(false);
      return;
    }

    async function loadSales() {
      try {
        setLoading(true);
        setError("");

        const result = await getDashboard(Number(pharmacyId));

        console.log("Dashboard response:", result);

        setData(result);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error ? error.message : "Unable to load sales.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, [pharmacyId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/40">
        <p className="text-muted-foreground">Loading sales...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/40 px-6">
        <div className="rounded-xl border bg-background p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Sales Unavailable</h1>

          <p className="mt-2 text-sm text-destructive">
            {error || "Unable to load sales."}
          </p>

          <a
            href={
              pharmacyId ? `/dashboard?pharmacyId=${pharmacyId}` : "/dashboard"
            }
            className="mt-6 inline-block rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  /*
   * Support both possible response formats:
   *
   * {
   *   sales: {
   *     totalSales: 10,
   *     totalRevenue: 500
   *   }
   * }
   *
   * OR
   *
   * {
   *   totalSales: 10,
   *   totalRevenue: 500
   * }
   */

  const totalSales = data.sales?.totalSales ?? data.totalSales ?? 0;

  const totalRevenue = data.sales?.totalRevenue ?? data.totalRevenue ?? 0;

  const topSelling = data.topSelling ?? data.topSellingMedicines ?? [];

  const pharmacyName = data.pharmacy?.name ?? "My Pharmacy";

  return (
    <main className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">Sales</h1>

            <p className="text-sm text-muted-foreground">
              View your pharmacy sales and best-selling medicines.
            </p>
          </div>

          <a
            href={
              pharmacyId ? `/dashboard?pharmacyId=${pharmacyId}` : "/dashboard"
            }
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary cards */}
        <div className="grid gap-5 md:grid-cols-2">
          <SummaryCard
            title="Total Sales"
            value={totalSales.toString()}
            description="Number of completed sales"
          />

          <SummaryCard
            title="Total Revenue"
            value={totalRevenue.toString()}
            description="Total sales revenue"
          />
        </div>

        {/* Top selling medicines */}
        <section className="mt-8 rounded-xl border bg-background shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">Top Selling Medicines</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Medicines with the highest sales activity.
            </p>
          </div>

          {topSelling.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No sales data available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="px-6 py-4 font-medium">#</th>

                    <th className="px-6 py-4 font-medium">Medicine</th>

                    <th className="px-6 py-4 font-medium">Quantity Sold</th>

                    <th className="px-6 py-4 font-medium">Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {topSelling.map((medicine, index) => (
                    <tr
                      key={medicine.medicineId}
                      className="border-b last:border-0"
                    >
                      <td className="px-6 py-4 font-medium">{index + 1}</td>

                      <td className="px-6 py-4 font-medium">
                        {medicine.medicineName}
                      </td>

                      <td className="px-6 py-4">{medicine.quantitySold}</td>

                      <td className="px-6 py-4">{medicine.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pharmacy information */}
        <section className="mt-8 rounded-xl border bg-background p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Sales Overview</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <InfoItem title="Pharmacy" value={pharmacyName} />

            <InfoItem
              title="Total Transactions"
              value={totalSales.toString()}
            />

            <InfoItem title="Total Revenue" value={totalRevenue.toString()} />
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>

      <p className="mt-2 text-3xl font-bold">{value}</p>

      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function InfoItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>

      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
