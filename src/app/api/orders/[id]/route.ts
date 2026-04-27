import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: any) {
  try {
    requireAuth(req);
    const resolvedParams = await params;
    const body = await req.json();

    const data: any = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.client !== undefined) data.client = body.client;
    if (body.total !== undefined) data.total = body.total;

    if (body.items !== undefined) {
      await prisma.orderItem.deleteMany({ where: { orderId: resolvedParams.id } });
      data.items = {
        create: body.items.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };
    }

    const order = await prisma.order.update({
      where: { id: resolvedParams.id },
      data,
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ success: false, message: error.message || 'Error del servidor' }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    requireAdmin(req);
    const resolvedParams = await params;
    await prisma.order.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ success: false, message: error.message || 'Error del servidor' }, { status });
  }
}
