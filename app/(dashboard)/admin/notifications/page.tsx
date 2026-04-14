import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BookOpen, Award, CreditCard, MessageSquare } from "lucide-react";

export default async function AdminNotificationsPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/student");
  }

  // Recent activity feed
  const [recentPurchases, recentReviews, recentCertificates, recentSubmissions] =
    await Promise.all([
      db.purchase.findMany({
        where: { status: "COMPLETED" },
        include: {
          profile: { select: { name: true } },
          course: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.review.findMany({
        include: {
          profile: { select: { name: true } },
          course: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.certificate.findMany({
        include: {
          profile: { select: { name: true } },
          course: { select: { title: true } },
        },
        orderBy: { issueDate: "desc" },
        take: 10,
      }),
      db.assignmentSubmission.findMany({
        where: { status: "submitted" },
        include: {
          profile: { select: { name: true } },
          assignment: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  type ActivityItem = {
    id: string;
    type: "enrollment" | "review" | "certificate" | "submission";
    message: string;
    time: Date;
  };

  const activities: ActivityItem[] = [
    ...recentPurchases.map((p) => ({
      id: `purchase-${p.id}`,
      type: "enrollment" as const,
      message: `${p.profile.name} enrolled in ${p.course.title}`,
      time: p.createdAt,
    })),
    ...recentReviews.map((r) => ({
      id: `review-${r.id}`,
      type: "review" as const,
      message: `${r.profile.name} reviewed ${r.course.title} (${r.rating}★)`,
      time: r.createdAt,
    })),
    ...recentCertificates.map((c) => ({
      id: `cert-${c.id}`,
      type: "certificate" as const,
      message: `${c.profile.name} earned certificate for ${c.course.title}`,
      time: c.issueDate,
    })),
    ...recentSubmissions.map((s) => ({
      id: `sub-${s.id}`,
      type: "submission" as const,
      message: `${s.profile.name} submitted ${s.assignment.title}`,
      time: s.createdAt,
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 30);

  const iconMap = {
    enrollment: <CreditCard className="h-4 w-4 text-blue-500" />,
    review: <MessageSquare className="h-4 w-4 text-yellow-500" />,
    certificate: <Award className="h-4 w-4 text-green-500" />,
    submission: <BookOpen className="h-4 w-4 text-purple-500" />,
  };

  const badgeMap = {
    enrollment: "bg-blue-100 text-blue-700",
    review: "bg-yellow-100 text-yellow-700",
    certificate: "bg-green-100 text-green-700",
    submission: "bg-purple-100 text-purple-700",
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Feed</h1>
          <p className="text-sm text-muted-foreground">
            Recent platform activity and notifications
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bell className="h-4 w-4" />
          {activities.length} recent events
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-lg font-bold">{recentPurchases.length}</p>
              <p className="text-xs text-muted-foreground">Enrollments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-lg font-bold">{recentReviews.length}</p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Award className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-lg font-bold">{recentCertificates.length}</p>
              <p className="text-xs text-muted-foreground">Certificates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-lg font-bold">{recentSubmissions.length}</p>
              <p className="text-xs text-muted-foreground">Pending Reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">{iconMap[activity.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTime(activity.time)}
                    </p>
                  </div>
                  <Badge className={`text-[10px] ${badgeMap[activity.type]}`}>
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
