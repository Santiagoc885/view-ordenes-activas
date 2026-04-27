import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);

    const status = req.nextUrl.searchParams.get("status");
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const limit = 10;

    const where = status ? { status: status as any } : {};

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ success: false, message: error.message || 'Error del servidor' }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const body = await req.json();

    const order = await prisma.order.create({
      data: {
        client: body.client,
        total: body.total,
        status: "PENDING",
        items: {
          create: body.items,
        },
      },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ success: false, message: error.message || 'Error del servidor' }, { status });
  }
}
