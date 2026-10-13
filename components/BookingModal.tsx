"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  X,
  ShieldCheck,
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialResourceId?: string;
  initialDate?: Date;
  initialHour?: number;
  onSuccess?: () => void;
}

export function BookingModal({
  isOpen,
  onClose,
  initialResourceId,
  initialDate,
  initialHour,
  onSuccess,
}: BookingModalProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  // Form states
  const [resourceId, setResourceId] = useState("");
  const [title, setTitle] = useState("");
  const [bookerName, setBookerName] = useState("");
  const [bookerEmail, setBookerEmail] = useState("");
  const [date, setDate] = useState("");
  const [startTimeStr, setStartTimeStr] = useState("10:00");
  const [endTimeStr, setEndTimeStr] = useState("11:00");

  // Conflict validation states
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isSlotValid, setIsSlotValid] = useState<boolean | null>(null);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Fetch available resources when modal opens
  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch("/api/resources");
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (e) {
      console.error("Error fetching resources:", e);
    } finally {
      setLoadingResources(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchResources();
    }
  }, [isOpen, fetchResources]);

  // Synchronize initial prop values on open
  useEffect(() => {
    if (isOpen) {
      const available = resources.filter((r) => r.status === ResourceStatus.AVAILABLE);
      if (initialResourceId) {
        setResourceId(initialResourceId);
      } else if (available.length > 0 && !resourceId) {
        setResourceId(available[0].id);
      }

      const targetDate = initialDate || new Date();
      setDate(format(targetDate, "yyyy-MM-dd"));

      const startH = initialHour !== undefined ? initialHour : 10;
      const endH = initialHour !== undefined ? initialHour + 1 : 11;
      setStartTimeStr(`${String(startH).padStart(2, "0")}:00`);
      setEndTimeStr(`${String(endH).padStart(2, "0")}:00`);

      setFormError(null);
      setFormSuccess(null);
      setConflictWarning(null);
      setIsSlotValid(null);
    }
  }, [isOpen, initialResourceId, initialDate, initialHour, resources, resourceId]);

  // Debounced real-time conflict checking
  useEffect(() => {
    if (!isOpen || !resourceId || !date || !startTimeStr || !endTimeStr) {
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
  }, [isOpen, resourceId, date, startTimeStr, endTimeStr]);

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
          bookerName: bookerName.trim(),
          bookerEmail: bookerEmail.trim(),
          title: title.trim(),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create reservation.");
        return;
      }

      setFormSuccess(`Reservation for "${data.title}" successfully confirmed and locked!`);

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err) {
      console.error("Submit error:", err);
      setFormError("Network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const availableResources = resources.filter(
    (r) => r.status === ResourceStatus.AVAILABLE
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-slate-200 relative shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Close window"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Window Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Atomic Concurrency Guard Enabled</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Schedule a Facility
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reserve boardrooms, audio equipment, or vehicles with instant conflict validation.
          </p>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Resource Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Facility / Asset <span className="text-rose-500">*</span>
            </label>
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              required
              disabled={loadingResources}
              className="w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              {loadingResources && <option>Loading available assets...</option>}
              {!loadingResources && availableResources.length === 0 && (
                <option value="" disabled>
                  No available resources
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Meeting / Purpose Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Executive Strategy Meeting"
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Booker Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Booker Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  placeholder="e.g. Samantha Wright"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Booker Work Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={bookerEmail}
                  onChange={(e) => setBookerEmail(e.target.value)}
                  placeholder="samantha@primewave.com"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Date, Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="time"
                  required
                  step="900"
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                End Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="time"
                  required
                  step="900"
                  value={endTimeStr}
                  onChange={(e) => setEndTimeStr(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Conflict & Validation Banners */}
          {checkingConflict && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Verifying schedule availability in real-time...</span>
            </div>
          )}

          {conflictWarning && !checkingConflict && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-900">Schedule Collision Detected</span>
                <span>{conflictWarning}</span>
              </div>
            </div>
          )}

          {isSlotValid && !conflictWarning && !checkingConflict && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Time slot is free and available for booking!</span>
            </div>
          )}

          {formError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-900">Submission Error</span>
                <span>{formError}</span>
              </div>
            </div>
          )}

          {formSuccess && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Actions Footer */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || checkingConflict || isSlotValid === false}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
      </div>
    </div>
  );
}
