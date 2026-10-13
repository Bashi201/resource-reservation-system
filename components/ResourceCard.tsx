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
  onBook?: (resource: ResourceWithCount) => void;
}

export function ResourceCard({ resource, onEdit, onBook }: ResourceCardProps) {
  const isAvailable = resource.status === ResourceStatus.AVAILABLE;
  const activeBookings = resource._count?.reservations ?? 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <ResourceTypeBadge type={resource.type} />
          <StatusBadge status={resource.status} type="resource" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {resource.name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {resource.description || "No specific details provided."}
        </p>

        {/* Meta info */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-slate-400" />
            <span>
              {resource.type === ResourceType.ROOM
                ? `Capacity: ${resource.capacity} seats`
                : `Units / Seats: ${resource.capacity}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {activeBookings} active booking{activeBookings === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
        {isAvailable ? (
          onBook ? (
            <button
              onClick={() => onBook(resource)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all transform active:scale-95 cursor-pointer"
            >
              <span>Book Slot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href={`/reservations/new?resourceId=${resource.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all transform active:scale-95"
            >
              <span>Book Slot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )
        ) : (
          <button
            disabled
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          >
            Unavailable for Booking
          </button>
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(resource)}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Edit Resource"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
