"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Resource } from "@prisma/client";
import { BookingForm } from "@/components/BookingForm";
import { NewReservationSkeleton } from "@/components/skeletons";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

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

  const fetchResources = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  if (loading) {
    return <NewReservationSkeleton />;
  }


  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back button */}
      <div>
        <Link
          href="/reservations"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reservations</span>
        </Link>
      </div>

      {/* Main Booking Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Atomic Concurrency Guard Enabled</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Schedule a Facility
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
    <Suspense fallback={<NewReservationSkeleton />}>
      <BookingContent />
    </Suspense>
  );
}

