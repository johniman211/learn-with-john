import axios from "axios";
import type { PaymentInitInput } from "./index";
import type { PaymentInitResult } from "./whatsapp-manual";

export async function processCoinbase(input: PaymentInitInput): Promise<PaymentInitResult> {
  const { credentials, orderId, amount, currency, courseName, studentName, callbackUrl } = input;

  try {
    const res = await axios.post(
      "https://api.commerce.coinbase.com/charges",
      {
        name: `Learn With John - ${courseName}`,
        description: `Course enrollment for ${studentName}`,
        pricing_type: "fixed_price",
        local_price: {
          amount: amount.toFixed(2),
          currency,
        },
        metadata: {
          order_id: orderId,
        },
        redirect_url: `${callbackUrl}?gateway=coinbase&order=${orderId}`,
        cancel_url: `${callbackUrl}?gateway=coinbase&order=${orderId}&cancelled=1`,
      },
      {
        headers: {
          "X-CC-Api-Key": credentials.api_key,
          "X-CC-Version": "2018-03-22",
          "Content-Type": "application/json",
        },
      }
    );

    if (res.data.data?.hosted_url) {
      return {
        success: true,
        redirectUrl: res.data.data.hosted_url,
        transactionRef: res.data.data.code,
      };
    }

    return {
      success: false,
      error: "Failed to create Coinbase charge",
      gatewayResponse: res.data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    return {
      success: false,
      error: err.message || "Coinbase payment initiation failed",
      gatewayResponse: err.response?.data,
    };
  }
}
