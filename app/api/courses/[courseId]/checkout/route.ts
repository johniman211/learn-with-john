export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { pesapalRequest, registerIPN } from "@/lib/pesapal";
import { sarafaRequest } from "@/lib/sarafa";

let cachedIpnId: string | null = null;

async function getIpnId(): Promise<string> {
  if (process.env.PESAPAL_IPN_ID) return process.env.PESAPAL_IPN_ID;
  if (cachedIpnId) return cachedIpnId;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const result = await registerIPN(`${appUrl}/api/webhooks/pesapal`, "POST");
  cachedIpnId = result.ipn_id;
  console.log("[PESAPAL] Registered IPN:", cachedIpnId);
  return cachedIpnId!;
}

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

    if (!course || !course.price) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const { paymentMethod, couponCode } = await req.json();

    let finalPrice = course.price;

    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode, isActive: true },
      });

      if (coupon) {
        const discount = coupon.isPercent
          ? (finalPrice * coupon.discount) / 100
          : coupon.discount;
        finalPrice = Math.max(0, finalPrice - discount);
      }
    }

    if (finalPrice <= 0) {
      return new NextResponse("Use free enrollment", { status: 400 });
    }

    const existingPurchase = await db.purchase.findUnique({
      where: {
        profileId_courseId: {
          profileId: profile.id,
          courseId: course.id,
        },
      },
    });

    if (existingPurchase?.status === "COMPLETED") {
      return new NextResponse("Already enrolled", { status: 400 });
    }

    const orderTrackingId = `LWJ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await db.purchase.upsert({
      where: {
        profileId_courseId: {
          profileId: profile.id,
          courseId: course.id,
        },
      },
      create: {
        profileId: profile.id,
        courseId: course.id,
        amount: finalPrice,
        currency: course.currency,
        status: "PENDING",
        paymentMethod,
        orderTrackingId,
      },
      update: {
        amount: finalPrice,
        status: "PENDING",
        paymentMethod,
        orderTrackingId,
      },
    });

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/student/courses/${course.id}`;

    if (paymentMethod === "pesapal") {
      const ipnId = await getIpnId();

      const pesapalResponse = await pesapalRequest("POST", "/api/Transactions/SubmitOrderRequest", {
        id: orderTrackingId,
        currency: course.currency,
        amount: finalPrice,
        description: `Enrollment: ${course.title}`,
        callback_url: callbackUrl,
        notification_id: ipnId,
        billing_address: {
          email_address: profile.email,
          first_name: profile.name.split(" ")[0],
          last_name: profile.name.split(" ").slice(1).join(" ") || profile.name,
        },
      });

      if (!pesapalResponse.redirect_url) {
        console.error("[PESAPAL] No redirect URL:", pesapalResponse);
        return new NextResponse("Payment provider error", { status: 502 });
      }

      return NextResponse.json({
        redirectUrl: pesapalResponse.redirect_url,
        orderTrackingId,
      });
    }

    if (paymentMethod === "sarafa") {
      const sarafaResponse = await sarafaRequest("POST", "/payments", {
        amount: finalPrice,
        currency: course.currency,
        reference: orderTrackingId,
        description: `Enrollment: ${course.title}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/sarafa`,
        return_url: callbackUrl,
        customer: {
          email: profile.email,
          name: profile.name,
        },
      });

      return NextResponse.json({
        redirectUrl: sarafaResponse.payment_url || sarafaResponse.redirect_url,
        orderTrackingId,
      });
    }

    return new NextResponse("Invalid payment method", { status: 400 });
  } catch (error: unknown) {
    const axiosErr = error as { response?: { data?: unknown; status?: number } };
    if (axiosErr.response) {
      console.error("[CHECKOUT] API Error:", axiosErr.response.status, axiosErr.response.data);
    } else {
      console.error("[CHECKOUT]", error);
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
