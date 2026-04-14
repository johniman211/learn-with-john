"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, Tag, Copy } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  isPercent: boolean;
  maxUses: number | null;
  timesUsed: number;
  isActive: boolean;
  expiresAt: string | null;
  course: { id: string; title: string } | null;
}

interface CouponManagerProps {
  initialCoupons: Coupon[];
  courses: { id: string; title: string }[];
}

export function CouponManager({ initialCoupons, courses }: CouponManagerProps) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(10);
  const [isPercent, setIsPercent] = useState(true);
  const [maxUses, setMaxUses] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [expiresAt, setExpiresAt] = useState("");

  const resetForm = () => {
    setCode("");
    setDiscount(10);
    setIsPercent(true);
    setMaxUses("");
    setCourseId("all");
    setExpiresAt("");
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    try {
      setIsCreating(true);
      const { data } = await axios.post("/api/admin/coupons", {
        code,
        discount,
        isPercent,
        maxUses: maxUses ? parseInt(maxUses) : null,
        courseId: courseId === "all" ? null : courseId,
        expiresAt: expiresAt || null,
      });
      setCoupons((prev) => [{ ...data, course: null }, ...prev]);
      toast.success("Coupon created!");
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error?.response?.data?.error || "Failed to create coupon");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await axios.patch(`/api/admin/coupons/${id}`, { isActive: !isActive });
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c))
      );
      toast.success(isActive ? "Coupon deactivated" : "Coupon activated");
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/admin/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    } finally {
      setDeletingId(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Copied!");
  };

  return (
    <div className="space-y-6">
      {/* Create Coupon */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Coupon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    min={0}
                  />
                  <Select
                    value={isPercent ? "percent" : "fixed"}
                    onValueChange={(v) => setIsPercent(v === "percent")}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">%</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max Uses (blank = unlimited)</Label>
                <Input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label>Apply to Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expires At (optional)</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={isCreating} className="gap-2">
                {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                Create
              </Button>
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Coupon List */}
      {coupons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No coupons created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
            const isMaxed = coupon.maxUses && coupon.timesUsed >= coupon.maxUses;

            return (
              <Card key={coupon.id} className={!coupon.isActive ? "opacity-60" : ""}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-bold tracking-wider">
                        {coupon.code}
                      </code>
                      <button onClick={() => copyCode(coupon.code)}>
                        <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {coupon.isActive && !isExpired && !isMaxed ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge variant="secondary">
                          {isExpired ? "Expired" : isMaxed ? "Maxed" : "Inactive"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">
                        {coupon.isPercent ? `${coupon.discount}%` : `$${coupon.discount}`}
                      </span>{" "}
                      off
                    </p>
                    {coupon.course && (
                      <p className="text-xs">Course: {coupon.course.title}</p>
                    )}
                    <p className="text-xs">
                      Used: {coupon.timesUsed}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : " (unlimited)"}
                    </p>
                    {coupon.expiresAt && (
                      <p className="text-xs">
                        Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleToggle(coupon.id, coupon.isActive)}
                    >
                      {coupon.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(coupon.id)}
                      disabled={deletingId === coupon.id}
                    >
                      {deletingId === coupon.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
