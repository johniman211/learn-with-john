"use client";

import ScrollFAQAccordion from "@/components/ui/scroll-faqaccordion";

const faqData = [
  {
    id: 1,
    question: "Do I need a laptop or can I use my phone?",
    answer: "You can learn on your phone. All courses are fully mobile-friendly.",
  },
  {
    id: 2,
    question: "What if I'm a complete beginner with zero tech experience?",
    answer: "Perfect. Every course starts from zero. If you can send a WhatsApp message, you can start.",
  },
  {
    id: 3,
    question: "Are the courses really free?",
    answer: "Yes — we're in our testing phase and every course is 100% free. Just sign up, enroll, and start learning. No payment needed.",
  },
  {
    id: 4,
    question: "Will I get a certificate?",
    answer: "Yes. Complete the course and you get a downloadable PDF certificate with your name on it. You can share it with employers, clients, and on LinkedIn.",
  },
  {
    id: 5,
    question: "What if I get stuck or have questions?",
    answer: "Every course has a Q&A section. John personally answers student questions.",
  },
  {
    id: 6,
    question: "Is this only for people in Juba?",
    answer: "No — anyone in South Sudan, or anywhere in the world, can enroll and learn online.",
  },
];

export function FAQSection() {
  return (
    <ScrollFAQAccordion
      data={faqData}
      questionClassName="bg-white/5 text-white/90"
      answerClassName="bg-[#1D6FF2] text-black"
    />
  );
}
