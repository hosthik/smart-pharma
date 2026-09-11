"use client";

import { useState } from "react";
import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";
import { getToken } from "@/lib/auth";

const API_URL = "http://localhost:4000";

const categories = [
  "General Feedback",
  "Inventory Management",
  "Medicine Management",
  "Pharmacy Dashboard",
  "Subscription",
  "Payment",
  "Pharmacy Verification",
  "Technical Issue",
  "Feature Request",
  "Other",
];

export default function FeedbackPage() {
  const [category, setCategory] = useState("General Feedback");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (message.trim().length < 5) {
      setError("Please enter at least 5 characters in your feedback.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/feedback/pharmacy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          message: message.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          typeof data?.message === "string"
            ? data.message
            : "Failed to submit feedback.";

        throw new Error(errorMessage);
      }

      setSuccess("Thank you! Your feedback has been submitted successfully.");

      setCategory("General Feedback");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <PharmacyNavigation activePath="/dashboard/feedback" />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-950">
              Send Us Your Feedback
            </h1>

            <p className="mt-3 text-slate-600">
              Help us improve SmartPharma by sharing your pharmacy experience,
              suggestions, or concerns.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {success && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Feedback Category
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Your Feedback
                </label>

                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your pharmacy experience..."
                  minLength={5}
                  maxLength={2000}
                  rows={7}
                  required
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                />

                <div className="mt-2 text-right text-xs text-slate-400">
                  {message.length}/2000
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">
              We value your opinion
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your feedback helps us improve pharmacy management, inventory
              management, medicine services, and the overall SmartPharma
              experience for pharmacies.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
