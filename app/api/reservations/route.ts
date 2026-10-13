import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { reservationSchema } from "@/lib/validation";
import { checkReservationOverlap } from "@/lib/overlap";
import { ReservationStatus, ResourceStatus } from "@prisma/client";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");
    const status = searchParams.get("status") as ReservationStatus | null;
    const dateStr = searchParams.get("date");
    const search = searchParams.get("search")?.trim() || "";

    let dateFilter = {};
    if (dateStr) {
      const parsedDate = parseISO(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        const dayStart = startOfDay(parsedDate);
        const dayEnd = endOfDay(parsedDate);
        dateFilter = {
          startTime: {
            gte: dayStart,
            lte: dayEnd,
          },
        };
      }
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        ...(resourceId ? { resourceId } : {}),
        ...(status && Object.values(ReservationStatus).includes(status) ? { status } : {}),
        ...dateFilter,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { bookerName: { contains: search, mode: "insensitive" } },
                { bookerEmail: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        resource: true,
      },
      orderBy: {
        startTime: "desc",
      },
      take: 100,
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("GET /api/reservations error:", error);
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = reservationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { resourceId, bookerName, bookerEmail, title, startTime, endTime } = validated.data;

    // Concurrency Guard: Atomic Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify resource exists and is AVAILABLE
      const resource = await tx.resource.findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        throw { status: 404, message: "Resource not found" };
      }

      if (resource.status !== ResourceStatus.AVAILABLE) {
        throw {
          status: 400,
          message: `Cannot book "${resource.name}": resource is currently marked as ${resource.status}.`,
        };
      }

      // 2. Perform atomic overlap check inside transaction
      const overlap = await checkReservationOverlap({
        resourceId,
        startTime,
        endTime,
        tx,
      });

      if (overlap.hasConflict) {
        throw {
          status: 409,
          message: overlap.message,
          conflictingReservation: overlap.conflictingReservation,
        };
      }

      // 3. Create confirmed reservation
      const newReservation = await tx.reservation.create({
        data: {
          resourceId,
          bookerName,
          bookerEmail,
          title,
          startTime,
          endTime,
          status: ReservationStatus.CONFIRMED,
        },
        include: {
          resource: true,
        },
      });

      return newReservation;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/reservations error:", error);
    const err = error as { status?: number; message?: string; conflictingReservation?: unknown };
    if (err && err.status && err.message) {
      return NextResponse.json(
        {
          error: err.message,
          conflictingReservation: err.conflictingReservation,
        },
        { status: err.status }
      );
    }
    return NextResponse.json({ error: "Internal server error occurred while booking" }, { status: 500 });
  }
}
