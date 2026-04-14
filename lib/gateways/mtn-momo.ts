import axios from "axios";
import type { PaymentInitInput } from "./index";
import type { PaymentInitResult } from "./whatsapp-manual";

export async function processMtnMomo(input: PaymentInitInput): Promise<PaymentInitResult> {
  const { credentials, orderId, amount, currency, studentPhone, webhookUrl, environment } = input;
  const isLive = (credentials.environment || environment) === "live";
  const baseUrl = isLive
    ? "https://proxy.momoapi.mtn.com"
    : "https://sandbox.momodeveloper.mtn.com";

  if (!studentPhone) {
    return { success: false, error: "Phone number is required for MTN Mobile Money" };
  }

  try {
    // Step 1: Get access token
    const auth = Buffer.from(`${credentials.api_user_id}:${credentials.api_key}`).toString("base64");
    const tokenRes = await axios.post(
      `${baseUrl}/collection/token/`,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Ocp-Apim-Subscription-Key": credentials.subscription_key,
        },
      }
    );
    const accessToken = tokenRes.data.access_token;

    // Step 2: Request to pay
    const referenceId = orderId;
    const phone = studentPhone.replace(/[^0-9]/g, "");

    await axios.post(
      `${baseUrl}/collection/v1_0/requesttopay`,
      {
        amount: amount.toString(),
        currency,
        externalId: orderId,
        payer: {
          partyIdType: "MSISDN",
          partyId: phone,
        },
        payerMessage: `Course payment ${orderId}`,
        payeeNote: `Learn With John - Course enrollment`,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": isLive ? "live" : "sandbox",
          "Ocp-Apim-Subscription-Key": credentials.subscription_key,
          "Content-Type": "application/json",
          "X-Callback-Url": `${webhookUrl}/api/webhooks/mtn-momo`,
        },
      }
    );

    return {
      success: true,
      waitForSTK: true,
      transactionRef: referenceId,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    return {
      success: false,
      error: err.message || "MTN MoMo payment initiation failed",
      gatewayResponse: err.response?.data,
    };
  }
}
