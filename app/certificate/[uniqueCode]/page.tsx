import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PrintCertificate } from "@/components/course/print-certificate";

interface CertificatePageProps {
  params: { uniqueCode: string };
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const certificate = await db.certificate.findUnique({
    where: { uniqueCode: params.uniqueCode },
    include: {
      profile: { select: { name: true } },
      course: { select: { title: true } },
    },
  });

  if (!certificate) {
    notFound();
  }

  return (
    <PrintCertificate
      studentName={certificate.profile.name}
      courseTitle={certificate.course.title}
      issueDate={certificate.issueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
      uniqueCode={certificate.uniqueCode}
    />
  );
}
