"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Calculator,
  ClipboardPlus,
  FileText,
  Home,
  Info,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Pill,
  Search,
  X,
} from "lucide-react";

type PatientNavigationProps = {
  activePath?: string;
};

const navigationItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Find Medicine",
    href: "/find-medicine",
    icon: Search,
  },
  {
    label: "Pharmacies",
    href: "/pharmacies",
    icon: MapPin,
  },
  {
    label: "Scan Prescription",
    href: "/scan-prescription",
    icon: ClipboardPlus,
  },
  {
    label: "Cost Estimation",
    href: "/cost-estimation",
    icon: Calculator,
  },
  {
    label: "Medicine Reminder",
    href: "/medicine-reminder",
    icon: Pill,
  },
  {
    label: "About Us",
    href: "/about-us",
    icon: Info,
  },
  {
    label: "Contact Us",
    href: "/contact-us",
    icon: Mail,
  },
  {
    label: "Feedback",
    href: "/feedback",
    icon: MessageCircle,
  },
];

export default function PatientNavigation({
  activePath,
}: PatientNavigationProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentPath = activePath ?? pathname;

  function isActive(href: string) {
    return (
      currentPath === href ||
      (href !== "/" && currentPath.startsWith(`${href}/`))
    );
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Top Header */}
        <div className="flex min-h-20 items-center justify-between gap-6">
          {/* SmartPharma Brand */}
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setMenuOpen(false)}
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

            <div>
              <span className="block text-lg font-bold text-slate-900">
                SmartPharma
              </span>

              <span className="block text-xs font-medium text-slate-500">
                Smart Healthcare
              </span>
            </div>
          </Link>

          {/* Pharmacy Login */}
          <Link
            href="/pharmacy/login"
            className="hidden items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 sm:flex"
          >
            <FileText className="h-4 w-4" />
            <span>Pharmacy Login</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={
              menuOpen ? "Close patient navigation" : "Open patient navigation"
            }
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-50 sm:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 overflow-x-auto border-t border-slate-100 py-3 sm:flex">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        {menuOpen ? (
          <div className="border-t border-slate-100 py-4 sm:hidden">
            <nav className="flex flex-col gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-slate-950 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <Link
                href="/pharmacy/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <FileText className="h-4 w-4" />
                <span>Pharmacy Login</span>
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
