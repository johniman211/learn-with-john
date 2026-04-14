export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pesapalRequest } from "@/lib/pesapal";
import { sendPaymentConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { OrderTrackingId, OrderMerchantReference } = body;

    const trackingId = OrderTrackingId || OrderMerchantReference;

    if (!trackingId) {
      return new NextResponse("Missing tracking ID", { status: 400 });
    }

    const statusResponse = await pesapalRequest(
      "GET",
      `/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`
    );

    const paymentStatus = statusResponse.payment_status_description;

    const purchase = await db.purchase.findFirst({
      where: { orderTrackingId: trackingId },
      include: {
        profile: true,
        course: true,
      },
    });

    if (!purchase) {
      console.error("[PESAPAL_WEBHOOK] Purchase not found:", trackingId);
      return new NextResponse("OK", { status: 200 });
    }

    if (paymentStatus === "Completed") {
      await db.purchase.update({
        where: { id: purchase.id },
        data: {
          status: "COMPLETED",
          transactionId: statusResponse.confirmation_code || statusResponse.transaction_id,
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
    } else if (paymentStatus === "Failed" || paymentStatus === "Invalid") {
      await db.purchase.update({
        where: { id: purchase.id },
        data: { status: "FAILED" },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[PESAPAL_WEBHOOK]", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderTrackingId = searchParams.get("OrderTrackingId");

  if (!orderTrackingId) {
    return new NextResponse("Missing OrderTrackingId", { status: 400 });
  }

  try {
    const statusResponse = await pesapalRequest(
      "GET",
      `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`
    );

    const paymentStatus = statusResponse.payment_status_description;

    const purchase = await db.purchase.findFirst({
      where: { orderTrackingId },
      include: { profile: true, course: true },
    });

    if (purchase && paymentStatus === "Completed" && purchase.status !== "COMPLETED") {
      await db.purchase.update({
        where: { id: purchase.id },
        data: {
          status: "COMPLETED",
          transactionId: statusResponse.confirmation_code || statusResponse.transaction_id,
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
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[PESAPAL_WEBHOOK_GET]", error);
    return new NextResponse("Error", { status: 500 });
  }
}
