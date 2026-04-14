import axios from "axios";
import type { PaymentInitInput } from "./index";
import type { PaymentInitResult } from "./whatsapp-manual";

export async function processFlutterwave(input: PaymentInitInput): Promise<PaymentInitResult> {
  const { credentials, orderId, amount, currency, courseName, studentName, studentEmail, callbackUrl, environment } = input;
  const isLive = (credentials.environment || environment) === "live";
  const baseUrl = "https://api.flutterwave.com/v3";
  const secretKey = credentials.secret_key;

  try {
    const response = await axios.post(
      `${baseUrl}/payments`,
      {
        tx_ref: orderId,
        amount,
        currency,
        redirect_url: `${callbackUrl}?gateway=flutterwave&order=${orderId}`,
        customer: {
          email: studentEmail,
          name: studentName,
        },
        customizations: {
          title: "Learn With John",
          description: `Enrollment: ${courseName}`,
        },
        meta: {
          order_id: orderId,
          is_sandbox: !isLive,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "success" && response.data.data?.link) {
      return {
        success: true,
        redirectUrl: response.data.data.link,
        transactionRef: orderId,
      };
    }

    return {
      success: false,
      error: response.data.message || "Failed to create Flutterwave payment",
      gatewayResponse: response.data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    return {
      success: false,
      error: err.message || "Flutterwave payment initiation failed",
      gatewayResponse: err.response?.data,
    };
  }
}
