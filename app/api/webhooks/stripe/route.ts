export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlockCourseAccess } from "@/lib/payment-utils";
import { decryptCredentials } from "@/lib/encryption";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    // Get Stripe webhook secret from gateway credentials
    const gateway = await db.paymentGateway.findUnique({ where: { code: "stripe" } });
    if (!gateway?.credentials) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
    }

    const creds = decryptCredentials(gateway.credentials);
    const webhookSecret = creds.webhook_secret;

    // Verify signature
    if (webhookSecret && sig) {
      const elements = sig.split(",");
      const timestamp = elements.find(e => e.startsWith("t="))?.split("=")[1];
      const v1Sig = elements.find(e => e.startsWith("v1="))?.split("=")[1];

      if (timestamp && v1Sig) {
        const payload = `${timestamp}.${body}`;
        const expected = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");
        if (expected !== v1Sig) {
          console.error("[STRIPE_WEBHOOK] Invalid signature");
          return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }
      }
    }

    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id || session.client_reference_id;

      if (!orderId) {
        return NextResponse.json({ error: "No order ID" }, { status: 400 });
      }

      const purchase = await db.purchase.findFirst({
        where: { orderTrackingId: orderId },
      });

      if (purchase && purchase.status !== "COMPLETED") {
        await db.paymentTransaction.updateMany({
          where: { orderId },
          data: {
            status: "completed",
            externalRef: session.payment_intent,
            paidAt: new Date(),
            gatewayResponse: JSON.stringify(session),
          },
        });

        await unlockCourseAccess({ purchaseId: purchase.id, transactionRef: session.payment_intent });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
