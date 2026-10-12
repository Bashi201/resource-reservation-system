"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Resource } from "@prisma/client";
import { BookingForm } from "@/components/BookingForm";
import { Calendar, ArrowLeft, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const prefillResourceId = searchParams.get("resourceId") || "";
  const prefillDate = searchParams.get("date");
  const prefillHour = searchParams.get("hour")
    ? parseInt(searchParams.get("hour")!, 10)
    : undefined;

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/resources");
        if (res.ok) {
          const data = await res.json();
          setResources(data);
        }
      } catch (err) {
        console.error("Error loading resources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading booking configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Back button */}
      <div>
        <Link
          href="/reservations"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reservations</span>
        </Link>
      </div>

      {/* Main Booking Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Atomic Concurrency Guard Enabled</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Schedule a Facility
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reserve boardrooms, audio equipment, or vehicles with instant conflict validation.
          </p>
        </div>

        <BookingForm
          resources={resources}
          initialResourceId={prefillResourceId}
          initialDate={prefillDate ? new Date(prefillDate) : undefined}
          initialHour={prefillHour}
          onSuccess={() => {
            router.push("/reservations");
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}

export default function NewReservationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Preparing booking view...</p>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
