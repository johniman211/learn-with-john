import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { LearnPlayer } from "@/components/course/learn-player";

interface LearnPageProps {
  params: { courseId: string; lessonId: string };
}

export default async function LearnPage({ params }: LearnPageProps) {
  const profile = await getProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      profile: { select: { name: true } },
      sections: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            include: {
              muxData: true,
              progress: {
                where: { profileId: profile.id },
              },
              quizzes: {
                include: {
                  questions: {
                    orderBy: { position: "asc" },
                  },
                },
              },
              attachments: {
                select: { id: true, name: true, url: true },
              },
              assignments: {
                select: { id: true, title: true, instructions: true, maxScore: true },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return redirect("/student/courses");
  }

  type LessonRow = {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    videoUrl: string | null;
    isFree: boolean;
    muxData: { playbackId: string | null } | null;
    progress: { isCompleted: boolean }[];
    quizzes: {
      id: string;
      title: string;
      passMark: number;
      questions: { id: string; question: string; options: string[]; correctAnswer: number; position: number }[];
    }[];
    attachments: { id: string; name: string; url: string }[];
    assignments: { id: string; title: string; instructions: string; maxScore: number }[];
  };

  const allFlatLessons = course.sections.flatMap(
    (s: { lessons: unknown[] }) => s.lessons
  ) as LessonRow[];

  const lesson = allFlatLessons.find((l) => l.id === params.lessonId);

  if (!lesson) {
    const firstLesson = allFlatLessons[0];
    if (firstLesson) {
      return redirect(`/student/courses/${course.id}/learn/${firstLesson.id}`);
    }
    return redirect("/student/courses");
  }

  // Fetch quiz attempts separately
  let quizWithAttempts = null;
  const quizData = lesson.quizzes?.[0];
  if (quizData) {
    const attempts = await db.quizAttempt.findMany({
      where: { quizId: quizData.id, profileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    quizWithAttempts = {
      ...quizData,
      attempts: attempts.map((a: { score: number; passed: boolean }) => ({
        score: a.score,
        passed: a.passed,
      })),
    };
  }

  const isCompleted = lesson.progress?.[0]?.isCompleted || false;

  const allLessonIds = allFlatLessons.map((l) => l.id);
  const currentIndex = allLessonIds.indexOf(params.lessonId);
  const nextLessonId = currentIndex < allLessonIds.length - 1 ? allLessonIds[currentIndex + 1] : null;
  const prevLessonId = currentIndex > 0 ? allLessonIds[currentIndex - 1] : null;

  const completedCount = allFlatLessons.filter(
    (l) => l.progress?.[0]?.isCompleted
  ).length;
  const totalLessons = allLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const sections = course.sections.map((section: {
    id: string;
    title: string;
    lessons: { id: string; title: string; isFree: boolean; progress: { isCompleted: boolean }[] }[];
  }) => ({
    id: section.id,
    title: section.title,
    lessons: section.lessons.map((l: { id: string; title: string; isFree: boolean; progress: { isCompleted: boolean }[] }) => ({
      id: l.id,
      title: l.title,
      isFree: l.isFree,
      isCompleted: l.progress?.[0]?.isCompleted || false,
    })),
  }));

  return (
    <LearnPlayer
      courseId={course.id}
      courseTitle={course.title}
      courseDescription={course.description}
      instructorName={(course as unknown as { profile?: { name?: string } }).profile?.name || "Instructor"}
      sections={sections}
      activeLessonId={params.lessonId}
      lessonTitle={lesson.title}
      lessonDescription={lesson.description}
      lessonContent={lesson.content}
      videoUrl={lesson.videoUrl || null}
      isCompleted={isCompleted}
      nextLessonId={nextLessonId}
      prevLessonId={prevLessonId}
      quiz={quizWithAttempts}
      profileId={profile.id}
      attachments={lesson.attachments || []}
      assignment={lesson.assignments?.[0] || null}
      progressPercent={progressPercent}
      completedCount={completedCount}
      totalLessons={totalLessons}
      currentLessonIndex={currentIndex}
    />
  );
}
