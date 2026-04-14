"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Loader2, StickyNote } from "lucide-react";

interface LessonNotesProps {
  courseId: string;
  lessonId: string;
}

export function LessonNotes({ courseId, lessonId }: LessonNotesProps) {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = content !== savedContent;

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `/api/courses/${courseId}/lessons/${lessonId}/notes`
        );
        setContent(data.content || "");
        setSavedContent(data.content || "");
      } catch {
        // silent fail
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, [courseId, lessonId]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      const { data } = await axios.post(
        `/api/courses/${courseId}/lessons/${lessonId}/notes`,
        { content }
      );
      setSavedContent(data.content || "");
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  }, [courseId, lessonId, content]);

  // Auto-save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (hasChanges && !isSaving) {
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasChanges, isSaving, handleSave]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <StickyNote className="h-4 w-4" />
          <span>Personal notes for this lesson</span>
        </div>
        {hasChanges && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your notes here... (Ctrl+S to save)"
        rows={6}
        className="resize-y min-h-[120px]"
      />
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">
          Only you can see these notes
        </p>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="gap-1.5 bg-[#1D6FF2] hover:bg-[#1858D0] text-white"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save Note
        </Button>
      </div>
    </div>
  );
}
