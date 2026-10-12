import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrimeWave Lab | Resource Reservation System",
  description:
    "Centralized shared resource booking platform engineered for PrimeWave Lab. Real-time conflict detection, high-concurrency protection, and facility schedule management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}
      >
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
          <p>
            © 2026 PrimeWave Lab (Pvt) Ltd • Resource Reservation Management System.
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Powered by Next.js 16 App Router, TypeScript, Prisma ORM, and PostgreSQL.
          </p>
        </footer>
      </body>
    </html>
  );
}
