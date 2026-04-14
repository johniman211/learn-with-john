"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, Send } from "lucide-react";

interface EmailBroadcastProps {
  courses: { id: string; title: string }[];
}

export function EmailBroadcast({ courses }: EmailBroadcastProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    try {
      setIsSending(true);
      const { data } = await axios.post("/api/admin/broadcast", {
        subject,
        message,
        courseId: courseId === "all" ? null : courseId,
      });
      toast.success(`Email sent to ${data.sentCount}/${data.totalStudents} students`);
      setSubject("");
      setMessage("");
      setCourseId("all");
    } catch {
      toast.error("Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Broadcast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Recipients</Label>
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
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line..."
          />
        </div>
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your email content..."
            rows={6}
          />
        </div>
        <Button onClick={handleSend} disabled={isSending} className="gap-2">
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isSending ? "Sending..." : "Send Broadcast"}
        </Button>
      </CardContent>
    </Card>
  );
}
