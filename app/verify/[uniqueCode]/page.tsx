import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Award } from "lucide-react";

interface VerifyPageProps {
  params: { uniqueCode: string };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const certificate = await db.certificate.findUnique({
    where: { uniqueCode: params.uniqueCode },
    include: {
      profile: { select: { name: true } },
      course: { select: { title: true } },
    },
  });

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Certificate Not Found</h1>
            <p className="text-muted-foreground">
              This certificate ID does not exist or has been revoked.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="max-w-lg w-full border-2 border-[#1D6FF2]">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-widest text-[#1D6FF2]">
              LEARN WITH JOHN
            </p>
            <Award className="h-16 w-16 text-[#1D6FF2] mx-auto" />
          </div>

          <div>
            <Badge className="bg-[#12B76A] mb-4">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
            <h1 className="text-2xl font-bold">Certificate of Completion</h1>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">This certifies that</p>
            <p className="text-xl font-bold">{certificate.profile.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              has successfully completed the course
            </p>
            <p className="text-lg font-semibold text-[#1D6FF2]">
              {certificate.course.title}
            </p>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Issue Date</span>
              <span className="font-medium">
                {certificate.issueDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Certificate ID</span>
              <span className="font-mono text-xs">{certificate.uniqueCode}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
