import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/");
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { courses: true } },
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Manage course categories
        </p>
      </div>
      <CategoryManager
        initialCategories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          courseCount: c._count.courses,
        }))}
      />
    </div>
  );
}
