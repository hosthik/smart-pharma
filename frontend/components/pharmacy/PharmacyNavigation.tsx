"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Boxes,
  ChevronDown,
  CreditCard,
  Home,
  Info,
  LogOut,
  MapPin,
  Pill,
  UserRound,
} from "lucide-react";
import { useSyncExternalStore } from "react";

import { getCurrentUser, logout } from "@/lib/auth";

type PharmacyNavigationProps = {
  activePath?: string;
};

const navigation = [
  {
    name: "Home",
    href: "/dashboard/home",
    icon: Home,
  },
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
  {
    name: "About Us",
    href: "/dashboard/about",
    icon: Info,
  },
  {
    name: "Contact Us",
    href: "/dashboard/contact",
    icon: Info,
  },
  {
    name: "Account Settings",
    href: "/dashboard/account",
    icon: UserRound,
  },
];

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function getClientPharmacyName() {
  return getCurrentUser()?.pharmacyName || "Pharmacy";
}

function getServerPharmacyName() {
  return "Pharmacy";
}

export default function PharmacyNavigation({
  activePath,
}: PharmacyNavigationProps) {
  const router = useRouter();

  const mounted = useSyncExternalStore(
    subscribeToStorage,
    getClientSnapshot,
    getServerSnapshot,
  );

  const pharmacyName = useSyncExternalStore(
    subscribeToStorage,
    getClientPharmacyName,
    getServerPharmacyName,
  );

  const handleLogout = () => {
    logout();
    router.push("/pharmacy/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Brand + Account */}
        <div className="flex min-h-20 items-center justify-between gap-6">
          {/* SmartPharma Brand */}
          <Link href="/dashboard/home" className="flex items-center gap-3">
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

            <div>
              <span className="block text-lg font-bold text-slate-900">
                SmartPharma
              </span>

              <span className="block text-xs font-medium text-slate-500">
                Pharmacy Management
              </span>
            </div>
          </Link>

          {/* Pharmacy Account */}
          <Link
            href="/dashboard/account"
            className="group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <UserRound className="h-5 w-5" />
            </div>

            <div className="hidden text-right sm:block">
              <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">
                {mounted ? pharmacyName : "Pharmacy"}
              </p>

              <p className="text-xs text-slate-500">Pharmacy Account</p>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-400 transition group-hover:text-slate-700 sm:block" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 py-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />

                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />

            <span>Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
