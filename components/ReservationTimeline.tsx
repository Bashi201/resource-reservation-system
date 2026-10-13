"use client";

import React from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { Resource, Reservation } from "@prisma/client";
import { Clock, Calendar as CalendarIcon, Info } from "lucide-react";

interface ReservationWithResource extends Reservation {
  resource: Resource;
}

interface ReservationTimelineProps {
  resources: Resource[];
  reservations: ReservationWithResource[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSlotClick?: (resourceId: string, hour: number) => void;
}

export function ReservationTimeline({
  resources,
  reservations,
  selectedDate,
  onDateChange,
  onSlotClick,
}: ReservationTimelineProps) {
  // Working hours to display (e.g., 08:00 to 20:00)
  const startHour = 8;
  const endHour = 20;
  const totalHours = endHour - startHour;
  const hoursArray = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  // Filter reservations for the selected date
  const dayReservations = reservations.filter(
    (res) =>
      res.status === "CONFIRMED" &&
      isSameDay(new Date(res.startTime), selectedDate)
  );

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      {/* Timeline Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Interactive Daily Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time visual schedule. Click any open slot to reserve immediately.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => {
                if (e.target.value) {
                  onDateChange(parseISO(e.target.value));
                }
              }}
              className="pl-9 pr-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-2xs"
            />
          </div>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
          >
            Today
          </button>
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[820px]">
          {/* Header Time Markers */}
          <div className="grid grid-cols-[220px_1fr] border-b border-slate-100 pb-2 mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2">
              Facility / Asset
            </div>
            <div className="grid grid-cols-12 text-center">
              {hoursArray.slice(0, 12).map((h) => (
                <div key={h} className="text-[11px] font-semibold text-slate-500">
                  {h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
                </div>
              ))}
            </div>
          </div>

          {/* Resources Rows */}
          <div className="space-y-2.5">
            {resources.map((resource) => {
              const resList = dayReservations.filter((r) => r.resourceId === resource.id);

              return (
                <div
                  key={resource.id}
                  className="grid grid-cols-[220px_1fr] items-center py-2 px-2 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-slate-100 transition-colors group"
                >
                  {/* Resource Info column */}
                  <div className="pr-4">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {resource.name}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      Cap: {resource.capacity} • {resource.type}
                    </span>
                  </div>

                  {/* 12-hour bar track */}
                  <div className="relative h-10 bg-slate-100/90 rounded-lg border border-slate-200 overflow-hidden flex items-center">
                    {/* Hour grid lines */}
                    <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="border-r border-slate-200 h-full"
                        />
                      ))}
                    </div>

                    {/* Empty click triggers */}
                    <div className="absolute inset-0 grid grid-cols-12">
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSlotClick && onSlotClick(resource.id, startHour + idx)}
                          className="h-full hover:bg-indigo-100/70 transition-colors cursor-pointer"
                          title={`Click to reserve ${resource.name} at ${startHour + idx}:00`}
                        />
                      ))}
                    </div>

                    {/* Booked blocks */}
                    {resList.map((res) => {
                      const start = new Date(res.startTime);
                      const end = new Date(res.endTime);

                      const startDecimal =
                        start.getHours() + start.getMinutes() / 60;
                      const endDecimal = end.getHours() + end.getMinutes() / 60;

                      // Clamp within startHour and endHour
                      const clampedStart = Math.max(startHour, startDecimal);
                      const clampedEnd = Math.min(endHour, endDecimal);

                      if (clampedEnd <= startHour || clampedStart >= endHour) {
                        return null;
                      }

                      const leftPercent = ((clampedStart - startHour) / totalHours) * 100;
                      const widthPercent = ((clampedEnd - clampedStart) / totalHours) * 100;

                      return (
                        <div
                          key={res.id}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${Math.max(widthPercent, 2)}%`,
                          }}
                          className="absolute h-7 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs border border-indigo-800/20 flex items-center px-2 z-10 overflow-hidden cursor-pointer hover:brightness-105 transition-all"
                          title={`${res.title} (${res.bookerName})\n${format(start, "h:mm a")} - ${format(end, "h:mm a")}`}
                        >
                          <span className="text-[11px] font-semibold text-white truncate drop-shadow-2xs">
                            {res.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend & Help Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-indigo-600 border border-indigo-700"></span>
            <span className="font-medium text-slate-700">Reserved (Confirmed)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300"></span>
            <span className="font-medium text-slate-700">Available (Click slot to book)</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span>Operating hours 8:00 AM – 8:00 PM. High-concurrency safe.</span>
        </div>
      </div>
    </div>
  );
}
