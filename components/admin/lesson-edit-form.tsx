"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Video } from "lucide-react";

const RichTextEditor = dynamic(() => import("@/components/admin/rich-text-editor"), {
  ssr: false,
  loading: () => <div className="h-[200px] border rounded-md animate-pulse bg-muted" />,
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  isPublished: z.boolean(),
  isFree: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface LessonEditFormProps {
  courseId: string;
  sectionId: string;
  lessonId: string;
  initialData: FormValues;
}

export function LessonEditForm({
  courseId,
  sectionId,
  lessonId,
  initialData,
}: LessonEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      await axios.patch(
        `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
        values
      );
      toast.success("Lesson updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lesson Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="e.g. 'Getting Started with HTML'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="Brief description of this lesson..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Content (Rich Text)</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Paste video URL here..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Supports: YouTube, Vimeo, Amazon S3, Mux, or any direct video URL (.mp4)
                  </FormDescription>
                  {field.value && (field.value.startsWith("http://") || field.value.startsWith("https://")) && (
                    <div className="mt-2 aspect-video rounded-md overflow-hidden border bg-black">
                      <VideoPreview url={field.value} />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Free Preview</FormLabel>
                      <FormDescription className="text-xs">
                        Allow non-enrolled students to preview
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Published</FormLabel>
                      <FormDescription className="text-xs">
                        Make this lesson visible to students
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function getEmbedUrl(url: string): { type: "iframe" | "video"; src: string } | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch) return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}` };

  // Vimeo
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/)(\d+)/
  );
  if (vimeoMatch) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };

  // Mux
  const muxMatch = url.match(
    /stream\.mux\.com\/([a-zA-Z0-9]+)/
  );
  if (muxMatch) return { type: "iframe", src: `https://stream.mux.com/${muxMatch[1]}` };

  // Direct video (S3, CloudFront, any .mp4/.webm URL)
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || url.includes("s3.amazonaws.com") || url.includes("cloudfront.net")) {
    return { type: "video", src: url };
  }

  // Fallback — try as direct video
  if (url.startsWith("http")) {
    return { type: "video", src: url };
  }

  return null;
}

function VideoPreview({ url }: { url: string }) {
  const embed = getEmbedUrl(url);
  if (!embed) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Video className="h-8 w-8" />
      </div>
    );
  }

  if (embed.type === "iframe") {
    return (
      <iframe
        src={embed.src}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  }

  return <video src={embed.src} controls className="w-full h-full" />;
}
