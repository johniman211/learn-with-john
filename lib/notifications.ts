import { db } from "@/lib/db";

export async function createNotification({
  profileId,
  title,
  message,
  link,
}: {
  profileId: string;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await db.notification.create({
      data: {
        profileId,
        title,
        message,
        link: link || null,
      },
    });
  } catch (error) {
    console.error("[CREATE_NOTIFICATION]", error);
  }
}
