import Link from "next/link";
import { Header1 } from "@/components/ui/header-1";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";

const faqs = [
  {
    q: "How do I create an account?",
    a: "Click the 'Get Started' button on the homepage or navigate to /sign-up. Fill in your name, email, and password to create your free account.",
  },
  {
    q: "Are the courses really free?",
    a: "During our testing period, all courses are completely free! We may introduce paid courses in the future, but existing free enrollments will remain free forever.",
  },
  {
    q: "How do I enroll in a course?",
    a: "Browse our courses, click on one you're interested in, and click the 'Enroll' button on the course detail page. You'll get instant access to all course materials.",
  },
  {
    q: "How do I track my progress?",
    a: "Your dashboard shows your enrolled courses, completed lessons, and certificates. Inside each course, a progress bar shows how far along you are.",
  },
  {
    q: "How do I earn a certificate?",
    a: "Complete all lessons in a course (including any quizzes and assignments). Once you reach 100% completion, you can generate your certificate from the course player.",
  },
  {
    q: "Can I take notes while learning?",
    a: "Yes! Each lesson has a 'Notes' tab in the course player where you can write and auto-save personal notes tied to that specific lesson.",
  },
  {
    q: "How does the leaderboard work?",
    a: "You earn 10 points for every lesson completed and 100 points for each certificate earned. The leaderboard ranks all students by total points.",
  },
  {
    q: "Can I bookmark courses for later?",
    a: "Yes! Click the heart icon on any course detail page to save it to your wishlist. You can view your wishlist on your student dashboard.",
  },
  {
    q: "How do I contact support?",
    a: "Visit our Contact page or email us at John@learnwithjohn.com. You can also reach us via WhatsApp at +211 929 385 157.",
  },
  {
    q: "Can I access courses on mobile?",
    a: "Yes, our platform is fully responsive and works on phones, tablets, and desktops.",
  },
];

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A1628] text-white">
      <Header1 />

      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-medium tracking-widest text-[#1D6FF2] mb-4">
                HELP CENTER
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold">
                Frequently Asked Questions
              </h1>
              <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
                Find answers to common questions about Learn with John
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border border-white/10 rounded-lg px-5 bg-white/5"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-white/90 hover:text-white hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-white/60 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Card className="mt-12 bg-white/5 border-white/10">
              <CardContent className="p-6 text-center">
                <HelpCircle className="h-8 w-8 mx-auto mb-3 text-[#1D6FF2]" />
                <h3 className="font-semibold text-white mb-2">Still have questions?</h3>
                <p className="text-sm text-white/50 mb-4">
                  We&apos;re here to help. Reach out to us anytime.
                </p>
                <div className="flex justify-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1D6FF2] text-white text-sm font-medium hover:bg-[#1858D0] transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Contact Us
                  </Link>
                  <a
                    href="https://wa.me/211929385157"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="container text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} Learn With John. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
