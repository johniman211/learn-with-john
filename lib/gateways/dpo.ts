import axios from "axios";
import type { PaymentInitInput } from "./index";
import type { PaymentInitResult } from "./whatsapp-manual";

export async function processDPO(input: PaymentInitInput): Promise<PaymentInitResult> {
  const { credentials, orderId, amount, currency, courseName, callbackUrl, environment } = input;
  const isLive = (credentials.environment || environment) === "live";
  const baseUrl = isLive ? "https://secure.3gdirectpay.com" : "https://secure1.sandbox.directpay.online";

  try {
    // Step 1: Create payment token
    const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${credentials.company_token}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${amount.toFixed(2)}</PaymentAmount>
    <PaymentCurrency>${currency}</PaymentCurrency>
    <CompanyRef>${orderId}</CompanyRef>
    <RedirectURL>${callbackUrl}?gateway=dpo&amp;order=${orderId}</RedirectURL>
    <BackURL>${callbackUrl}?gateway=dpo&amp;order=${orderId}&amp;cancelled=1</BackURL>
    <CompanyRefUnique>1</CompanyRefUnique>
    <PTL>60</PTL>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${credentials.service_type || "3854"}</ServiceType>
      <ServiceDescription>${courseName}</ServiceDescription>
      <ServiceDate>${new Date().toISOString().split("T")[0]}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

    const response = await axios.post(`${baseUrl}/API/v6/`, xmlPayload, {
      headers: { "Content-Type": "application/xml" },
    });

    const data = response.data as string;
    const tokenMatch = data.match(/<TransToken>([^<]+)<\/TransToken>/);
    const resultMatch = data.match(/<Result>([^<]+)<\/Result>/);

    if (resultMatch && resultMatch[1] === "000" && tokenMatch) {
      return {
        success: true,
        redirectUrl: `${baseUrl}/payv2.php?ID=${tokenMatch[1]}`,
        transactionRef: tokenMatch[1],
      };
    }

    const explanation = data.match(/<ResultExplanation>([^<]+)<\/ResultExplanation>/);
    return {
      success: false,
      error: explanation?.[1] || "Failed to create DPO payment token",
      gatewayResponse: data,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err.message || "DPO payment initiation failed" };
  }
}
