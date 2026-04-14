export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { sendAssignmentReviewEmail } from "@/lib/email";

export async function PATCH(req: Request) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { submissionId, score, feedback, status } = await req.json();

    const submission = await db.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score,
        feedback,
        status: status || (score !== null ? "reviewed" : "submitted"),
      },
      include: {
        profile: true,
        assignment: {
          include: {
            lesson: {
              include: {
                section: {
                  include: { course: true },
                },
              },
            },
          },
        },
      },
    });

    if (submission.profile && submission.assignment) {
      const courseName = submission.assignment.lesson?.section?.course?.title || "Course";
      await sendAssignmentReviewEmail(
        submission.profile.email,
        submission.profile.name,
        submission.assignment.title,
        courseName,
        score,
        feedback,
        status
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("[ASSIGNMENT_REVIEW]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
