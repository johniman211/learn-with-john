"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  courseId: string;
  variant?: "icon" | "full";
}

export function BookmarkButton({ courseId, variant = "icon" }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/courses/${courseId}/bookmark`)
      .then(({ data }) => setIsBookmarked(data.isBookmarked))
      .catch(() => {});
  }, [courseId]);

  const toggle = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(`/api/courses/${courseId}/bookmark`);
      setIsBookmarked(data.isBookmarked);
      toast.success(data.isBookmarked ? "Saved to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "full") {
    return (
      <button
        onClick={toggle}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
          isBookmarked
            ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Heart
          className={cn("h-4 w-4", isBookmarked && "fill-red-500")}
        />
        {isBookmarked ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className="p-2 rounded-full hover:bg-muted transition-colors"
      title={isBookmarked ? "Remove from wishlist" : "Save to wishlist"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          isBookmarked ? "text-red-500 fill-red-500" : "text-muted-foreground"
        )}
      />
    </button>
  );
}
