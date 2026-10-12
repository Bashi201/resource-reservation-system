"use client";

import React from "react";
import Link from "next/link";
import { Resource, ResourceType, ResourceStatus } from "@prisma/client";
import { StatusBadge, ResourceTypeBadge } from "./StatusBadge";
import { Users, Calendar, ArrowRight, Edit3 } from "lucide-react";

interface ResourceWithCount extends Resource {
  _count?: {
    reservations: number;
  };
}

interface ResourceCardProps {
  resource: ResourceWithCount;
  onEdit?: (resource: ResourceWithCount) => void;
}

export function ResourceCard({ resource, onEdit }: ResourceCardProps) {
  const isAvailable = resource.status === ResourceStatus.AVAILABLE;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between group">
      <div>
        {/* Header badges */}
        <div className="flex items-center justify-between mb-3.5">
          <ResourceTypeBadge type={resource.type} />
          <StatusBadge status={resource.status} type="resource" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
          {resource.name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {resource.description || "No specific details provided."}
        </p>

        {/* Meta info */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-500" />
            <span>
              {resource.type === ResourceType.ROOM
                ? `Capacity: ${resource.capacity} people`
                : `Quantity / Seats: ${resource.capacity}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>
              {resource._count?.reservations ?? 0} active booking{(resource._count?.reservations ?? 0) === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2">
        {isAvailable ? (
          <Link
            href={`/reservations/new?resourceId=${resource.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 transition-all hover:border-indigo-500/60"
          >
            <span>Book Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <button
            disabled
            className="flex-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/40 text-slate-500 border border-slate-700/30 cursor-not-allowed"
          >
            Unavailable for Booking
          </button>
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(resource)}
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 border border-white/10 transition-colors"
            title="Edit Resource"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
