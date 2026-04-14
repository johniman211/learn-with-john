"use client";

import { Award, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintCertificateProps {
  studentName: string;
  courseTitle: string;
  issueDate: string;
  uniqueCode: string;
}

export function PrintCertificate({
  studentName,
  courseTitle,
  issueDate,
  uniqueCode,
}: PrintCertificateProps) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-8 px-4">
      {/* Print button - hidden on print */}
      <div className="max-w-4xl mx-auto mb-4 print:hidden">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Certificate
        </Button>
      </div>

      {/* Certificate */}
      <div className="max-w-4xl mx-auto bg-white border-2 border-[#1D6FF2] rounded-lg shadow-lg print:shadow-none print:rounded-none print:border-4">
        <div className="p-12 md:p-16 text-center space-y-8">
          {/* Header ornament */}
          <div className="border-b-2 border-[#1D6FF2]/20 pb-8">
            <p className="text-sm font-bold tracking-[0.3em] text-[#1D6FF2] uppercase mb-2">
              Learn With John
            </p>
            <div className="flex justify-center">
              <Award className="h-16 w-16 text-[#1D6FF2]" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
              Certificate of Completion
            </h1>
            <p className="text-gray-500 text-sm">This is to certify that</p>
          </div>

          {/* Student name */}
          <div className="py-4">
            <p className="text-3xl md:text-4xl font-serif font-bold text-[#1D6FF2] border-b-2 border-[#1D6FF2]/30 inline-block pb-2 px-8">
              {studentName}
            </p>
          </div>

          {/* Course */}
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">
              has successfully completed the course
            </p>
            <p className="text-xl md:text-2xl font-semibold text-gray-900">
              {courseTitle}
            </p>
          </div>

          {/* Footer details */}
          <div className="border-t-2 border-[#1D6FF2]/20 pt-8 mt-8">
            <div className="flex justify-between items-end max-w-md mx-auto">
              <div className="text-left">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Issue Date
                </p>
                <p className="text-sm font-medium text-gray-700">{issueDate}</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-gray-400 mb-1" />
                <p className="text-xs text-gray-400">Instructor</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Certificate ID
                </p>
                <p className="text-xs font-mono text-gray-500">{uniqueCode}</p>
              </div>
            </div>
          </div>

          {/* Verification link */}
          <p className="text-[10px] text-gray-400">
            Verify at: {typeof window !== "undefined" ? window.location.origin : ""}/verify/{uniqueCode}
          </p>
        </div>
      </div>
    </div>
  );
}
