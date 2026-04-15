import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { EnrollButton } from "@/components/course/enroll-button";
import { ReviewForm } from "@/components/course/review-form";
import { BookmarkButton } from "@/components/course/bookmark-button";
import { ShareButton } from "@/components/course/share-button";
import { TrackView } from "@/components/course/track-view";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Star,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

interface CourseDetailPageProps {
  params: { courseId: string };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const profile = await getProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  let course;
  try {
    course = await db.course.findUnique({
      where: { id: params.courseId, isPublished: true },
      include: {
        category: true,
        profile: { select: { name: true, imageUrl: true } },
        sections: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { position: "asc" },
              select: { id: true, title: true, isFree: true },
            },
          },
        },
        reviews: {
          include: { profile: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  } catch (err) {
    console.error("[COURSE_DETAIL]", err);
    return redirect("/student/courses");
  }

  if (!course) {
    return redirect("/student/courses");
  }

  let isEnrolled = false;
  try {
    const purchase = await db.purchase.findFirst({
      where: {
        profileId: profile.id,
        courseId: course.id,
        status: "COMPLETED",
      },
    });
    isEnrolled = !!purchase;
  } catch (err) {
    console.error("[PURCHASE_CHECK]", err);
  }

  // Fetch user's existing review
  let existingReview: { rating: number; comment: string | null } | null = null;
  if (isEnrolled) {
    const userReview = await db.review.findUnique({
      where: {
        profileId_courseId: {
          profileId: profile.id,
          courseId: course.id,
        },
      },
      select: { rating: true, comment: true },
    });
    existingReview = userReview;
  }

  const totalLessons = course.sections.reduce(
    (acc: number, s: { lessons: { id: string }[] }) => acc + s.lessons.length,
    0
  );

  const firstLesson = course.sections[0]?.lessons?.[0] as { id: string } | undefined;

  return (
    <div className="max-w-5xl mx-auto">
      <TrackView courseId={course.id} courseTitle={course.title} courseImageUrl={course.imageUrl} />
      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {(course as unknown as { previewVideoUrl?: string }).previewVideoUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border bg-black">
              <iframe
                src={
                  (() => {
                    const url = (course as unknown as { previewVideoUrl: string }).previewVideoUrl;
                    if (url.includes("youtube.com/watch")) return url.replace("watch?v=", "embed/");
                    if (url.includes("youtu.be/")) return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]}`;
                    return url;
                  })()
                }
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : course.imageUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border">
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
          ) : null}

          <div>
            <div className="flex items-center gap-2 mb-3">
              {course.category && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                  {(course.category as { name: string }).name}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{course.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              {course.profile.imageUrl ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={course.profile.imageUrl}
                    alt={course.profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700">
                    {course.profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{course.profile.name}</p>
                <p className="text-xs text-muted-foreground">Instructor</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>{totalLessons} lesson{totalLessons !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{course.sections.length} section{course.sections.length !== 1 ? "s" : ""}</span>
            </div>
            {course.reviews.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-foreground font-medium">
                  {(course.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / course.reviews.length).toFixed(1)}
                </span>
                <span>({course.reviews.length})</span>
              </div>
            )}
          </div>

          {course.description && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
                {course.description}
              </p>
            </>
          )}

          <Separator />

          {/* Course Content */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Course Content
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {course.sections.length} sections &middot; {totalLessons} lessons
              </span>
            </h2>
            <div className="space-y-2">
              {course.sections.map((section: {
                id: string;
                title: string;
                lessons: { id: string; title: string; isFree: boolean }[];
              }, sectionIdx: number) => (
                <details
                  key={section.id}
                  className="group border rounded-lg overflow-hidden"
                  open={sectionIdx === 0}
                >
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-0 -rotate-90" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
                    </span>
                  </summary>
                  <div className="border-t">
                    {section.lessons.map((lesson: { id: string; title: string; isFree: boolean }, lessonIdx: number) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors border-b last:border-0"
                      >
                        <span className="text-xs text-muted-foreground w-5 text-center flex-shrink-0">
                          {lessonIdx + 1}
                        </span>
                        <PlayCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className={`text-sm flex-1 ${!lesson.isFree && !isEnrolled ? "text-muted-foreground" : ""}`}>
                          {lesson.title}
                        </span>
                        {lesson.isFree && !isEnrolled && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Free
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {course.reviews.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Student Reviews
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({course.reviews.length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {course.reviews.map((review: {
                    id: string;
                    rating: number;
                    comment: string | null;
                    profile: { name: string };
                  }) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-bold text-muted-foreground">
                              {review.profile.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.profile.name}</p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Review Form (enrolled students only) */}
          {isEnrolled && (
            <>
              <Separator />
              <ReviewForm courseId={course.id} existingReview={existingReview} />
            </>
          )}
        </div>

        {/* Sticky Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {course.price && course.price > 0 ? (
                    <span className="text-2xl font-bold text-blue-600">
                      {course.currency} {course.price.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-2xl font-bold text-green-600">Free</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <BookmarkButton courseId={course.id} />
                  <ShareButton courseTitle={course.title} courseId={course.id} />
                </div>
              </div>

              {isEnrolled ? (
                <Link href={`/student/courses/${course.id}/learn/${firstLesson?.id || ""}`} className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <EnrollButton
                  courseId={course.id}
                  courseName={course.title}
                  price={course.price || 0}
                  currency={course.currency}
                />
              )}

              <Separator />

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>{totalLessons} lessons &middot; {course.sections.length} sections</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
