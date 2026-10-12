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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Available
          </span>
        );
      case ResourceStatus.MAINTENANCE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Maintenance
          </span>
        );
      case ResourceStatus.INACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3 text-rose-400" />
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <CheckCircle2 className="w-3 h-3 text-indigo-400" />
          Confirmed
        </span>
      );
    case ReservationStatus.CANCELLED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20 line-through">
          <XCircle className="w-3 h-3 text-slate-400" />
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <DoorOpen className="w-3.5 h-3.5" />
          Meeting Room
        </span>
      );
    case ResourceType.EQUIPMENT:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Monitor className="w-3.5 h-3.5" />
          Equipment
        </span>
      );
    case ResourceType.VEHICLE:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Car className="w-3.5 h-3.5" />
          Vehicle
        </span>
      );
    default:
      return null;
  }
}
