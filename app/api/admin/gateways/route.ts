export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { decryptCredentials, maskCredentials } from "@/lib/encryption";

// GET all gateways with fields and masked credentials
export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gateways = await db.paymentGateway.findMany({
      include: { credentialFields: { orderBy: { sortOrder: "asc" } } },
      orderBy: { displayOrder: "asc" },
    });

    const result = gateways.map((gw: {
      id: string;
      code: string;
      credentials: string | null;
      [key: string]: unknown;
    }) => {
      let maskedCreds: Record<string, string> = {};
      if (gw.credentials) {
        try {
          const raw = decryptCredentials(gw.credentials);
          maskedCreds = maskCredentials(raw);
        } catch {
          maskedCreds = {};
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { credentials: rawCreds, ...rest } = gw;
      return { ...rest, credentials: maskedCreds };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ADMIN_GATEWAYS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// PUT update display order
export async function PUT(req: Request) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orders } = await req.json();
    // orders: { code: string, displayOrder: number }[]

    for (const item of orders) {
      await db.paymentGateway.update({
        where: { code: item.code },
        data: { displayOrder: item.displayOrder },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_GATEWAYS_PUT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
