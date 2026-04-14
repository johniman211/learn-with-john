import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/auth-actions";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <Sidebar role={profile.role as "ADMIN" | "STUDENT"} />
      </div>
      <div className="flex-1 lg:pl-64 transition-all duration-300">
        <Navbar
          profileName={profile.name}
          role={profile.role as "ADMIN" | "STUDENT"}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
