export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string; lessonId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, instructions, maxScore } = await req.json();

    const existing = await db.assignment.findUnique({
      where: { lessonId: params.lessonId },
    });

    if (existing) {
      return new NextResponse("Assignment already exists for this lesson", { status: 400 });
    }

    const assignment = await db.assignment.create({
      data: {
        title,
        instructions,
        maxScore: maxScore || 100,
        lessonId: params.lessonId,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string; lessonId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assignment = await db.assignment.findUnique({
      where: { lessonId: params.lessonId },
      include: {
        submissions: profile.role === "ADMIN" ? {
          include: { profile: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        } : {
          where: { profileId: profile.id },
        },
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string; lessonId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const assignment = await db.assignment.findUnique({
      where: { lessonId: params.lessonId },
    });

    if (!assignment) {
      return new NextResponse("Not found", { status: 404 });
    }

    const updated = await db.assignment.update({
      where: { id: assignment.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.instructions !== undefined && { instructions: body.instructions }),
        ...(body.maxScore !== undefined && { maxScore: body.maxScore }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ASSIGNMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string; lessonId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assignment = await db.assignment.findUnique({
      where: { lessonId: params.lessonId },
    });

    if (!assignment) {
      return new NextResponse("Not found", { status: 404 });
    }

    await db.assignment.delete({ where: { id: assignment.id } });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[ASSIGNMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
