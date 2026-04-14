export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get top students by completed lessons
    const students = await db.profile.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        lessonProgress: {
          where: { isCompleted: true },
          select: { id: true },
        },
        certificates: {
          select: { id: true },
        },
      },
    });

    const leaderboard = students
      .map((s) => ({
        id: s.id,
        name: s.name,
        imageUrl: s.imageUrl,
        lessonsCompleted: s.lessonProgress.length,
        certificates: s.certificates.length,
        points: s.lessonProgress.length * 10 + s.certificates.length * 100,
      }))
      .filter((s) => s.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 20);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("[LEADERBOARD_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
