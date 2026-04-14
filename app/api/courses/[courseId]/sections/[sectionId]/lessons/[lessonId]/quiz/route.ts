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

    const { title, passMark } = await req.json();

    const existingQuiz = await db.quiz.findUnique({
      where: { lessonId: params.lessonId },
    });

    if (existingQuiz) {
      return new NextResponse("Quiz already exists for this lesson", { status: 400 });
    }

    const quiz = await db.quiz.create({
      data: {
        title: title || "Lesson Quiz",
        passMark: passMark || 70,
        lessonId: params.lessonId,
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_POST]", error);
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

    const quiz = await db.quiz.findUnique({
      where: { lessonId: params.lessonId },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_GET]", error);
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

    const quiz = await db.quiz.findUnique({
      where: { lessonId: params.lessonId },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    const updated = await db.quiz.update({
      where: { id: quiz.id },
      data: {
        title: body.title,
        passMark: body.passMark,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[QUIZ_PATCH]", error);
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

    const quiz = await db.quiz.findUnique({
      where: { lessonId: params.lessonId },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    await db.quiz.delete({
      where: { id: quiz.id },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[QUIZ_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
