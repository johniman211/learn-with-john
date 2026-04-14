export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { sendWelcomeEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const profile = await getProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: { id: params.courseId, isPublished: true },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Payments disabled — all courses are free for testing
    const existingPurchase = await db.purchase.findUnique({
      where: {
        profileId_courseId: {
          profileId: profile.id,
          courseId: course.id,
        },
      },
    });

    if (existingPurchase) {
      return new NextResponse("Already enrolled", { status: 400 });
    }

    await db.purchase.create({
      data: {
        profileId: profile.id,
        courseId: course.id,
        amount: 0,
        currency: course.currency,
        status: "COMPLETED",
        paymentMethod: "free",
      },
    });

    // Non-blocking — don't let email failure break enrollment
    try {
      await sendWelcomeEmail(profile.email, profile.name, course.title);
    } catch (emailError) {
      console.error("[ENROLL_FREE_EMAIL]", emailError);
    }

    await createNotification({
      profileId: profile.id,
      title: "Enrolled successfully!",
      message: `You're now enrolled in "${course.title}". Start learning now!`,
      link: `/student/courses/${course.id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ENROLL_FREE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
