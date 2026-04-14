"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CheckoutModal } from "@/components/course/checkout-modal";

interface EnrollButtonProps {
  courseId: string;
  courseName?: string;
  price?: number;
  currency?: string;
}

export function EnrollButton({ courseId, courseName, price, currency }: EnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const isPaid = price && price > 0;

  async function handleEnroll() {
    if (isPaid) {
      setShowCheckout(true);
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`/api/courses/${courseId}/enroll-free`);
      toast.success("Enrolled successfully!");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={handleEnroll}
        disabled={isLoading}
        className="w-full bg-[#1D6FF2] hover:bg-[#1858D0] text-white"
        size="lg"
      >
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isPaid ? `Enroll — ${currency || "KES"} ${price!.toLocaleString()}` : "Enroll for Free"}
      </Button>

      {showCheckout && isPaid && (
        <CheckoutModal
          courseId={courseId}
          courseName={courseName || "Course"}
          price={price!}
          currency={currency || "KES"}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
