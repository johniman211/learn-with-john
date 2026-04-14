"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { File, Loader2, PlusCircle, Trash2, ExternalLink } from "lucide-react";

interface AttachmentItem {
  id: string;
  name: string;
  url: string;
}

interface LessonAttachmentsProps {
  courseId: string;
  sectionId: string;
  lessonId: string;
  attachments: AttachmentItem[];
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL"),
});

export function LessonAttachments({
  courseId,
  sectionId,
  lessonId,
  attachments,
}: LessonAttachmentsProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", url: "" },
  });

  async function onAdd(values: z.infer<typeof formSchema>) {
    try {
      setIsAdding(true);
      await axios.post(
        `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/attachments`,
        values
      );
      toast.success("Attachment added");
      form.reset();
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  }

  async function onDelete(attachmentId: string) {
    try {
      setDeletingId(attachmentId);
      await axios.delete(
        `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/attachments?attachmentId=${attachmentId}`
      );
      toast.success("Attachment deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attachments</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="rounded-md border p-3 bg-muted/30">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAdd)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">File Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isAdding}
                          placeholder="e.g. 'Lecture Notes.pdf'"
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">File URL</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isAdding}
                          placeholder="https://example.com/file.pdf"
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowForm(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isAdding}>
                    {isAdding && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                    Add Attachment
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {attachments.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No attachments yet. Add resources for your students.
          </p>
        )}

        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 rounded-md border p-3"
          >
            <File className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                Open
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              disabled={deletingId === attachment.id}
              onClick={() => onDelete(attachment.id)}
            >
              {deletingId === attachment.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
