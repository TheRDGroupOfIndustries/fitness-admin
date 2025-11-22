  import { authMiddleware } from "@/middleware";
  import { PrismaClient } from "@prisma/client";
  import type { JwtPayload } from "jsonwebtoken";
  import { NextRequest, NextResponse } from "next/server";

  import prisma from "@/lib/prisma";

  export async function GET(request: NextRequest) {
    try {
      const decoded = (await authMiddleware(request)) as JwtPayload & {
        id: string;
      };

      const chats = await prisma.chat.findMany({
        where: {
          OR: [{ userId: decoded.id }, { trainerId: decoded.id }],
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          trainer: {
            select: {
              name: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      return NextResponse.json({ chats });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  }
