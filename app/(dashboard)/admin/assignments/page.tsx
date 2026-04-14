import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { SubmissionReviewCard } from "@/components/admin/submission-review-card";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default async function AdminAssignmentsPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/");
  }

  const submissions = await db.assignmentSubmission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: { select: { name: true, email: true } },
      assignment: {
        include: {
          lesson: {
            include: {
              section: {
                include: { course: { select: { id: true, title: true } } },
              },
            },
          },
        },
      },
    },
  });

  const pending = submissions.filter((s: { status: string }) => s.status === "submitted" || s.status === "pending");
  const reviewed = submissions.filter((s: { status: string }) => s.status !== "submitted" && s.status !== "pending");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assignment Submissions</h1>
        <p className="text-sm text-muted-foreground">
          Review student assignment submissions
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
              <ClipboardList className="h-5 w-5" />
              <span>No pending submissions</span>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pending.map((submission: {
              id: string;
              fileUrl: string | null;
              notes: string | null;
              score: number | null;
              feedback: string | null;
              status: string;
              createdAt: Date;
              profile: { name: string; email: string };
              assignment: {
                id: string;
                title: string;
                instructions: string;
                maxScore: number;
                lesson: {
                  title: string;
                  section: { course: { id: string; title: string } };
                } | null;
              };
            }) => (
              <SubmissionReviewCard
                key={submission.id}
                submission={{
                  id: submission.id,
                  fileUrl: submission.fileUrl,
                  notes: submission.notes,
                  score: submission.score,
                  feedback: submission.feedback,
                  status: submission.status,
                  createdAt: submission.createdAt.toISOString(),
                  studentName: submission.profile.name,
                  studentEmail: submission.profile.email,
                  assignmentId: submission.assignment.id,
                  assignmentTitle: submission.assignment.title,
                  maxScore: submission.assignment.maxScore,
                  courseName: submission.assignment.lesson?.section?.course?.title || "",
                  lessonName: submission.assignment.lesson?.title || "",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Reviewed ({reviewed.length})
          </h2>
          <div className="grid gap-4">
            {reviewed.map((submission: {
              id: string;
              fileUrl: string | null;
              notes: string | null;
              score: number | null;
              feedback: string | null;
              status: string;
              createdAt: Date;
              profile: { name: string; email: string };
              assignment: {
                id: string;
                title: string;
                instructions: string;
                maxScore: number;
                lesson: {
                  title: string;
                  section: { course: { id: string; title: string } };
                } | null;
              };
            }) => (
              <SubmissionReviewCard
                key={submission.id}
                submission={{
                  id: submission.id,
                  fileUrl: submission.fileUrl,
                  notes: submission.notes,
                  score: submission.score,
                  feedback: submission.feedback,
                  status: submission.status,
                  createdAt: submission.createdAt.toISOString(),
                  studentName: submission.profile.name,
                  studentEmail: submission.profile.email,
                  assignmentId: submission.assignment.id,
                  assignmentTitle: submission.assignment.title,
                  maxScore: submission.assignment.maxScore,
                  courseName: submission.assignment.lesson?.section?.course?.title || "",
                  lessonName: submission.assignment.lesson?.title || "",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
