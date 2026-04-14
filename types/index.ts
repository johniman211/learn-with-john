export type Role = "ADMIN" | "STUDENT";

export type CourseWithSections = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  currency: string;
  isPublished: boolean;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  sections: SectionWithLessons[];
  category: Category | null;
};

export type SectionWithLessons = {
  id: string;
  title: string;
  position: number;
  courseId: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  sectionId: string;
  muxData: MuxData | null;
  attachments: Attachment[];
};

export type Category = {
  id: string;
  name: string;
};

export type MuxData = {
  id: string;
  assetId: string;
  playbackId: string | null;
  lessonId: string;
};

export type Attachment = {
  id: string;
  name: string;
  url: string;
  lessonId: string;
  createdAt: Date;
};
