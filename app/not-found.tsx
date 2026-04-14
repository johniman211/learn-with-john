import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  BookOpen,
  Search,
} from "lucide-react";
import { Header1 } from "@/components/ui/header-1";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A1628] text-white">
      <Header1 />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg mx-auto">
          <div className="relative mb-8">
            <p className="text-[120px] md:text-[160px] font-extrabold leading-none text-white/[0.03] select-none">
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#1D6FF2]/10 flex items-center justify-center">
                <Search className="h-10 w-10 text-[#1D6FF2]" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Page Not Found
          </h1>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Don&apos;t worry — let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <Button size="lg" className="bg-[#1D6FF2] hover:bg-[#1858D0] text-black font-semibold gap-2 w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 gap-2 w-full sm:w-auto"
              >
                <BookOpen className="h-4 w-4" />
                Browse Courses
              </Button>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-white/40 mb-4">Looking for one of these?</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/student" className="text-sm text-white/60 hover:text-[#1D6FF2] transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                Student Dashboard
              </Link>
              <Link href="/student/my-courses" className="text-sm text-white/60 hover:text-[#1D6FF2] transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                My Courses
              </Link>
              <Link href="/about" className="text-sm text-white/60 hover:text-[#1D6FF2] transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                About
              </Link>
              <Link href="/contact" className="text-sm text-white/60 hover:text-[#1D6FF2] transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="container text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} Learn With John. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
