import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { AnnouncementManager } from "@/components/admin/announcement-manager";
import { EmailBroadcast } from "@/components/admin/email-broadcast";

export default async function AdminAnnouncementsPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/student");
  }

  const announcements = await db.announcement.findMany({
    include: { course: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  const courses = await db.course.findMany({
    where: { profileId: profile.id, isPublished: true },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-sm text-muted-foreground">
          Send announcements to your students
        </p>
      </div>

      <AnnouncementManager
        initialAnnouncements={JSON.parse(JSON.stringify(announcements))}
        courses={courses}
      />

      <EmailBroadcast courses={courses} />
    </div>
  );
}
