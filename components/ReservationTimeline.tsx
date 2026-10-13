"use client";

import React from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { Resource, Reservation } from "@prisma/client";
import {
  Clock,
  Calendar as CalendarIcon,
  Info,
  ShieldCheck,
  Plus,
} from "lucide-react";

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
  // Working hours to display (08:00 to 20:00)
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Controls Header */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>Interactive Daily Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
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
              className="pl-9 pr-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 hover:bg-white border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-700 focus:outline-none transition-all shadow-2xs cursor-pointer"
            />
          </div>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[960px]">
          {/* Table Header matching system theme */}
          <div className="grid grid-cols-[220px_1fr] bg-slate-50/90 border-b border-slate-200 text-slate-600">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 flex items-center border-r border-slate-200">
              Facility / Asset
            </div>
            <div className="grid grid-cols-12 text-center">
              {hoursArray.slice(0, 12).map((h, idx) => (
                <div
                  key={h}
                  className={`text-[11px] font-semibold text-slate-600 py-3 border-r border-slate-200/70 ${
                    idx % 2 === 1 ? "bg-slate-100/40" : "bg-transparent"
                  }`}
                >
                  {h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
                </div>
              ))}
            </div>
          </div>

          {/* Unified Rows */}
          <div className="divide-y divide-slate-100">
            {resources.map((resource) => {
              const resList = dayReservations.filter((r) => r.resourceId === resource.id);

              return (
                <div
                  key={resource.id}
                  className="grid grid-cols-[220px_1fr] hover:bg-slate-50/40 transition-colors group"
                >
                  {/* Resource Column */}
                  <div className="px-4 py-3 min-w-0 border-r border-slate-200 flex flex-col justify-center bg-white group-hover:bg-slate-50/40 transition-colors">
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {resource.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {resource.type} • Cap: {resource.capacity}
                    </p>
                  </div>

                  {/* 12-Hour Timeline Track Column */}
                  <div className="relative h-13 min-h-[52px]">
                    {/* Grid Column Slot Buttons with subtle alternating shading */}
                    <div className="absolute inset-0 grid grid-cols-12">
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onSlotClick && onSlotClick(resource.id, startHour + idx)}
                          className={`h-full border-r border-slate-200/70 hover:bg-indigo-50/60 transition-colors cursor-pointer flex items-center justify-center group/slot relative ${
                            idx % 2 === 1 ? "bg-slate-50/50" : "bg-transparent"
                          }`}
                          title={`Click to reserve ${resource.name} at ${startHour + idx}:00`}
                        >
                          <div className="opacity-0 group-hover/slot:opacity-100 transition-all scale-75 group-hover/slot:scale-100 duration-150 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white shadow-xs pointer-events-none">
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Booked Reservation Blocks */}
                    {resList.map((res) => {
                      const start = new Date(res.startTime);
                      const end = new Date(res.endTime);

                      const startDecimal = start.getHours() + start.getMinutes() / 60;
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
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            left: `calc(${leftPercent}% + 2px)`,
                            width: `calc(${Math.max(widthPercent, 1)}% - 4px)`,
                          }}
                          className="absolute top-2 bottom-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs border border-indigo-700/80 flex items-center px-2.5 gap-1.5 z-10 overflow-hidden cursor-pointer transition-colors"
                          title={`${res.title} (${res.bookerName})\n${format(start, "h:mm a")} - ${format(end, "h:mm a")}`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                          <span className="text-xs font-semibold text-white truncate">
                            {res.title}
                          </span>
                          {widthPercent >= 14 && (
                            <span className="text-[10px] text-indigo-200 font-normal shrink-0 ml-auto hidden sm:inline">
                              {format(start, "h:mm")}–{format(end, "h:mm a")}
                            </span>
                          )}
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

      {/* Footer Legend matching system theme */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-indigo-600 border border-indigo-700"></span>
            <span className="text-slate-600 font-medium text-[11px]">Reserved (Confirmed)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span>
            <span className="text-slate-600 font-medium text-[11px]">Available (Click slot to book)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span>Operating hours 8:00 AM – 8:00 PM • Conflict-free reservation</span>
        </div>
      </div>
    </div>
  );
}
