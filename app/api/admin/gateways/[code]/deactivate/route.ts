export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

// POST deactivate a gateway
export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.paymentGateway.update({
      where: { code: params.code },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DEACTIVATE_GATEWAY]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
