"use client";

import { Calendar, FileText, User, Clock } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Sign Up",
    date: "Step 1",
    content: "Create your free account in under 60 seconds. No credit card required.",
    category: "Onboarding",
    icon: Calendar,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Choose Course",
    date: "Step 2",
    content: "Pick from web design, freelancing, AI tools, and more. All beginner-friendly.",
    category: "Selection",
    icon: FileText,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Start Learning",
    date: "Step 3",
    content: "Watch video lessons at your own pace. On your phone, tablet, or computer.",
    category: "Learning",
    icon: User,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 60,
  },
  {
    id: 4,
    title: "Get Certified",
    date: "Step 4",
    content: "Complete the course and download your professional certificate to share with clients.",
    category: "Completion",
    icon: Clock,
    relatedIds: [3],
    status: "pending" as const,
    energy: 30,
  },
];

export function JourneyTimeline() {
  return <RadialOrbitalTimeline timelineData={timelineData} />;
}
