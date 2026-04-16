import { processWhatsAppManual, type PaymentInitResult } from "./whatsapp-manual";
import { processDPO } from "./dpo";
import { processFlutterwave } from "./flutterwave";
import { processMpesa } from "./mpesa";
import { processMtnMomo } from "./mtn-momo";
import { processPesapal } from "./pesapal-gateway";
import { processStripe } from "./stripe-gateway";
import { processPaypal } from "./paypal-gateway";
import { processCoinbase } from "./coinbase-gateway";
import { processBankTransfer } from "./bank-transfer";

export type { PaymentInitResult };

export interface PaymentInitInput {
  gatewayCode: string;
  credentials: Record<string, string>;
  environment: string;
  orderId: string;
  amount: number;
  currency: string;
  courseName: string;
  courseId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  callbackUrl: string;
  webhookUrl: string;
  appUrl: string;
}

/**
 * Returns a supported currency for the given gateway.
 * If the course currency is not supported, falls back to a default.
 */
export function resolveCurrency(
  currency: string,
  supported: string[],
  fallback: string = "USD"
): string {
  return supported.includes(currency.toUpperCase()) ? currency : fallback;
}

const processors: Record<string, (input: PaymentInitInput) => Promise<PaymentInitResult>> = {
  whatsapp_manual: processWhatsAppManual,
  dpo: processDPO,
  flutterwave: processFlutterwave,
  mpesa: processMpesa,
  mtn_momo: processMtnMomo,
  pesapal: processPesapal,
  stripe: processStripe,
  paypal: processPaypal,
  coinbase: processCoinbase,
  bank_transfer: processBankTransfer,
};

export async function initiatePayment(input: PaymentInitInput): Promise<PaymentInitResult> {
  const processor = processors[input.gatewayCode];
  if (!processor) {
    return { success: false, error: `Unsupported gateway: ${input.gatewayCode}` };
  }
  return processor(input);
}
