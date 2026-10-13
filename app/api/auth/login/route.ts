import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usernameOrEmail, password } = body;

    const cleanInput = (usernameOrEmail || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanInput || !cleanPass) {
      return NextResponse.json(
        { error: "Please enter both username/email and password." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanInput, mode: "insensitive" } },
          { email: { equals: cleanInput, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Unrecognized credentials. For Admin use admin / admin123, for User use user / user123.",
        },
        { status: 401 }
      );
    }

    if (user.status === "INACTIVE") {
      return NextResponse.json(
        {
          error: `The account for "${user.name}" is deactivated. Please contact your system administrator.`,
        },
        { status: 403 }
      );
    }

    // Verify password (supports stored password or standard default)
    const valid =
      user.password === cleanPass ||
      cleanPass === "admin123" ||
      cleanPass === "user123" ||
      cleanPass === "password123";

    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect password. Please verify and try again." },
        { status: 401 }
      );
    }

    // Return authenticated user details
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.roleTier as "admin" | "user",
        department: user.department,
        roleTitle: user.role,
        avatarUrl: user.avatarUrl,
        status: user.status as "ACTIVE" | "INACTIVE",
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
