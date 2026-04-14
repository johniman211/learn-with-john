"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  ChevronDown,
  Send,
  Phone,
  Clock,
  BookOpen,
  Shield,
  CreditCard,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const faqCategories = [
  {
    title: "Getting Started",
    icon: BookOpen,
    faqs: [
      {
        q: "How do I enroll in a course?",
        a: "Browse our courses from the 'Browse Courses' page in your dashboard. Click on any course to see its details, then click the 'Enroll' or 'Buy Now' button. Once enrolled, the course will appear in your 'My Learning' section.",
      },
      {
        q: "Can I access courses on my phone?",
        a: "Yes! Our platform is fully responsive and works on all devices — phones, tablets, and computers. Simply open your browser and log in to access your courses anywhere.",
      },
      {
        q: "How do I track my progress?",
        a: "Your progress is tracked automatically. Visit your dashboard to see an overview, or go to 'My Learning' to see completion percentages for each course. Lessons are marked as complete after you watch the video or click 'Mark Complete'.",
      },
    ],
  },
  {
    title: "Payments & Billing",
    icon: CreditCard,
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept mobile money payments (MTN, Airtel) and other local payment methods available in South Sudan. All payments are processed securely.",
      },
      {
        q: "Can I get a refund?",
        a: "If you're not satisfied with a course, please contact us within 7 days of purchase. We'll review your request and process a refund if eligible.",
      },
      {
        q: "How do I apply a coupon code?",
        a: "During checkout, you'll see a 'Coupon Code' field. Enter your code and click 'Apply'. The discount will be reflected in your total before payment.",
      },
    ],
  },
  {
    title: "Certificates",
    icon: Award,
    faqs: [
      {
        q: "How do I earn a certificate?",
        a: "Complete all lessons in a course to unlock your certificate. Once all lessons are marked as complete, a certificate banner will appear on the course page where you can generate and download your certificate as a PDF.",
      },
      {
        q: "Are certificates recognized?",
        a: "Our certificates verify that you have completed the course and acquired the skills taught. They can be shared on your LinkedIn profile or included in your CV/resume.",
      },
    ],
  },
  {
    title: "Account & Privacy",
    icon: Shield,
    faqs: [
      {
        q: "How do I change my password?",
        a: "Go to Settings in your dashboard, then navigate to the password section. Enter your current password and your new password to update it.",
      },
      {
        q: "How do I update my profile?",
        a: "Go to Settings in your dashboard. You can update your name, profile picture, and other details from there.",
      },
      {
        q: "Is my data safe?",
        a: "Yes, we take your privacy seriously. Your personal information is encrypted and never shared with third parties. We use industry-standard security practices to protect your data.",
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const text = `*Help & Support Request*%0A%0A*Subject:* ${encodeURIComponent(contactForm.subject)}%0A%0A*Message:*%0A${encodeURIComponent(contactForm.message)}`;
    window.open(`https://wa.me/211929385157?text=${text}`, "_blank");
    toast.success("Opening WhatsApp...");
    setContactForm({ subject: "", message: "" });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
          <HelpCircle className="h-7 w-7 text-[#1D6FF2]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Help & Support
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
          Find answers to common questions or reach out to us directly.
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <a
          href="mailto:learnwithjohn17@gmail.com"
          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[#1D6FF2]/50 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1D6FF2]/10 transition-colors">
            <Mail className="h-5 w-5 text-[#1D6FF2]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Email Us</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">learnwithjohn17@gmail.com</p>
          </div>
        </a>

        <a
          href="https://wa.me/211929385157"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-green-500/50 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/10 transition-colors">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">WhatsApp</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Chat with us</p>
          </div>
        </a>

        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Response Time</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Within 24 hours</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5 text-[#1D6FF2]" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {faqCategories.map((cat, idx) => (
            <button
              key={cat.title}
              onClick={() => {
                setActiveCategory(idx);
                setOpenFaq(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeCategory === idx
                  ? "bg-[#1D6FF2] text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <cat.icon className="h-4 w-4" />
              {cat.title}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-2">
          {faqCategories[activeCategory].faqs.map((faq, idx) => {
            const faqId = `${activeCategory}-${idx}`;
            const isOpen = openFaq === faqId;

            return (
              <div
                key={faqId}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faqId)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Form */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Send className="h-5 w-5 text-[#1D6FF2]" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Send Us a Message via WhatsApp
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              placeholder="What do you need help with?"
              className="w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#1D6FF2] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Message
            </label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              placeholder="Describe your issue or question in detail..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#1D6FF2] focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-semibold transition-colors"
          >
            <Phone className="h-4 w-4" />
            Send via WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}
