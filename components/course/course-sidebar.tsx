"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  Lock,
  PlayCircle,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

interface LessonItem {
  id: string;
  title: string;
  isFree: boolean;
  isCompleted: boolean;
}

interface SectionItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

interface CourseSidebarProps {
  courseId: string;
  courseTitle: string;
  sections: SectionItem[];
  activeLessonId: string;
  isEnrolled: boolean;
  progressPercent: number;
}

export function CourseSidebar({
  courseId,
  courseTitle,
  sections,
  activeLessonId,
  isEnrolled,
  progressPercent,
}: CourseSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => {
      const initial = new Set<string>();
      for (const section of sections) {
        if (section.lessons.some((l) => l.id === activeLessonId)) {
          initial.add(section.id);
        }
      }
      return initial;
    }
  );

  function toggleSection(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  return (
    <div className="hidden md:flex md:w-80 md:flex-col border-r bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm line-clamp-2">{courseTitle}</h2>
        {isEnrolled && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {sections.reduce((acc, s) => acc + s.lessons.filter(l => l.isCompleted).length, 0)}/{sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons
              </span>
              <span className="font-medium text-foreground">{progressPercent}%</span>
            </div>
            <Progress
              value={progressPercent}
              className={`h-2 ${progressPercent === 100 ? "[&>div]:bg-[#12B76A]" : "[&>div]:bg-[#1D6FF2]"}`}
            />
          </div>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sections.map((section) => (
            <div key={section.id} className="mb-1">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    !expandedSections.has(section.id) && "-rotate-90"
                  )}
                />
                <span className="truncate">{section.title}</span>
              </button>
              {expandedSections.has(section.id) && (
                <div className="space-y-0.5 ml-1">
                  {section.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLessonId;
                    const isLocked = !lesson.isFree && !isEnrolled;

                    return (
                      <Link
                        key={lesson.id}
                        href={
                          isLocked
                            ? "#"
                            : `/student/courses/${courseId}/learn/${lesson.id}`
                        }
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          isLocked && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        {lesson.isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-[#12B76A] flex-shrink-0" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <PlayCircle className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
