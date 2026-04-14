export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function PATCH(
  req: Request,
  { params }: { params: { couponId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const coupon = await db.coupon.update({
      where: { id: params.couponId },
      data: body,
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("[COUPON_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { couponId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.coupon.delete({ where: { id: params.couponId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COUPON_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
