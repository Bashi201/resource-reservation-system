import React from "react";
import { ResourceType } from "@prisma/client";
import { DoorOpen, Monitor, Car, Box } from "lucide-react";

interface ResourcePlaceholderProps {
  type: ResourceType;
  className?: string;
  compact?: boolean;
}

export function ResourcePlaceholder({
  type,
  className = "",
  compact = false,
}: ResourcePlaceholderProps) {
  switch (type) {
    case ResourceType.ROOM:
      return (
        <div
          className={`relative w-full h-full flex flex-col items-center justify-center p-3 select-none overflow-hidden bg-gradient-to-br from-indigo-50/90 via-slate-50 to-indigo-100/40 border-r border-slate-200/60 ${className}`}
        >
          {/* Subtle Blueprint Architectural Grid Pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-35 text-indigo-400 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="blueprint-grid"
                width="16"
                height="16"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 16 0 L 0 0 0 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
          </svg>

          {/* Decorative Isometric Room Geometry */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-white/90 shadow-2xs border border-indigo-200/80 flex items-center justify-center mb-1.5 text-indigo-600">
              <DoorOpen className="w-5 h-5 stroke-[1.75]" />
            </div>
            {!compact && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700/80">
                Meeting Room
              </span>
            )}
            <span className="text-[9px] font-medium text-slate-400">
              No photo uploaded
            </span>
          </div>
        </div>
      );

    case ResourceType.EQUIPMENT:
      return (
        <div
          className={`relative w-full h-full flex flex-col items-center justify-center p-3 select-none overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50/60 to-slate-200/50 border-r border-slate-200/60 ${className}`}
        >
          {/* Subtle Tech Circuit / Grid Pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-30 text-sky-500 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="tech-dots"
                width="12"
                height="12"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tech-dots)" />
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-white/90 shadow-2xs border border-sky-200/80 flex items-center justify-center mb-1.5 text-sky-600">
              <Monitor className="w-5 h-5 stroke-[1.75]" />
            </div>
            {!compact && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800/80">
                Equipment
              </span>
            )}
            <span className="text-[9px] font-medium text-slate-400">
              No photo uploaded
            </span>
          </div>
        </div>
      );

    case ResourceType.VEHICLE:
      return (
        <div
          className={`relative w-full h-full flex flex-col items-center justify-center p-3 select-none overflow-hidden bg-gradient-to-br from-emerald-50/80 via-slate-50 to-teal-100/40 border-r border-slate-200/60 ${className}`}
        >
          {/* Dynamic Speed Diagonal Pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-25 text-emerald-500 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="transit-stripes"
                width="16"
                height="16"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#transit-stripes)" />
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-white/90 shadow-2xs border border-emerald-200/80 flex items-center justify-center mb-1.5 text-emerald-600">
              <Car className="w-5 h-5 stroke-[1.75]" />
            </div>
            {!compact && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/80">
                Fleet Vehicle
              </span>
            )}
            <span className="text-[9px] font-medium text-slate-400">
              No photo uploaded
            </span>
          </div>
        </div>
      );

    default:
      return (
        <div
          className={`relative w-full h-full flex flex-col items-center justify-center p-3 select-none bg-slate-100 border-r border-slate-200/60 ${className}`}
        >
          <div className="w-10 h-10 rounded-xl bg-white/90 border border-slate-200 flex items-center justify-center mb-1.5 text-slate-500">
            <Box className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-500">Asset</span>
        </div>
      );
  }
}
