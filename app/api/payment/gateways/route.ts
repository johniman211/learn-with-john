export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET active gateways for checkout (no credentials)
export async function GET() {
  try {
    const gateways = await db.paymentGateway.findMany({
      where: { isActive: true, isAvailable: true },
      select: {
        code: true,
        name: true,
        displayName: true,
        description: true,
        logo: true,
        category: true,
        supportedCountries: true,
        supportedCurrencies: true,
        feePercent: true,
        feeFixed: true,
        environment: true,
        displayOrder: true,
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(gateways);
  } catch (error) {
    console.error("[PAYMENT_GATEWAYS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
