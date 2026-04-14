export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; quizId: string } }
) {
  try {
    const profile = await getProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { answers } = await req.json();

    const quiz = await db.quiz.findUnique({
      where: { id: params.quizId },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    let correctCount = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      if (answers[i] === quiz.questions[i].correctAnswer) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passMark;

    const attempt = await db.quizAttempt.create({
      data: {
        score,
        passed,
        answers,
        profileId: profile.id,
        quizId: quiz.id,
      },
    });

    if (passed) {
      await db.lessonProgress.upsert({
        where: {
          profileId_lessonId: {
            profileId: profile.id,
            lessonId: quiz.lessonId,
          },
        },
        create: {
          profileId: profile.id,
          lessonId: quiz.lessonId,
          isCompleted: true,
        },
        update: {
          isCompleted: true,
        },
      });
    }

    return NextResponse.json({ score, passed, attemptId: attempt.id });
  } catch (error) {
    console.error("[QUIZ_ATTEMPT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
