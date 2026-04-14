export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

// GET all pending manual payments (WhatsApp + Bank Transfer)
export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pending = await db.purchase.findMany({
      where: {
        status: "PENDING",
        gatewayCode: { in: ["whatsapp_manual", "bank_transfer"] },
      },
      include: {
        profile: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pending);
  } catch (error) {
    console.error("[PENDING_PAYMENTS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
