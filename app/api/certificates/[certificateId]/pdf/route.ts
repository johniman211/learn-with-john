export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { generateCertificateBuffer } from "@/lib/certificate-pdf";

export async function GET(
  req: Request,
  { params }: { params: { certificateId: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const certificate = await db.certificate.findUnique({
      where: { id: params.certificateId },
      include: {
        profile: { select: { name: true } },
        course: { select: { title: true } },
      },
    });

    if (!certificate) {
      return new NextResponse("Certificate not found", { status: 404 });
    }

    if (certificate.profileId !== profile.id && profile.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const pdfBuffer = await generateCertificateBuffer({
      studentName: certificate.profile.name,
      courseName: certificate.course.title,
      issueDate: certificate.issueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      uniqueCode: certificate.uniqueCode,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${certificate.uniqueCode}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[CERTIFICATE_PDF]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
