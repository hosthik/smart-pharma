import type { Metadata } from "next";
import "./globals.css";

import AiAssistant from "@/components/ai/AiAssistant";

export const metadata: Metadata = {
  title: "SmartPharma",
  description: "SmartPharma - Medicine Discovery and Pharmacy Management",
  icons: {
    icon: "/images/smartpharma logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}

        <AiAssistant />
      </body>
    </html>
  );
}
