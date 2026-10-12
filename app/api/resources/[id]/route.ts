import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateResourceSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            status: "CONFIRMED",
            endTime: { gte: new Date() },
          },
          orderBy: { startTime: "asc" },
          take: 10,
        },
      },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("GET /api/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch resource" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validatedData = updateResourceSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: validatedData.data,
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("PUT /api/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.resource.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reservations: {
              where: {
                status: "CONFIRMED",
                endTime: { gte: new Date() },
              },
            },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    if (existing._count.reservations > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete resource with active or upcoming reservations",
          details: `This resource currently has ${existing._count.reservations} active upcoming booking(s). Please cancel those reservations first or set the status to INACTIVE.`,
        },
        { status: 409 }
      );
    }

    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
