"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { Send, MessageSquare, Reply, Loader2 } from "lucide-react";

interface DiscussionProfile {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface DiscussionItem {
  id: string;
  message: string;
  createdAt: string;
  profile: DiscussionProfile;
  replies: {
    id: string;
    message: string;
    createdAt: string;
    profile: DiscussionProfile;
  }[];
}

interface LessonDiscussionsProps {
  courseId: string;
  lessonId: string;
  profileId: string;
}

function Avatar({ name, size = "sm" }: { name: string; imageUrl?: string | null; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-9 h-9 text-sm" : "w-7 h-7 text-[10px]";
  return (
    <div className={`${cls} rounded-full bg-[#12B76A]/20 flex items-center justify-center flex-shrink-0`}>
      <span className="font-bold text-[#12B76A]">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function LessonDiscussions(props: LessonDiscussionsProps) {
  const { courseId, lessonId } = props;
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `/api/courses/${courseId}/lessons/${lessonId}/discussions`
      );
      setDiscussions(data);
    } catch {
      console.error("Failed to fetch discussions");
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleSubmit = async () => {
    if (!newMessage.trim()) return;
    try {
      setSubmitting(true);
      await axios.post(
        `/api/courses/${courseId}/lessons/${lessonId}/discussions`,
        { message: newMessage.trim() }
      );
      setNewMessage("");
      await fetchDiscussions();
      toast.success("Comment posted!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const msg = error?.response?.data?.error || "Failed to post comment";
      console.error("Discussion post error:", msg, err);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyMessage.trim()) return;
    try {
      setReplySubmitting(true);
      await axios.post(
        `/api/courses/${courseId}/lessons/${lessonId}/discussions`,
        { message: replyMessage.trim(), parentId }
      );
      setReplyMessage("");
      setReplyingTo(null);
      await fetchDiscussions();
      toast.success("Reply posted!");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setReplySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* New Comment Box */}
      <div className="bg-[#0F2035] rounded-lg border border-[#1A3050] p-4">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ask a question or share your thoughts..."
          className="w-full bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1A3050]">
          <span className="text-[10px] text-white/25">Ctrl+Enter to submit</span>
          <button
            onClick={handleSubmit}
            disabled={submitting || !newMessage.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#12B76A] hover:bg-[#0EA35E] disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-medium transition-colors"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Post
          </button>
        </div>
      </div>

      {/* Discussion Count */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-white/40" />
        <span className="text-sm text-white/50">
          {discussions.length} discussion{discussions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Discussion List */}
      {discussions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 text-white/15" />
          <p className="text-sm text-white/40">No discussions yet</p>
          <p className="text-xs text-white/25 mt-1">Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((d) => (
            <div key={d.id} className="bg-[#0F2035] rounded-lg border border-[#1A3050] overflow-hidden">
              {/* Main comment */}
              <div className="p-4">
                <div className="flex gap-3">
                  <Avatar name={d.profile.name} imageUrl={d.profile.imageUrl} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{d.profile.name}</span>
                      <span className="text-[10px] text-white/30">
                        {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{d.message}</p>
                    <button
                      onClick={() => {
                        setReplyingTo(replyingTo === d.id ? null : d.id);
                        setReplyMessage("");
                      }}
                      className="flex items-center gap-1 mt-2 text-xs text-white/40 hover:text-[#12B76A] transition-colors"
                    >
                      <Reply className="h-3 w-3" />
                      Reply{d.replies.length > 0 ? ` (${d.replies.length})` : ""}
                    </button>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {d.replies.length > 0 && (
                <div className="border-t border-[#1A3050] bg-[#262829]">
                  {d.replies.map((r) => (
                    <div key={r.id} className="px-4 py-3 border-b border-[#1A3050]/50 last:border-0">
                      <div className="flex gap-3 ml-6">
                        <Avatar name={r.profile.name} imageUrl={r.profile.imageUrl} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-white">{r.profile.name}</span>
                            <span className="text-[10px] text-white/30">
                              {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{r.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {replyingTo === d.id && (
                <div className="border-t border-[#1A3050] bg-[#262829] p-3">
                  <div className="flex gap-2 ml-6">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 bg-[#0A1628] border border-[#1A3050] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 resize-none outline-none min-h-[60px] focus:border-[#12B76A]/50"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply(d.id);
                      }}
                    />
                    <button
                      onClick={() => handleReply(d.id)}
                      disabled={replySubmitting || !replyMessage.trim()}
                      className="self-end px-3 py-2 rounded-lg bg-[#12B76A] hover:bg-[#0EA35E] disabled:opacity-40 text-black text-xs font-medium transition-colors"
                    >
                      {replySubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
