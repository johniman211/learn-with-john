export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

// GET check payment status by orderId
export async function GET(req: Request) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const courseId = searchParams.get("courseId");

    if (!orderId && !courseId) {
      return NextResponse.json({ error: "orderId or courseId required" }, { status: 400 });
    }

    let purchase;
    if (orderId) {
      purchase = await db.purchase.findFirst({
        where: { orderTrackingId: orderId, profileId: profile.id },
        select: { id: true, status: true, courseId: true, gatewayCode: true, orderTrackingId: true },
      });
    } else {
      purchase = await db.purchase.findFirst({
        where: { courseId: courseId!, profileId: profile.id },
        select: { id: true, status: true, courseId: true, gatewayCode: true, orderTrackingId: true },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (!purchase) {
      return NextResponse.json({ status: "NOT_FOUND" });
    }

    return NextResponse.json({
      status: purchase.status,
      courseId: purchase.courseId,
      gatewayCode: purchase.gatewayCode,
    });
  } catch (error) {
    console.error("[PAYMENT_STATUS]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
