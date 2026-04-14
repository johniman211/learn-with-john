export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlockCourseAccess } from "@/lib/payment-utils";
import { decryptCredentials } from "@/lib/encryption";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    console.log("[DPO_WEBHOOK]", body);

    // Parse DPO callback — typically XML or form-encoded
    const transToken = body.match(/TransactionToken=([^&]+)/)?.[1]
      || body.match(/<TransactionToken>([^<]+)<\/TransactionToken>/)?.[1];

    if (!transToken) {
      return NextResponse.json({ received: true });
    }

    // Verify with DPO
    const gateway = await db.paymentGateway.findUnique({ where: { code: "dpo" } });
    if (!gateway?.credentials) {
      return NextResponse.json({ received: true });
    }

    const creds = decryptCredentials(gateway.credentials);
    const isLive = gateway.environment === "live";
    const baseUrl = isLive ? "https://secure.3gdirectpay.com" : "https://secure1.sandbox.directpay.online";

    const verifyXml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${creds.company_token}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${transToken}</TransactionToken>
</API3G>`;

    const res = await axios.post(`${baseUrl}/API/v6/`, verifyXml, {
      headers: { "Content-Type": "application/xml" },
    });

    const data = res.data as string;
    const result = data.match(/<Result>([^<]+)<\/Result>/)?.[1];
    const companyRef = data.match(/<CompanyRef>([^<]+)<\/CompanyRef>/)?.[1];

    if (result === "000" && companyRef) {
      const purchase = await db.purchase.findFirst({
        where: { orderTrackingId: companyRef },
      });

      if (purchase && purchase.status !== "COMPLETED") {
        await db.paymentTransaction.updateMany({
          where: { orderId: companyRef },
          data: {
            status: "completed",
            externalRef: transToken,
            paidAt: new Date(),
            gatewayResponse: data,
          },
        });

        await unlockCourseAccess({ purchaseId: purchase.id, transactionRef: transToken });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[DPO_WEBHOOK]", error);
    return NextResponse.json({ received: true });
  }
}
