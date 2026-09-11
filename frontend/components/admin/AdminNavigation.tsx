"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  Landmark,
  LogOut,
  Map,
  Menu,
  MessageSquare,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { logout } from "@/lib/auth";

type AdminNavigationProps = {
  activePath?: string;
};

const navigation = [
  {
    name: "Pharmacy Verification",
    href: "/dashboard/admin/pharmacies",
    icon: Building2,
  },
  {
    name: "Payment Verification",
    href: "/dashboard/admin/payment",
    icon: CreditCard,
  },
  {
    name: "Bank Accounts",
    href: "/dashboard/admin/banks",
    icon: Landmark,
  },
  {
    name: "Active Subscriptions",
    href: "/dashboard/admin/payment#subscriptions",
    icon: Settings,
  },
  {
    name: "Transportation Rates",
    href: "/dashboard/admin/transportation-rates",
    icon: Map,
  },
  {
    name: "Feedback",
    href: "/dashboard/admin/feedback",
    icon: MessageSquare,
  },
];

export default function AdminNavigation({ activePath }: AdminNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPath = activePath || pathname;

  function isActive(href: string) {
    const path = href.split("#")[0];

    return currentPath === path || currentPath.startsWith(`${path}/`);
  }

  function handleLogout() {
    logout();
    router.push("/pharmacy/login");
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="flex min-h-20 items-center justify-between gap-6">
          {/* Brand */}
          <Link
            href="/dashboard/admin/pharmacies"
            className="flex min-w-0 items-center gap-3"
            aria-label="SmartPharma Administration"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
              <Image
                src="/images/smartpharma logo.png"
                alt="SmartPharma"
                width={56}
                height={56}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="min-w-0">
              <span className="block truncate text-lg font-bold text-slate-900">
                SmartPharma
              </span>

              <span className="block text-xs font-medium text-slate-500">
                Administration
              </span>
            </div>
          </Link>

          {/* Admin Account */}
          <div className="flex items-center gap-3">
            {/* Admin Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <Settings className="h-5 w-5" />
            </div>

            {/* Admin Information */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                Administrator
              </p>

              <p className="text-xs font-medium text-slate-500">
                Admin Account
              </p>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />

              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 sm:hidden"
              aria-label={
                mobileOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 overflow-x-auto border-t border-slate-100 py-3 sm:flex">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-slate-100 py-4 sm:hidden">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-slate-800 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />

                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
