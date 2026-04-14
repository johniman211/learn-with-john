export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlockCourseAccess } from "@/lib/payment-utils";
import { decryptCredentials } from "@/lib/encryption";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();

    // Verify hash
    const gateway = await db.paymentGateway.findUnique({ where: { code: "flutterwave" } });
    if (!gateway?.credentials) {
      return NextResponse.json({ error: "Not configured" }, { status: 400 });
    }

    const creds = decryptCredentials(gateway.credentials);
    const hash = req.headers.get("verif-hash");
    if (hash && creds.secret_key) {
      const expectedHash = crypto.createHash("sha256").update(creds.secret_key).digest("hex");
      if (hash !== expectedHash) {
        console.error("[FLUTTERWAVE_WEBHOOK] Invalid hash");
        return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
      }
    }

    const event = JSON.parse(body);

    if (event.event === "charge.completed" && event.data?.status === "successful") {
      const orderId = event.data.tx_ref;
      const purchase = await db.purchase.findFirst({
        where: { orderTrackingId: orderId },
      });

      if (purchase && purchase.status !== "COMPLETED") {
        await db.paymentTransaction.updateMany({
          where: { orderId },
          data: {
            status: "completed",
            externalRef: String(event.data.id),
            paidAt: new Date(),
            gatewayResponse: JSON.stringify(event.data),
          },
        });

        await unlockCourseAccess({ purchaseId: purchase.id, transactionRef: String(event.data.id) });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[FLUTTERWAVE_WEBHOOK]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
