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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { code } = await req.json();

    const coupon = await db.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return new NextResponse("Invalid coupon", { status: 404 });
    }

    if (!coupon.isActive) {
      return new NextResponse("Coupon is inactive", { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return new NextResponse("Coupon expired", { status: 400 });
    }

    if (coupon.maxUses && coupon.maxUses > 0 && coupon.timesUsed >= coupon.maxUses) {
      return new NextResponse("Coupon usage limit reached", { status: 400 });
    }

    if (coupon.courseId && coupon.courseId !== params.courseId) {
      return new NextResponse("Coupon not valid for this course", { status: 400 });
    }

    const course = await db.course.findUnique({
      where: { id: params.courseId },
      select: { price: true },
    });

    if (!course || !course.price) {
      return new NextResponse("Course not found", { status: 404 });
    }

    let discountAmount: number;
    if (coupon.isPercent) {
      discountAmount = (course.price * coupon.discount) / 100;
    } else {
      discountAmount = coupon.discount;
    }

    discountAmount = Math.min(discountAmount, course.price);

    return NextResponse.json({
      discountAmount,
      couponId: coupon.id,
    });
  } catch (error) {
    console.error("[COUPON_VALIDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
