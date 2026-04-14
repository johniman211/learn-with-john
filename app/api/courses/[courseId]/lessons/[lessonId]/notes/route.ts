export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await db.note.findUnique({
      where: {
        profileId_lessonId: {
          profileId: profile.id,
          lessonId: params.lessonId,
        },
      },
    });

    return NextResponse.json({ content: note?.content || "" });
  } catch (error) {
    console.error("[NOTES_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (typeof content !== "string") {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    if (content.trim().length === 0) {
      // Delete note if empty
      await db.note.deleteMany({
        where: {
          profileId: profile.id,
          lessonId: params.lessonId,
        },
      });
      return NextResponse.json({ content: "" });
    }

    const note = await db.note.upsert({
      where: {
        profileId_lessonId: {
          profileId: profile.id,
          lessonId: params.lessonId,
        },
      },
      update: { content: content.trim() },
      create: {
        content: content.trim(),
        profileId: profile.id,
        lessonId: params.lessonId,
      },
    });

    return NextResponse.json({ content: note.content });
  } catch (error) {
    console.error("[NOTES_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
