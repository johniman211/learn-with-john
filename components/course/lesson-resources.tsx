"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FileText,
  Download,
  ExternalLink,
  Loader2,
  ClipboardList,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Attachment {
  id: string;
  name: string;
  url: string;
}

interface Assignment {
  id: string;
  title: string;
  instructions: string;
  maxScore: number;
}

interface Submission {
  id: string;
  fileUrl: string | null;
  notes: string | null;
  score: number | null;
  feedback: string | null;
  status: string;
  createdAt: string;
}

interface LessonResourcesProps {
  courseId: string;
  lessonId: string;
  profileId: string;
  attachments: Attachment[];
  assignment: Assignment | null;
}

export function LessonResources(props: LessonResourcesProps) {
  const { courseId, lessonId, attachments, assignment } = props;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing submission if assignment exists
  useEffect(() => {
    if (!assignment) return;
    const fetchSubmission = async () => {
      try {
        setSubmissionLoading(true);
        const { data } = await axios.get(
          `/api/courses/${courseId}/lessons/${lessonId}/assignment/submission`
        );
        if (data) {
          setSubmission(data);
          setNotes(data.notes || "");
        }
      } catch {
        // No submission yet — that's fine
      } finally {
        setSubmissionLoading(false);
      }
    };
    fetchSubmission();
  }, [courseId, lessonId, assignment]);

  const handleSubmitAssignment = async () => {
    if (!assignment || !notes.trim()) return;
    try {
      setSubmitting(true);
      const { data } = await axios.post(
        `/api/courses/${courseId}/lessons/${lessonId}/assignment/submission`,
        { notes: notes.trim() }
      );
      setSubmission(data);
      toast.success("Assignment submitted!");
    } catch {
      toast.error("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const hasContent = attachments.length > 0 || assignment;

  if (!hasContent) {
    return (
      <div className="text-center py-16">
        <FileText className="h-10 w-10 mx-auto mb-3 text-white/15" />
        <p className="text-sm text-white/40">No resources for this lesson</p>
        <p className="text-xs text-white/25 mt-1">
          The instructor hasn&apos;t added any downloadable resources yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Downloadable Files */}
      {attachments.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Download className="h-4 w-4 text-[#12B76A]" />
            Downloadable Resources
          </h3>
          <div className="space-y-2">
            {attachments.map((att) => {
              const ext = att.name.split(".").pop()?.toLowerCase() || "";
              return (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#0F2035] border border-[#1A3050] hover:border-[#12B76A]/30 hover:bg-[#0F2035]/80 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#12B76A]/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-[#12B76A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{att.name}</p>
                    <p className="text-[10px] text-white/30 uppercase">{ext} file</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-[#12B76A] transition-colors flex-shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Assignment */}
      {assignment && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#12B76A]" />
            Assignment: {assignment.title}
          </h3>
          <div className="bg-[#0F2035] rounded-lg border border-[#1A3050] overflow-hidden">
            {/* Instructions */}
            <div className="p-4 border-b border-[#1A3050]">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-2">Instructions</p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{assignment.instructions}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-white/30">
                <span>Max score: {assignment.maxScore}</span>
              </div>
            </div>

            {/* Submission Status / Form */}
            <div className="p-4">
              {submissionLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-white/30" />
                </div>
              ) : submission ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {submission.status === "graded" ? (
                      <CheckCircle className="h-4 w-4 text-[#12B76A]" />
                    ) : submission.status === "pending" ? (
                      <Clock className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-white/40" />
                    )}
                    <span className="text-sm font-medium text-white capitalize">{submission.status}</span>
                    {submission.score !== null && (
                      <span className="text-sm text-[#12B76A] font-bold ml-2">
                        {submission.score}/{assignment.maxScore}
                      </span>
                    )}
                  </div>

                  {submission.notes && (
                    <div className="bg-[#0A1628] rounded-lg p-3 border border-[#1A3050]">
                      <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Your Answer</p>
                      <p className="text-xs text-white/60 whitespace-pre-wrap">{submission.notes}</p>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="bg-[#12B76A]/5 rounded-lg p-3 border border-[#12B76A]/20">
                      <p className="text-[10px] text-[#12B76A]/60 uppercase tracking-wide mb-1">Instructor Feedback</p>
                      <p className="text-xs text-white/60 whitespace-pre-wrap">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-white/40 uppercase tracking-wide font-medium">Your Submission</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your answer or project notes here..."
                    className="w-full bg-[#0A1628] border border-[#1A3050] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 resize-none outline-none min-h-[100px] focus:border-[#12B76A]/50"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitAssignment}
                      disabled={submitting || !notes.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#12B76A] hover:bg-[#0EA35E] disabled:opacity-40 text-black text-sm font-medium transition-colors"
                    >
                      {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Submit Assignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
