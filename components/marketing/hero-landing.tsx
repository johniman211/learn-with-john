"use client";

import HeroSection from "@/components/ui/hero-section";
import { Users, BookOpen, Award } from "lucide-react";

export function HeroLanding() {
  return (
    <HeroSection
      className="bg-[#0A1628] text-white"
      title={
        <>
          Stop Watching.
          <br />
          <span className="text-[#1D6FF2]">Start Earning.</span>
        </>
      }
      subtitle="Learn the exact digital skills that pay real money — web design, AI tools, freelancing, and more. In English. At your own pace. From someone who lives right here in Juba."
      actions={[
        {
          text: "Start Learning Today",
          href: "/sign-up",
          variant: "default",
          className:
            "bg-[#1D6FF2] hover:bg-[#1858D0] text-black font-bold text-lg px-8 py-6 h-auto rounded-xl shadow-lg shadow-[#1D6FF2]/20",
        },
        {
          text: "Browse Courses",
          href: "/sign-in",
          variant: "outline",
          className:
            "border-white/20 text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 h-auto rounded-xl",
        },
      ]}
      stats={[
        {
          value: "500+",
          label: "Active Students",
          icon: <Users className="h-5 w-5 text-[#1D6FF2]" />,
        },
        {
          value: "10+",
          label: "Courses",
          icon: <BookOpen className="h-5 w-5 text-[#1D6FF2]" />,
        },
        {
          value: "100%",
          label: "Certificates",
          icon: <Award className="h-5 w-5 text-[#1D6FF2]" />,
        },
      ]}
      images={[
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop",
      ]}
    />
  );
}
