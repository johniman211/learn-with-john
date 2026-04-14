export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { unlockCourseAccess, generateWhatsAppNotificationLink } from "@/lib/payment-utils";

// POST confirm manual payment
export async function POST(
  req: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchase = await db.purchase.findUnique({
      where: { id: params.purchaseId },
      include: {
        profile: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (purchase.status === "COMPLETED") {
      return NextResponse.json({ error: "Already confirmed" }, { status: 400 });
    }

    // Log transaction
    await db.paymentTransaction.create({
      data: {
        orderId: purchase.orderTrackingId || purchase.id,
        gatewayCode: purchase.gatewayCode || "whatsapp_manual",
        transactionRef: `MANUAL-${Date.now()}`,
        amount: purchase.amount,
        currency: purchase.currency,
        status: "completed",
        paidAt: new Date(),
        gatewayResponse: JSON.stringify({ confirmedBy: profile.id, confirmedAt: new Date() }),
      },
    });

    await unlockCourseAccess({ purchaseId: purchase.id });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const whatsappLink = generateWhatsAppNotificationLink({
      studentName: purchase.profile.name,
      courseName: purchase.course.title,
      courseId: purchase.course.id,
      appUrl,
    });

    return NextResponse.json({ success: true, whatsappLink });
  } catch (error) {
    console.error("[CONFIRM_PAYMENT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
