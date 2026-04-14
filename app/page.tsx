import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { FAQSection } from "@/components/marketing/faq-section";
import { HeroLanding } from "@/components/marketing/hero-landing";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { Feature1 } from "@/components/ui/feature-1";
import { About3 } from "@/components/ui/about-3";
import { Hero } from "@/components/ui/animated-hero";
import { ServiceCard } from "@/components/ui/service-card";
import ServicesSection from "@/components/ui/services";
import { InstructorAbout } from "@/components/marketing/instructor-about";
import { Features4 } from "@/components/ui/features-4";
import { Header1 } from "@/components/ui/header-1";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A1628] text-white">
      {/* SECTION 10: Sticky Navigation */}
      <Header1 />

      <main className="flex-1">
        {/* SECTION 01: Animated Hero */}
        <HeroLanding />

        {/* SECTION 02: Animated Testimonials */}
        <TestimonialsSection />

        {/* SECTION 03: The Problem */}
        <Features4
          heading="You're Smart. You're Motivated. So Why Is It Still Hard to Make Money Online?"
          subheading="Because most online courses were built for America, Europe, and Nigeria — not for South Sudan. Here's what's been holding you back."
        />

        {/* SECTION 03b: Feature Highlight */}
        <div className="border-y border-white/10 bg-white/[0.02] [&_section]:!py-20 [&_h1]:!text-white [&_p]:!text-white/60 [&_a]:!no-underline [&_button]:!text-white [&_button]:!border-white/20 [&_button:first-of-type]:!bg-[#1D6FF2] [&_button:first-of-type]:!text-black">
          <Feature1
            title="South Sudan's First Digital Skills Platform"
            description="Real skills. Real instructor. Built for real life in South Sudan. Learn web design, AI tools, freelancing, and more — all from your phone. Pay with mobile money. Get a certificate when you finish."
            imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
            imageAlt="Students learning digital skills together"
            buttonPrimary={{
              label: "Start Learning",
              href: "/sign-up",
            }}
            buttonSecondary={{
              label: "Browse Courses",
              href: "/student/courses",
            }}
          />
        </div>

        {/* SECTION 04: Introducing Learn With John */}
        <div className="bg-white/[0.02] border-y border-white/10">
          <ServicesSection
            heading="Introducing Learn With John"
            subheading="South Sudan's First Digital Skills Platform — real skills for real life."
            services={[
              {
                title: "Learn at Your Own Pace",
                image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=512&auto=format&fit=crop",
                overlayImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=512&auto=format&fit=crop",
              },
              {
                title: "Skills That Actually Pay",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=512&auto=format&fit=crop",
                overlayImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=512&auto=format&fit=crop",
              },
              {
                title: "Get a Certificate",
                image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=512&auto=format&fit=crop",
                overlayImage: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=512&auto=format&fit=crop",
              },
              {
                title: "Built for South Sudan",
                image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=512&auto=format&fit=crop",
                overlayImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=512&auto=format&fit=crop",
              },
            ]}
          />
        </div>

        {/* SECTION 05: Our Courses */}
        <section className="py-20 md:py-28">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Our Courses</h2>
              <p className="text-white/60 mt-3">Pick a skill. Start learning. Start earning.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ServiceCard
                title="Web Design & AI Website Building"
                href="/sign-up"
                imgSrc="https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=320&auto=format&fit=crop"
                imgAlt="Web design illustration"
                variant="gold"
                className="min-h-[180px] text-black"
              />
              <ServiceCard
                title="Make Money Online from South Sudan"
                href="/sign-up"
                imgSrc="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=320&auto=format&fit=crop"
                imgAlt="Money and freelancing"
                variant="emerald"
                className="min-h-[180px]"
              />
              <ServiceCard
                title="AI Tools for Work & Business"
                href="/sign-up"
                imgSrc="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=320&auto=format&fit=crop"
                imgAlt="AI tools illustration"
                variant="blue"
                className="min-h-[180px]"
              />
              <ServiceCard
                title="Freelancing Fundamentals"
                href="/sign-up"
                imgSrc="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=320&auto=format&fit=crop"
                imgAlt="Freelancer working on laptop"
                variant="red"
                className="min-h-[180px]"
              />
            </div>
          </div>
        </section>

        {/* SECTION 05b: About */}
        <div className="border-y border-white/10 bg-white/[0.02] [&_section]:!py-20 [&_h1]:!text-white [&_h2]:!text-white [&_p]:!text-white/60 [&_.bg-muted]:!bg-white/5 [&_span]:!text-white [&_button]:!text-white [&_button]:!border-white/20">
          <About3
            title="About Learn With John"
            description="A passionate team dedicated to empowering South Sudanese youth with practical digital skills that translate into real income — built by someone who understands the local context."
            mainImage={{
              src: "/images/john.jpeg",
              alt: "John — Digital Skills Trainer, Juba",
            }}
            secondaryImage={{
              src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
              alt: "Students in a classroom",
            }}
            breakout={{
              src: "",
              alt: "Learn With John",
              title: "Learn With John — Juba, South Sudan",
              description: "Courses designed for complete beginners. No jargon. No assumptions. Just practical skills you can use the same week you learn them.",
              buttonText: "Start Learning",
              buttonUrl: "/sign-up",
            }}
            achievementsTitle="Our Impact in Numbers"
            achievementsDescription="Empowering South Sudanese youth and entrepreneurs with practical digital skills since 2024."
            achievements={[
              { label: "Active Students", value: "500+" },
              { label: "Courses Available", value: "10+" },
              { label: "Completion Rate", value: "95%" },
              { label: "Cities Reached", value: "5+" },
            ]}
          />
        </div>

        {/* SECTION 06: Instructor Bio */}
        <section className="py-20 md:py-28 bg-white/[0.02] border-y border-white/10">
          <div className="container max-w-5xl mx-auto">
            <p className="text-sm font-medium tracking-widest text-[#1D6FF2] text-center mb-8">
              YOUR INSTRUCTOR
            </p>
            <InstructorAbout />
            <div className="mt-8 text-center">
              <Link href="/sign-up">
                <Button variant="link" className="text-[#1D6FF2] text-lg font-semibold hover:text-[#1858D0]">
                  Join 500+ students already learning with John
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 07: Free Access */}
        <section className="py-20 md:py-28">
          <div className="container max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 mb-6">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Limited Time</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              All Courses Are
              <br />
              <span className="text-blue-400">Completely Free.</span>
            </h2>
            <p className="text-white/60 mt-4 text-lg">
              We&apos;re in our testing phase — every course on the platform is 100% free.
              Sign up, enroll, and start learning today. No payment needed.
            </p>

            <div className="mt-8 p-6 rounded-xl border border-blue-500/30 bg-blue-500/5 inline-block">
              <div className="flex items-center gap-3 text-sm">
                <Zap className="h-5 w-5 text-blue-400" />
                <span className="text-white/80">Instant access</span>
                <span className="text-white/30">|</span>
                <GraduationCap className="h-5 w-5 text-blue-400" />
                <span className="text-white/80">All courses included</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-blue-400">
                No credit card. No mobile money. Just sign up and learn.
              </p>
            </div>

            <div className="mt-8">
              <Link href="/sign-up">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-10">
                  Start Learning for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 08: FAQ */}
        <section className="py-20 md:py-28 bg-white/[0.02] border-y border-white/10">
          <div className="container max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <FAQSection />
          </div>
        </section>

        {/* SECTION 09: Animated Final CTA */}
        <div className="[&_h1]:!text-white [&_p]:!text-white/60 [&_a]:!no-underline [&_button]:!border-white/20 [&_button]:!text-white [&_button.gap-4:last-of-type]:!bg-[#1D6FF2] [&_button.gap-4:last-of-type]:!text-black">
          <Hero
            titles={["web design", "freelancing", "AI tools", "real income", "your future"]}
            heading="Start building"
            description="Don't let another month pass watching other people build skills and make money online. The course is here. The instructor is here. The only thing missing is you."
            badgeText="Your first step costs less than a lunch in Juba"
            primaryButton={{
              label: "Enroll Now",
              href: "/sign-up",
            }}
            secondaryButton={{
              label: "Browse Courses",
              href: "/student/courses",
            }}
          />
        </div>
      </main>

      <footer className="border-t border-white/10 py-10 bg-black/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-6 w-6 text-[#1D6FF2]" />
                <span className="font-bold text-lg">Learn With John</span>
              </div>
              <p className="text-sm text-white/50">
                South Sudan&apos;s first digital skills platform. Real skills for real life.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3 text-white/80">Quick Links</h4>
              <div className="space-y-2 text-sm text-white/50">
                <Link href="/courses" className="block hover:text-[#1D6FF2] transition-colors">
                  Courses
                </Link>
                <Link href="/about" className="block hover:text-[#1D6FF2] transition-colors">
                  About
                </Link>
                <Link href="/contact" className="block hover:text-[#1D6FF2] transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3 text-white/80">Contact</h4>
              <div className="space-y-2 text-sm text-white/50">
                <a href="mailto:John@learnwithjohn.com" className="block hover:text-[#1D6FF2] transition-colors">
                  John@learnwithjohn.com
                </a>
                <a href="https://wa.me/211929385157" target="_blank" rel="noopener noreferrer" className="block hover:text-[#1D6FF2] transition-colors">
                  +211 929 385 157
                </a>
                <p className="text-white/40">Gudele 2, Juba, South Sudan</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/30">
            &copy; {new Date().getFullYear()} Learn With John. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
