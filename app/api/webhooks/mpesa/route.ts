export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlockCourseAccess } from "@/lib/payment-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[MPESA_WEBHOOK]", JSON.stringify(body));

    const callback = body.Body?.stkCallback;
    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const resultCode = callback.ResultCode;
    const checkoutRequestId = callback.CheckoutRequestID;

    // Find the transaction by reference
    const transaction = await db.paymentTransaction.findFirst({
      where: { transactionRef: checkoutRequestId },
    });

    if (!transaction) {
      console.error("[MPESA_WEBHOOK] Transaction not found:", checkoutRequestId);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (resultCode === 0) {
      // Payment successful
      const items = callback.CallbackMetadata?.Item || [];
      const mpesaRef = items.find((i: { Name: string }) => i.Name === "MpesaReceiptNumber")?.Value;

      await db.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "completed",
          externalRef: mpesaRef,
          paidAt: new Date(),
          gatewayResponse: JSON.stringify(body),
        },
      });

      const purchase = await db.purchase.findFirst({
        where: { orderTrackingId: transaction.orderId },
      });

      if (purchase) {
        await unlockCourseAccess({ purchaseId: purchase.id, transactionRef: mpesaRef });
      }
    } else {
      // Payment failed
      await db.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "failed",
          errorMessage: callback.ResultDesc,
          gatewayResponse: JSON.stringify(body),
        },
      });

      const purchase = await db.purchase.findFirst({
        where: { orderTrackingId: transaction.orderId },
      });
      if (purchase) {
        await db.purchase.update({
          where: { id: purchase.id },
          data: { status: "FAILED" },
        });
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("[MPESA_WEBHOOK]", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
