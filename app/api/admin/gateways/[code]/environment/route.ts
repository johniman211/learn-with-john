export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

// POST toggle environment sandbox/live
export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { environment } = await req.json();

    if (!["sandbox", "live"].includes(environment)) {
      return NextResponse.json({ error: "Invalid environment" }, { status: 400 });
    }

    await db.paymentGateway.update({
      where: { code: params.code },
      data: { environment },
    });

    return NextResponse.json({ success: true, environment });
  } catch (error) {
    console.error("[GATEWAY_ENVIRONMENT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
