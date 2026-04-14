export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
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
      where: {
        id: params.courseId,
        profileId: profile.id,
      },
      include: {
        sections: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const hasPublishedLessons = course.sections.some((section: { lessons: { isPublished: boolean }[] }) =>
      section.lessons.some((lesson: { isPublished: boolean }) => lesson.isPublished)
    );

    if (
      !course.title ||
      !course.description ||
      !course.imageUrl ||
      !course.price ||
      !hasPublishedLessons
    ) {
      return new NextResponse(
        "Missing required fields. Ensure you have a title, description, image, price, and at least one published lesson.",
        { status: 400 }
      );
    }

    const updatedCourse = await db.course.update({
      where: { id: params.courseId },
      data: { isPublished: true },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const profile = await getProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (profile.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedCourse = await db.course.update({
      where: {
        id: params.courseId,
        profileId: profile.id,
      },
      data: { isPublished: false },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
