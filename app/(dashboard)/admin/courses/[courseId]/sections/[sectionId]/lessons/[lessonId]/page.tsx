import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { LessonEditForm } from "@/components/admin/lesson-edit-form";
import { LessonAttachments } from "@/components/admin/lesson-attachments";
import { MuxUpload } from "@/components/admin/mux-upload";
import { QuizBuilder } from "@/components/admin/quiz-builder";
import { AssignmentBuilder } from "@/components/admin/assignment-builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Video } from "lucide-react";

interface LessonEditorPageProps {
  params: {
    courseId: string;
    sectionId: string;
    lessonId: string;
  };
}

export default async function LessonEditorPage({ params }: LessonEditorPageProps) {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: { id: params.courseId, profileId: profile.id },
  });

  if (!course) {
    return redirect("/admin/courses");
  }

  const lesson = await db.lesson.findUnique({
    where: {
      id: params.lessonId,
      sectionId: params.sectionId,
    },
    include: {
      attachments: {
        orderBy: { createdAt: "desc" },
      },
      muxData: true,
    },
  });

  if (!lesson) {
    return redirect(`/admin/courses/${params.courseId}`);
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-x-2 mb-6">
        <Link href={`/admin/courses/${params.courseId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <LessonEditForm
            courseId={params.courseId}
            sectionId={params.sectionId}
            lessonId={params.lessonId}
            initialData={{
              title: lesson.title,
              description: lesson.description || "",
              content: lesson.content || "",
              videoUrl: lesson.videoUrl || "",
              isPublished: lesson.isPublished,
              isFree: lesson.isFree,
            }}
          />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lesson.muxData?.playbackId ? (
                <div className="space-y-3">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={`https://stream.mux.com/${lesson.muxData.playbackId}.m3u8`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Playback ID: {lesson.muxData.playbackId}
                  </p>
                </div>
              ) : (
                <MuxUpload
                  courseId={params.courseId}
                  sectionId={params.sectionId}
                  lessonId={params.lessonId}
                />
              )}
            </CardContent>
          </Card>
          <LessonAttachments
            courseId={params.courseId}
            sectionId={params.sectionId}
            lessonId={params.lessonId}
            attachments={lesson.attachments.map((a: { id: string; name: string; url: string }) => ({
              id: a.id,
              name: a.name,
              url: a.url,
            }))}
          />
          <QuizBuilder
            courseId={params.courseId}
            sectionId={params.sectionId}
            lessonId={params.lessonId}
          />
          <AssignmentBuilder
            courseId={params.courseId}
            sectionId={params.sectionId}
            lessonId={params.lessonId}
          />
        </div>
      </div>
    </div>
  );
}
