export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

// GET — fetch all discussions for a lesson (top-level + replies)
export async function GET(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const discussions = await db.discussion.findMany({
      where: {
        lessonId: params.lessonId,
        parentId: null, // top-level only
      },
      include: {
        profile: { select: { id: true, name: true, imageUrl: true } },
        replies: {
          include: {
            profile: { select: { id: true, name: true, imageUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(discussions);
  } catch (error) {
    console.error("[DISCUSSIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST — create a new discussion or reply
export async function POST(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile) {
      console.error("[DISCUSSIONS_POST] No profile found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, parentId } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const discussion = await db.discussion.create({
      data: {
        message: message.trim(),
        profileId: profile.id,
        lessonId: params.lessonId,
        parentId: parentId || null,
      },
      include: {
        profile: { select: { id: true, name: true, imageUrl: true } },
        replies: {
          include: {
            profile: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
    });

    return NextResponse.json(discussion);
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[DISCUSSIONS_POST] Error:", err?.message || error);
    return NextResponse.json(
      { error: err?.message || "Internal Error" },
      { status: 500 }
    );
  }
}
