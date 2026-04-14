import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/auth-actions";
import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form";

export default async function StudentSettingsPage() {
  const profile = await getProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences
        </p>
      </div>

      <ProfileSettingsForm
        initialName={profile.name}
        initialEmail={profile.email}
        initialImageUrl={profile.imageUrl || ""}
        role={profile.role}
      />
    </div>
  );
}
