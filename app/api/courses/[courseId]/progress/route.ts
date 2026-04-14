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

    const { lessonId, isCompleted } = await req.json();

    const progress = await db.lessonProgress.upsert({
      where: {
        profileId_lessonId: {
          profileId: profile.id,
          lessonId,
        },
      },
      create: {
        profileId: profile.id,
        lessonId,
        isCompleted,
      },
      update: {
        isCompleted,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[PROGRESS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const profile = await getProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: { id: params.courseId },
      include: {
        sections: {
          include: {
            lessons: {
              where: { isPublished: true },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const allLessonIds = course.sections.flatMap((s: { lessons: { id: string }[] }) =>
      s.lessons.map((l: { id: string }) => l.id)
    );

    const completedLessons = await db.lessonProgress.count({
      where: {
        profileId: profile.id,
        lessonId: { in: allLessonIds },
        isCompleted: true,
      },
    });

    const totalLessons = allLessonIds.length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return NextResponse.json({
      completedLessons,
      totalLessons,
      progressPercent,
    });
  } catch (error) {
    console.error("[PROGRESS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
