import React from "react";
import { Skeleton } from "./Skeleton";

export function ReservationsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header section skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="h-7 w-72 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      {/* Filter / Search Bar skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <Skeleton className="h-9 w-16 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <Skeleton className="h-9 w-full sm:w-48 rounded-xl" />
          <Skeleton className="h-9 w-full sm:w-64 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4">Reservation Title</th>
                <th className="py-3.5 px-4">Facility / Resource</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Booker Contact</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6].map((row) => (
                <tr key={row} className="hover:bg-slate-50/50">
                  <td className="py-4 px-4 sm:px-6">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>
                  <td className="py-4 px-4 space-y-1">
                    <Skeleton className="h-4 w-44 rounded-md" />
                    <Skeleton className="h-3 w-28 rounded" />
                  </td>
                  <td className="py-4 px-4 space-y-1">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </td>
                  <td className="py-4 px-4 space-y-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </td>
                  <td className="py-4 px-4 space-y-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-40 rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton className="h-8 w-16 rounded-lg" />
                      <Skeleton className="h-8 w-16 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
