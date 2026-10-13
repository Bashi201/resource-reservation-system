"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Resource, ResourceType, ResourceStatus } from "@prisma/client";
import { ResourcePlaceholder } from "./ResourcePlaceholder";
import {
  Users,
  Calendar,
  ArrowRight,
  Edit3,
  DoorOpen,
  Monitor,
  Car,
  AlertTriangle,
  XCircle,
  Maximize2,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

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

const TYPE_ICONS: Record<ResourceType, React.ElementType> = {
  [ResourceType.ROOM]: DoorOpen,
  [ResourceType.EQUIPMENT]: Monitor,
  [ResourceType.VEHICLE]: Car,
};

const TYPE_LABELS: Record<ResourceType, string> = {
  [ResourceType.ROOM]: "Meeting Room",
  [ResourceType.EQUIPMENT]: "Equipment",
  [ResourceType.VEHICLE]: "Vehicle",
};

export function ResourceCard({ resource, onEdit, onBook }: ResourceCardProps) {
  const { isAdmin } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const isAvailable = resource.status === ResourceStatus.AVAILABLE;
  const activeBookings = resource._count?.reservations ?? 0;

  const TypeIcon = TYPE_ICONS[resource.type];
  const typeLabel = TYPE_LABELS[resource.type];
  const hasValidImage = Boolean(resource.imageUrl && !imageError);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 overflow-hidden flex flex-col sm:flex-row group">
        {/* Left: Crisp Dedicated Media Thumbnail / Placeholder */}
        <div className="relative w-full sm:w-44 h-36 sm:h-auto shrink-0 overflow-hidden bg-slate-50 flex items-center justify-center">
          {hasValidImage ? (
            <div className="relative w-full h-full group/media">
              <img
                src={resource.imageUrl!}
                alt={resource.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              {/* Subtle hover trigger for full-res lightbox */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/media:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                title="Click to view full image"
              >
                <span className="p-1.5 rounded-lg bg-white/90 text-slate-800 shadow-sm backdrop-blur-xs flex items-center gap-1 text-[11px] font-semibold">
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Enlarge</span>
                </span>
              </button>
            </div>
          ) : (
            <ResourcePlaceholder type={resource.type} />
          )}
        </div>

        {/* Right: Content & Action Matrix */}
        <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* Header: Category Badge & Operational Status */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                <TypeIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{typeLabel}</span>
              </span>

              {isAvailable ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span>Available</span>
                </span>
              ) : resource.status === ResourceStatus.MAINTENANCE ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Maintenance</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  <XCircle className="w-3 h-3 text-slate-400" />
                  <span>Inactive</span>
                </span>
              )}
            </div>

            {/* Resource Name */}
            <h3
              className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug"
              title={resource.name}
            >
              {resource.name}
            </h3>

            {/* Description */}
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {resource.description || "Shared company asset available for internal reservations."}
            </p>
          </div>

          {/* Footer: Metadata Chips & Action Controls */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            {/* Metadata Badges */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70">
                <Users className="w-3 h-3 text-slate-400" />
                <span>
                  {resource.type === ResourceType.ROOM
                    ? `${resource.capacity} Seats`
                    : `${resource.capacity} Unit${resource.capacity > 1 ? "s" : ""}`}
                </span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50/70 border border-indigo-200/50 text-indigo-700">
                <Calendar className="w-3 h-3 text-indigo-500" />
                <span>
                  {activeBookings} active booking{activeBookings === 1 ? "" : "s"}
                </span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              {isAdmin && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(resource)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  title="Edit Resource"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {isAvailable ? (
                onBook ? (
                  <button
                    type="button"
                    onClick={() => onBook(resource)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs hover:shadow-sm hover:shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>Book Slot</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <Link
                    href={`/reservations/new?resourceId=${resource.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs hover:shadow-sm hover:shadow-indigo-600/20 active:scale-98 transition-all"
                  >
                    <span>Book Slot</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed">
                  Unavailable
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for High-Resolution View */}
      {isLightboxOpen && resource.imageUrl && (
        <div
          role="dialog"
          aria-label="Image preview"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 truncate">
                {resource.name}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-slate-900/5 rounded-xl mt-1">
              <img
                src={resource.imageUrl}
                alt={resource.name}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
