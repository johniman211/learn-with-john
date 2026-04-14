"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CoursePublishButtonProps {
  courseId: string;
  isPublished: boolean;
}

export function CoursePublishButton({
  courseId,
  isPublished,
}: CoursePublishButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onClick() {
    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.delete(`/api/courses/${courseId}/publish`);
        toast.success("Course unpublished");
      } else {
        await axios.patch(`/api/courses/${courseId}/publish`);
        toast.success("Course published");
      }
      router.refresh();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      variant={isPublished ? "outline" : "default"}
      size="sm"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isPublished ? "Unpublish" : "Publish"}
    </Button>
  );
}
