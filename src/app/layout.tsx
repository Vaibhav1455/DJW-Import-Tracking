import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "DJW Import Tracking",
  description: "Import cargo lots, sales bookings, and live available-to-sell stock.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${fraunces.variable} font-sans`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
