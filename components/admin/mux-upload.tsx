"use client";

import { useState, useCallback } from "react";
import * as UpChunk from "@mux/upchunk";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createMuxUploadUrl } from "@/lib/mux-actions";
import { Upload, Loader2, CheckCircle, XCircle } from "lucide-react";

interface MuxUploadProps {
  courseId: string;
  sectionId: string;
  lessonId: string;
}

type UploadStatus = "idle" | "uploading" | "processing" | "complete" | "error";

export function MuxUpload({ courseId, sectionId, lessonId }: MuxUploadProps) {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        setStatus("uploading");
        setProgress(0);
        setErrorMessage(null);

        const { uploadUrl, uploadId } = await createMuxUploadUrl();

        const upload = UpChunk.createUpload({
          endpoint: uploadUrl,
          file,
          chunkSize: 5120,
        });

        upload.on("error", (err: { detail: string }) => {
          setStatus("error");
          setErrorMessage(err.detail || "Upload failed");
          toast.error("Upload failed");
        });

        upload.on("progress", (prog: { detail: number }) => {
          setProgress(Math.round(prog.detail));
        });

        upload.on("success", async () => {
          setStatus("processing");

          await axios.patch(
            `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
            { muxUploadId: uploadId }
          );

          toast.success("Video uploaded — processing will complete shortly");
          setStatus("complete");
          router.refresh();
        });
      } catch {
        setStatus("error");
        setErrorMessage("Failed to start upload");
        toast.error("Failed to start upload");
      }
    },
    [courseId, sectionId, lessonId, router]
  );

  return (
    <div className="space-y-3">
      {status === "idle" && (
        <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 transition-colors">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm font-medium">Click to upload video</span>
          <span className="text-xs text-muted-foreground mt-1">
            MP4, MOV, WebM supported
          </span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </label>
      )}

      {status === "uploading" && (
        <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Uploading... {progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {status === "processing" && (
        <div className="flex items-center gap-2 p-4 rounded-lg border bg-amber-500/10">
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          <span className="text-sm font-medium text-amber-600">
            Processing video... This may take a few minutes.
          </span>
        </div>
      )}

      {status === "complete" && (
        <div className="flex items-center gap-2 p-4 rounded-lg border bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-[#12B76A]" />
          <span className="text-sm font-medium text-green-600">
            Video uploaded successfully!
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setStatus("idle")}
          >
            Upload another
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 p-4 rounded-lg border bg-destructive/10">
          <XCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            {errorMessage || "Upload failed"}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setStatus("idle")}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
