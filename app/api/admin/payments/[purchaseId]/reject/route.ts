export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { createNotification } from "@/lib/notifications";
import { generateWhatsAppRejectionLink } from "@/lib/payment-utils";

// POST reject manual payment
export async function POST(
  req: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reason } = await req.json();

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

    await db.purchase.update({
      where: { id: params.purchaseId },
      data: {
        status: "FAILED",
        rejectionReason: reason || "Payment could not be verified",
      },
    });

    await db.paymentTransaction.create({
      data: {
        orderId: purchase.orderTrackingId || purchase.id,
        gatewayCode: purchase.gatewayCode || "whatsapp_manual",
        amount: purchase.amount,
        currency: purchase.currency,
        status: "failed",
        errorMessage: reason || "Payment rejected by admin",
        gatewayResponse: JSON.stringify({ rejectedBy: profile.id, reason }),
      },
    });

    await createNotification({
      profileId: purchase.profile.id,
      title: "Payment Not Verified",
      message: `Your payment for "${purchase.course.title}" could not be verified. Reason: ${reason || "Please contact support."}`,
      link: `/student/courses/${purchase.course.id}`,
    });

    const whatsappLink = generateWhatsAppRejectionLink({
      studentName: purchase.profile.name,
      courseName: purchase.course.title,
      reason: reason || "Payment could not be verified",
    });

    return NextResponse.json({ success: true, whatsappLink });
  } catch (error) {
    console.error("[REJECT_PAYMENT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
