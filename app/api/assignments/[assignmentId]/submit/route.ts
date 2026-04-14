export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function POST(
  req: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileUrl, notes } = await req.json();

    const assignment = await db.assignment.findUnique({
      where: { id: params.assignmentId },
    });

    if (!assignment) {
      return new NextResponse("Assignment not found", { status: 404 });
    }

    const submission = await db.assignmentSubmission.upsert({
      where: {
        profileId_assignmentId: {
          profileId: profile.id,
          assignmentId: params.assignmentId,
        },
      },
      create: {
        profileId: profile.id,
        assignmentId: params.assignmentId,
        fileUrl,
        notes,
        status: "submitted",
      },
      update: {
        fileUrl,
        notes,
        status: "submitted",
        score: null,
        feedback: null,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("[ASSIGNMENT_SUBMIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
