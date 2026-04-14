"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Megaphone, Send } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  course: { id: string; title: string } | null;
}

interface AnnouncementManagerProps {
  initialAnnouncements: Announcement[];
  courses: { id: string; title: string }[];
}

export function AnnouncementManager({ initialAnnouncements, courses }: AnnouncementManagerProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [courseId, setCourseId] = useState("all");

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setCourseId("all");
    setShowForm(false);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setIsCreating(true);
      const { data } = await axios.post("/api/admin/announcements", {
        title,
        message,
        courseId: courseId === "all" ? null : courseId,
      });
      setAnnouncements((prev) => [{ ...data, course: null }, ...prev]);
      toast.success(`Announcement sent to ${data.notifiedCount} student(s)`);
      resetForm();
      router.refresh();
    } catch {
      toast.error("Failed to send announcement");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Compose Announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Course Available!"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Send to</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title} (enrolled only)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSend} disabled={isCreating} className="gap-2">
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Announcement
              </Button>
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {announcements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No announcements sent yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{a.title}</h3>
                  <div className="flex items-center gap-2">
                    {a.course ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {a.course.title}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">All Students</Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
