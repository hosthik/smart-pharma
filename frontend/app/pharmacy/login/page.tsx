"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Store } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function PharmacyLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Invalid email or password.";

        throw new Error(message);
      }

      if (!data?.accessToken) {
        throw new Error("Login succeeded, but no access token was returned.");
      }

      if (!data?.user) {
        throw new Error(
          "Login succeeded, but no user information was returned.",
        );
      }

      localStorage.setItem("smartpharma_token", data.accessToken);

      localStorage.setItem("smartpharma_user", JSON.stringify(data.user));

      /*
       * Administrators do not belong to a pharmacy.
       * They must go directly to the administration area.
       */
      if (data.user.role === "ADMIN") {
        router.push("/dashboard/admin/pharmacies");
        return;
      }

      /*
       * Pharmacy owners and staff must have
       * an associated pharmacy.
       */
      if (!data.user.pharmacyId || typeof data.user.pharmacyId !== "number") {
        localStorage.removeItem("smartpharma_token");

        localStorage.removeItem("smartpharma_user");

        throw new Error("No pharmacy is associated with this login.");
      }

      /*
       * Confirm the stored user can be read
       * correctly before entering the dashboard.
       */
      const currentUser = getCurrentUser();

      if (!currentUser) {
        localStorage.removeItem("smartpharma_token");

        localStorage.removeItem("smartpharma_user");

        throw new Error("Unable to establish your login session.");
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              SP
            </div>

            <div className="leading-none">
              <p className="text-lg font-bold tracking-tight text-slate-900">
                SmartPharma
              </p>

              <p className="mt-1 text-[11px] text-slate-500">
                Pharmacy Management
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Login Section */}
      <section className="flex min-h-[calc(100vh-145px)] items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Store className="h-7 w-7" />
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Pharmacy Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Sign in to manage your pharmacy, medicines, inventory, sales, and
              location.
            </p>
          </div>

          {/* Login Card */}
          <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@example.com"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Signing In..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Register Pharmacy */}
            <div className="mt-6 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?
              </p>

              <Link
                href="/pharmacy/register"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 transition hover:text-slate-600"
              >
                Register your pharmacy
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Patient Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">Looking for a medicine?</p>

            <Link
              href="/find-medicine"
              className="mt-1 inline-block text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              Find medicine as a patient
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} SmartPharma. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
