import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { AuthProvider } from "@/lib/auth-context";
import { BrandingProvider } from "@/lib/branding-context";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
        <AuthProvider>
          <BrandingProvider>
            <AppShell>{children}</AppShell>
          </BrandingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
