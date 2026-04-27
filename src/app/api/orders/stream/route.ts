import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);

    const encoder = new TextEncoder();
    let intervalId: NodeJS.Timeout | null = null;
    let closed = false;

    const cleanup = () => {
      closed = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const stream = new ReadableStream({
      async start(controller) {
        const sendOrders = async () => {
          if (closed) return;
          try {
            const orders = await prisma.order.findMany({
              include: { items: true },
              orderBy: { createdAt: "desc" },
            });
            if (closed) return;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(orders)}\n\n`));
          } catch (error: any) {
            if (error?.code === "ERR_INVALID_STATE") {
              cleanup();
              return;
            }
            console.error("Error fetching orders:", error);
          }
        };

        await sendOrders();
        intervalId = setInterval(sendOrders, 2000);

        req.signal.addEventListener("abort", () => {
          cleanup();
          try {
            controller.close();
          } catch {}
        });
      },
      cancel() {
        cleanup();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ success: false, message: error.message || 'Error del servidor' }, { status });
  }
}

