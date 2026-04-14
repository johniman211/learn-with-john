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

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (profile.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { url, name } = await req.json();

    const attachment = await db.attachment.create({
      data: {
        url,
        name,
        lessonId: params.lessonId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("[ATTACHMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const profile = await getProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (profile.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!attachmentId) {
      return new NextResponse("Attachment ID required", { status: 400 });
    }

    const attachment = await db.attachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("[ATTACHMENTS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
