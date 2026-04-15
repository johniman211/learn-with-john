export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { decryptCredentials } from "@/lib/encryption";
import { initiatePayment } from "@/lib/gateways";
import { generateOrderId } from "@/lib/payment-utils";

// POST create order with selected gateway
export async function POST(req: Request) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, gatewayCode, couponCode, phoneNumber } = await req.json();

    if (!courseId || !gatewayCode) {
      return NextResponse.json({ error: "Course and gateway are required" }, { status: 400 });
    }

    const course = await db.course.findUnique({
      where: { id: courseId, isPublished: true },
    });

    if (!course || !course.price) {
      return NextResponse.json({ error: "Course not found or is free" }, { status: 404 });
    }

    // Check existing enrollment
    const existing = await db.purchase.findUnique({
      where: { profileId_courseId: { profileId: profile.id, courseId } },
    });

    if (existing?.status === "COMPLETED") {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
    }

    // Get gateway
    const gateway = await db.paymentGateway.findUnique({
      where: { code: gatewayCode },
    });

    if (!gateway || !gateway.isActive) {
      return NextResponse.json({ error: "Payment method not available" }, { status: 400 });
    }

    // Apply coupon
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
      return NextResponse.json({ error: "Use free enrollment" }, { status: 400 });
    }

    const orderId = generateOrderId();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create/update purchase
    await db.purchase.upsert({
      where: { profileId_courseId: { profileId: profile.id, courseId } },
      create: {
        profileId: profile.id,
        courseId,
        amount: finalPrice,
        currency: course.currency,
        status: "PENDING",
        paymentMethod: gatewayCode,
        gatewayCode,
        orderTrackingId: orderId,
      },
      update: {
        amount: finalPrice,
        status: "PENDING",
        paymentMethod: gatewayCode,
        gatewayCode,
        orderTrackingId: orderId,
      },
    });

    // Log transaction
    await db.paymentTransaction.create({
      data: {
        orderId,
        gatewayCode,
        amount: finalPrice,
        currency: course.currency,
        status: "pending",
      },
    });

    // Decrypt gateway credentials
    let credentials: Record<string, string> = {};
    if (gateway.credentials) {
      try {
        credentials = decryptCredentials(gateway.credentials);
      } catch (decryptErr) {
        console.error("[PAYMENT_CHECKOUT] Failed to decrypt credentials for", gatewayCode, decryptErr);
        return NextResponse.json({ error: "Payment gateway configuration error" }, { status: 500 });
      }
    }

    if (!credentials || Object.keys(credentials).length === 0) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 400 });
    }

    // Process payment
    const result = await initiatePayment({
      gatewayCode,
      credentials,
      environment: gateway.environment,
      orderId,
      amount: finalPrice,
      currency: course.currency,
      courseName: course.title,
      courseId: course.id,
      studentName: profile.name,
      studentEmail: profile.email,
      studentPhone: phoneNumber,
      callbackUrl: `${appUrl}/student/courses/${courseId}`,
      webhookUrl: appUrl,
      appUrl,
    });

    if (!result.success) {
      console.error("[PAYMENT_CHECKOUT] Gateway error:", gatewayCode, result.error, result.gatewayResponse);
      return NextResponse.json(
        { error: result.error || "Payment initiation failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      orderId,
      ...result,
    });
  } catch (error) {
    console.error("[PAYMENT_CHECKOUT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
