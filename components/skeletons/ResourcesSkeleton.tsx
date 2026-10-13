import React from "react";
import { Skeleton } from "./Skeleton";
import { ResourceCardSkeleton } from "./ResourceCardSkeleton";

export function ResourcesSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header section skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="h-7 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      {/* Filter / Search Bar skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-full md:w-72 rounded-xl" />
      </div>

      {/* Grid of Resource Cards skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <ResourceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
