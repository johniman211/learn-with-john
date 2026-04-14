"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed";

interface TrackViewProps {
  courseId: string;
  courseTitle: string;
  courseImageUrl: string | null;
}

export function TrackView({ courseId, courseTitle, courseImageUrl }: TrackViewProps) {
  useEffect(() => {
    addRecentlyViewed({ id: courseId, title: courseTitle, imageUrl: courseImageUrl });
  }, [courseId, courseTitle, courseImageUrl]);

  return null;
}
