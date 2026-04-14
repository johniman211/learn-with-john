"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Loader2,
  X,
  CreditCard,
  Smartphone,
  Building2,
  HandCoins,
  AlertTriangle,
  CheckCircle,
  Phone,
  ArrowRight,
  Shield,
} from "lucide-react";

interface ActiveGateway {
  code: string;
  name: string;
  displayName: string | null;
  description: string | null;
  logo: string | null;
  category: string;
  supportedCurrencies: string[];
  feePercent: number;
  feeFixed: number;
  environment: string;
}

interface CheckoutModalProps {
  courseId: string;
  courseName: string;
  price: number;
  currency: string;
  onClose: () => void;
}

const gatewayLogos: Record<string, string> = {
  whatsapp_manual: "/icons/whatsapp.svg",
  pesapal: "/icons/pesapal.svg",
  paypal: "/icons/paypal.svg",
  stripe: "/icons/stripe.svg",
  flutterwave: "/icons/flutterwave.svg",
  mpesa: "/icons/mpesa.svg",
  mtn_momo: "/icons/mtn-momo.svg",
  dpo: "/icons/dpo.svg",
  coinbase: "/icons/coinbase.svg",
  bank_transfer: "/icons/bank-transfer.svg",
};

export function CheckoutModal({ courseId, courseName, price, currency, onClose }: CheckoutModalProps) {
  const router = useRouter();
  const [gateways, setGateways] = useState<ActiveGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<Record<string, string> | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const allSandbox = gateways.length > 0 && gateways.every((g) => g.environment === "sandbox");
  const needsPhone = selected && ["mpesa", "mtn_momo"].includes(selected);

  const fetchGateways = useCallback(async () => {
    try {
      const res = await axios.get("/api/payment/gateways");
      setGateways(res.data);
    } catch {
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  // Poll for payment status
  useEffect(() => {
    if (!orderId || paymentStatus === "COMPLETED") return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/payment/status?orderId=${orderId}`);
        if (res.data.status === "COMPLETED") {
          setPaymentStatus("COMPLETED");
          toast.success("Payment confirmed! Redirecting...");
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/student/courses/${courseId}`);
            router.refresh();
          }, 2000);
        } else if (res.data.status === "FAILED") {
          setPaymentStatus("FAILED");
          clearInterval(interval);
        }
      } catch {
        // silent
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId, paymentStatus, courseId, router]);

  const handleCheckout = async () => {
    if (!selected) {
      toast.error("Please select a payment method");
      return;
    }

    if (needsPhone && !phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setProcessing(true);
    try {
      const res = await axios.post("/api/payment/checkout", {
        courseId,
        gatewayCode: selected,
        couponCode: couponCode || undefined,
        phoneNumber: phoneNumber || undefined,
      });

      const data = res.data;
      setOrderId(data.orderId);

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      if (data.whatsappUrl) {
        setWhatsappUrl(data.whatsappUrl);
        setPaymentStatus("WAITING_WHATSAPP");
        window.open(data.whatsappUrl, "_blank");
        return;
      }

      if (data.bankDetails) {
        setBankDetails(data.bankDetails);
        setPaymentStatus("WAITING_BANK");
        return;
      }

      if (data.waitForSTK) {
        setPaymentStatus("WAITING_STK");
        return;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Waiting screens
  if (paymentStatus === "COMPLETED") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Confirmed!</h2>
          <p className="text-muted-foreground text-sm">You now have full access to {courseName}. Redirecting...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "WAITING_STK") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <Smartphone className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold mb-2">Check Your Phone</h2>
          <p className="text-muted-foreground text-sm mb-4">
            A payment prompt has been sent to your phone. Enter your PIN to complete the payment.
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Waiting for confirmation... Checking every 10 seconds</p>
          <Button variant="outline" className="mt-4" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    );
  }

  if (paymentStatus === "WAITING_WHATSAPP") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <HandCoins className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Complete Your Payment</h2>
          <p className="text-muted-foreground text-sm mb-4">
            A WhatsApp message has been opened. Send the payment details and screenshot of your payment confirmation.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-left text-sm space-y-1 mb-4">
            <p><strong>Course:</strong> {courseName}</p>
            <p><strong>Amount:</strong> {currency} {price.toLocaleString()}</p>
            <p><strong>Order ID:</strong> {orderId}</p>
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-green-500 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground mb-4">Waiting for admin to confirm your payment...</p>
          {whatsappUrl && (
            <Button
              variant="outline"
              className="mb-2"
              onClick={() => window.open(whatsappUrl, "_blank")}
            >
              Reopen WhatsApp
            </Button>
          )}
          <br />
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  if (paymentStatus === "WAITING_BANK" && bankDetails) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-8">
          <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-center">Bank Transfer Details</h2>
          <p className="text-muted-foreground text-sm text-center mb-4">
            Transfer the exact amount below and wait for confirmation.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2 mb-4">
            <p><strong>Amount:</strong> {currency} {price.toLocaleString()}</p>
            <p><strong>Order ID:</strong> {orderId}</p>
            {bankDetails.bank_name && <p><strong>Bank:</strong> {bankDetails.bank_name}</p>}
            {bankDetails.account_name && <p><strong>Account Name:</strong> {bankDetails.account_name}</p>}
            {bankDetails.account_number && <p><strong>Account Number:</strong> {bankDetails.account_number}</p>}
            {bankDetails.branch && <p><strong>Branch:</strong> {bankDetails.branch}</p>}
            {bankDetails.swift_code && <p><strong>SWIFT:</strong> {bankDetails.swift_code}</p>}
            {bankDetails.additional_instructions && (
              <p className="text-xs text-muted-foreground mt-2">{bankDetails.additional_instructions}</p>
            )}
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground text-center mb-4">Waiting for admin confirmation...</p>
          <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  if (paymentStatus === "FAILED") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
          <p className="text-muted-foreground text-sm mb-4">Something went wrong with your payment. Please try again.</p>
          <Button
            className="bg-[#1D6FF2] hover:bg-[#1858D0] text-white"
            onClick={() => {
              setPaymentStatus(null);
              setOrderId(null);
              setSelected(null);
            }}
          >
            Try Different Method
          </Button>
        </div>
      </div>
    );
  }

  // Main checkout UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">Choose Payment Method</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {courseName} — <span className="font-bold text-blue-600">{currency} {price.toLocaleString()}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sandbox Banner */}
        {allSandbox && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                <strong>Test Mode</strong> — No real payments will be processed.
              </p>
            </div>
          </div>
        )}

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : gateways.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Payment is being set up</p>
              <p className="text-xs text-muted-foreground mt-1">Please contact support for enrollment assistance.</p>
            </div>
          ) : (
            <>
              {/* Gateway Selection */}
              <div className="space-y-2">
                {gateways.map((gw) => (
                  <button
                    key={gw.code}
                    onClick={() => setSelected(gw.code)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      selected === gw.code
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                        : "border-transparent bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`rounded-lg overflow-hidden shrink-0 ${selected === gw.code ? "ring-2 ring-blue-400" : ""}`}>
                      {gatewayLogos[gw.code] ? (
                        <Image
                          src={gatewayLogos[gw.code]}
                          alt={gw.name}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                      ) : (
                        <div className={`p-2.5 ${selected === gw.code ? "bg-blue-100 dark:bg-blue-900/40" : "bg-muted"}`}>
                          <CreditCard className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{gw.displayName || gw.name}</span>
                        {gw.environment === "sandbox" && (
                          <Badge className="text-[9px] px-1 py-0 bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">
                            Test
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{gw.description}</p>
                    </div>
                    {gw.feePercent > 0 && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        +{gw.feePercent}%
                      </span>
                    )}
                    <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selected === gw.code ? "border-blue-500" : "border-gray-300"
                    }`}>
                      {selected === gw.code && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Phone Number Input for STK push gateways */}
              {needsPhone && (
                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    <Phone className="h-3.5 w-3.5 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={selected === "mpesa" ? "e.g. 0712345678" : "e.g. +256712345678"}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Coupon */}
              <div>
                <label className="text-xs font-medium block mb-1">Have a coupon?</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {gateways.length > 0 && (
          <div className="p-5 border-t">
            <Button
              className="w-full bg-[#1D6FF2] hover:bg-[#1858D0] text-white h-11"
              onClick={handleCheckout}
              disabled={!selected || processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              {processing ? "Processing..." : `Pay ${currency} ${price.toLocaleString()}`}
            </Button>
            <div className="flex items-center justify-center gap-1 mt-3">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">Secure payment • 256-bit encryption</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
