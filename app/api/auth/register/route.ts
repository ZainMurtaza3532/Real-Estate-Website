import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, phone, agencyName } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Default role is BUYER; sanitize allowed requested roles
    let assignedRole: "BUYER" | "SELLER" | "ADMIN" = "BUYER";
    if (role === "AGENT" || role === "SELLER") {
      assignedRole = "SELLER";
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
        phone: phone ? String(phone).trim() : null,
        agencyName: agencyName ? String(agencyName).trim() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        agencyName: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating your account." },
      { status: 500 }
    );
  }
}
