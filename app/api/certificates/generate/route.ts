export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { sendCertificateEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = await req.json();

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: {
              where: { isPublished: true },
              include: {
                progress: {
                  where: { profileId: profile.id },
                },
                quizzes: true,
                assignments: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const purchase = await db.purchase.findFirst({
      where: {
        profileId: profile.id,
        courseId,
        status: "COMPLETED",
      },
    });

    if (!purchase) {
      return new NextResponse("Not enrolled", { status: 403 });
    }

    const allLessons = course.sections.flatMap(
      (s: { lessons: unknown[] }) => s.lessons
    ) as {
      id: string;
      progress: { isCompleted: boolean }[];
      quizzes: { id: string }[];
      assignments: { id: string }[];
    }[];

    const allCompleted = allLessons.every(
      (l) => l.progress?.[0]?.isCompleted
    );

    if (!allCompleted) {
      return new NextResponse("Not all lessons completed", { status: 400 });
    }

    const quizIds = allLessons.flatMap((l) => l.quizzes.map((q) => q.id));
    if (quizIds.length > 0) {
      const passedQuizzes = await db.quizAttempt.findMany({
        where: {
          profileId: profile.id,
          quizId: { in: quizIds },
          passed: true,
        },
        distinct: ["quizId"],
      });
      if (passedQuizzes.length < quizIds.length) {
        return new NextResponse("Not all quizzes passed", { status: 400 });
      }
    }

    const assignmentIds = allLessons.flatMap((l) =>
      l.assignments.map((a) => a.id)
    );
    if (assignmentIds.length > 0) {
      const passedAssignments = await db.assignmentSubmission.findMany({
        where: {
          profileId: profile.id,
          assignmentId: { in: assignmentIds },
          status: "passed",
        },
        distinct: ["assignmentId"],
      });
      if (passedAssignments.length < assignmentIds.length) {
        return new NextResponse("Not all assignments passed", { status: 400 });
      }
    }

    const existing = await db.certificate.findUnique({
      where: {
        profileId_courseId: {
          profileId: profile.id,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const certificate = await db.certificate.create({
      data: {
        profileId: profile.id,
        courseId,
      },
    });

    try {
      await sendCertificateEmail(
        profile.email,
        profile.name,
        course.title,
        certificate.uniqueCode
      );
    } catch (emailError) {
      console.error("[CERTIFICATE_EMAIL]", emailError);
    }

    await createNotification({
      profileId: profile.id,
      title: "Certificate earned!",
      message: `Congratulations! You've earned your certificate for "${course.title}".`,
      link: `/verify/${certificate.uniqueCode}`,
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("[CERTIFICATE_GENERATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
