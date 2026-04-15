import axios from "axios";
import type { PaymentInitInput } from "./index";
import type { PaymentInitResult } from "./whatsapp-manual";

async function getToken(credentials: Record<string, string>, isLive: boolean): Promise<string> {
  const baseUrl = isLive ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3";
  const res = await axios.post(`${baseUrl}/api/Auth/RequestToken`, {
    consumer_key: credentials.consumer_key,
    consumer_secret: credentials.consumer_secret,
  });
  return res.data.token;
}

export async function processPesapal(input: PaymentInitInput): Promise<PaymentInitResult> {
  const { credentials, orderId, amount, currency, courseName, studentName, studentEmail, callbackUrl, webhookUrl, environment } = input;
  const isLive = (credentials.environment || environment) === "live";
  const baseUrl = isLive ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3";

  try {
    const token = await getToken(credentials, isLive);
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    // Register IPN if no ipn_id
    let ipnId = credentials.ipn_id;
    if (!ipnId) {
      const ipnRes = await axios.post(
        `${baseUrl}/api/URLSetup/RegisterIPN`,
        { url: `${webhookUrl}/api/webhooks/pesapal`, ipn_notification_type: "POST" },
        { headers }
      );
      ipnId = ipnRes.data.ipn_id;
    }

    // Submit order
    const res = await axios.post(
      `${baseUrl}/api/Transactions/SubmitOrderRequest`,
      {
        id: orderId,
        currency,
        amount,
        description: `Enrollment: ${courseName}`,
        callback_url: `${callbackUrl}?gateway=pesapal&order=${orderId}`,
        notification_id: ipnId,
        billing_address: {
          email_address: studentEmail,
          first_name: studentName.split(" ")[0],
          last_name: studentName.split(" ").slice(1).join(" ") || studentName,
        },
      },
      { headers }
    );

    if (res.data.redirect_url) {
      return {
        success: true,
        redirectUrl: res.data.redirect_url,
        transactionRef: res.data.order_tracking_id || orderId,
      };
    }

    return {
      success: false,
      error: "No redirect URL from Pesapal",
      gatewayResponse: res.data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string };
    console.error("[PESAPAL_GATEWAY]", err.message, err.response?.status, JSON.stringify(err.response?.data));
    const detail = typeof err.response?.data === "object" && err.response?.data
      ? (err.response.data as { message?: string; error?: { message?: string } })?.message
        || (err.response.data as { error?: { message?: string } })?.error?.message
        || JSON.stringify(err.response.data)
      : err.message;
    return {
      success: false,
      error: detail || "Pesapal payment initiation failed",
      gatewayResponse: err.response?.data,
    };
  }
}
