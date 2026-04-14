"use client";

import { useEffect, useState } from "react";
import { Award, PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletionCelebrationProps {
  courseTitle: string;
  onClose: () => void;
}

function ConfettiPiece({ delay, left }: { delay: number; left: number }) {
  const colors = ["#1D6FF2", "#F5A623", "#12B76A", "#4DA3FF", "#ff6b6b", "#ffd93d"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 8;
  const rotation = Math.random() * 360;

  return (
    <div
      className="absolute animate-confetti-fall pointer-events-none"
      style={{
        left: `${left}%`,
        top: "-10px",
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        transform: `rotate(${rotation}deg)`,
        animationDelay: `${delay}ms`,
        borderRadius: "2px",
      }}
    />
  );
}

export function CompletionCelebration({ courseTitle, onClose }: CompletionCelebrationProps) {
  const [confetti, setConfetti] = useState<{ id: number; delay: number; left: number }[]>([]);

  useEffect(() => {
    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      delay: Math.random() * 2000,
      left: Math.random() * 100,
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Confetti layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((p) => (
          <ConfettiPiece key={p.id} delay={p.delay} left={p.left} />
        ))}
      </div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto w-20 h-20 rounded-full bg-[#12B76A]/10 flex items-center justify-center mb-5">
          <PartyPopper className="h-10 w-10 text-[#12B76A]" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Congratulations!
        </h2>
        <p className="text-gray-600 mb-1">You&apos;ve completed</p>
        <p className="text-lg font-semibold text-[#1D6FF2] mb-6">
          {courseTitle}
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
          <Award className="h-4 w-4 text-[#F5A623]" />
          <span>Your certificate is ready!</span>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-[#1D6FF2] hover:bg-[#1858D0] text-white"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
