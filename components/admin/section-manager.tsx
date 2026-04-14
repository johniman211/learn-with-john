"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Loader2,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { LessonManager } from "./lesson-manager";

interface LessonItem {
  id: string;
  title: string;
  position: number;
  isPublished: boolean;
  isFree: boolean;
}

interface SectionItem {
  id: string;
  title: string;
  position: number;
  lessons: LessonItem[];
}

interface SectionManagerProps {
  courseId: string;
  sections: SectionItem[];
}

const addSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export function SectionManager({ courseId, sections: initialSections }: SectionManagerProps) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [isAdding, setIsAdding] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const form = useForm<z.infer<typeof addSectionSchema>>({
    resolver: zodResolver(addSectionSchema),
    defaultValues: { title: "" },
  });

  function toggleExpand(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  async function onAddSection(values: z.infer<typeof addSectionSchema>) {
    try {
      setIsAdding(true);
      await axios.post(`/api/courses/${courseId}/sections`, values);
      toast.success("Section added");
      form.reset();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  }

  async function onDeleteSection(sectionId: string) {
    try {
      await axios.delete(`/api/courses/${courseId}/sections/${sectionId}`);
      toast.success("Section deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function onUpdateSectionTitle(sectionId: string) {
    if (!editTitle.trim()) return;
    try {
      await axios.patch(`/api/courses/${courseId}/sections/${sectionId}`, {
        title: editTitle,
      });
      toast.success("Section updated");
      setEditingSectionId(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    setSections(updatedItems);

    try {
      setIsReordering(true);
      await axios.put(`/api/courses/${courseId}/sections/reorder`, {
        list: updatedItems.map((item) => ({
          id: item.id,
          position: item.position,
        })),
      });
      toast.success("Sections reordered");
    } catch {
      toast.error("Something went wrong");
      setSections(initialSections);
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sections & Lessons</span>
          {isReordering && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onAddSection)}
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
                      placeholder="New section title..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="sm" disabled={isAdding}>
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4 mr-1" />
              )}
              Add
            </Button>
          </form>
        </Form>

        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No sections yet. Add one above.
          </p>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="rounded-md border bg-card"
                      >
                        <div className="flex items-center gap-2 px-3 py-2">
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          </div>
                          <button
                            onClick={() => toggleExpand(section.id)}
                            className="p-0.5"
                          >
                            {expandedSections.has(section.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>

                          {editingSectionId === section.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="h-7 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") onUpdateSectionTitle(section.id);
                                  if (e.key === "Escape") setEditingSectionId(null);
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => onUpdateSectionTitle(section.id)}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm font-medium flex-1">
                              {section.title}
                            </span>
                          )}

                          <Badge variant="secondary" className="text-xs">
                            {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setEditingSectionId(section.id);
                              setEditTitle(section.title);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => onDeleteSection(section.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {expandedSections.has(section.id) && (
                          <div className="border-t px-3 py-2 bg-muted/30">
                            <LessonManager
                              courseId={courseId}
                              sectionId={section.id}
                              lessons={section.lessons}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
