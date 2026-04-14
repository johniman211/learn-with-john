"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Star } from "lucide-react";

interface CourseItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: { id: string; name: string } | null;
  totalLessons: number;
  isEnrolled?: boolean;
  avgRating?: number | null;
  reviewCount?: number;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface CourseCatalogFilterProps {
  courses: CourseItem[];
  categories: CategoryItem[];
  linkPrefix: string; // e.g. "/sign-up" or "/student/courses"
  variant?: "dark" | "light";
}

export function CourseCatalogFilter({
  courses,
  categories,
  linkPrefix,
  variant = "light",
}: CourseCatalogFilterProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.category?.name || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        !activeCategory || c.category?.id === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, search, activeCategory]);

  const isDark = variant === "dark";

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative max-w-md mx-auto">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-white/40" : "text-muted-foreground"}`} />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`pl-10 ${
            isDark
              ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#1D6FF2]"
              : ""
          }`}
        />
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === null
                ? isDark
                  ? "bg-[#1D6FF2] text-white"
                  : "bg-primary text-primary-foreground"
                : isDark
                ? "bg-white/10 text-white/60 hover:bg-white/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? isDark
                    ? "bg-[#1D6FF2] text-white"
                    : "bg-primary text-primary-foreground"
                  : isDark
                  ? "bg-white/5 text-white/60 hover:bg-white/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {(search || activeCategory) && (
        <p className={`text-center text-sm ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
          {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
          {search && <> for &ldquo;{search}&rdquo;</>}
          {activeCategory && (
            <>
              {" "}in{" "}
              <span className="font-medium">
                {categories.find((c) => c.id === activeCategory)?.name}
              </span>
            </>
          )}
        </p>
      )}

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No courses match your search.</p>
          {(search || activeCategory) && (
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory(null);
              }}
              className="mt-2 text-sm text-[#1D6FF2] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link
              key={course.id}
              href={
                linkPrefix === "/sign-up"
                  ? "/sign-up"
                  : `${linkPrefix}/${course.id}`
              }
            >
              <Card
                className={`overflow-hidden h-full group transition-all ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white hover:border-[#1D6FF2]/30"
                    : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-0">
                  <div className={`relative aspect-video ${isDark ? "bg-white/5" : ""}`}>
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDark ? "" : "bg-muted"}`}>
                        <BookOpen className={`h-8 w-8 ${isDark ? "text-white/20" : "text-muted-foreground"}`} />
                      </div>
                    )}
                    {course.isEnrolled && (
                      <Badge className="absolute top-2 right-2 bg-[#1D6FF2]">
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  <div className={isDark ? "p-5 space-y-2" : "p-4"}>
                    {course.category && (
                      <span
                        className={`text-[10px] font-medium tracking-wider uppercase ${
                          isDark ? "text-[#1D6FF2]" : "text-muted-foreground"
                        }`}
                      >
                        {course.category.name}
                      </span>
                    )}
                    <h3
                      className={`font-semibold line-clamp-2 ${
                        isDark
                          ? "group-hover:text-[#1D6FF2]"
                          : "mb-1"
                      } transition-colors`}
                    >
                      {course.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className={isDark ? "text-white/50" : "text-muted-foreground"}>
                        {course.totalLessons} lesson
                        {course.totalLessons !== 1 ? "s" : ""}
                      </span>
                      {course.avgRating ? (
                        <span className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className={isDark ? "text-white/70" : "text-foreground font-medium"}>
                            {course.avgRating.toFixed(1)}
                          </span>
                          <span className={isDark ? "text-white/40" : "text-muted-foreground"}>({course.reviewCount})</span>
                        </span>
                      ) : (
                        <span className={`font-semibold text-xs ${isDark ? "text-blue-400" : "text-[#1D6FF2]"}`}>
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
