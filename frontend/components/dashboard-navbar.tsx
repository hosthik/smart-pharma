"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Boxes,
  CreditCard,
  MapPin,
  Pill,
  Search,
  ShoppingCart,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Activity,
  },
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    icon: Boxes,
  },
  {
    name: "Medicines",
    href: "/dashboard/medicines",
    icon: Pill,
  },
  {
    name: "Sales",
    href: "/dashboard/sales",
    icon: ShoppingCart,
  },
  {
    name: "Find Medicine",
    href: "/find-medicine",
    icon: Search,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Subscription",
    href: "/dashboard/subscription",
    icon: CreditCard,
  },
  {
    name: "Location",
    href: "/dashboard/location",
    icon: MapPin,
  },
];

export default function DashboardNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center px-4 sm:px-6">
        {/* SmartPharma Logo */}
        <Link href="/dashboard" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            SP
          </div>

          <div className="hidden leading-none sm:block">
            <p className="text-[17px] font-bold tracking-tight text-slate-900">
              SmartPharma
            </p>

            <p className="mt-1 text-[11px] text-slate-500">
              Pharmacy Management
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="ml-8 hidden flex-1 items-center gap-1 xl:flex">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-[17px] w-[17px]" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin */}
        <div className="ml-auto hidden shrink-0 items-center gap-3 xl:flex">
          <div className="text-right leading-tight">
            <p className="text-[14px] font-bold text-slate-900">
              Pharmacy Admin
            </p>

            <p className="mt-1 text-[11px] text-slate-500">Pharmacy #1</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
            PA
          </div>
        </div>

        {/* Tablet / Mobile Navigation */}
        <nav className="ml-4 flex flex-1 items-center gap-1 overflow-x-auto xl:hidden">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Small screen profile */}
        <div className="ml-3 flex shrink-0 xl:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            PA
          </div>
        </div>
      </div>
    </header>
  );
}
