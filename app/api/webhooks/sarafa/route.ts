export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPaymentConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      reference,
      status,
      transaction_id,
    } = body;

    if (!reference) {
      return new NextResponse("Missing reference", { status: 400 });
    }

    const purchase = await db.purchase.findFirst({
      where: { orderTrackingId: reference },
      include: {
        profile: true,
        course: true,
      },
    });

    if (!purchase) {
      console.error("[SARAFA_WEBHOOK] Purchase not found:", reference);
      return new NextResponse("OK", { status: 200 });
    }

    if (status === "completed" || status === "successful" || status === "success") {
      await db.purchase.update({
        where: { id: purchase.id },
        data: {
          status: "COMPLETED",
          transactionId: transaction_id || reference,
        },
      });

      if (purchase.profile && purchase.course) {
        await sendPaymentConfirmationEmail(
          purchase.profile.email,
          purchase.profile.name,
          purchase.course.title,
          purchase.amount,
          purchase.currency
        );
      }
    } else if (status === "failed" || status === "cancelled") {
      await db.purchase.update({
        where: { id: purchase.id },
        data: { status: "FAILED" },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[SARAFA_WEBHOOK]", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
