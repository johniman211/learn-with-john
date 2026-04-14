import { redirect } from "next/navigation";

// This route group page conflicts with app/page.tsx at "/".
// Redirect to root which is handled by app/page.tsx.
export default function MarketingRedirect() {
  redirect("/");
}
