import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateReservationSchema } from "@/lib/validation";
import { checkReservationOverlap } from "@/lib/overlap";
import { ReservationStatus } from "@prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        resource: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("GET /api/reservations/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch reservation" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validated = updateReservationSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.reservation.findUnique({
      where: { id },
      include: { resource: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const newStart = validated.data.startTime ?? existing.startTime;
    const newEnd = validated.data.endTime ?? existing.endTime;

    // If times are changing and reservation is CONFIRMED, check for overlaps excluding itself
    const willBeConfirmed =
      validated.data.status !== undefined
        ? validated.data.status === ReservationStatus.CONFIRMED
        : existing.status === ReservationStatus.CONFIRMED;

    if (willBeConfirmed) {
      const overlap = await checkReservationOverlap({
        resourceId: existing.resourceId,
        startTime: newStart,
        endTime: newEnd,
        excludeReservationId: id,
      });

      if (overlap.hasConflict) {
        return NextResponse.json(
          {
            error: overlap.message,
            conflictingReservation: overlap.conflictingReservation,
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        ...(validated.data.title && { title: validated.data.title }),
        ...(validated.data.bookerName && { bookerName: validated.data.bookerName }),
        ...(validated.data.bookerEmail && { bookerEmail: validated.data.bookerEmail }),
        ...(validated.data.startTime && { startTime: validated.data.startTime }),
        ...(validated.data.endTime && { endTime: validated.data.endTime }),
        ...(validated.data.status && { status: validated.data.status }),
      },
      include: {
        resource: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/reservations/[id] error:", error);
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
  }
}

// Soft cancellation endpoint (sets status to CANCELLED)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.reservation.findUnique({
      where: { id },
      include: { resource: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const cancelled = await prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
      },
      include: {
        resource: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Reservation "${existing.title}" cancelled successfully. The time slot is now available for other bookings.`,
      reservation: cancelled,
    });
  } catch (error) {
    console.error("DELETE /api/reservations/[id] error:", error);
    return NextResponse.json({ error: "Failed to cancel reservation" }, { status: 500 });
  }
}
