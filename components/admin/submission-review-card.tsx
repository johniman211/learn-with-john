"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ExternalLink,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";

interface SubmissionData {
  id: string;
  fileUrl: string | null;
  notes: string | null;
  score: number | null;
  feedback: string | null;
  status: string;
  createdAt: string;
  studentName: string;
  studentEmail: string;
  assignmentId: string;
  assignmentTitle: string;
  maxScore: number;
  courseName: string;
  lessonName: string;
}

interface SubmissionReviewCardProps {
  submission: SubmissionData;
}

export function SubmissionReviewCard({ submission }: SubmissionReviewCardProps) {
  const [score, setScore] = useState(submission.score ?? 0);
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(submission.status);

  async function handleReview(status: string) {
    try {
      setIsLoading(true);
      await axios.patch(`/api/assignments/${submission.assignmentId}/review`, {
        submissionId: submission.id,
        score,
        feedback,
        status,
      });
      setCurrentStatus(status);
      toast.success(`Submission marked as ${status}`);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  }

  const isPending = currentStatus === "submitted" || currentStatus === "pending";

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    submitted: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    passed: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    failed: "bg-red-100 text-red-700",
    revision: "bg-orange-100 text-orange-700",
    reviewed: "bg-amber-100 text-amber-700",
  };

  const statusLabel: Record<string, string> = {
    pending: "Pending Review",
    submitted: "Submitted",
    approved: "Approved",
    passed: "Passed",
    rejected: "Rejected",
    failed: "Failed",
    revision: "Revision Requested",
    reviewed: "Reviewed",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{submission.assignmentTitle}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {submission.courseName} &middot; {submission.lessonName}
            </p>
          </div>
          <Badge className={statusColor[currentStatus] || "bg-gray-100"}>
            {statusLabel[currentStatus] || currentStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Student:</span>{" "}
            <span className="font-medium">{submission.studentName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="font-medium">{submission.studentEmail}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Submitted:</span>{" "}
            <span className="font-medium">
              {new Date(submission.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Max Score:</span>{" "}
            <span className="font-medium">{submission.maxScore}</span>
          </div>
        </div>

        {submission.fileUrl && (
          <a
            href={submission.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Submitted File
          </a>
        )}

        {submission.notes && (
          <div className="p-3 rounded-md bg-muted text-sm">
            <Label className="text-xs text-muted-foreground">Student Notes</Label>
            <p className="mt-1">{submission.notes}</p>
          </div>
        )}

        {isPending && (
          <>
            <div className="rounded-lg border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 p-4 space-y-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Review this submission</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Score (out of {submission.maxScore})</Label>
                  <Input
                    type="number"
                    min={0}
                    max={submission.maxScore}
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write feedback for the student..."
                  rows={3}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => handleReview("approved")}
                  disabled={isLoading}
                  className="bg-[#12B76A] hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReview("rejected")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!feedback.trim()) {
                      toast.error("Please provide feedback explaining what needs revision");
                      return;
                    }
                    handleReview("revision");
                  }}
                  disabled={isLoading}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  )}
                  Request Revision
                </Button>
              </div>
            </div>
          </>
        )}

        {!isPending && (
          <div className="space-y-2 text-sm">
            {(currentStatus === "approved" || currentStatus === "passed") && submission.score !== null && (
              <div>
                <span className="text-muted-foreground">Score:</span>{" "}
                <span className="font-semibold text-green-600">{submission.score}/{submission.maxScore}</span>
              </div>
            )}
            {(currentStatus === "rejected" || currentStatus === "failed") && submission.score !== null && (
              <div>
                <span className="text-muted-foreground">Score:</span>{" "}
                <span className="font-semibold text-red-600">{submission.score}/{submission.maxScore}</span>
              </div>
            )}
            {currentStatus === "revision" && (
              <div className="p-3 rounded-md bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">Revision Requested</p>
                {feedback && <p className="text-sm text-orange-800 dark:text-orange-300">{feedback}</p>}
              </div>
            )}
            {currentStatus !== "revision" && feedback && (
              <div>
                <span className="text-muted-foreground">Feedback:</span>{" "}
                <span>{feedback}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
