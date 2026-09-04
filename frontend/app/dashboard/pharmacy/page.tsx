"use client";
import DashboardNavbar from "@/components/dashboard-navbar";
export default function PharmacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <DashboardNavbar />
      <h1 className="text-3xl font-bold text-slate-900">Pharmacy</h1>

      <p className="mt-2 text-slate-600">
        Pharmacy management will appear here.
      </p>
    </main>
  );
}
