"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

import PatientNavigation from "@/components/patient/PatientNavigation";

const contactItems = [
  {
    icon: Mail,
    title: "Email",
    value: "support@smartpharma.com",
    description: "For general questions, support, and feedback",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+2519 7398 5357",
    description: "Monday to Friday, 8:00 AM – 5:00 PM",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Robe, Bale, Oromia, Ethiopia",
    description: "SmartPharma support office",
  },
];

const teamMembers = [
  {
    name: "Abdurehman Abduljewad",
    roles: ["Leader", "Manager of Cyber Security", "Admin"],
    phone: "+251 98 461 7112",
    telegram: "https://t.me/secretlygently",
    telegramLabel: "@secretlygently",
    image: "/images/team/abdurahman.jpg",
  },
  {
    name: "Berekie Tilahun",
    roles: ["Vice Leader", "Business Manager, Admin"],
    phone: "+251 96 004 2272",
    telegram: "https://t.me/+251960042272",
    telegramLabel: "Telegram",
    image: "/images/team/berekie.jpg",
  },
  {
    name: "Fenet Habtamu",
    roles: ["Vice Business Manager", "Admin"],
    phone: "+251 94 693 8728",
    telegram: "https://t.me/Fefina46",
    telegramLabel: "@Fefina46",
    image: "/images/team/fenet.jpg",
  },
  {
    name: "Hosni Hassen",
    roles: [
      "Manager of Fullstack",
      "Admin",
      "Coder and Vice Cyber Security Manager",
    ],
    phone: "0973985357",
    telegram: "https://t.me/hosthas",
    telegramLabel: "@hosthas",
    image: "/images/team/husni.jpg",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PatientNavigation activePath="/contact-us" />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              SmartPharma Support
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Contact Us
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Have a question about SmartPharma, need help finding medicine, or
              want to share feedback? Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-14 lg:px-8">
        {/* Contact Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {contactItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-950">
                  {item.title}
                </h2>

                <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                  {item.value}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Support and Hours */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Support */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <MessageCircle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  We&apos;re here to help
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Need assistance?
                </h2>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
              Whether you need help searching for a medicine, finding a
              pharmacy, understanding medicine availability, using the
              prescription scanner, or using another SmartPharma feature, our
              support team is ready to assist.
            </p>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">
                Before contacting support
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Please describe your question or issue clearly and include any
                relevant SmartPharma feature you were using. This helps us
                understand your situation and provide better assistance.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:support@smartpharma.com"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Mail className="h-4 w-4" />
                Email Support
              </a>

              <a
                href="tel:+251973985357"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <Phone className="h-4 w-4" />
                Call Us
              </a>
            </div>
          </section>

          {/* Support Hours */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Clock3 className="h-5 w-5 text-slate-700" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-950">
              Support Hours
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <span className="text-slate-500">Monday – Friday</span>

                <span className="font-medium text-slate-700">
                  8:00 AM – 5:00 PM
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <span className="text-slate-500">Saturday</span>

                <span className="font-medium text-slate-700">
                  9:00 AM – 1:00 PM
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Sunday</span>

                <span className="font-medium text-slate-700">Closed</span>
              </div>
            </div>

            <div className="mt-7 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Response
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                We aim to respond to support questions as quickly as possible
                during our support hours.
              </p>
            </div>
          </section>
        </div>

        {/* Development Team */}
        <section className="mt-12">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              The People Behind SmartPharma
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Meet Our Development Team
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
              SmartPharma is built by a dedicated team working across
              leadership, business management, writing, administration, and
              backend development.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
              >
                {/* Photo */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Information */}
                <div className="p-6">
                  <h3 className="text-xl font-bold tracking-tight text-slate-950">
                    {member.name}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {member.roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {role}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3">
                    {member.phone ? (
                      <a
                        href={`tel:${member.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-3 text-sm text-slate-600 transition hover:text-slate-950"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <Phone className="h-4 w-4 text-slate-700" />
                        </span>

                        <span className="font-medium">{member.phone}</span>
                      </a>
                    ) : null}

                    <a
                      href={member.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-slate-600 transition hover:text-slate-950"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <Send className="h-4 w-4 text-slate-700" />
                      </span>

                      <span className="font-medium">
                        {member.telegramLabel}
                      </span>
                    </a>
                  </div>

                  <a
                    href={member.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Send className="h-4 w-4" />
                    Contact on Telegram
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Helpful Links */}
        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Explore SmartPharma
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Looking for something else?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Use these tools to find medicine information or learn more about
              what SmartPharma offers.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/find-medicine"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <h3 className="font-semibold text-slate-950">Find Medicine</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search for medicines and check pharmacy availability.
              </p>
            </Link>

            <Link
              href="/pharmacies"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <h3 className="font-semibold text-slate-950">Find Pharmacies</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Explore pharmacies and their available medicines.
              </p>
            </Link>

            <Link
              href="/scan-prescription"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <h3 className="font-semibold text-slate-950">
                Scan Prescription
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Upload a prescription to help identify medicines.
              </p>
            </Link>

            <Link
              href="/about-us"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <h3 className="font-semibold text-slate-950">
                About SmartPharma
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Learn more about SmartPharma and our mission.
              </p>
            </Link>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mt-10 rounded-3xl bg-slate-950 p-7 text-center text-white shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            SmartPharma
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            We&apos;re here to make your medicine journey easier.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Search for medicines, discover pharmacies, or learn more about
            SmartPharma and the tools available to you.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/find-medicine"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Find Medicine
            </Link>

            <Link
              href="/about-us"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              About SmartPharma
            </Link>
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} SmartPharma. All rights reserved.</p>

          <div className="flex flex-wrap gap-5">
            <Link href="/" className="transition hover:text-slate-950">
              Home
            </Link>

            <Link
              href="/find-medicine"
              className="transition hover:text-slate-950"
            >
              Find Medicine
            </Link>

            <Link
              href="/pharmacies"
              className="transition hover:text-slate-950"
            >
              Pharmacies
            </Link>

            <Link href="/about-us" className="transition hover:text-slate-950">
              About Us
            </Link>

            <Link
              href="/contact-us"
              className="transition hover:text-slate-950"
            >
              Contact Us
            </Link>

            <Link
              href="/pharmacy/login"
              className="transition hover:text-slate-950"
            >
              Pharmacy Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
