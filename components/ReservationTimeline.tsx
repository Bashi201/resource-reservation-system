"use client";

import React, { useState } from "react";
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
    <div className="glass-panel rounded-2xl p-6">
      {/* Timeline Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Interactive Daily Schedule
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual block view. Click any open slot to start a reservation.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={format(selectedDate, "yyyy-MM-dd")}
            onChange={(e) => {
              if (e.target.value) {
                onDateChange(parseISO(e.target.value));
              }
            }}
            className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          />
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-white/10 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Time Markers */}
          <div className="grid grid-cols-[220px_1fr] border-b border-white/5 pb-2 mb-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-2">
              Facility / Asset
            </div>
            <div className="grid grid-cols-12 text-center">
              {hoursArray.slice(0, 12).map((h) => (
                <div key={h} className="text-[11px] font-medium text-slate-400">
                  {h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
                </div>
              ))}
            </div>
          </div>

          {/* Resources Rows */}
          <div className="space-y-3">
            {resources.map((resource) => {
              const resList = dayReservations.filter((r) => r.resourceId === resource.id);

              return (
                <div
                  key={resource.id}
                  className="grid grid-cols-[220px_1fr] items-center py-2.5 px-2 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/5 transition-colors group"
                >
                  {/* Resource Info column */}
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                      {resource.name}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      Cap: {resource.capacity} • {resource.type}
                    </span>
                  </div>

                  {/* 12-hour bar track */}
                  <div className="relative h-10 bg-slate-950/70 rounded-lg border border-white/5 overflow-hidden flex items-center">
                    {/* Hour grid lines */}
                    <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="border-r border-white/[0.04] h-full"
                          onClick={() => onSlotClick && onSlotClick(resource.id, startHour + idx)}
                        />
                      ))}
                    </div>

                    {/* Empty click triggers */}
                    <div className="absolute inset-0 grid grid-cols-12">
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSlotClick && onSlotClick(resource.id, startHour + idx)}
                          className="h-full hover:bg-emerald-500/10 transition-colors"
                          title={`Click to book ${resource.name} at ${startHour + idx}:00`}
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
                          className="absolute h-7 rounded-md bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 border border-indigo-400/40 shadow-sm shadow-indigo-600/30 flex items-center px-2 z-10 overflow-hidden cursor-pointer group/block"
                          title={`${res.title} (${res.bookerName})\n${format(start, "h:mm a")} - ${format(end, "h:mm a")}`}
                        >
                          <span className="text-[11px] font-medium text-white truncate drop-shadow-sm">
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

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-r from-indigo-600 to-violet-600 border border-indigo-400/30"></span>
            <span>Reserved (Confirmed)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-950/70 border border-white/10 hover:bg-emerald-500/20"></span>
            <span>Available (Click to book)</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>Timeline displays standard operational hours (8:00 AM – 8:00 PM).</span>
        </div>
      </div>
    </div>
  );
}
