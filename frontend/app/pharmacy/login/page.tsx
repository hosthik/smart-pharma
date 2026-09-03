"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginPharmacy } from "@/lib/api";

export default function PharmacyLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await loginPharmacy(email, password);

      localStorage.setItem(
        "smartpharma_token",
        data.accessToken,
      );

      localStorage.setItem(
        "smartpharma_user",
        JSON.stringify(data.user),
      );

      router.push(
        `/dashboard?pharmacyId=${data.user.pharmacyId}`,
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-6">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Pharmacy Login
          </h1>

          <p className="mt-2 text-muted-foreground">
            Sign in to manage your pharmacy
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="owner@example.com"
              required
              className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              required
              className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}