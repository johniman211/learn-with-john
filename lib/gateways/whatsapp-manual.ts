import type { PaymentInitInput } from "./index";

export interface PaymentInitResult {
  success: boolean;
  redirectUrl?: string;
  whatsappUrl?: string;
  bankDetails?: Record<string, string>;
  waitForSTK?: boolean;
  transactionRef?: string;
  error?: string;
  gatewayResponse?: unknown;
}

export async function processWhatsAppManual(input: PaymentInitInput): Promise<PaymentInitResult> {
  const { credentials, orderId, amount, currency, courseName, studentName } = input;

  const momoNumber = credentials.momo_number || "+211929385157";
  const whatsappNumber = credentials.whatsapp_number || "+211929385157";
  const accountName = credentials.account_name || "John";
  const instructions = credentials.payment_instructions || "";

  const message = `*New Course Payment*%0A%0A*Student:* ${encodeURIComponent(studentName)}%0A*Course:* ${encodeURIComponent(courseName)}%0A*Amount:* ${currency} ${amount}%0A*Order ID:* ${orderId}%0A%0A*Send Mobile Money to:*%0ANumber: ${momoNumber}%0AName: ${accountName}%0A%0A${instructions ? encodeURIComponent(instructions) + "%0A%0A" : ""}Please send your payment confirmation screenshot here.`;

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;

  return {
    success: true,
    whatsappUrl,
    transactionRef: orderId,
  };
}
