import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { CourseEditForm } from "@/components/admin/course-edit-form";
import { SectionManager } from "@/components/admin/section-manager";
import { CoursePublishButton } from "@/components/admin/course-publish-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CourseDeleteButton } from "@/components/admin/course-delete-button";

interface CourseEditorPageProps {
  params: { courseId: string };
}

export default async function CourseEditorPage({ params }: CourseEditorPageProps) {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      profileId: profile.id,
    },
    include: {
      category: true,
      sections: {
        include: {
          lessons: {
            include: {
              attachments: true,
              muxData: true,
            },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    return redirect("/admin/courses");
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-x-2">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to courses
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-x-2">
          <CoursePublishButton
            courseId={course.id}
            isPublished={course.isPublished}
          />
          <CourseDeleteButton courseId={course.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CourseEditForm
            courseId={course.id}
            initialData={{
              title: course.title,
              description: course.description || "",
              imageUrl: course.imageUrl || "",
              previewVideoUrl: course.previewVideoUrl || "",
              price: course.price || 0,
              currency: course.currency,
              categoryId: course.categoryId || "",
            }}
            categories={categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </div>
        <div>
          <SectionManager
            courseId={course.id}
            sections={course.sections.map((section) => ({
              id: section.id,
              title: section.title,
              position: section.position,
              lessons: section.lessons.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                position: lesson.position,
                isPublished: lesson.isPublished,
                isFree: lesson.isFree,
              })),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
