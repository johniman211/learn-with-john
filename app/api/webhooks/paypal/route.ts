export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlockCourseAccess } from "@/lib/payment-utils";
import { decryptCredentials } from "@/lib/encryption";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[PAYPAL_WEBHOOK]", JSON.stringify(body));

    if (body.event_type === "CHECKOUT.ORDER.APPROVED" || body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = body.resource;
      const orderId = resource?.purchase_units?.[0]?.reference_id
        || resource?.supplementary_data?.related_ids?.order_id;

      if (!orderId) return NextResponse.json({ received: true });

      const purchase = await db.purchase.findFirst({
        where: { orderTrackingId: orderId },
      });

      if (!purchase || purchase.status === "COMPLETED") {
        return NextResponse.json({ received: true });
      }

      // Capture the payment if order approved
      if (body.event_type === "CHECKOUT.ORDER.APPROVED") {
        const gateway = await db.paymentGateway.findUnique({ where: { code: "paypal" } });
        if (gateway?.credentials) {
          const creds = decryptCredentials(gateway.credentials);
          const isLive = gateway.environment === "live";
          const baseUrl = isLive ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
          const auth = Buffer.from(`${creds.client_id}:${creds.client_secret}`).toString("base64");

          const tokenRes = await axios.post(
            `${baseUrl}/v1/oauth2/token`,
            "grant_type=client_credentials",
            { headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" } }
          );

          await axios.post(
            `${baseUrl}/v2/checkout/orders/${resource.id}/capture`,
            {},
            { headers: { Authorization: `Bearer ${tokenRes.data.access_token}` } }
          );
        }
      }

      await db.paymentTransaction.updateMany({
        where: { orderId },
        data: {
          status: "completed",
          externalRef: resource?.id,
          paidAt: new Date(),
          gatewayResponse: JSON.stringify(body),
        },
      });

      await unlockCourseAccess({ purchaseId: purchase.id, transactionRef: resource?.id });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PAYPAL_WEBHOOK]", error);
    return NextResponse.json({ received: true });
  }
}
