"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Resource, Reservation } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { ReservationTimeline } from "@/components/ReservationTimeline";
import { ResourceCard } from "@/components/ResourceCard";
import { StatusBadge } from "@/components/StatusBadge";
import { BookingModal } from "@/components/BookingModal";
import { DashboardSkeleton } from "@/components/skeletons";
import {
  Layers,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Loader2,
} from "lucide-react";

interface ReservationWithResource extends Reservation {
  resource: Resource;
}

export default function DashboardPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<ReservationWithResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Booking Modal Window state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [modalPreResource, setModalPreResource] = useState<string | undefined>(undefined);
  const [modalPreDate, setModalPreDate] = useState<Date | undefined>(undefined);
  const [modalPreHour, setModalPreHour] = useState<number | undefined>(undefined);

  const handleOpenBooking = (params?: { resourceId?: string; date?: Date; hour?: number }) => {
    setModalPreResource(params?.resourceId);
    setModalPreDate(params?.date);
    setModalPreHour(params?.hour);
    setIsBookingModalOpen(true);
  };

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    setSelectedDate(new Date());
    fetchData();
  }, [fetchData]);

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
    return <DashboardSkeleton />;
  }


  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 md:p-10 shadow-xs">
        {/* Soft Ambient Glows */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-50/70 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-50/70 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>PrimeWave Centralized Facility Operations</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Resource Reservation Management System
            </h1>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              Eliminate double bookings, schedule boardrooms, and manage shared company assets with
              real-time conflict detection and transaction-isolated booking integrity.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenBooking()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all transform active:scale-95 cursor-pointer"
              >
                <span>Book a Facility</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/resources"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all"
              >
                <span>Explore Assets</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Quick Operational Overview Widget */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
            <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Facility System Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Optimal
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Available Inventory</span>
                  <span className="text-indigo-600 font-bold">
                    {Math.round((availableResources / (totalResources || 1)) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{
                      width: `${Math.round((availableResources / (totalResources || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                <span>Concurrency Protection</span>
                <span className="font-semibold text-slate-800">Serializable Isolation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Assets
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{totalResources}</span>
            <span className="text-xs text-slate-500 block mt-1">Rooms, tech rigs & vehicles</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available Now
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-600">{availableResources}</span>
            <span className="text-xs text-slate-500 block mt-1">Ready for instant booking</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bookings Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{todayReservations.length}</span>
            <span className="text-xs text-slate-500 block mt-1">Scheduled for selected date</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Bookings
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{totalConfirmed}</span>
            <span className="text-xs text-slate-500 block mt-1">Total active confirmed</span>
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
          handleOpenBooking({
            resourceId: resId,
            date: selectedDate || new Date(),
            hour,
          });
        }}
      />

      {/* Two Column Section: Upcoming Schedule Feed & Resource Directory Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Today's Bookings Feed */}
        <div className="lg:col-span-4 xl:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Today&apos;s Reservations</span>
              </h2>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {todayReservations.length} slot{todayReservations.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {todayReservations.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  No reservations scheduled for this date.
                </div>
              ) : (
                todayReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700">
                        {format(new Date(res.startTime), "h:mm a")} –{" "}
                        {format(new Date(res.endTime), "h:mm a")}
                      </span>
                      <StatusBadge status={res.status} type="reservation" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{res.title}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700">{res.resource.name}</span>
                      <span>By: {res.bookerName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/reservations"
              className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>View all bookings & history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Featured Assets Grid */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Facility & Asset Catalog</h2>
              <p className="text-xs text-slate-500">
                Browse shared resources and review current booking allocations.
              </p>
            </div>
            <Link
              href="/resources"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All ({totalResources})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {resources.slice(0, 6).map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onBook={(r) =>
                  handleOpenBooking({
                    resourceId: r.id,
                    date: selectedDate || new Date(),
                  })
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal Window */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialResourceId={modalPreResource}
        initialDate={modalPreDate}
        initialHour={modalPreHour}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}
