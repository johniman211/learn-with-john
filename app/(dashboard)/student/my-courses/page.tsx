import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  ArrowRight,
  PlayCircle,
  Download,
  Printer,
  Award,
  CheckCircle,
  Clock,
} from "lucide-react";

export default async function MyCoursesPage() {
  const profile = await getProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  // Get all enrolled courses with lesson progress
  const enrolledPurchases = await db.purchase.findMany({
    where: { profileId: profile.id, status: "COMPLETED" },
    include: {
      course: {
        include: {
          category: true,
          sections: {
            orderBy: { position: "asc" },
            include: {
              lessons: {
                where: { isPublished: true },
                orderBy: { position: "asc" },
                select: { id: true, title: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get all lesson progress for this student
  const lessonProgress = await db.lessonProgress.findMany({
    where: { profileId: profile.id, isCompleted: true },
    select: { lessonId: true },
  });

  const completedLessonIds = new Set(lessonProgress.map((lp) => lp.lessonId));

  // Get certificates
  const certificates = await db.certificate.findMany({
    where: { profileId: profile.id },
    select: { id: true, courseId: true, uniqueCode: true },
  });

  const certifiedCourseIds = new Set(certificates.map((c) => c.courseId));
  const certificateMap = new Map(certificates.map((c) => [c.courseId, c.id]));
  const certificateCodeMap = new Map(certificates.map((c) => [c.courseId, c.uniqueCode]));

  // Build course data with progress
  const coursesWithProgress = enrolledPurchases.map((purchase) => {
    const course = purchase.course;
    const allLessonIds = course.sections.flatMap(
      (s: { lessons: { id: string }[] }) => s.lessons.map((l) => l.id)
    );
    const totalLessons = allLessonIds.length;
    const completedLessons = allLessonIds.filter((id: string) =>
      completedLessonIds.has(id)
    ).length;
    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const firstLessonId = allLessonIds[0] || "";
    const isCertified = certifiedCourseIds.has(course.id);
    const isComplete = progressPercent === 100;

    return {
      purchaseId: purchase.id,
      enrolledAt: purchase.createdAt,
      courseId: course.id,
      title: course.title,
      imageUrl: course.imageUrl,
      category: course.category?.name || null,
      totalLessons,
      completedLessons,
      progressPercent,
      firstLessonId,
      isCertified,
      isComplete,
      certificateId: certificateMap.get(course.id) || null,
      certificateCode: certificateCodeMap.get(course.id) || null,
    };
  });

  const inProgress = coursesWithProgress.filter(
    (c) => !c.isComplete && c.completedLessons > 0
  );
  const completed = coursesWithProgress.filter((c) => c.isComplete);
  const notStarted = coursesWithProgress.filter(
    (c) => c.completedLessons === 0
  );

  const totalEnrolled = coursesWithProgress.length;
  const totalCompleted = completed.length;
  const totalInProgress = inProgress.length;
  const overallLessons = coursesWithProgress.reduce(
    (sum, c) => sum + c.totalLessons,
    0
  );
  const overallDone = coursesWithProgress.reduce(
    (sum, c) => sum + c.completedLessons,
    0
  );
  const overallPercent =
    overallLessons > 0 ? Math.round((overallDone / overallLessons) * 100) : 0;

  function CourseCard({
    course,
  }: {
    course: (typeof coursesWithProgress)[0];
  }) {
    return (
      <Link
        href={`/student/courses/${course.courseId}/learn/${course.firstLessonId}`}
      >
        <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
          <div className="relative aspect-video">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            {course.isCertified && (
              <Badge className="absolute top-2 right-2 bg-[#F5A623] text-black gap-1">
                <Award className="h-3 w-3" />
                Certified
              </Badge>
            )}
            {course.isComplete && !course.isCertified && (
              <Badge className="absolute top-2 right-2 bg-[#12B76A] text-white gap-1">
                <CheckCircle className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
          <CardContent className="p-4 space-y-3">
            <div>
              {course.category && (
                <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  {course.category}
                </p>
              )}
              <h3 className="font-semibold line-clamp-2 text-sm mt-0.5">
                {course.title}
              </h3>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {course.completedLessons} / {course.totalLessons} lessons
                </span>
                <span className="font-medium">{course.progressPercent}%</span>
              </div>
              <Progress value={course.progressPercent} className="h-1.5" />
            </div>
            <Button size="sm" variant="ghost" className="w-full gap-1 text-xs">
              {course.completedLessons === 0 ? (
                <>
                  Start Learning
                  <ArrowRight className="h-3 w-3" />
                </>
              ) : course.isComplete ? (
                <>
                  Review Course
                  <CheckCircle className="h-3 w-3" />
                </>
              ) : (
                <>
                  Continue
                  <PlayCircle className="h-3 w-3" />
                </>
              )}
            </Button>
            {course.isComplete && course.certificateId && (
              <a
                href={`/api/certificates/${course.certificateId}/pdf`}
                className="block relative z-10"
              >
                <Button size="sm" variant="outline" className="w-full gap-1 text-xs border-[#F5A623]/30 text-[#F5A623] hover:bg-[#F5A623]/10">
                  <Download className="h-3 w-3" />
                  Download Certificate
                </Button>
              </a>
            )}
            {course.isComplete && course.certificateCode && (
              <a
                href={`/certificate/${course.certificateCode}`}
                target="_blank"
                className="block relative z-10"
              >
                <Button size="sm" variant="outline" className="w-full gap-1 text-xs">
                  <Printer className="h-3 w-3" />
                  Print Certificate
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Learning</h1>
          <p className="text-sm text-muted-foreground">
            Track your progress across all enrolled courses
          </p>
        </div>
        <Link href="/student/courses">
          <Button size="sm" className="gap-2">
            Browse Courses
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrolled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercent}%</div>
            <Progress value={overallPercent} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
      </div>

      {totalEnrolled === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-1">No courses yet</h3>
            <p className="text-sm mb-4">
              You haven&apos;t enrolled in any courses. Browse our catalog to
              get started!
            </p>
            <Link href="/student/courses">
              <Button className="gap-2">
                Browse Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All ({totalEnrolled})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({totalInProgress})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({totalCompleted})
            </TabsTrigger>
            <TabsTrigger value="not-started">
              Not Started ({notStarted.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesWithProgress.map((course) => (
                <CourseCard key={course.purchaseId} course={course} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            {inProgress.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No courses in progress.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgress.map((course) => (
                  <CourseCard key={course.purchaseId} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completed.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No completed courses yet. Keep learning!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((course) => (
                  <CourseCard key={course.purchaseId} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="not-started">
            {notStarted.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>You&apos;ve started all your enrolled courses!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {notStarted.map((course) => (
                  <CourseCard key={course.purchaseId} course={course} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
