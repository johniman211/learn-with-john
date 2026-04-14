import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RecentlyViewedCourses } from "@/components/course/recently-viewed-courses";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  ArrowRight,
  PlayCircle,
  Download,
  ClipboardList,
  Award,
  Heart,
  Flame,
  CalendarDays,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const profile = await getProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const [
    enrolledCourses,
    completedLessonsCount,
    certificates,
    pendingAssignments,
  ] = await Promise.all([
    db.purchase.findMany({
      where: { profileId: profile.id, status: "COMPLETED" },
      include: {
        course: {
          include: {
            sections: {
              include: {
                lessons: {
                  where: { isPublished: true },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.lessonProgress.count({
      where: { profileId: profile.id, isCompleted: true },
    }),
    db.certificate.findMany({
      where: { profileId: profile.id },
      include: { course: { select: { title: true } } },
      orderBy: { issueDate: "desc" },
    }),
    db.assignmentSubmission.findMany({
      where: { profileId: profile.id, status: { in: ["pending", "submitted"] } },
      include: {
        assignment: {
          include: {
            lesson: { select: { title: true } },
          },
        },
      },
    }),
  ]);

  // Personal stats
  const recentActivity = await db.lessonProgress.findMany({
    where: { profileId: profile.id, isCompleted: true },
    select: { updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  // Calculate learning streak (consecutive days with activity)
  let streak = 0;
  if (recentActivity.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activityDays = new Set(
      recentActivity.map((a) => {
        const d = new Date(a.updatedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
    const sortedDays = Array.from(activityDays).sort((a, b) => b - a);
    const dayMs = 86400000;
    // Check if active today or yesterday
    if (sortedDays[0] >= today.getTime() - dayMs) {
      streak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        if (sortedDays[i] === sortedDays[i - 1] - dayMs) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // Lessons completed this week
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const lessonsThisWeek = recentActivity.filter(
    (a) => new Date(a.updatedAt) >= weekAgo
  ).length;

  const bookmarkedCourses = await db.bookmark.findMany({
    where: { profileId: profile.id },
    include: {
      course: {
        select: { id: true, title: true, imageUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const lastProgress = await db.lessonProgress.findFirst({
    where: { profileId: profile.id },
    orderBy: { updatedAt: "desc" },
    include: {
      lesson: {
        include: {
          section: {
            include: { course: { select: { id: true, title: true } } },
          },
        },
      },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile.name}!</h1>
          <p className="text-sm text-muted-foreground">
            Continue your learning journey
          </p>
        </div>
        <Link href="/student/courses">
          <Button size="sm" className="gap-2">
            Browse Courses
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lessons Done</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLessonsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{streak} day{streak !== 1 ? "s" : ""}</p>
              <p className="text-xs text-muted-foreground">Learning streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lessonsThisWeek}</p>
              <p className="text-xs text-muted-foreground">Lessons completed this week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {lastProgress?.lesson && (
        <Card className="border-[#1D6FF2]/30 bg-[#1D6FF2]/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <PlayCircle className="h-8 w-8 text-[#1D6FF2]" />
              <div>
                <p className="text-sm font-medium">Resume Learning</p>
                <p className="text-xs text-muted-foreground">
                  {lastProgress.lesson.section.course.title} &middot; {lastProgress.lesson.title}
                </p>
              </div>
            </div>
            <Link
              href={`/student/courses/${lastProgress.lesson.section.course.id}/learn/${lastProgress.lessonId}`}
            >
              <Button size="sm" className="bg-[#1D6FF2] hover:bg-[#1858D0]">
                Continue
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">My Courses</h2>
        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>You haven&apos;t enrolled in any courses yet.</p>
              <Link href="/student/courses">
                <Button variant="link" className="mt-2">Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((purchase: {
              id: string;
              course: {
                id: string;
                title: string;
                imageUrl: string | null;
                sections: { lessons: { id: string }[] }[];
              };
            }) => {
              const totalLessons = purchase.course.sections.reduce(
                (sum: number, s: { lessons: { id: string }[] }) => sum + s.lessons.length,
                0
              );
              const courseLessonIds = purchase.course.sections.flatMap(
                (s: { lessons: { id: string }[] }) => s.lessons.map((l: { id: string }) => l.id)
              );
              const firstLessonId = courseLessonIds[0] || "";

              return (
                <Link
                  key={purchase.id}
                  href={`/student/courses/${purchase.course.id}/learn/${firstLessonId}`}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    <div className="relative aspect-video">
                      {purchase.course.imageUrl ? (
                        <Image
                          src={purchase.course.imageUrl}
                          alt={purchase.course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold line-clamp-2 text-sm">
                        {purchase.course.title}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{totalLessons} lessons</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {certificates.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            <Award className="inline h-5 w-5 mr-1 text-[#F5A623]" />
            Certificates Earned
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert: {
              id: string;
              uniqueCode: string;
              issueDate: Date;
              course: { title: string };
            }) => (
              <Card key={cert.id} className="border-[#F5A623]/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{cert.course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {cert.issueDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge className="bg-[#F5A623] text-black">Certified</Badge>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/api/certificates/${cert.id}/pdf`}>
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                    </a>
                    <Link href={`/verify/${cert.uniqueCode}`}>
                      <Button size="sm" variant="ghost" className="text-xs">
                        Verify
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      {/* Wishlist */}
      {bookmarkedCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              My Wishlist
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bookmarkedCourses.map((bm: { id: string; course: { id: string; title: string; imageUrl: string | null } }) => (
              <Link key={bm.id} href={`/student/courses/${bm.course.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-video bg-muted">
                    {bm.course.imageUrl ? (
                      <Image
                        src={bm.course.imageUrl}
                        alt={bm.course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium line-clamp-2">{bm.course.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      <RecentlyViewedCourses />
    </div>
  );
}
