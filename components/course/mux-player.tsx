"use client";

import { useState, useCallback } from "react";
import MuxPlayer from "@mux/mux-player-react";
import axios from "axios";
import toast from "react-hot-toast";

import { Loader2, Lock } from "lucide-react";

interface MuxPlayerComponentProps {
  playbackId: string;
  lessonId: string;
  courseId: string;
  isLocked: boolean;
  onComplete?: () => void;
}

export function MuxPlayerComponent({
  playbackId,
  lessonId,
  courseId,
  isLocked,
  onComplete,
}: MuxPlayerComponentProps) {
  const [isReady, setIsReady] = useState(false);

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

  if (isLocked) {
    return (
      <div className="relative aspect-video flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center text-white">
          <Lock className="h-8 w-8 mx-auto mb-2 opacity-75" />
          <p className="text-sm font-medium">This lesson is locked</p>
          <p className="text-xs opacity-75 mt-1">Enroll in the course to access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      <MuxPlayer
        playbackId={playbackId}
        autoPlay={false}
        onCanPlay={() => setIsReady(true)}
        onEnded={handleEnded}
        accentColor="#1D6FF2"
        style={{ width: "100%", height: "100%" }}
        streamType="on-demand"
      />
    </div>
  );
}
