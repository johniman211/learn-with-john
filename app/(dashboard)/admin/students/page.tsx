import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Award,
  Mail,
} from "lucide-react";

export default async function AdminStudentsPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/student");
  }

  const students = await db.profile.findMany({
    where: { role: "STUDENT" },
    include: {
      purchases: {
        where: { status: "COMPLETED" },
        select: { id: true },
      },
      certificates: {
        select: { id: true },
      },
      lessonProgress: {
        where: { isCompleted: true },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalStudents = students.length;
  const studentsWithCourses = students.filter((s) => s.purchases.length > 0).length;
  const totalCertificates = students.reduce((sum, s) => sum + s.certificates.length, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-sm text-muted-foreground">
          View and manage all registered students
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsWithCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertificates}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium text-center">Courses</th>
                  <th className="p-4 font-medium text-center">Lessons Done</th>
                  <th className="p-4 font-medium text-center">Certificates</th>
                  <th className="p-4 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No students registered yet.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="secondary">
                          {student.purchases.length}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        {student.lessonProgress.length}
                      </td>
                      <td className="p-4 text-center">
                        {student.certificates.length > 0 ? (
                          <Badge className="bg-[#1D6FF2] text-white">
                            {student.certificates.length}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="p-4 text-right text-xs text-muted-foreground">
                        {student.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
