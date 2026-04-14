export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function POST(
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

    const course = await db.course.findUnique({
      where: { id: params.courseId, profileId: profile.id },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const { title } = await req.json();

    const lastLesson = await db.lesson.findFirst({
      where: { sectionId: params.sectionId },
      orderBy: { position: "desc" },
    });

    const newPosition = lastLesson ? lastLesson.position + 1 : 0;

    const lesson = await db.lesson.create({
      data: {
        title,
        sectionId: params.sectionId,
        position: newPosition,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("[LESSONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
