export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string } }
) {
  try {
    const profile = await getProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (profile.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const values = await req.json();

    const section = await db.section.update({
      where: {
        id: params.sectionId,
        courseId: params.courseId,
      },
      data: { ...values },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("[SECTION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string } }
) {
  try {
    const profile = await getProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (profile.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const section = await db.section.delete({
      where: {
        id: params.sectionId,
        courseId: params.courseId,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("[SECTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
