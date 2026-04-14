export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlockCourseAccess } from "@/lib/payment-utils";
import { decryptCredentials } from "@/lib/encryption";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get("x-cc-webhook-signature");

    const gateway = await db.paymentGateway.findUnique({ where: { code: "coinbase" } });
    if (!gateway?.credentials) {
      return NextResponse.json({ error: "Not configured" }, { status: 400 });
    }

    const creds = decryptCredentials(gateway.credentials);

    // Verify signature
    if (sig && creds.webhook_secret) {
      const expected = crypto.createHmac("sha256", creds.webhook_secret).update(body).digest("hex");
      if (expected !== sig) {
        console.error("[COINBASE_WEBHOOK] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(body);

    if (event.event?.type === "charge:confirmed" || event.event?.type === "charge:resolved") {
      const charge = event.event.data;
      const orderId = charge.metadata?.order_id;

      if (!orderId) return NextResponse.json({ received: true });

      const purchase = await db.purchase.findFirst({
        where: { orderTrackingId: orderId },
      });

      if (purchase && purchase.status !== "COMPLETED") {
        await db.paymentTransaction.updateMany({
          where: { orderId },
          data: {
            status: "completed",
            externalRef: charge.code,
            paidAt: new Date(),
            gatewayResponse: JSON.stringify(charge),
          },
        });

        await unlockCourseAccess({ purchaseId: purchase.id, transactionRef: charge.code });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[COINBASE_WEBHOOK]", error);
    return NextResponse.json({ received: true });
  }
}
