import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { SendRemindersButton } from "@/components/admin/send-reminders-button";
import {
  BookOpen,
  DollarSign,
  ArrowRight,
  ClipboardList,
  Award,
  TrendingUp,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/student");
  }

  const [
    courseCount,
    publishedCount,
    purchases,
    studentCount,
    pendingSubmissions,
    certificateCount,
  ] = await Promise.all([
    db.course.count({ where: { profileId: profile.id } }),
    db.course.count({ where: { profileId: profile.id, isPublished: true } }),
    db.purchase.findMany({
      where: { course: { profileId: profile.id }, status: "COMPLETED" },
      select: { amount: true, currency: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    db.profile.count({ where: { role: "STUDENT" } }),
    db.assignmentSubmission.count({ where: { status: "submitted" } }),
    db.certificate.count(),
  ]);

  const totalRevenue = purchases.reduce(
    (sum: number, p: { amount: number }) => sum + p.amount,
    0
  );

  const monthlyData: Record<string, number> = {};
  for (const p of purchases) {
    const key = p.createdAt.toISOString().slice(0, 7);
    monthlyData[key] = (monthlyData[key] || 0) + p.amount;
  }

  const last6Months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    last6Months.push({ month: label, revenue: monthlyData[key] || 0 });
  }

  const recentEnrollments = await db.purchase.findMany({
    where: { course: { profileId: profile.id }, status: "COMPLETED" },
    include: {
      profile: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const coursePerformance = await db.course.findMany({
    where: { profileId: profile.id, isPublished: true },
    include: {
      purchases: { where: { status: "COMPLETED" }, select: { amount: true } },
      sections: {
        include: {
          lessons: { where: { isPublished: true }, select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SendRemindersButton />
          <Link href="/admin/assignments">
            <Button size="sm" variant="outline" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Reviews
              {pendingSubmissions > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-destructive text-white rounded-full">
                  {pendingSubmissions}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/admin/courses">
            <Button size="sm" className="gap-2">
              Manage Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue > 0 ? `$${totalRevenue.toFixed(0)}` : "$0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {purchases.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
            <p className="text-xs text-muted-foreground">
              {studentCount} total students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseCount}</div>
            <p className="text-xs text-muted-foreground">
              {publishedCount} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificateCount}</div>
            <p className="text-xs text-muted-foreground">Issued to students</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={last6Months} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEnrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No enrollments yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((e: {
                  id: string;
                  createdAt: Date;
                  profile: { name: string; email: string };
                  course: { title: string };
                }) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{e.profile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.course.title}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {e.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Course</th>
                  <th className="pb-2 font-medium text-center">Lessons</th>
                  <th className="pb-2 font-medium text-center">Enrollments</th>
                  <th className="pb-2 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {coursePerformance.map((c: {
                  id: string;
                  title: string;
                  purchases: { amount: number }[];
                  sections: { lessons: { id: string }[] }[];
                }) => {
                  const lessonCount = c.sections.reduce(
                    (sum: number, s: { lessons: { id: string }[] }) => sum + s.lessons.length,
                    0
                  );
                  const courseRevenue = c.purchases.reduce(
                    (sum: number, p: { amount: number }) => sum + p.amount,
                    0
                  );
                  return (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{c.title}</td>
                      <td className="py-2 text-center">{lessonCount}</td>
                      <td className="py-2 text-center">{c.purchases.length}</td>
                      <td className="py-2 text-right">${courseRevenue.toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
