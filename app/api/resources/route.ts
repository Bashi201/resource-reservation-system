import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resourceSchema } from "@/lib/validation";
import { ResourceType, ResourceStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as ResourceType | null;
    const status = searchParams.get("status") as ResourceStatus | null;
    const search = searchParams.get("search")?.trim() || "";

    const resources = await prisma.resource.findMany({
      where: {
        ...(type && Object.values(ResourceType).includes(type) ? { type } : {}),
        ...(status && Object.values(ResourceStatus).includes(status) ? { status } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
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
      orderBy: [{ status: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("GET /api/resources error:", error);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resourceSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const newResource = await prisma.resource.create({
      data: validatedData.data,
    });

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error("POST /api/resources error:", error);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}
