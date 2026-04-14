import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Target,
  Heart,
  MapPin,
} from "lucide-react";
import { Header1 } from "@/components/ui/header-1";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A1628] text-white">
      <Header1 />

      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium tracking-widest text-[#1D6FF2] mb-4">
              ABOUT US
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Built in Juba.
              <br />
              <span className="text-[#1D6FF2]">Built for South Sudan.</span>
            </h1>
            <p className="mt-6 text-lg text-white/60 leading-relaxed">
              Learn With John is South Sudan&apos;s first digital skills platform —
              created to give every motivated person access to practical,
              income-generating skills regardless of their background.
            </p>
          </div>
        </section>

        <section className="py-16 border-y border-white/10 bg-white/[0.02]">
          <div className="container max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white/5 border-white/10 text-white">
                <CardContent className="pt-8 pb-8 text-center space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-full bg-[#1D6FF2]/10 flex items-center justify-center">
                    <Target className="h-7 w-7 text-[#1D6FF2]" />
                  </div>
                  <h3 className="font-bold text-lg">Our Mission</h3>
                  <p className="text-sm text-white/60">
                    To equip South Sudanese youth and entrepreneurs with digital
                    skills that translate directly into income and opportunity.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 text-white">
                <CardContent className="pt-8 pb-8 text-center space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-full bg-[#1D6FF2]/10 flex items-center justify-center">
                    <Heart className="h-7 w-7 text-[#1D6FF2]" />
                  </div>
                  <h3 className="font-bold text-lg">Our Values</h3>
                  <p className="text-sm text-white/60">
                    Accessibility, practicality, and local relevance. Every course
                    is designed for our context — mobile-first, affordable, no jargon.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 text-white">
                <CardContent className="pt-8 pb-8 text-center space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-full bg-[#1D6FF2]/10 flex items-center justify-center">
                    <MapPin className="h-7 w-7 text-[#1D6FF2]" />
                  </div>
                  <h3 className="font-bold text-lg">Where We Are</h3>
                  <p className="text-sm text-white/60">
                    Based in Gudele 2, Juba, South Sudan. Our
                    online platform reaches learners across South Sudan and beyond.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container max-w-3xl mx-auto">
            <p className="text-sm font-medium tracking-widest text-[#1D6FF2] text-center mb-4">
              MEET YOUR INSTRUCTOR
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              John
            </h2>

            <div className="flex justify-center mb-10">
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden ring-4 ring-[#1D6FF2]/30 shadow-2xl">
                <Image
                  src="/images/john.jpeg"
                  alt="John — Digital Skills Trainer"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>

            <div className="space-y-4 text-white/70 text-lg leading-relaxed">
              <p>
                I&apos;ve spent years teaching digital skills in Juba. At CB Technology
                Training Center in Gudele, I&apos;ve helped hundreds of students go from
                zero to confident — building websites, using AI tools, and landing
                their first freelance clients.
              </p>
              <p>
                I built Learn With John because I was tired of watching talented
                South Sudanese people struggle with platforms that weren&apos;t made for
                them. Courses that assume fast internet, bank cards, and Western
                contexts don&apos;t work here.
              </p>
              <p>
                My approach is simple: start from zero, use real examples from our
                daily life, and make sure every student walks away with a skill they
                can use <em>this week</em> to earn money.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-extrabold text-[#1D6FF2]">500+</p>
                <p className="text-sm text-white/50 mt-1">Students Trained</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#1D6FF2]">3+</p>
                <p className="text-sm text-white/50 mt-1">Years Teaching</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#1D6FF2]">100%</p>
                <p className="text-sm text-white/50 mt-1">Beginner Friendly</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-white/10 bg-white/[0.02]">
          <div className="container max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start?
            </h2>
            <p className="text-white/60 mb-8">
              Join hundreds of South Sudanese students already building their future.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-[#1D6FF2] hover:bg-[#1858D0] text-black font-bold px-8"
              >
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
