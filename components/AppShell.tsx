"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useBranding } from "@/lib/branding-context";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { DeveloperSignature } from "./DeveloperSignature";
import { Loader2 } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { branding } = useBranding();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync collapsed preference after hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pw_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore
    }
  }, []);

  // Route Protection: Unauthenticated visitors cannot access protected application routes
  useEffect(() => {
    if (isHydrated && !isAuthenticated && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, pathname, router]);

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

  // If on /login page, render without standard app shell chrome
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Guard for protected routes: show clean transition if unauthenticated or not yet hydrated
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Redirecting to login…</span>
        </div>
      </div>
    );
  }

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
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left">© 2026 {branding.companyName} • {branding.tagline}</p>
          <DeveloperSignature variant="footer" />
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Next.js 16</span>
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
