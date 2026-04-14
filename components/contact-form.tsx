"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardContent } from "@/components/ui/card";
import { Send, Loader2, CheckCircle } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !subject || !message) {
      setError("All fields are required");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post("/api/contact", { name, email, subject, message });
      setIsSent(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error?.response?.data?.error || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <CardContent className="p-6 space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#12B76A]/10 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-[#12B76A]" />
        </div>
        <h3 className="text-lg font-semibold text-white">Message Sent!</h3>
        <p className="text-sm text-white/60">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <Button
          onClick={() => {
            setIsSent(false);
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
          }}
          variant="outline"
          className="mt-2 border-white/20 text-white hover:bg-white/10"
        >
          Send Another Message
        </Button>
      </CardContent>
    );
  }

  return (
    <CardContent className="p-6 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/80">Your Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Email Address</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What is this about?"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Message</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={5}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1D6FF2] hover:bg-[#1858D0] text-black font-semibold"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Sending..." : "Send Message"}
        </Button>
        <p className="text-xs text-white/40 text-center">
          We typically respond within 24 hours.
        </p>
      </form>
    </CardContent>
  );
}
