"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
  GripVertical,
  Loader2,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";

interface LessonItem {
  id: string;
  title: string;
  position: number;
  isPublished: boolean;
  isFree: boolean;
}

interface LessonManagerProps {
  courseId: string;
  sectionId: string;
  lessons: LessonItem[];
}

const addLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export function LessonManager({
  courseId,
  sectionId,
  lessons: initialLessons,
}: LessonManagerProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<z.infer<typeof addLessonSchema>>({
    resolver: zodResolver(addLessonSchema),
    defaultValues: { title: "" },
  });

  async function onAddLesson(values: z.infer<typeof addLessonSchema>) {
    try {
      setIsAdding(true);
      await axios.post(
        `/api/courses/${courseId}/sections/${sectionId}/lessons`,
        values
      );
      toast.success("Lesson added");
      form.reset();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  }

  async function onDeleteLesson(lessonId: string) {
    try {
      await axios.delete(
        `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`
      );
      toast.success("Lesson deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    setLessons(updatedItems);

    try {
      await axios.put(
        `/api/courses/${courseId}/sections/${sectionId}/lessons/reorder`,
        {
          list: updatedItems.map((item) => ({
            id: item.id,
            position: item.position,
          })),
        }
      );
      toast.success("Lessons reordered");
    } catch {
      toast.error("Something went wrong");
      setLessons(initialLessons);
    }
  }

  return (
    <div className="space-y-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onAddLesson)}
          className="flex items-end gap-2"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    disabled={isAdding}
                    placeholder="New lesson title..."
                    className="h-8 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" variant="outline" className="h-8" disabled={isAdding}>
            {isAdding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
            )}
            Add
          </Button>
        </form>
      </Form>

      {lessons.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No lessons in this section.
        </p>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`lessons-${sectionId}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
              {lessons.map((lesson, index) => (
                <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-sm"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" />
                      </div>
                      <span className="flex-1 truncate">{lesson.title}</span>
                      <div className="flex items-center gap-1">
                        {lesson.isFree && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            Free
                          </Badge>
                        )}
                        <Badge
                          variant={lesson.isPublished ? "default" : "secondary"}
                          className="text-[10px] px-1 py-0"
                        >
                          {lesson.isPublished ? "Live" : "Draft"}
                        </Badge>
                        <Link
                          href={`/admin/courses/${courseId}/sections/${sectionId}/lessons/${lesson.id}`}
                        >
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => onDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
