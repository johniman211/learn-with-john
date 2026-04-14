export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, message, courseId } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
    }

    let students;
    if (courseId) {
      const purchases = await db.purchase.findMany({
        where: { courseId, status: "COMPLETED" },
        include: { profile: { select: { email: true, name: true } } },
      });
      students = purchases.map((p) => ({
        email: p.profile.email,
        name: p.profile.name,
      }));
    } else {
      students = await db.profile.findMany({
        where: { role: "STUDENT" },
        select: { email: true, name: true },
      });
    }

    let sentCount = 0;
    for (const student of students) {
      try {
        await resend.emails.send({
          from: "Learn with John <noreply@learnwithjohn.com>",
          to: student.email,
          subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1D6FF2;">${subject}</h2>
              <p>Hi ${student.name},</p>
              <div style="white-space: pre-wrap; line-height: 1.6;">${message}</div>
              <p style="margin-top: 24px; color: #666; font-size: 14px;">
                — The Learn with John Team
              </p>
            </div>
          `,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${student.email}`, err);
      }
    }

    return NextResponse.json({ success: true, sentCount, totalStudents: students.length });
  } catch (error) {
    console.error("[BROADCAST_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
