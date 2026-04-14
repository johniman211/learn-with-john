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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    // Verify enrollment
    const purchase = await db.purchase.findFirst({
      where: {
        profileId: profile.id,
        courseId: params.courseId,
        status: "COMPLETED",
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "You must be enrolled to leave a review" },
        { status: 403 }
      );
    }

    // Upsert review (one per student per course)
    const review = await db.review.upsert({
      where: {
        profileId_courseId: {
          profileId: profile.id,
          courseId: params.courseId,
        },
      },
      update: {
        rating,
        comment: comment?.trim() || null,
      },
      create: {
        rating,
        comment: comment?.trim() || null,
        profileId: profile.id,
        courseId: params.courseId,
      },
      include: {
        profile: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(review);
  } catch (error: unknown) {
    console.error("[REVIEWS_POST]", (error as Error)?.message || error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
