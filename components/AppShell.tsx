"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pw_sidebar_collapsed");
        if (saved !== null) {
          return saved === "true";
        }
      } catch {
        // Ignore
      }
    }
    return false;
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pw_sidebar_collapsed", String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Sidebar (Desktop fixed + Mobile slideover) */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Top Navbar */}
      <Navbar
        onOpenMobileMenu={() => setIsMobileOpen(true)}
        isCollapsed={isCollapsed}
      />

      {/* Main Content Area (pt-16 to offset fixed top navbar) */}
      <main
        className={`flex-1 pt-16 transition-[padding] duration-300 ease-in-out ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* Production-grade Footer */}
      <footer
        className={`border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500 transition-[padding] duration-300 ease-in-out ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 PrimeWave Lab (Pvt) Ltd • Resource Reservation Management System</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Next.js 16 App Router</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>Prisma ORM</span>
            <span>•</span>
            <span>PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
