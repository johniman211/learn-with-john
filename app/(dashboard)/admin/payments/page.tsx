import { getProfile } from "@/lib/supabase/auth-actions";
import { redirect } from "next/navigation";
import { PaymentDashboard } from "@/components/admin/payment-dashboard";

export default async function PaymentMethodsPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "ADMIN") return redirect("/sign-in");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Payment Methods</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage payment gateways, configure credentials, and review manual payments.
        </p>
      </div>
      <PaymentDashboard />
    </div>
  );
}
