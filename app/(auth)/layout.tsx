import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Hero section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-[#1D6FF2] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="text-white max-w-lg relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-10">
            <GraduationCap className="h-10 w-10 text-[#1D6FF2]" />
            <span className="text-2xl font-bold">Learn With John</span>
          </Link>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Build real digital skills.
            <br />
            <span className="text-[#1D6FF2]">Earn real money.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            South Sudan&apos;s first digital skills platform. Learn web design, AI tools,
            freelancing and more — taught by someone who understands your situation.
          </p>
          <div className="mt-10 flex items-center gap-6 text-sm text-white/50">
            <span>✓ No experience needed</span>
            <span>✓ Pay with mobile money</span>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 bg-[#F4F7FF] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-[#1D6FF2]" />
              <span className="text-lg font-bold">Learn With John</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
