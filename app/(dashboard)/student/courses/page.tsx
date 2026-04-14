import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { CourseCatalogFilter } from "@/components/course/course-catalog-filter";

export default async function StudentCoursesPage() {
  const profile = await getProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: {
      category: true,
      sections: {
        include: {
          lessons: {
            where: { isPublished: true },
            select: { id: true },
          },
        },
      },
      purchases: {
        where: { profileId: profile.id, status: "COMPLETED" },
        select: { id: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  const courseItems = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    imageUrl: course.imageUrl,
    category: course.category ? { id: course.category.id, name: course.category.name } : null,
    totalLessons: course.sections.reduce(
      (acc: number, s: { lessons: { id: string }[] }) => acc + s.lessons.length,
      0
    ),
    isEnrolled: course.purchases.length > 0,
    avgRating: course.reviews.length > 0
      ? course.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / course.reviews.length
      : null,
    reviewCount: course.reviews.length,
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Browse Courses</h1>
        <p className="text-sm text-muted-foreground">
          Explore our catalog and start learning
        </p>
      </div>

      <CourseCatalogFilter
        courses={courseItems}
        categories={categories}
        linkPrefix="/student/courses"
        variant="light"
      />
    </div>
  );
}
