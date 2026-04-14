export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlockCourseAccess } from "@/lib/payment-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[MTN_MOMO_WEBHOOK]", JSON.stringify(body));

    const externalId = body.externalId || body.referenceId;
    const status = body.status;

    if (!externalId) {
      return NextResponse.json({ received: true });
    }

    const transaction = await db.paymentTransaction.findFirst({
      where: { orderId: externalId },
    });

    if (!transaction) {
      return NextResponse.json({ received: true });
    }

    if (status === "SUCCESSFUL") {
      await db.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "completed",
          externalRef: body.financialTransactionId,
          paidAt: new Date(),
          gatewayResponse: JSON.stringify(body),
        },
      });

      const purchase = await db.purchase.findFirst({
        where: { orderTrackingId: transaction.orderId },
      });

      if (purchase) {
        await unlockCourseAccess({ purchaseId: purchase.id, transactionRef: body.financialTransactionId });
      }
    } else if (status === "FAILED") {
      await db.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "failed",
          errorMessage: body.reason || "Payment failed",
          gatewayResponse: JSON.stringify(body),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[MTN_MOMO_WEBHOOK]", error);
    return NextResponse.json({ received: true });
  }
}
