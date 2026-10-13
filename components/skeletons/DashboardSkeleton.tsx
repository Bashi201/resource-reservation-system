import React from "react";
import { Skeleton } from "./Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 md:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <Skeleton className="h-9 w-3/4 max-w-lg rounded-xl" />
            <Skeleton className="h-4 w-full max-w-xl rounded-lg" />
            <Skeleton className="h-4 w-2/3 max-w-md rounded-lg" />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-5 xl:col-span-4 flex justify-end">
            <Skeleton className="h-48 w-full max-w-xs rounded-2xl" />
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-7 w-16 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
            <Skeleton className="w-12 h-12 rounded-2xl" />
          </div>
        ))}
      </div>

      {/* Timeline Section Skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-60 rounded-lg" />
            <Skeleton className="h-3.5 w-80 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>

        {/* Timeline mock grid */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          <div className="bg-slate-50/80 p-3 flex items-center gap-4">
            <Skeleton className="h-5 w-40 rounded-lg shrink-0" />
            <div className="grid grid-cols-8 gap-2 flex-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                <Skeleton key={h} className="h-4 w-full rounded" />
              ))}
            </div>
          </div>
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="p-3.5 flex items-center gap-4 bg-white">
              <div className="w-40 shrink-0 space-y-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <div className="grid grid-cols-8 gap-2 flex-1 items-center">
                <Skeleton className={`h-8 rounded-lg col-span-${(row % 3) + 1} opacity-70`} />
                <div className="col-span-1" />
                <Skeleton className={`h-8 rounded-lg col-span-${((row + 1) % 2) + 1} opacity-50`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Quick Catalog Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-44 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[1, 2].map((k) => (
            <div
              key={k}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row gap-4"
            >
              <Skeleton className="w-full sm:w-44 h-36 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded" />
                <div className="pt-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
