import React from "react";
import { Skeleton } from "./Skeleton";

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header section */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-7 w-72 rounded-xl" />
        </div>
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </div>

      {/* Tabs navigation skeleton */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Main Settings Card Skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-6">
          <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <Skeleton className="h-5 w-44 rounded-lg mx-auto sm:mx-0" />
            <Skeleton className="h-3.5 w-64 rounded-md mx-auto sm:mx-0" />
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <Skeleton className="h-8 w-28 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Form fields skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
