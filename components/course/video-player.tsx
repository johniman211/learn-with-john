"use client";

import { useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface VideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  courseId: string;
  onComplete?: () => void;
}

function getEmbedInfo(url: string): { type: "iframe" | "video"; src: string } {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch) return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}` };

  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };

  // Mux stream
  const muxMatch = url.match(/stream\.mux\.com\/([a-zA-Z0-9]+)/);
  if (muxMatch) return { type: "iframe", src: `https://stream.mux.com/${muxMatch[1]}` };

  // Direct video (S3, CloudFront, .mp4, etc.)
  return { type: "video", src: url };
}

export function VideoPlayer({
  videoUrl,
  lessonId,
  courseId,
  onComplete,
}: VideoPlayerProps) {
  const handleEnded = useCallback(async () => {
    try {
      await axios.put(`/api/courses/${courseId}/progress`, {
        lessonId,
        isCompleted: true,
      });
      onComplete?.();
      toast.success("Lesson completed!");
    } catch {
      toast.error("Failed to mark as complete");
    }
  }, [courseId, lessonId, onComplete]);

  const embed = getEmbedInfo(videoUrl);

  return (
    <div className="relative aspect-video overflow-hidden bg-black">
      {embed.type === "iframe" ? (
        <iframe
          src={embed.src}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      ) : (
        <video
          src={embed.src}
          controls
          className="w-full h-full"
          onEnded={handleEnded}
        />
      )}
    </div>
  );
}
