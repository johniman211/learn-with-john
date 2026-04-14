import { db } from "@/lib/db";
import { Header1 } from "@/components/ui/header-1";
import { CourseCatalogFilter } from "@/components/course/course-catalog-filter";

export const dynamic = "force-dynamic";

export default async function PublicCourseCatalogPage() {
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
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[#0A1628] text-white">
      <Header1 />

      <main className="flex-1">
        <section className="py-16 md:py-20">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold">
                Course <span className="text-[#1D6FF2]">Catalog</span>
              </h1>
              <p className="mt-3 text-white/60 text-lg">
                Explore our courses and start building real digital skills today
              </p>
            </div>

            <CourseCatalogFilter
              courses={courseItems}
              categories={categories}
              linkPrefix="/sign-up"
              variant="dark"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="container text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} Learn With John. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
