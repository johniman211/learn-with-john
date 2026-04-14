"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Loader2, Camera } from "lucide-react";

interface ProfileSettingsFormProps {
  initialName: string;
  initialEmail: string;
  initialImageUrl: string;
  role: string;
}

export function ProfileSettingsForm({
  initialName,
  initialEmail,
  initialImageUrl,
  role,
}: ProfileSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isLoading, setIsLoading] = useState(false);

  const hasChanges = name !== initialName || imageUrl !== initialImageUrl;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      await axios.patch("/api/profile", { name: name.trim(), imageUrl });
      toast.success("Profile updated!");
      router.refresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error?.response?.data?.error || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-muted"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#1D6FF2]/10 flex items-center justify-center border-2 border-muted">
                  <span className="text-lg font-bold text-[#1D6FF2]">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1D6FF2] flex items-center justify-center cursor-pointer hover:bg-[#1858D0] transition-colors">
                <Camera className="h-3 w-3 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Image must be under 2MB");
                      return;
                    }
                    // Convert to base64 data URL for simplicity
                    const reader = new FileReader();
                    reader.onload = () => {
                      setImageUrl(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Click the camera icon to upload a photo</p>
              <p className="text-xs">Max 2MB. JPG, PNG supported.</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input value={initialEmail} disabled className="bg-muted" />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Input
                value={role === "ADMIN" ? "Administrator" : "Student"}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {hasChanges && (
            <>
              <Separator />
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-[#1D6FF2] hover:bg-[#1858D0] text-white"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action="/api/auth/signout" method="POST">
            <Button variant="outline" type="submit" className="w-full">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
