"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoPlayer } from "@/components/course/video-player";
import { QuizPlayer } from "@/components/course/quiz-player";
import { LessonDiscussions } from "@/components/course/lesson-discussions";
import { LessonResources } from "@/components/course/lesson-resources";
import { LessonNotes } from "@/components/course/lesson-notes";
import { CompletionCelebration } from "@/components/course/completion-celebration";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { cn } from "@/lib/utils";
import {
  X,
  CheckCircle,
  PlayCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListVideo,
  FileText,
  GraduationCap,
  Search,
  User,
  BookOpen,
  Award,
  Download,
  Loader2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface LearnPlayerProps {
  courseId: string;
  courseTitle: string;
  courseDescription?: string | null;
  instructorName?: string;
  sections: SectionItem[];
  activeLessonId: string;
  lessonTitle: string;
  lessonDescription: string | null;
  lessonContent: string | null;
  videoUrl: string | null;
  isCompleted: boolean;
  nextLessonId: string | null;
  prevLessonId: string | null;
  quiz: QuizData | null;
  profileId: string;
  attachments: { id: string; name: string; url: string }[];
  assignment: { id: string; title: string; instructions: string; maxScore: number } | null;
  progressPercent: number;
  completedCount: number;
  totalLessons: number;
  currentLessonIndex: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LearnPlayer(props: LearnPlayerProps) {
  const {
  courseId,
  courseTitle,
  instructorName = "John",
  sections,
  activeLessonId,
  lessonTitle,
  lessonDescription,
  lessonContent,
  videoUrl,
  isCompleted: initialIsCompleted,
  nextLessonId,
  prevLessonId,
  quiz,
  profileId,
  attachments,
  assignment,
  progressPercent,
  completedCount,
  totalLessons,
  currentLessonIndex,
} = props;
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"about" | "discussion" | "resources" | "notes">("about");
  const [videoOutOfView, setVideoOutOfView] = useState(false);
  const [miniPlayerDismissed, setMiniPlayerDismissed] = useState(false);
  const videoSentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detect when video scrolls out of view to show mini PiP player
  useEffect(() => {
    if (!videoUrl || !videoSentinelRef.current || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVideoOutOfView(!entry.isIntersecting);
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1,
      }
    );

    observer.observe(videoSentinelRef.current);
    return () => observer.disconnect();
  }, [videoUrl]);

  // Reset mini player dismiss when lesson changes
  useEffect(() => {
    setMiniPlayerDismissed(false);
    setVideoOutOfView(false);
  }, [activeLessonId]);

  const showMiniPlayer = videoUrl && videoOutOfView && !miniPlayerDismissed;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const section of sections) {
      if (section.lessons.some((l) => l.id === activeLessonId)) {
        initial.add(section.id);
      }
    }
    return initial;
  });

  const handleMarkComplete = useCallback(async () => {
    try {
      setIsMarkingComplete(true);
      await axios.put(`/api/courses/${courseId}/progress`, {
        lessonId: activeLessonId,
        isCompleted: !isCompleted,
      });
      const nowCompleted = !isCompleted;
      setIsCompleted(nowCompleted);
      toast.success(isCompleted ? "Marked as incomplete" : "Lesson completed!");
      // Check if this was the last lesson — trigger celebration
      if (nowCompleted) {
        const allCompleted = sections.every((s) =>
          s.lessons.every((l) =>
            l.id === activeLessonId ? true : l.isCompleted
          )
        );
        if (allCompleted) {
          setShowCelebration(true);
        }
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsMarkingComplete(false);
    }
  }, [courseId, activeLessonId, isCompleted, router]);

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

  const goToPrevLesson = useCallback(() => {
    if (prevLessonId) {
      router.push(`/student/courses/${courseId}/learn/${prevLessonId}`);
    }
  }, [courseId, prevLessonId, router]);

  function toggleSection(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  let globalLessonIndex = 0;

  const quizPassed = quiz?.attempts?.[0]?.passed ?? false;
  const hasQuiz = quiz && quiz.questions.length > 0;
  const canComplete = !hasQuiz || quizPassed;

  const tabs = [
    { id: "about" as const, label: "About" },
    { id: "discussion" as const, label: "Discussion" },
    { id: "resources" as const, label: "Resources" },
    { id: "notes" as const, label: "Notes" },
  ];

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#0A1628] text-white">
      {showCelebration && (
        <CompletionCelebration
          courseTitle={courseTitle}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {/* ─── Skillshare-style Top Header Bar ───────────────────────────── */}
      <header className="flex items-center h-[52px] px-4 md:px-6 bg-[#0A1628] border-b border-[#1A3050] flex-shrink-0 z-20">
        {/* Left: Logo */}
        <Link
          href="/student"
          className="flex items-center gap-2 mr-4 md:mr-6 flex-shrink-0"
        >
          <GraduationCap className="h-6 w-6 text-[#1D6FF2]" />
          <span className="text-sm font-bold text-white hidden sm:inline">Learn With John</span>
        </Link>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden md:flex items-center bg-[#1A3050] rounded-full px-4 py-1.5 gap-2">
          <Search className="h-4 w-4 text-white/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search courses..."
            className="bg-transparent text-sm text-white placeholder-white/40 outline-none w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                router.push(`/student/courses?q=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`);
              }
            }}
          />
        </div>

        {/* Right: Nav Items */}
        <div className="flex items-center gap-1 ml-auto">
          <Link
            href="/student/my-courses"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <BookOpen className="h-4 w-4 md:hidden" />
            <span className="hidden md:inline">My Classes</span>
          </Link>
          <NotificationBell />
          <Link
            href="/student/settings"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1D6FF2] hover:bg-[#1858D0] transition-colors ml-1"
          >
            <User className="h-4 w-4 text-white" />
          </Link>
        </div>
      </header>

      {/* ─── Main Content Area ─────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ─── Left: Video + content (scrollable) ──────────────────────── */}
        <div ref={scrollContainerRef} className="flex-1 min-w-0 overflow-y-auto">
          {/* Video Player */}
          <div ref={videoSentinelRef} className="w-full bg-black">
            {videoUrl ? (
              <VideoPlayer
                videoUrl={videoUrl}
                lessonId={activeLessonId}
                courseId={courseId}
                onComplete={handleVideoComplete}
              />
            ) : (
              <div className="w-full flex items-center justify-center h-[280px] md:h-[400px]">
                <div className="text-center text-white/30">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Text-based lesson</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar: Previous / Status / Next */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-[#0F2035] border-b border-[#1A3050]">
            <button
              onClick={goToPrevLesson}
              disabled={!prevLessonId}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                prevLessonId
                  ? "text-white/70 hover:text-white"
                  : "text-white/20 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-3">
              {canComplete && (
                <button
                  onClick={handleMarkComplete}
                  disabled={isMarkingComplete}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-all",
                    isCompleted
                      ? "text-[#12B76A]"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  <CheckCircle className={cn("h-4 w-4", isCompleted && "fill-[#12B76A]")} />
                  {isCompleted ? "Completed" : "Mark complete"}
                </button>
              )}
              <span className="text-xs text-white/40">
                {currentLessonIndex + 1} of {totalLessons}
              </span>
            </div>

            <button
              onClick={goToNextLesson}
              disabled={!nextLessonId}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                nextLessonId
                  ? "text-white/70 hover:text-white"
                  : "text-white/20 cursor-not-allowed"
              )}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Course Title + Instructor — Below video like Skillshare */}
          <div className="bg-[#0A1628]">
            <div className="px-6 pt-6 pb-4">
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">{courseTitle}</h1>
              <p className="text-base text-white/70 mt-1">{lessonTitle}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-8 h-8 rounded-full bg-[#12B76A]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#12B76A]">
                    {instructorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{instructorName}</p>
                </div>
              </div>
            </div>

            {/* Tabs Row */}
            <div className="px-6 border-b border-[#1A3050]">
              <div className="flex gap-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-5 py-3.5 text-sm font-medium border-b-2 transition-colors",
                      activeTab === tab.id
                        ? "border-white text-white"
                        : "border-transparent text-white/50 hover:text-white/80"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="px-6 py-6">
              {activeTab === "about" && (
                <div className="space-y-6 max-w-3xl">
                  {/* Certificate Banner — shown when course is 100% complete */}
                  {progressPercent >= 100 && (
                    <div className="rounded-xl border border-[#12B76A]/30 bg-gradient-to-r from-[#12B76A]/10 via-[#12B76A]/5 to-transparent p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#12B76A]/20 flex items-center justify-center flex-shrink-0">
                          <Award className="h-6 w-6 text-[#12B76A]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white mb-1">Congratulations! 🎉</h3>
                          <p className="text-sm text-white/60 mb-3">
                            You&apos;ve completed all lessons in <span className="text-white font-medium">{courseTitle}</span>. Download your certificate of completion.
                          </p>
                          {certificateId ? (
                            <a
                              href={`/api/certificates/${certificateId}/pdf`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#12B76A] hover:bg-[#0EA35E] text-black text-sm font-semibold transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              Download Certificate
                            </a>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  setCertificateLoading(true);
                                  const { data } = await axios.post("/api/certificates/generate", { courseId });
                                  setCertificateId(data.id);
                                  toast.success("Certificate generated!");
                                } catch (err: unknown) {
                                  const error = err as { response?: { data?: string } };
                                  const msg = error?.response?.data || "Failed to generate certificate";
                                  toast.error(typeof msg === "string" ? msg : "Failed to generate certificate");
                                } finally {
                                  setCertificateLoading(false);
                                }
                              }}
                              disabled={certificateLoading}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#12B76A] hover:bg-[#0EA35E] disabled:opacity-50 text-black text-sm font-semibold transition-colors"
                            >
                              {certificateLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Award className="h-4 w-4" />
                              )}
                              Get Certificate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {lessonDescription && (
                    <p className="text-sm text-white/60 leading-relaxed">{lessonDescription}</p>
                  )}

                  {lessonContent && (
                    <div
                      className="prose prose-sm prose-invert max-w-none
                        prose-headings:text-white prose-headings:font-bold
                        prose-p:text-white/70 prose-p:leading-relaxed
                        prose-a:text-[#12B76A] prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white
                        prose-li:text-white/70
                        prose-code:text-[#12B76A] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
                      dangerouslySetInnerHTML={{ __html: lessonContent }}
                    />
                  )}

                  {!lessonContent && !lessonDescription && !hasQuiz && (
                    <div className="text-center py-16">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 text-white/20" />
                      <p className="text-sm text-white/40">No additional content for this lesson.</p>
                      <p className="text-xs text-white/25 mt-2">Watch the video and mark as complete when you&apos;re done.</p>
                    </div>
                  )}

                  {hasQuiz && (
                    <div className="mt-8">
                      <QuizPlayer
                        quiz={quiz}
                        courseId={courseId}
                        lessonId={activeLessonId}
                        profileId={profileId}
                        onPass={() => router.refresh()}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "discussion" && (
                <LessonDiscussions
                  courseId={courseId}
                  lessonId={activeLessonId}
                  profileId={profileId}
                />
              )}

              {activeTab === "resources" && (
                <LessonResources
                  courseId={courseId}
                  lessonId={activeLessonId}
                  profileId={profileId}
                  attachments={attachments}
                  assignment={assignment}
                />
              )}

              {activeTab === "notes" && (
                <LessonNotes
                  courseId={courseId}
                  lessonId={activeLessonId}
                />
              )}
            </div>
          </div>
        </div>

        {/* ─── Right Sidebar: Lesson List (Skillshare style) ───────────── */}
        {sidebarOpen && (
          <aside className="hidden md:flex flex-shrink-0 w-[340px] flex-col bg-[#0F2035] border-l border-[#1A3050]">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A3050] flex-shrink-0">
              <div className="flex items-center gap-2">
                <ListVideo className="h-4 w-4 text-white/60" />
                <span className="text-sm font-bold text-white">
                  {totalLessons} Lessons
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-4 py-2.5 border-b border-[#1A3050] flex-shrink-0">
              <div className="flex items-center gap-3">
                <Progress
                  value={progressPercent}
                  className="flex-1 h-1.5 bg-white/10 [&>div]:bg-[#12B76A]"
                />
                <span className="text-xs text-white/50 font-medium">{progressPercent}%</span>
              </div>
            </div>

            {/* Flat lesson list — Skillshare style */}
            <ScrollArea className="flex-1">
              {sections.map((section) => {
                const sectionCompleted = section.lessons.filter((l) => l.isCompleted).length;
                const sectionStartIndex = globalLessonIndex;
                globalLessonIndex += section.lessons.length;

                return (
                  <div key={section.id}>
                    {/* Section header (collapsible) */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-[#1A3050]/40 border-b border-[#1A3050] hover:bg-[#1A3050]/70 transition-colors text-left"
                    >
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-white/40 transition-transform flex-shrink-0",
                          !expandedSections.has(section.id) && "-rotate-90"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{section.title}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {sectionCompleted}/{section.lessons.length} completed
                        </p>
                      </div>
                    </button>

                    {/* Lessons */}
                    {expandedSections.has(section.id) &&
                      section.lessons.map((lesson, lessonIdx) => {
                        const isActive = lesson.id === activeLessonId;
                        const lessonNum = sectionStartIndex + lessonIdx + 1;

                        return (
                          <Link
                            key={lesson.id}
                            href={`/student/courses/${courseId}/learn/${lesson.id}`}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 border-b border-[#1A3050]/40 transition-colors group",
                              isActive
                                ? "bg-[#1D6FF2]/10 border-l-2 border-l-[#1D6FF2]"
                                : "hover:bg-white/[0.04]"
                            )}
                          >
                            {/* Lesson number / status icon */}
                            <div className="flex-shrink-0 w-6 flex justify-center">
                              {isActive ? (
                                <PlayCircle className="h-5 w-5 text-[#1D6FF2]" />
                              ) : lesson.isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-[#12B76A]" />
                              ) : (
                                <span className="text-xs font-medium text-white/30">
                                  {lessonNum}.
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <p
                              className={cn(
                                "flex-1 text-sm leading-snug",
                                isActive
                                  ? "font-semibold text-white"
                                  : lesson.isCompleted
                                    ? "text-white/40"
                                    : "text-white/70 group-hover:text-white/90"
                              )}
                            >
                              {lesson.title}
                            </p>
                          </Link>
                        );
                      })}
                  </div>
                );
              })}

              {/* Complete a class badge — like Skillshare */}
              {progressPercent < 100 && (
                <div className="m-4 p-4 rounded-xl border border-[#1A3050] bg-[#1A3050]/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#12B76A]/15 flex items-center justify-center flex-shrink-0">
                      <Award className="h-5 w-5 text-[#12B76A]" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">
                        Earn a <span className="font-bold text-white">Certificate</span> by completing all lessons.
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {completedCount} of {totalLessons} completed
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </aside>
        )}

        {/* Sidebar Toggle (when collapsed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden md:flex items-center justify-center w-10 bg-[#0F2035] border-l border-[#1A3050] text-white/40 hover:text-white hover:bg-[#1A3050] transition-colors flex-shrink-0"
          >
            <ListVideo className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ─── Floating Mini Player (PiP) ──────────────────────────────────── */}
      {showMiniPlayer && (
        <div
          className="fixed bottom-4 right-4 z-50 w-[320px] rounded-lg overflow-hidden shadow-2xl shadow-black/60 border border-[#1A3050] bg-black"
          style={{ animation: "miniPlayerIn 0.3s ease-out" }}
        >
          <div className="relative">
            <VideoPlayer
              videoUrl={videoUrl}
              lessonId={activeLessonId}
              courseId={courseId}
              onComplete={handleVideoComplete}
            />
            <button
              onClick={() => setMiniPlayerDismissed(true)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/90 transition-colors z-10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-2">
              <p className="text-[11px] text-white/90 font-medium truncate">{lessonTitle}</p>
              <p className="text-[9px] text-white/50">{currentLessonIndex + 1} of {totalLessons}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
