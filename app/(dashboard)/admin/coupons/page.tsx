import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { CouponManager } from "@/components/admin/coupon-manager";

export default async function AdminCouponsPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    return redirect("/student");
  }

  const coupons = await db.coupon.findMany({
    include: { course: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  const courses = await db.course.findMany({
    where: { profileId: profile.id },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage discount coupons
        </p>
      </div>

      <CouponManager
        initialCoupons={JSON.parse(JSON.stringify(coupons))}
        courses={courses}
      />
    </div>
  );
}
