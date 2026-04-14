export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string; lessonId: string } }
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

    // Sanitize optional fields
    if (values.description === "") values.description = null;
    if (values.content === "") values.content = null;
    if (values.videoUrl === "") values.videoUrl = null;

    const lesson = await db.lesson.update({
      where: {
        id: params.lessonId,
        sectionId: params.sectionId,
      },
      data: { ...values },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("[LESSON_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string; lessonId: string } }
) {
  try {
    const profile = await getProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (profile.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const lesson = await db.lesson.delete({
      where: {
        id: params.lessonId,
        sectionId: params.sectionId,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("[LESSON_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
