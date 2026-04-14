"use server";

import { mux } from "@/lib/mux";

export async function createMuxUploadUrl() {
  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "baseline",
    },
  });

  return {
    uploadUrl: upload.url,
    uploadId: upload.id,
  };
}

export async function getMuxAssetFromUpload(uploadId: string) {
  const upload = await mux.video.uploads.retrieve(uploadId);
  return upload;
}
