export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmark = await db.bookmark.findUnique({
      where: {
        profileId_courseId: {
          profileId: profile.id,
          courseId: params.courseId,
        },
      },
    });

    return NextResponse.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error("[BOOKMARK_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.bookmark.findUnique({
      where: {
        profileId_courseId: {
          profileId: profile.id,
          courseId: params.courseId,
        },
      },
    });

    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ isBookmarked: false });
    } else {
      await db.bookmark.create({
        data: {
          profileId: profile.id,
          courseId: params.courseId,
        },
      });
      return NextResponse.json({ isBookmarked: true });
    }
  } catch (error) {
    console.error("[BOOKMARK_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
