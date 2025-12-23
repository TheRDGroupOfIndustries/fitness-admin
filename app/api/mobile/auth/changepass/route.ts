import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { email, password } = body;
    email = email.trim().toLowerCase();
    console.log("changepass body:", body);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error("changepass error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
