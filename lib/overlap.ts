import { prisma } from "./db";
import { Prisma, ReservationStatus } from "@prisma/client";
import { format } from "date-fns";

export interface OverlapCheckParams {
  resourceId: string;
  startTime: Date;
  endTime: Date;
  excludeReservationId?: string;
  tx?: Prisma.TransactionClient;
}

export interface OverlapCheckResult {
  hasConflict: boolean;
  conflictingReservation?: {
    id: string;
    title: string;
    bookerName: string;
    startTime: Date;
    endTime: Date;
  };
  message?: string;
}

/**
 * Standard interval overlap algorithm:
 * Overlap exists iff (newStart < existingEnd) AND (newEnd > existingStart)
 * Note: Back-to-back slots (e.g. 10:00-11:00 and 11:00-12:00) do NOT overlap
 * because 11:00 < 11:00 is false.
 */
export async function checkReservationOverlap({
  resourceId,
  startTime,
  endTime,
  excludeReservationId,
  tx,
}: OverlapCheckParams): Promise<OverlapCheckResult> {
  const client = tx ?? prisma;

  // Query only CONFIRMED reservations for the same resource
  const conflict = await client.reservation.findFirst({
    where: {
      resourceId,
      status: ReservationStatus.CONFIRMED,
      ...(excludeReservationId
        ? {
            id: { not: excludeReservationId },
          }
        : {}),
      // Interval overlap condition:
      // (newStart < existingEnd) AND (newEnd > existingStart)
      AND: [
        {
          startTime: {
            lt: endTime,
          },
        },
        {
          endTime: {
            gt: startTime,
          },
        },
      ],
    },
    include: {
      resource: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  if (!conflict) {
    return { hasConflict: false };
  }

  const formattedStart = format(conflict.startTime, "MMM d, yyyy h:mm a");
  const formattedEnd = format(conflict.endTime, "h:mm a");

  const message = `Conflict detected: "${conflict.resource.name}" is already reserved by ${conflict.bookerName} for "${conflict.title}" (${formattedStart} – ${formattedEnd}). Please choose a different time slot or resource.`;

  return {
    hasConflict: true,
    conflictingReservation: {
      id: conflict.id,
      title: conflict.title,
      bookerName: conflict.bookerName,
      startTime: conflict.startTime,
      endTime: conflict.endTime,
    },
    message,
  };
}
