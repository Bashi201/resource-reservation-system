"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import {
  Menu,
  Bell,
  ChevronRight,
  ChevronDown,
  Layers,
  Calendar,
  Settings,
  LayoutDashboard,
  Users,
  Clock,
  LogOut,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useBranding } from "@/lib/branding-context";

interface NavbarProps {
  onOpenMobileMenu: () => void;
  isCollapsed: boolean;
}

export function Navbar({ onOpenMobileMenu, isCollapsed }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAdmin, logout, isHydrated } = useAuth();
  const { branding } = useBranding();

  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoutFeedback, setLogoutFeedback] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Live real-time Date & Time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(format(now, "EEE, MMM d • h:mm a"));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setLogoutFeedback(true);
    setTimeout(() => {
      logout();
    }, 400);
  };

  // Dynamic breadcrumb generation
  const getBreadcrumbs = () => {
    if (pathname === "/") {
      return {
        title: "Overview Dashboard",
        icon: LayoutDashboard,
        crumb: "Dashboard",
      };
    }
    if (pathname.startsWith("/resources")) {
      return {
        title: "Resource Catalog",
        icon: Layers,
        crumb: "Resources",
      };
    }
    if (pathname.startsWith("/reservations/new")) {
      return {
        title: "Book Facility",
        icon: Calendar,
        crumb: "New Reservation",
      };
    }
    if (pathname.startsWith("/reservations")) {
      return {
        title: "Reservation Schedule",
        icon: Calendar,
        crumb: "Reservations",
      };
    }
    if (pathname.startsWith("/users")) {
      return {
        title: "Team & User Directory",
        icon: Users,
        crumb: "Users",
      };
    }
    if (pathname.startsWith("/settings")) {
      return {
        title: "System Settings",
        icon: Settings,
        crumb: "Settings",
      };
    }
    return {
      title: `${branding.brandTitle} Hub`,
      icon: LayoutDashboard,
      crumb: "System",
    };
  };

  const breadcrumb = getBreadcrumbs();
  const Icon = breadcrumb.icon;

  const userInitials = isHydrated && user
    ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "PW";


  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-[left] duration-300 ease-in-out ${
        isCollapsed ? "left-0 md:left-20" : "left-0 md:left-64"
      }`}
    >
      <div className="h-full w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Link href="/" className="hover:text-slate-700 transition-colors">
                {branding.brandTitle}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {breadcrumb.title}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Live Date/Time, Quick Action CTA & User Account Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Live Date & Time Display */}
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs min-w-[175px] h-[34px]">
            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="whitespace-nowrap">
              {currentDateTime || "Loading time..."}
            </span>
          </div>

          {/* Notification Bell */}
          <button
            title="Notifications"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600"></span>
          </button>

          {/* User Account Icon with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs group"
              aria-label="User Account Menu"
              aria-expanded={isUserMenuOpen}
            >
              {isHydrated && user?.avatarUrl ? (
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-xs shrink-0">
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 ${
                  isHydrated && isAdmin
                    ? "bg-gradient-to-tr from-indigo-600 to-blue-600"
                    : "bg-gradient-to-tr from-sky-600 to-teal-600"
                }`}>
                  {userInitials}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  {isHydrated && user ? user.name : "PrimeWave Portal"}
                </span>
                <span className={`block text-[10px] font-semibold ${
                  isHydrated && isAdmin ? "text-indigo-600" : "text-teal-600"
                }`}>
                  {isHydrated ? (user?.roleTitle || (isAdmin ? "Administrator" : "Team Member")) : "Resource Hub"}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu Window */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Account Details Header */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    {isHydrated && user?.avatarUrl ? (
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shadow-2xs shrink-0">
                        <Image
                          src={user.avatarUrl}
                          alt={user.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 ${
                        isHydrated && isAdmin
                          ? "bg-gradient-to-tr from-indigo-600 to-blue-600"
                          : "bg-gradient-to-tr from-sky-600 to-teal-600"
                      }`}>
                        {userInitials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user ? user.name : "User"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user ? user.email : "user@primewave.com"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAdmin ? "Admin Verified Session" : "Active Member Session"}</span>
                  </div>
                </div>

                {/* Nav Links */}
                <div className="space-y-0.5">
                  {isAdmin && (
                    <Link
                      href="/users"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Team & Users</span>
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Workspace Settings</span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="my-1.5 border-t border-slate-100" />

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Toast Notification */}
      {logoutFeedback && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Session Securely Signed Out</p>
            <p className="text-[11px] text-slate-500">Ready for next operator login.</p>
          </div>
        </div>
      )}
    </header>
  );
}
