"use client";

import { FormEvent, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Pill,
  Plus,
  Trash2,
} from "lucide-react";

import PatientNavigation from "@/components/patient/PatientNavigation";
import { Button } from "@/components/ui/button";

type Reminder = {
  id: number;
  medicine: string;
  dosage: string;
  time: string;
  frequency: string;
  startDate: string;
};

export default function MedicineReminderPage() {
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("Every day");
  const [startDate, setStartDate] = useState("");

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!medicine.trim() || !dosage.trim() || !time || !startDate) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const newReminder: Reminder = {
      id: Date.now(),
      medicine: medicine.trim(),
      dosage: dosage.trim(),
      time,
      frequency,
      startDate,
    };

    setReminders((current) => [...current, newReminder]);

    setMedicine("");
    setDosage("");
    setTime("");
    setFrequency("Every day");
    setStartDate("");
    setMessage("Reminder added successfully.");
  };

  const deleteReminder = (id: number) => {
    setReminders((current) => current.filter((reminder) => reminder.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <PatientNavigation activePath="/medicine-reminder" />

      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Bell className="h-7 w-7" />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Medication Management
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Medicine Reminder
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Set reminders for your medicines so you can stay on schedule and
              never miss an important dose.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          {/* Add Reminder */}
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Plus className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Add Reminder
                </h2>
                <p className="text-sm text-slate-500">
                  Create a new medicine schedule
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Medicine */}
              <div>
                <label
                  htmlFor="medicine"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Medicine name
                </label>

                <div className="relative">
                  <Pill className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="medicine"
                    type="text"
                    value={medicine}
                    onChange={(event) => setMedicine(event.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* Dosage */}
              <div>
                <label
                  htmlFor="dosage"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Dosage
                </label>

                <input
                  id="dosage"
                  type="text"
                  value={dosage}
                  onChange={(event) => setDosage(event.target.value)}
                  placeholder="e.g. 1 tablet"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {/* Time */}
              <div>
                <label
                  htmlFor="time"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Reminder time
                </label>

                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label
                  htmlFor="frequency"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Frequency
                </label>

                <select
                  id="frequency"
                  value={frequency}
                  onChange={(event) => setFrequency(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                >
                  <option>Every day</option>
                  <option>Every other day</option>
                  <option>Once a week</option>
                  <option>As needed</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Start date
                </label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {message && (
                <div className="flex items-start gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Reminder
              </Button>
            </form>
          </div>

          {/* Reminder List */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Your Reminders
              </h2>

              <p className="mt-1 text-slate-500">
                Keep track of your scheduled medicines.
              </p>
            </div>

            {reminders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <Bell className="h-6 w-6 text-slate-500" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  No reminders yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Add your first medicine reminder using the form to start
                  keeping track of your medication schedule.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <Pill className="h-6 w-6 text-slate-700" />
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {reminder.medicine}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {reminder.dosage}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              <Clock className="h-3.5 w-3.5" />
                              {reminder.time}
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {reminder.frequency}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {reminder.startDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteReminder(reminder.id)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Stay consistent with your medication
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Medicine reminders help you organize your medication schedule
                  and make it easier to remember your doses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SmartPharma. All rights reserved.</p>

          <div className="flex gap-6">
            <a href="/about-us" className="transition hover:text-slate-900">
              About Us
            </a>

            <a href="/contact-us" className="transition hover:text-slate-900">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
