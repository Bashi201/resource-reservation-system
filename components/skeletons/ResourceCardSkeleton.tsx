import React from "react";
import { Skeleton } from "./Skeleton";

export function ResourceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col sm:flex-row">
      {/* Media thumbnail placeholder */}
      <div className="w-full sm:w-44 h-40 sm:h-auto shrink-0 bg-slate-100 p-2">
        <Skeleton className="w-full h-full min-h-[140px] rounded-xl" />
      </div>

      {/* Details placeholder */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>

          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-5/6 rounded" />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
