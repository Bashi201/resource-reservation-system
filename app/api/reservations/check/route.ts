import { NextRequest, NextResponse } from "next/server";
import { checkReservationOverlap } from "@/lib/overlap";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resourceId, startTime, endTime, excludeReservationId } = body;

    if (!resourceId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "resourceId, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        {
          hasConflict: true,
          message: "End time must be later than start time",
        },
        { status: 200 }
      );
    }

    const result = await checkReservationOverlap({
      resourceId,
      startTime: start,
      endTime: end,
      excludeReservationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/reservations/check error:", error);
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
  }
}
