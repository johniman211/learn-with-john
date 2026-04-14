const STORAGE_KEY = "lwj_recently_viewed";
const MAX_ITEMS = 6;

export interface RecentCourse {
  id: string;
  title: string;
  imageUrl: string | null;
  viewedAt: number;
}

export function addRecentlyViewed(course: Omit<RecentCourse, "viewedAt">) {
  if (typeof window === "undefined") return;
  
  const existing = getRecentlyViewed();
  const filtered = existing.filter((c) => c.id !== course.id);
  const updated = [{ ...course, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getRecentlyViewed(): RecentCourse[] {
  if (typeof window === "undefined") return [];
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
