"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function signUp(formData: {
  name: string;
  email: string;
  password: string;
}) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create Profile row in the database
  if (data.user) {
    try {
      await db.profile.create({
        data: {
          userId: data.user.id,
          name: formData.name,
          email: formData.email,
        },
      });
    } catch {
      // Profile may already exist via DB trigger
    }
  }

  return { success: "Check your email to confirm your account." };
}

export async function signIn(formData: {
  email: string;
  password: string;
}) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Signed in successfully." };
}

export async function signOut() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function resetPassword(email: string) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password/update`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for the password reset link." };
}

export async function updatePassword(password: string) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password updated successfully." };
}

export async function getSession() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const user = await getUser();
  if (!user) return null;

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
  });

  return profile;
}
