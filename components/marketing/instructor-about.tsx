"use client";

import { GraduationCap, Smartphone, Award } from "lucide-react";
import AboutSection from "@/components/ui/about";

export function InstructorAbout() {
  return (
    <AboutSection
      heading="Meet John"
      subheading="Digital Skills Trainer, Juba, South Sudan — helping hundreds of South Sudanese youth learn real skills from scratch."
      variant="split"
      image={{
        src: "/images/john.jpeg",
        alt: "John — Digital Skills Trainer, Juba, South Sudan",
      }}
      features={[
        {
          icon: GraduationCap,
          title: "Trainer at CB Technology Center",
          description:
            "Teaching at CB Technology Training Center in Gudele, helping youth and entrepreneurs build digital skills.",
        },
        {
          icon: Smartphone,
          title: "Built for Our Context",
          description:
            "Courses designed for South Sudan — no jargon, no assumptions. Practical skills you can use the same week.",
        },
        {
          icon: Award,
          title: "500+ Students Trained",
          description:
            "A growing community of learners earning real income with the skills they learned right here.",
        },
      ]}
    />
  );
}
