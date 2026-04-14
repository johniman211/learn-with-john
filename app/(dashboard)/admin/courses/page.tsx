import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { CreateCourseDialog } from "@/components/admin/create-course-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Pencil } from "lucide-react";

export default async function AdminCoursesPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/");
  }

  const courses = await db.course.findMany({
    where: { profileId: profile.id },
    include: {
      category: true,
      sections: {
        include: { lessons: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Courses</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your courses
          </p>
        </div>
        <CreateCourseDialog />
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No courses yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by creating your first course
          </p>
          <CreateCourseDialog />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                const totalLessons = course.sections.reduce(
                  (acc: number, section: { lessons: unknown[] }) => acc + section.lessons.length,
                  0
                );
                return (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      {course.category?.name || (
                        <span className="text-muted-foreground italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {course.price
                        ? `${course.currency} ${course.price.toFixed(2)}`
                        : "Free"}
                    </TableCell>
                    <TableCell>
                      {course.sections.length} sections, {totalLessons} lessons
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/courses/${course.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
