import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  BarChart3,
  CheckCircle,
  DollarSign,
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/student");
  }

  const [
    totalStudents,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalLessonCompletions,
    totalCertificates,
    totalLessons,
  ] = await Promise.all([
    db.profile.count({ where: { role: "STUDENT" } }),
    db.course.count({ where: { profileId: profile.id } }),
    db.course.count({ where: { profileId: profile.id, isPublished: true } }),
    db.purchase.count({ where: { status: "COMPLETED" } }),
    db.lessonProgress.count({ where: { isCompleted: true } }),
    db.certificate.count(),
    db.lesson.count({ where: { isPublished: true } }),
  ]);

  // Revenue data
  const allPurchases = await db.purchase.findMany({
    where: { status: "COMPLETED" },
    select: { amount: true, courseId: true, createdAt: true },
  });
  const totalRevenue = allPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Top courses by enrollment
  const topCourses = await db.course.findMany({
    where: { profileId: profile.id, isPublished: true },
    include: {
      purchases: { where: { status: "COMPLETED" }, select: { id: true, amount: true } },
      sections: {
        include: {
          lessons: { where: { isPublished: true }, select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const courseStats = topCourses
    .map((course) => ({
      title: course.title,
      enrollments: course.purchases.length,
      revenue: course.purchases.reduce((sum: number, p: { id: string; amount?: number | null }) => sum + (p.amount || 0), 0),
      lessons: course.sections.reduce(
        (sum: number, s: { lessons: { id: string }[] }) => sum + s.lessons.length,
        0
      ),
    }))
    .sort((a, b) => b.enrollments - a.enrollments);

  const avgLessonsPerStudent =
    totalStudents > 0
      ? (totalLessonCompletions / totalStudents).toFixed(1)
      : "0";

  const certRate =
    totalEnrollments > 0
      ? Math.round((totalCertificates / totalEnrollments) * 100)
      : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Platform performance at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">total course enrollments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessonCompletions}</div>
            <p className="text-xs text-muted-foreground">
              avg {avgLessonsPerStudent} per student
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertificates}</div>
            <p className="text-xs text-muted-foreground">
              {certRate}% certification rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              from {allPurchases.length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Courses Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total courses</span>
              <span className="font-medium">{totalCourses}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium">{publishedCourses}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total lessons</span>
              <span className="font-medium">{totalLessons}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Draft</span>
              <span className="font-medium">{totalCourses - publishedCourses}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Course Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courseStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No published courses yet
              </p>
            ) : (
              <div className="space-y-4">
                {courseStats.map((course, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate max-w-[200px]">
                        {course.title}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {course.enrollments} enrolled · ${course.revenue.toFixed(0)} revenue
                      </span>
                    </div>
                    <Progress
                      value={
                        courseStats[0].enrollments > 0
                          ? (course.enrollments / courseStats[0].enrollments) * 100
                          : 0
                      }
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
