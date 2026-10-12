"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Resource, Reservation } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { ReservationTimeline } from "@/components/ReservationTimeline";
import { ResourceCard } from "@/components/ResourceCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Layers,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ReservationWithResource extends Reservation {
  resource: Resource;
}

export default function DashboardPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<ReservationWithResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const [resResources, resReservations] = await Promise.all([
        fetch("/api/resources"),
        fetch("/api/reservations"),
      ]);

      if (resResources.ok) {
        const data = await resResources.json();
        setResources(data);
      }
      if (resReservations.ok) {
        const data = await resReservations.json();
        setReservations(data);
      }
    } catch (e) {
      console.error("Dashboard data fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedDate(new Date());
    fetchData();
  }, []);

  const totalResources = resources.length;
  const availableResources = resources.filter((r) => r.status === "AVAILABLE").length;
  const todayReservations = reservations.filter(
    (r) =>
      r.status === "CONFIRMED" &&
      selectedDate &&
      isSameDay(new Date(r.startTime), selectedDate)
  );
  const totalConfirmed = reservations.filter((r) => r.status === "CONFIRMED").length;

  if (loading || !selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading system overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10 border border-white/10">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PrimeWave Centralized Facility Operations</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Resource Reservation Management System
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate double bookings, schedule boardrooms, and manage shared company assets with
            real-time conflict detection and transaction-isolated booking integrity.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/reservations/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95"
            >
              <span>Book a Facility</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/resources"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 transition-all"
            >
              <span>Explore Assets</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Assets
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white">{totalResources}</span>
            <span className="text-xs text-slate-400 block mt-1">Rooms, tech rigs & vehicles</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Available Now
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-emerald-400">{availableResources}</span>
            <span className="text-xs text-slate-400 block mt-1">Ready for instant booking</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Bookings Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white">{todayReservations.length}</span>
            <span className="text-xs text-slate-400 block mt-1">Scheduled for today</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Bookings
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white">{totalConfirmed}</span>
            <span className="text-xs text-slate-400 block mt-1">Total active confirmed</span>
          </div>
        </div>
      </div>

      {/* Visual Timeline Section */}
      <ReservationTimeline
        resources={resources}
        reservations={reservations}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSlotClick={(resId, hour) => {
          window.location.href = `/reservations/new?resourceId=${resId}&date=${format(selectedDate, "yyyy-MM-dd")}&hour=${hour}`;
        }}
      />

      {/* Two Column Section: Upcoming Schedule Feed & Resource Directory Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Bookings Feed */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Today&apos;s Reservations</span>
              </h2>
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {todayReservations.length} slot{todayReservations.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {todayReservations.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                  No reservations scheduled for today yet.
                </div>
              ) : (
                todayReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-300">
                        {format(new Date(res.startTime), "h:mm a")} –{" "}
                        {format(new Date(res.endTime), "h:mm a")}
                      </span>
                      <StatusBadge status={res.status} type="reservation" />
                    </div>
                    <p className="text-sm font-medium text-white mt-1">{res.title}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{res.resource.name}</span>
                      <span>By: {res.bookerName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Link
              href="/reservations"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>View all bookings & history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Featured Assets Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-lg font-bold text-white">Facility & Asset Catalog</h2>
              <p className="text-xs text-slate-400">
                Browse shared resources and review current booking allocations.
              </p>
            </div>
            <Link
              href="/resources"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All ({totalResources})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.slice(0, 4).map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
