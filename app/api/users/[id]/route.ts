import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateUserSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        reservations: {
          take: 10,
          orderBy: { startTime: "desc" },
          include: { resource: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateUserSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check duplicate email if email is being updated
    if (validated.data.email && validated.data.email.toLowerCase() !== existingUser.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: validated.data.email.toLowerCase() },
      });
      if (duplicateEmail) {
        return NextResponse.json(
          { error: "Another account already uses this email address." },
          { status: 409 }
        );
      }
    }

    // Check duplicate username if username is being updated
    if (validated.data.username && validated.data.username.toLowerCase() !== existingUser.username) {
      const duplicateUsername = await prisma.user.findUnique({
        where: { username: validated.data.username.toLowerCase() },
      });
      if (duplicateUsername) {
        return NextResponse.json(
          { error: "Another account already uses this username." },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(validated.data.name ? { name: validated.data.name } : {}),
        ...(validated.data.email ? { email: validated.data.email.toLowerCase() } : {}),
        ...(validated.data.username ? { username: validated.data.username.toLowerCase() } : {}),
        ...(validated.data.password ? { password: validated.data.password } : {}),
        ...(validated.data.department ? { department: validated.data.department } : {}),
        ...(validated.data.role ? { role: validated.data.role } : {}),
        ...(validated.data.roleTier ? { roleTier: validated.data.roleTier } : {}),
        ...(validated.data.status ? { status: validated.data.status } : {}),
        ...(validated.data.avatarUrl !== undefined ? { avatarUrl: validated.data.avatarUrl } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (reservations have onDelete: SetNull so they remain safely in the audit log)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
