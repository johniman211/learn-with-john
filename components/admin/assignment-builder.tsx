"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, ClipboardList, Save } from "lucide-react";

interface AssignmentData {
  id: string;
  title: string;
  instructions: string;
  maxScore: number;
}

interface AssignmentBuilderProps {
  courseId: string;
  sectionId: string;
  lessonId: string;
}

export function AssignmentBuilder({ courseId, sectionId, lessonId }: AssignmentBuilderProps) {
  const basePath = `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/assignment`;

  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxScore, setMaxScore] = useState(100);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axios.get(basePath);
        if (res.data) {
          setAssignment(res.data);
          setTitle(res.data.title);
          setInstructions(res.data.instructions);
          setMaxScore(res.data.maxScore);
        }
      } catch {
        // No assignment yet
      } finally {
        setIsLoading(false);
      }
    }
    fetch();
  }, [basePath]);

  async function create() {
    try {
      setIsSaving(true);
      const res = await axios.post(basePath, {
        title: "Lesson Assignment",
        instructions: "Complete the following assignment...",
        maxScore: 100,
      });
      setAssignment(res.data);
      setTitle(res.data.title);
      setInstructions(res.data.instructions);
      setMaxScore(res.data.maxScore);
      toast.success("Assignment created");
    } catch {
      toast.error("Failed to create assignment");
    } finally {
      setIsSaving(false);
    }
  }

  async function save() {
    try {
      setIsSaving(true);
      await axios.patch(basePath, { title, instructions, maxScore });
      toast.success("Assignment updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this assignment and all submissions?")) return;
    try {
      setIsSaving(true);
      await axios.delete(basePath);
      setAssignment(null);
      toast.success("Assignment deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!assignment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Add an assignment students must complete for this lesson.
          </p>
          <Button onClick={create} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Assignment Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Instructions</Label>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={5}
            placeholder="Describe what the student should do..."
          />
        </div>
        <div className="space-y-2">
          <Label>Max Score</Label>
          <Input
            type="number"
            min={1}
            value={maxScore}
            onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button size="sm" variant="destructive" onClick={remove} disabled={isSaving}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
