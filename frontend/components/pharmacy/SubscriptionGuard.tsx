"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getPharmacyId, getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const BASIC_ALLOWED_PATHS = ["/dashboard/subscription", "/dashboard/account"];

type Subscription = {
  id: number;
  pharmacyId: number;
  plan: "BASIC" | "STANDARD" | "PROFESSIONAL" | "ENTERPRISE";
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
  startDate: string | null;
  renewalDate: string | null;
};
export default function SubscriptionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSubscription() {
      const token = getToken();
      const pharmacyId = getPharmacyId();

      /*
       * Admin pages are handled separately and must not be
       * restricted by the pharmacy subscription.
       */
      if (pathname.startsWith("/dashboard/admin")) {
        if (!cancelled) {
          setAllowed(true);
          setLoading(false);
        }

        return;
      }

      if (!token || !pharmacyId) {
        router.replace("/pharmacy/login");
        return;
      }

      /*
       * Subscription and Account are always available so that
       * a Basic pharmacy can manage its plan and upgrade.
       */
      const isAllowedPath = BASIC_ALLOWED_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      );

      try {
        const response = await fetch(
          `${API_URL}/payments/subscription/${pharmacyId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load subscription.");
        }

        const subscription = (await response.json()) as Subscription | null;

        if (cancelled) {
          return;
        }

        /*
         * No subscription:
         * allow the user to reach the subscription page
         * so they can choose a plan.
         */
        if (!subscription) {
          setAllowed(isAllowedPath);
          setLoading(false);

          if (!isAllowedPath) {
            router.replace("/dashboard/subscription");
          }

          return;
        }

        /*
         * Basic pharmacies can only access Subscription
         * and Account.
         */
        if (subscription.plan === "BASIC") {
          if (isAllowedPath) {
            setAllowed(true);
          } else {
            setAllowed(false);
            router.replace("/dashboard/subscription");
          }

          setLoading(false);
          return;
        }

        /*
         * Paid active subscriptions get the full pharmacy
         * dashboard.
         */
        if (subscription.status === "ACTIVE") {
          setAllowed(true);
          setLoading(false);
          return;
        }
        {
          setAllowed(true);
          setLoading(false);
          return;
        }

        /*
         * Expired, cancelled, or pending subscriptions:
         * send the pharmacy to Subscription.
         */
        setAllowed(isAllowedPath);
        setLoading(false);

        if (!isAllowedPath) {
          router.replace("/dashboard/subscription");
        }
      } catch {
        if (cancelled) {
          return;
        }

        setAllowed(false);
        setLoading(false);
        router.replace("/dashboard/subscription");
      }
    }

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <p className="mt-4 text-sm text-slate-500">
            Checking subscription...
          </p>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
