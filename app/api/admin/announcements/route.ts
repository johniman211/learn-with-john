export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const announcements = await db.announcement.findMany({
      include: { course: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("[ANNOUNCEMENTS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, message, courseId } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message required" }, { status: 400 });
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        message,
        courseId: courseId || null,
        profileId: profile.id,
      },
    });

    // Send notifications to relevant students
    let students;
    if (courseId) {
      // Only students enrolled in this course
      const purchases = await db.purchase.findMany({
        where: { courseId, status: "COMPLETED" },
        select: { profileId: true },
      });
      students = purchases.map((p) => p.profileId);
    } else {
      // All students
      const allStudents = await db.profile.findMany({
        where: { role: "STUDENT" },
        select: { id: true },
      });
      students = allStudents.map((s) => s.id);
    }

    // Create notifications for each student
    await Promise.all(
      students.map((studentId) =>
        createNotification({
          profileId: studentId,
          title: `📢 ${title}`,
          message,
          link: "/student",
        })
      )
    );

    return NextResponse.json({ ...announcement, notifiedCount: students.length });
  } catch (error) {
    console.error("[ANNOUNCEMENTS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
