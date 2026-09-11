"use client";
import Image from "next/image";

import Link from "next/link";
import { Clock3, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

import PharmacyNavigation from "@/components/pharmacy/PharmacyNavigation";

const contactItems = [
  {
    icon: Mail,
    title: "Email",
    value: "support@smartpharma.com",
    description: "For general questions and support",
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
    role: "Group Leader, Admin",
    phone: "+251 98 461 7112",
    telegram: "https://t.me/secretlygently",
    image: "/images/team/abdurehman.jpg",
  },
  {
    name: "Berekie Tilahun",
    role: "Vice Group Leader, Business Manager",
    phone: "+251 96 004 2272",
    telegram: "https://t.me/+251960042272",
    image: "/images/team/berekie.jpg",
  },
  {
    name: "Fenet",
    role: "Vice Business Manager, Writer",
    phone: null,
    telegram: "https://t.me/Fefina46",
    image: "/images/team/fenet.jpg",
  },
  {
    name: "Hosni Hassen",
    role: "Backend Manager, Admin, Coder",
    phone: "0973985357",
    telegram: "https://t.me/hosthas",
    image: "/images/team/hosni.jpg",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PharmacyNavigation activePath="/dashboard/contact" />

      {/* Main */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Page Heading */}
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            SmartPharma Support
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Contact Us
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            We&apos;re here to help your pharmacy run more efficiently. Reach
            out to the SmartPharma team whenever you need assistance, have a
            question, or want to share feedback.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {contactItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-950">
                  {item.title}
                </h2>

                <p className="mt-2 break-words text-sm font-semibold text-slate-700">
                  {item.value}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Support / Hours */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Support */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <MessageCircle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  We&apos;re here for you
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Need assistance?
                </h2>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
              Whether you need help managing your inventory, understanding your
              analytics, updating your pharmacy information, or using your
              SmartPharma subscription, our support team is ready to assist.
            </p>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">
                Before contacting support
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Please include your pharmacy name and a short description of the
                issue. This helps us respond faster and provide the right
                assistance.
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

          {/* Hours */}
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
          </section>
        </div>

        {/* Pharmacy Support Information */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Pharmacy Support
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              We&apos;re here to support your pharmacy
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              SmartPharma is designed to help pharmacies manage medicines,
              inventory, analytics, subscriptions, and pharmacy information more
              efficiently. If you experience a problem or need help using any
              part of the platform, our support team is ready to assist.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-950">
                Inventory Support
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Get help managing medicine stock and inventory information.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-950">
                Pharmacy Information
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Get assistance updating your pharmacy details and location.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-950">
                Analytics Support
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Get help understanding your pharmacy analytics and reports.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-950">
                Subscription Support
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Get assistance with your SmartPharma subscription and account.
              </p>
            </div>
          </div>
        </section>

        {/* Development Team */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              SmartPharma Team
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Meet our development team
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Our team works together to build, manage, and improve the
              SmartPharma platform. You can contact the appropriate team member
              directly when you need additional assistance.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md"
              >
                {/* Team Photo */}
                <div className="aspect-square bg-slate-100">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Team Information */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-950">
                    {member.name}
                  </h3>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    {member.role}
                  </p>

                  <div className="mt-5 space-y-3">
                    {member.phone ? (
                      <a
                        href={`tel:${member.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-3 text-sm font-medium text-slate-700 transition hover:text-slate-950"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <Phone className="h-4 w-4" />
                        </span>

                        <span>{member.phone}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <Phone className="h-4 w-4" />
                        </span>

                        <span>No phone listed</span>
                      </div>
                    )}

                    <a
                      href={member.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm font-medium text-slate-700 transition hover:text-slate-950"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <Send className="h-4 w-4" />
                      </span>

                      <span>Telegram</span>
                    </a>
                  </div>

                  <a
                    href={member.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Send className="h-4 w-4" />
                    Contact on Telegram
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            SmartPharma
          </p>

          <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            Need more information about the platform?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Learn more about SmartPharma or return to your pharmacy dashboard to
            continue managing your operations.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/about"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              About SmartPharma
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Return to Dashboard
            </Link>
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} SmartPharma. All rights reserved.
          </span>

          <Link
            href="/dashboard/about"
            className="font-medium text-slate-900 transition hover:text-slate-600"
          >
            About SmartPharma
          </Link>
        </div>
      </footer>
    </main>
  );
}
