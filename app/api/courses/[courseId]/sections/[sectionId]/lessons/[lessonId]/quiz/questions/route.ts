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

    const quiz = await db.quiz.findUnique({
      where: { lessonId: params.lessonId },
      include: { questions: true },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    const { question, options, correctAnswer } = await req.json();

    const newQuestion = await db.quizQuestion.create({
      data: {
        question,
        options,
        correctAnswer,
        position: quiz.questions.length,
        quizId: quiz.id,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("[QUIZ_QUESTION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const profile = await getProfile();

    if (!profile || profile.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { questionId, question, options, correctAnswer, position } = await req.json();

    const updated = await db.quizQuestion.update({
      where: { id: questionId },
      data: {
        ...(question !== undefined && { question }),
        ...(options !== undefined && { options }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[QUIZ_QUESTION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const profile = await getProfile();

    if (!profile || profile.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return new NextResponse("Question ID required", { status: 400 });
    }

    await db.quizQuestion.delete({
      where: { id: questionId },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[QUIZ_QUESTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
