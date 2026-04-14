export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { sendReminderEmail } from "@/lib/email";

export async function POST() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find students with incomplete courses who haven't had progress in 7+ days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const enrollments = await db.purchase.findMany({
      where: { status: "COMPLETED" },
      include: {
        profile: { select: { id: true, name: true, email: true } },
        course: {
          include: {
            sections: {
              include: {
                lessons: {
                  where: { isPublished: true },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    let sentCount = 0;

    for (const enrollment of enrollments) {
      const allLessonIds = enrollment.course.sections.flatMap(
        (s) => s.lessons.map((l) => l.id)
      );
      const totalLessons = allLessonIds.length;
      if (totalLessons === 0) continue;

      const completedLessons = await db.lessonProgress.count({
        where: {
          profileId: enrollment.profile.id,
          lessonId: { in: allLessonIds },
          isCompleted: true,
        },
      });

      // Skip if already completed
      if (completedLessons >= totalLessons) continue;

      // Check last activity
      const lastActivity = await db.lessonProgress.findFirst({
        where: {
          profileId: enrollment.profile.id,
          lessonId: { in: allLessonIds },
        },
        orderBy: { updatedAt: "desc" },
      });

      // Send reminder if no activity in 7+ days (or never started)
      if (!lastActivity || lastActivity.updatedAt < sevenDaysAgo) {
        const progressPercent = Math.round((completedLessons / totalLessons) * 100);
        await sendReminderEmail(
          enrollment.profile.email,
          enrollment.profile.name,
          enrollment.course.title,
          progressPercent
        );
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, sentCount });
  } catch (error) {
    console.error("[SEND_REMINDERS]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
