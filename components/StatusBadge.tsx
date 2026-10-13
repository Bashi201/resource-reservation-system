import React from "react";
import { ResourceStatus, ReservationStatus, ResourceType } from "@prisma/client";
import { CheckCircle2, AlertTriangle, XCircle, DoorOpen, Monitor, Car } from "lucide-react";

interface StatusBadgeProps {
  status: ResourceStatus | ReservationStatus | string;
  type?: "resource" | "reservation";
}

export function StatusBadge({ status, type = "resource" }: StatusBadgeProps) {
  if (type === "resource") {
    switch (status) {
      case ResourceStatus.AVAILABLE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Available
          </span>
        );
      case ResourceStatus.MAINTENANCE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Maintenance
          </span>
        );
      case ResourceStatus.INACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            Inactive
          </span>
        );
      default:
        return null;
    }
  }

  // Reservation statuses
  switch (status) {
    case ReservationStatus.CONFIRMED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          Confirmed
        </span>
      );
    case ReservationStatus.CANCELLED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 line-through">
          <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          Cancelled
        </span>
      );
    default:
      return null;
  }
}

export function ResourceTypeBadge({ type }: { type: ResourceType }) {
  switch (type) {
    case ResourceType.ROOM:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
          <DoorOpen className="w-3.5 h-3.5 text-blue-600" />
          Meeting Room
        </span>
      );
    case ResourceType.EQUIPMENT:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/80">
          <Monitor className="w-3.5 h-3.5 text-purple-600" />
          Equipment
        </span>
      );
    case ResourceType.VEHICLE:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
          <Car className="w-3.5 h-3.5 text-amber-600" />
          Vehicle
        </span>
      );
    default:
      return null;
  }
}
