"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  courseId: string;
  existingReview?: {
    rating: number;
    comment: string | null;
  } | null;
}

export function ReviewForm({ courseId, existingReview }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`/api/courses/${courseId}/reviews`, {
        rating,
        comment,
      });
      toast.success(existingReview ? "Review updated!" : "Review submitted!");
      router.refresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const msg = error?.response?.data?.error || "Failed to submit review";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {existingReview ? "Update Your Review" : "Leave a Review"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Your rating</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    value <= (hoveredRating || rating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {rating}/5
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Your review (optional)
          </p>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this course..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || rating === 0}
          className="bg-[#1D6FF2] hover:bg-[#1858D0] text-white"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existingReview ? "Update Review" : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  );
}
