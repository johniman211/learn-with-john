export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headersList = headers();
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;

    if (webhookSecret) {
      const signature = headersList.get("mux-signature");
      if (!signature) {
        return new NextResponse("Missing signature", { status: 401 });
      }
    }

    const { type, data } = body;

    if (type === "video.asset.ready") {
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id;
      const uploadId = data.upload_id;

      if (!playbackId) {
        return new NextResponse("No playback ID", { status: 200 });
      }

      const existingMuxData = await db.muxData.findFirst({
        where: { assetId },
      });

      if (existingMuxData) {
        await db.muxData.update({
          where: { id: existingMuxData.id },
          data: { playbackId },
        });
      } else if (uploadId) {
        const lesson = await db.lesson.findFirst({
          where: {
            videoUrl: uploadId,
          },
        });

        if (!lesson) {
          const lessonByMuxUploadId = await db.lesson.findFirst({
            where: {
              content: { contains: uploadId },
            },
          });

          if (lessonByMuxUploadId) {
            await db.muxData.create({
              data: {
                assetId,
                playbackId,
                lessonId: lessonByMuxUploadId.id,
              },
            });

            await db.lesson.update({
              where: { id: lessonByMuxUploadId.id },
              data: { videoUrl: `https://stream.mux.com/${playbackId}.m3u8` },
            });
          }
        } else {
          await db.muxData.upsert({
            where: { lessonId: lesson.id },
            create: {
              assetId,
              playbackId,
              lessonId: lesson.id,
            },
            update: {
              assetId,
              playbackId,
            },
          });

          await db.lesson.update({
            where: { id: lesson.id },
            data: { videoUrl: `https://stream.mux.com/${playbackId}.m3u8` },
          });
        }
      }
    }

    if (type === "video.asset.deleted") {
      const assetId = data.id;

      const existingMuxData = await db.muxData.findFirst({
        where: { assetId },
      });

      if (existingMuxData) {
        await db.muxData.delete({
          where: { id: existingMuxData.id },
        });
      }
    }

    if (type === "video.upload.asset_created") {
      const assetId = data.asset_id;
      const uploadId = data.id;

      const lesson = await db.lesson.findFirst({
        where: { videoUrl: uploadId },
      });

      if (lesson) {
        await db.muxData.upsert({
          where: { lessonId: lesson.id },
          create: {
            assetId,
            lessonId: lesson.id,
          },
          update: {
            assetId,
          },
        });
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[MUX_WEBHOOK]", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
