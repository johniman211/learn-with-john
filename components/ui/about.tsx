"use client";

import React from "react";
import { Zap, Palette, Puzzle, BookOpen, Box, Brain } from "lucide-react";

interface AboutFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface AboutSectionProps {
  heading?: string;
  subheading?: string;
  features?: AboutFeature[];
  variant?: "grid" | "split";
  image?: {
    src: string;
    alt: string;
  };
}

export default function AboutSection({
  heading = "About our apps",
  subheading = "A visual collection of our most recent works - each piece crafted with intention, emotion and style.",
  features = [
    {
      icon: Zap,
      title: "Lightning-Fast Performance",
      description: "Built with speed — minimal load times and optimized.",
    },
    {
      icon: Palette,
      title: "Beautifully Designed Components",
      description: "Modern, pixel-perfect UI components ready for any project.",
    },
    {
      icon: Puzzle,
      title: "Plug-and-Play Integration",
      description: "Simple setup with support for React, Next.js and Tailwind CSS.",
    },
    {
      icon: BookOpen,
      title: "Clear & Comprehensive",
      description: "Get started fast with usage examples, live previews and code.",
    },
    {
      icon: Box,
      title: "Fully Customizable",
      description: "Easily adapt styles, colors and layout to match your brand.",
    },
    {
      icon: Brain,
      title: "Accessibility First",
      description: "Built with WCAG standards in mind to ensure inclusive user experiences.",
    },
  ],
  variant = "grid",
  image,
}: AboutSectionProps) {
  if (variant === "split" && image) {
    return (
      <div className="py-16 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold">{heading}</h2>
          <p className="text-sm opacity-60 mt-2 max-w-md mx-auto">{subheading}</p>
        </div>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
          <img
            className="max-w-sm w-full rounded-xl h-auto"
            src={image.src}
            alt={image.alt}
          />
          <div>
            <h3 className="text-3xl font-semibold">{heading}</h3>
            <p className="text-sm opacity-60 mt-2">{subheading}</p>
            <div className="flex flex-col gap-8 mt-6">
              {features.slice(0, 3).map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="size-9 p-2 bg-[#1D6FF2]/10 border border-[#1D6FF2]/30 rounded flex-shrink-0 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#1D6FF2]" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium">{feature.title}</h4>
                      <p className="text-sm opacity-60">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold">{heading}</h2>
        <p className="text-sm opacity-60 mt-2 max-w-lg mx-auto">{subheading}</p>
      </div>
      <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index}>
              <div className="size-10 p-2 bg-[#1D6FF2]/10 border border-[#1D6FF2]/30 rounded flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#1D6FF2]" />
              </div>
              <div className="mt-5 space-y-2">
                <h3 className="text-base font-medium">{feature.title}</h3>
                <p className="text-sm opacity-60">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
