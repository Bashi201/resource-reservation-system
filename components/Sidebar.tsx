"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & Schedule",
      exact: true,
    },
    {
      href: "/resources",
      label: "Resources",
      icon: Layers,
      description: "Facilities & Equipment",
      exact: false,
    },
    {
      href: "/reservations",
      label: "Reservations",
      icon: Calendar,
      description: "Bookings & Timeline",
      exact: false,
    },
    {
      href: "/users",
      label: "Users",
      icon: Users,
      description: "Team & Permissions",
      exact: false,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      description: "Preferences & System",
      exact: false,
    },
  ];

  const isItemActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
          <Link
            href="/"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 transition-all ${
              isCollapsed ? "justify-center w-full" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                  PrimeWave Lab
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-600 block">
                  Resource Hub
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close mobile navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1.5">
          {!isCollapsed && (
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Main Menu
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                {/* Active Indicator Bar */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />
                )}

                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                      : "text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                    <span className="block leading-tight">{item.label}</span>
                    <span className="block text-[11px] text-slate-400 group-hover:text-slate-500 font-normal">
                      {item.description}
                    </span>
                  </div>
                )}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / User Profile & Desktop Collapse Toggle */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        {/* System Operator Badge */}
        {!isCollapsed ? (
          <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              PW
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 leading-tight truncate">
                Admin Console
              </p>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified Session</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Admin Console">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
              PW
            </div>
          </div>
        )}

        {/* Desktop Collapse / Expand Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );


  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
