export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function POST(
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
      where: { id: params.courseId, profileId: profile.id },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const { title } = await req.json();

    const lastSection = await db.section.findFirst({
      where: { courseId: params.courseId },
      orderBy: { position: "desc" },
    });

    const newPosition = lastSection ? lastSection.position + 1 : 0;

    const section = await db.section.create({
      data: {
        title,
        courseId: params.courseId,
        position: newPosition,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("[SECTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
