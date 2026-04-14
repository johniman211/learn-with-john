import axios from "axios";

const PESAPAL_BASE_URL = process.env.PESAPAL_ENVIRONMENT === "live"
  ? "https://pay.pesapal.com/v3"
  : "https://cybqa.pesapal.com/pesapalv3";

let cachedToken: { token: string; expiryDate: string } | null = null;

export async function getPesapalToken(): Promise<string> {
  if (cachedToken && new Date(cachedToken.expiryDate) > new Date()) {
    return cachedToken.token;
  }

  const response = await axios.post(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    consumer_key: process.env.PESAPAL_CONSUMER_KEY,
    consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
  });

  if (!response.data.token) {
    console.error("[PESAPAL] Auth failed:", response.data);
    throw new Error("Failed to get Pesapal token");
  }

  cachedToken = {
    token: response.data.token,
    expiryDate: response.data.expiryDate,
  };

  return cachedToken.token;
}

export async function pesapalRequest(method: string, endpoint: string, data?: unknown) {
  const token = await getPesapalToken();

  const response = await axios({
    method,
    url: `${PESAPAL_BASE_URL}${endpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data,
  });

  return response.data;
}

export async function submitPesapalOrder(orderData: {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callbackUrl: string;
  notificationId: string;
  billingAddress: {
    emailAddress: string;
    firstName: string;
    lastName: string;
  };
}) {
  return pesapalRequest("POST", "/api/Transactions/SubmitOrderRequest", orderData);
}

export async function getTransactionStatus(orderTrackingId: string) {
  return pesapalRequest(
    "GET",
    `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`
  );
}

export async function registerIPN(url: string, ipnNotificationType: string = "GET") {
  return pesapalRequest("POST", "/api/URLSetup/RegisterIPN", {
    url,
    ipn_notification_type: ipnNotificationType,
  });
}
