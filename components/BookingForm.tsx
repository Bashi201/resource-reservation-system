"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Resource, ResourceStatus } from "@prisma/client";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface BookingFormProps {
  resources: Resource[];
  initialResourceId?: string;
  initialDate?: Date;
  initialHour?: number;
  onSuccess?: () => void;
}

export function BookingForm({
  resources,
  initialResourceId,
  initialDate,
  initialHour,
  onSuccess,
}: BookingFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Filter only AVAILABLE resources for booking
  const availableResources = resources.filter(
    (r) => r.status === ResourceStatus.AVAILABLE
  );

  const [date, setDate] = useState<string>(
    initialDate ? format(initialDate, "yyyy-MM-dd") : ""
  );

  useEffect(() => {
    if (!date) {
      setDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [date]);

  const startH = initialHour !== undefined ? initialHour : 10;
  const startM = "00";
  const endH = initialHour !== undefined ? initialHour + 1 : 11;
  const endM = "00";

  const [resourceId, setResourceId] = useState(
    initialResourceId || (availableResources[0]?.id ?? "")
  );
  const [bookerName, setBookerName] = useState(user?.name || "");
  const [bookerEmail, setBookerEmail] = useState(user?.email || "");
  const [title, setTitle] = useState("");
  const [startTimeStr, setStartTimeStr] = useState(
    `${String(startH).padStart(2, "0")}:${startM}`
  );
  const [endTimeStr, setEndTimeStr] = useState(
    `${String(endH).padStart(2, "0")}:${endM}`
  );

  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isSlotValid, setIsSlotValid] = useState<boolean | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Debounced real-time availability check
  useEffect(() => {
    if (!resourceId || !date || !startTimeStr || !endTimeStr) {
      return;
    }

    const startDateTime = new Date(`${date}T${startTimeStr}:00`);
    const endDateTime = new Date(`${date}T${endTimeStr}:00`);

    if (startDateTime >= endDateTime) {
      const timeoutId = setTimeout(() => {
        setConflictWarning("End time must be later than start time.");
        setIsSlotValid(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    const timer = setTimeout(async () => {
      setCheckingConflict(true);
      try {
        const res = await fetch("/api/reservations/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
          }),
        });

        const data = await res.json();
        if (data.hasConflict) {
          setConflictWarning(data.message || "Conflict detected with an existing reservation.");
          setIsSlotValid(false);
        } else {
          setConflictWarning(null);
          setIsSlotValid(true);
        }
      } catch (err) {
        console.error("Availability check failed:", err);
      } finally {
        setCheckingConflict(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [resourceId, date, startTimeStr, endTimeStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!resourceId) {
      setFormError("Please select a resource.");
      return;
    }

    const startDateTime = new Date(`${date}T${startTimeStr}:00`);
    const endDateTime = new Date(`${date}T${endTimeStr}:00`);

    if (startDateTime >= endDateTime) {
      setFormError("End time must be strictly later than start time.");
      return;
    }

    const durationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
    if (durationMinutes < 15) {
      setFormError("Reservation duration must be at least 15 minutes.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId,
          bookerName,
          bookerEmail,
          title,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create reservation.");
        return;
      }

      setFormSuccess(
        `Reservation for "${data.title}" confirmed! The time slot is securely reserved.`
      );

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/reservations");
          router.refresh();
        }
      }, 1000);
    } catch (err) {
      console.error("Submit error:", err);
      setFormError("Network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resource Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
          Select Resource / Asset <span className="text-rose-500">*</span>
        </label>
        <select
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          required
          className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
        >
          {availableResources.length === 0 && (
            <option value="" disabled>
              No available resources found
            </option>
          )}
          {availableResources.map((res) => (
            <option key={res.id} value={res.id}>
              {res.name} ({res.type} • Capacity: {res.capacity})
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
          Meeting / Purpose Title <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Executive Strategy Meeting"
            className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Booker Name & Booker Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Booker Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={bookerName}
              onChange={(e) => setBookerName(e.target.value)}
              placeholder="e.g. Samantha Wright"
              className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Booker Work Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              value={bookerEmail}
              onChange={(e) => setBookerEmail(e.target.value)}
              placeholder="samantha@primewave.com"
              className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Date and Time selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Reservation Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Start Time <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="time"
              required
              step="900"
              value={startTimeStr}
              onChange={(e) => setStartTimeStr(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            End Time <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="time"
              required
              step="900"
              value={endTimeStr}
              onChange={(e) => setEndTimeStr(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Real-time Status / Conflict Banner */}
      {checkingConflict && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-700">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Verifying schedule availability in real-time...</span>
        </div>
      )}

      {conflictWarning && !checkingConflict && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-rose-900">Overlapping Booking Conflict</span>
            <span>{conflictWarning}</span>
          </div>
        </div>
      )}

      {isSlotValid && !conflictWarning && !checkingConflict && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Time slot is free and available for booking!</span>
        </div>
      )}

      {formError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-rose-900">Submission Error</span>
            <span>{formError}</span>
          </div>
        </div>
      )}

      {formSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting || checkingConflict || isSlotValid === false}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-md hover:shadow-indigo-600/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Securing Reservation...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Confirm & Lock Reservation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
