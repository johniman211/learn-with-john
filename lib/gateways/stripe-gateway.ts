import axios from "axios";
import type { PaymentInitInput } from "./index";
import type { PaymentInitResult } from "./whatsapp-manual";

export async function processStripe(input: PaymentInitInput): Promise<PaymentInitResult> {
  const { credentials, orderId, amount, currency, courseName, studentEmail, callbackUrl } = input;

  try {
    const secretKey = credentials.secret_key;

    // Create Stripe Checkout Session
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", `${callbackUrl}?gateway=stripe&order=${orderId}&session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${callbackUrl}?gateway=stripe&order=${orderId}&cancelled=1`);
    params.append("customer_email", studentEmail);
    params.append("client_reference_id", orderId);
    // Stripe supports most currencies but not SSP; fallback to USD
    const stripeCurrency = ["SSP"].includes(currency) ? "usd" : currency.toLowerCase();
    params.append("line_items[0][price_data][currency]", stripeCurrency);
    params.append("line_items[0][price_data][unit_amount]", Math.round(amount * 100).toString());
    params.append("line_items[0][price_data][product_data][name]", courseName);
    params.append("line_items[0][price_data][product_data][description]", `Course enrollment - Learn With John`);
    params.append("line_items[0][quantity]", "1");
    params.append("metadata[order_id]", orderId);

    const res = await axios.post(
      "https://api.stripe.com/v1/checkout/sessions",
      params.toString(),
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (res.data.url) {
      return {
        success: true,
        redirectUrl: res.data.url,
        transactionRef: res.data.id,
      };
    }

    return {
      success: false,
      error: "Failed to create Stripe checkout session",
      gatewayResponse: res.data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    return {
      success: false,
      error: err.message || "Stripe payment initiation failed",
      gatewayResponse: err.response?.data,
    };
  }
}
