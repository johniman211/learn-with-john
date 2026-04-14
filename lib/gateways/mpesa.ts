import axios from "axios";
import type { PaymentInitInput } from "./index";
import type { PaymentInitResult } from "./whatsapp-manual";

export async function processMpesa(input: PaymentInitInput): Promise<PaymentInitResult> {
  const { credentials, orderId, amount, studentPhone, webhookUrl, environment } = input;
  const isLive = (credentials.environment || environment) === "live";
  const baseUrl = isLive
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

  if (!studentPhone) {
    return { success: false, error: "Phone number is required for M-Pesa payment" };
  }

  try {
    // Step 1: Get OAuth token
    const auth = Buffer.from(`${credentials.consumer_key}:${credentials.consumer_secret}`).toString("base64");
    const tokenRes = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const accessToken = tokenRes.data.access_token;

    // Step 2: Initiate STK Push
    const shortcode = credentials.business_shortcode;
    const passkey = credentials.passkey;
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    // Format phone: remove + and leading 0, ensure starts with 254
    let phone = studentPhone.replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) phone = "254" + phone.slice(1);
    if (!phone.startsWith("254")) phone = "254" + phone;

    const stkRes = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.ceil(amount),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: `${webhookUrl}/api/webhooks/mpesa`,
        AccountReference: orderId,
        TransactionDesc: `Payment for course`,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (stkRes.data.ResponseCode === "0") {
      return {
        success: true,
        waitForSTK: true,
        transactionRef: stkRes.data.CheckoutRequestID,
        gatewayResponse: stkRes.data,
      };
    }

    return {
      success: false,
      error: stkRes.data.errorMessage || stkRes.data.ResponseDescription || "STK push failed",
      gatewayResponse: stkRes.data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    return {
      success: false,
      error: err.message || "M-Pesa payment initiation failed",
      gatewayResponse: err.response?.data,
    };
  }
}
