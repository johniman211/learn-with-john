"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VideoPlayer } from "@/components/course/video-player";
import { QuizPlayer } from "@/components/course/quiz-player";
import { CheckCircle, ChevronRight, Lock } from "lucide-react";

interface QuizData {
  id: string;
  title: string;
  passMark: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    position: number;
  }[];
  attempts: { score: number; passed: boolean }[];
}

interface LessonContentProps {
  courseId: string;
  lessonId: string;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  isLocked: boolean;
  isCompleted: boolean;
  nextLessonId: string | null;
  quiz: QuizData | null;
  profileId: string;
}

export function LessonContent({
  courseId,
  lessonId,
  title,
  description,
  content,
  videoUrl,
  isLocked,
  isCompleted: initialIsCompleted,
  nextLessonId,
  quiz,
  profileId,
}: LessonContentProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const handleMarkComplete = useCallback(async () => {
    try {
      setIsMarkingComplete(true);
      await axios.put(`/api/courses/${courseId}/progress`, {
        lessonId,
        isCompleted: !isCompleted,
      });
      setIsCompleted(!isCompleted);
      toast.success(isCompleted ? "Marked as incomplete" : "Lesson completed!");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsMarkingComplete(false);
    }
  }, [courseId, lessonId, isCompleted, router]);

  const handleVideoComplete = useCallback(() => {
    if (!isCompleted) {
      setIsCompleted(true);
      router.refresh();
    }
  }, [isCompleted, router]);

  const goToNextLesson = useCallback(() => {
    if (nextLessonId) {
      router.push(`/student/courses/${courseId}/learn/${nextLessonId}`);
    }
  }, [courseId, nextLessonId, router]);

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Lesson Locked</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Enroll in this course to access this lesson and all other premium content.
        </p>
        <Button onClick={() => router.push(`/student/courses/${courseId}`)}>
          View Course Details
        </Button>
      </div>
    );
  }

  const quizPassed = quiz?.attempts?.[0]?.passed ?? false;
  const hasQuiz = quiz && quiz.questions.length > 0;
  const canComplete = !hasQuiz || quizPassed;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {videoUrl && (
        <div className="mb-6">
          <VideoPlayer
            videoUrl={videoUrl}
            lessonId={lessonId}
            courseId={courseId}
            onComplete={handleVideoComplete}
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canComplete && (
            <Button
              onClick={handleMarkComplete}
              disabled={isMarkingComplete}
              variant={isCompleted ? "outline" : "default"}
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {isCompleted ? "Completed" : "Mark Complete"}
            </Button>
          )}
          {nextLessonId && (
            <Button onClick={goToNextLesson} variant="ghost" size="sm">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      {content && (
        <div
          className="prose prose-sm dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {hasQuiz && (
        <>
          <Separator className="my-6" />
          <QuizPlayer
            quiz={quiz}
            courseId={courseId}
            lessonId={lessonId}
            profileId={profileId}
            onPass={() => {
              router.refresh();
            }}
          />
        </>
      )}
    </div>
  );
}
