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
  Upload,
  CheckCircle,
  XCircle,
  ClipboardList,
} from "lucide-react";

interface AssignmentSubmissionProps {
  assignmentId: string;
  title: string;
  instructions: string;
  maxScore: number;
  existingSubmission: {
    fileUrl: string | null;
    notes: string | null;
    score: number | null;
    feedback: string | null;
    status: string;
  } | null;
}

export function AssignmentSubmission({
  assignmentId,
  title,
  instructions,
  maxScore,
  existingSubmission,
}: AssignmentSubmissionProps) {
  const [fileUrl, setFileUrl] = useState(existingSubmission?.fileUrl || "");
  const [notes, setNotes] = useState(existingSubmission?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState(existingSubmission);

  async function handleSubmit() {
    if (!fileUrl.trim() && !notes.trim()) {
      toast.error("Please provide a file URL or notes");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(`/api/assignments/${assignmentId}/submit`, {
        fileUrl: fileUrl || null,
        notes: notes || null,
      });
      setSubmission({
        fileUrl: res.data.fileUrl,
        notes: res.data.notes,
        score: null,
        feedback: null,
        status: "submitted",
      });
      toast.success("Assignment submitted!");
    } catch {
      toast.error("Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isReviewed = submission?.status === "passed" || submission?.status === "failed";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-md bg-muted">
          <Label className="text-xs text-muted-foreground">Instructions</Label>
          <div
            className="mt-1 text-sm prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: instructions }}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Max score: {maxScore}
          </p>
        </div>

        {isReviewed && (
          <div className={`p-4 rounded-md ${submission?.status === "passed" ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
            <div className="flex items-center gap-2 mb-2">
              {submission?.status === "passed" ? (
                <CheckCircle className="h-5 w-5 text-[#12B76A]" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <Badge variant={submission?.status === "passed" ? "default" : "destructive"}>
                {submission?.status?.toUpperCase()}
              </Badge>
              {submission?.score !== null && (
                <span className="text-sm font-medium ml-auto">
                  Score: {submission.score}/{maxScore}
                </span>
              )}
            </div>
            {submission?.feedback && (
              <div className="text-sm mt-2">
                <span className="font-medium">Feedback:</span> {submission.feedback}
              </div>
            )}
          </div>
        )}

        {submission?.status === "submitted" && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Your submission is being reviewed...
          </div>
        )}

        {(!submission || submission.status === "failed") && (
          <>
            <div className="space-y-2">
              <Label>File URL (Google Drive, Dropbox, etc.)</Label>
              <div className="flex gap-2">
                <Upload className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  placeholder="https://drive.google.com/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Add any notes for your instructor..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submission?.status === "failed" ? "Resubmit Assignment" : "Submit Assignment"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
