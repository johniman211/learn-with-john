import axios from "axios";
import type { PaymentInitInput } from "./index";
import type { PaymentInitResult } from "./whatsapp-manual";

async function getPayPalToken(credentials: Record<string, string>, isLive: boolean): Promise<string> {
  const baseUrl = isLive ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const auth = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString("base64");
  const res = await axios.post(
    `${baseUrl}/v1/oauth2/token`,
    "grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return res.data.access_token;
}

export async function processPaypal(input: PaymentInitInput): Promise<PaymentInitResult> {
  const { credentials, orderId, amount, currency, courseName, callbackUrl, environment } = input;
  const isLive = (credentials.environment || environment) === "live";
  const baseUrl = isLive ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

  // PayPal only supports certain currencies
  const supportedCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CNY", "CHF", "HKD", "SGD", "SEK", "DKK", "PLN", "NOK", "CZK", "ILS", "MXN", "BRL", "MYR", "PHP", "THB", "TWD", "NZD"];
  const paypalCurrency = supportedCurrencies.includes(currency) ? currency : "USD";

  try {
    const token = await getPayPalToken(credentials, isLive);

    const res = await axios.post(
      `${baseUrl}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId,
            description: `Enrollment: ${courseName}`,
            amount: {
              currency_code: paypalCurrency,
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${callbackUrl}?gateway=paypal&order=${orderId}`,
          cancel_url: `${callbackUrl}?gateway=paypal&order=${orderId}&cancelled=1`,
          brand_name: "Learn With John",
        },
      },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    const approveLink = res.data.links?.find((l: { rel: string }) => l.rel === "approve");
    if (approveLink) {
      return {
        success: true,
        redirectUrl: approveLink.href,
        transactionRef: res.data.id,
      };
    }

    return {
      success: false,
      error: "No approval link from PayPal",
      gatewayResponse: res.data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    return {
      success: false,
      error: err.message || "PayPal payment initiation failed",
      gatewayResponse: err.response?.data,
    };
  }
}
