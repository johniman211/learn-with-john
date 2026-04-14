export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

// GET — fetch existing submission for this user
export async function GET(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assignment = await db.assignment.findUnique({
      where: { lessonId: params.lessonId },
    });

    if (!assignment) {
      return new NextResponse("No assignment", { status: 404 });
    }

    const submission = await db.assignmentSubmission.findUnique({
      where: {
        profileId_assignmentId: {
          profileId: profile.id,
          assignmentId: assignment.id,
        },
      },
    });

    if (!submission) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("[SUBMISSION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST — create or update a submission
export async function POST(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { notes, fileUrl } = await req.json();

    const assignment = await db.assignment.findUnique({
      where: { lessonId: params.lessonId },
    });

    if (!assignment) {
      return new NextResponse("No assignment for this lesson", { status: 404 });
    }

    const submission = await db.assignmentSubmission.upsert({
      where: {
        profileId_assignmentId: {
          profileId: profile.id,
          assignmentId: assignment.id,
        },
      },
      create: {
        profileId: profile.id,
        assignmentId: assignment.id,
        notes: notes || null,
        fileUrl: fileUrl || null,
        status: "pending",
      },
      update: {
        notes: notes || null,
        fileUrl: fileUrl || null,
        status: "pending",
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("[SUBMISSION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
