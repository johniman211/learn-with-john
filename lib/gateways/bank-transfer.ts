import type { PaymentInitInput } from "./index";
import type { PaymentInitResult } from "./whatsapp-manual";

export async function processBankTransfer(input: PaymentInitInput): Promise<PaymentInitResult> {
  const { credentials, orderId } = input;

  return {
    success: true,
    bankDetails: {
      bank_name: credentials.bank_name || "",
      account_name: credentials.account_name || "",
      account_number: credentials.account_number || "",
      branch: credentials.branch || "",
      swift_code: credentials.swift_code || "",
      additional_instructions: credentials.additional_instructions || "",
    },
    transactionRef: orderId,
  };
}
