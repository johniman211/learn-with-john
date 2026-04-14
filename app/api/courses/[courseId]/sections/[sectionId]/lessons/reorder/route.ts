export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function PUT(req: Request) {
  try {
    const profile = await getProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (profile.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { list } = await req.json();

    for (const item of list) {
      await db.lesson.update({
        where: { id: item.id },
        data: { position: item.position },
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[LESSONS_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
