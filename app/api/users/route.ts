import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { userSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const department = searchParams.get("department");
    const roleTier = searchParams.get("roleTier");

    const users = await prisma.user.findMany({
      where: {
        ...(department && department !== "ALL" ? { department } : {}),
        ...(roleTier && roleTier !== "ALL" ? { roleTier } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } },
                { department: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users from database" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = userSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, username, password, department, role, roleTier, avatarUrl, status } =
      validated.data;

    // Check duplicate email or username
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: password || "password123",
        department,
        role,
        roleTier,
        avatarUrl: avatarUrl || null,
        status,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Failed to create user in database" }, { status: 500 });
  }
}
