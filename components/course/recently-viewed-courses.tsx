"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRecentlyViewed, RecentCourse } from "@/lib/recently-viewed";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookOpen } from "lucide-react";

export function RecentlyViewedCourses() {
  const [courses, setCourses] = useState<RecentCourse[]>([]);

  useEffect(() => {
    setCourses(getRecentlyViewed());
  }, []);

  if (courses.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-muted-foreground" />
        Recently Viewed
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Link key={course.id} href={`/student/courses/${course.id}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-muted">
                {course.imageUrl ? (
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
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
                <p className="text-sm font-medium line-clamp-2">{course.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
