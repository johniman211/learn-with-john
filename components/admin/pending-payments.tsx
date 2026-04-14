"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface PendingPurchase {
  id: string;
  amount: number;
  currency: string;
  orderTrackingId: string | null;
  gatewayCode: string | null;
  createdAt: string;
  profile: { id: string; name: string; email: string };
  course: { id: string; title: string; imageUrl: string | null };
}

export function PendingPayments() {
  const [purchases, setPurchases] = useState<PendingPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPending = useCallback(async () => {
    try {
      const res = await axios.get("/api/admin/payments/pending");
      setPurchases(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleConfirm = async (purchaseId: string) => {
    setProcessing(purchaseId);
    try {
      const res = await axios.post(`/api/admin/payments/${purchaseId}/confirm`);
      toast.success("Payment confirmed! Student now has access.");
      if (res.data.whatsappLink) {
        window.open(res.data.whatsappLink, "_blank");
      }
      await fetchPending();
    } catch {
      toast.error("Failed to confirm payment");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (purchaseId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setProcessing(purchaseId);
    try {
      const res = await axios.post(`/api/admin/payments/${purchaseId}/reject`, {
        reason: rejectReason,
      });
      toast.success("Payment rejected");
      if (res.data.whatsappLink) {
        window.open(res.data.whatsappLink, "_blank");
      }
      setRejectId(null);
      setRejectReason("");
      await fetchPending();
    } catch {
      toast.error("Failed to reject payment");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-yellow-600" />
        <h2 className="text-lg font-semibold">Pending Manual Payments</h2>
        {purchases.length > 0 && (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">
            {purchases.length}
          </Badge>
        )}
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No pending payments to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{purchase.profile.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {purchase.gatewayCode === "bank_transfer" ? "Bank Transfer" : "WhatsApp"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{purchase.profile.email}</p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">{purchase.course.title}</span>
                      <span className="text-muted-foreground"> — </span>
                      <span className="font-bold text-blue-600">
                        {purchase.currency} {purchase.amount.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Order: {purchase.orderTrackingId} • {format(new Date(purchase.createdAt), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {rejectId === purchase.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Rejection reason..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="rounded-md border px-2 py-1.5 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleReject(purchase.id)}
                          disabled={processing === purchase.id}
                        >
                          {processing === purchase.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reject"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => { setRejectId(null); setRejectReason(""); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleConfirm(purchase.id)}
                          disabled={processing === purchase.id}
                        >
                          {processing === purchase.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          Confirm & Notify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setRejectId(purchase.id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
