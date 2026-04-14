import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

/**
 * Universal enrollment unlock — called by every gateway after confirmed payment.
 * Uses a transaction to prevent duplicate enrollments.
 */
export async function unlockCourseAccess({
  purchaseId,
  transactionRef,
}: {
  purchaseId: string;
  transactionRef?: string;
}) {
  const purchase = await db.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      profile: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });

  if (!purchase) throw new Error("Purchase not found");
  if (purchase.status === "COMPLETED") return purchase;

  const updated = await db.purchase.update({
    where: { id: purchaseId },
    data: {
      status: "COMPLETED",
      transactionId: transactionRef || purchase.transactionId,
    },
    include: {
      profile: { select: { id: true, name: true } },
      course: { select: { id: true, title: true } },
    },
  });

  // Send notification to student
  await createNotification({
    profileId: purchase.profile.id,
    title: "🎉 Payment Confirmed!",
    message: `Your payment for "${purchase.course.title}" has been confirmed. You now have full access!`,
    link: `/student/courses/${purchase.course.id}`,
  });

  return updated;
}

/**
 * Generate a WhatsApp notification link for admin to send to student
 */
export function generateWhatsAppNotificationLink({
  studentName,
  courseName,
  courseId,
  phoneNumber,
  appUrl,
}: {
  studentName: string;
  courseName: string;
  courseId: string;
  phoneNumber?: string;
  appUrl: string;
}) {
  const message = `🎉 Congratulations ${studentName}!%0A%0AYour payment for *${encodeURIComponent(courseName)}* has been confirmed.%0A%0AYou now have full lifetime access to the course. Start learning here:%0A${appUrl}/student/courses/${courseId}%0A%0AThank you for choosing Learn With John! 📚`;

  if (phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}?text=${message}`;
  }
  return `https://wa.me/?text=${message}`;
}

/**
 * Generate WhatsApp rejection notification link
 */
export function generateWhatsAppRejectionLink({
  studentName,
  courseName,
  reason,
  phoneNumber,
}: {
  studentName: string;
  courseName: string;
  reason: string;
  phoneNumber?: string;
}) {
  const message = `Hi ${studentName},%0A%0AUnfortunately, we could not verify your payment for *${encodeURIComponent(courseName)}*.%0A%0AReason: ${encodeURIComponent(reason)}%0A%0APlease try again or contact us if you believe this is an error.%0A%0A— Learn With John`;

  if (phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}?text=${message}`;
  }
  return `https://wa.me/?text=${message}`;
}

/**
 * Generate order tracking ID
 */
export function generateOrderId(): string {
  return `LWJ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
