import axios from "axios";

const SARAFA_BASE_URL = process.env.SARAFA_API_URL || "https://api.sarafa.io/v1";

export async function sarafaRequest(method: string, endpoint: string, data?: unknown) {
  const response = await axios({
    method,
    url: `${SARAFA_BASE_URL}${endpoint}`,
    headers: {
      Authorization: `Bearer ${process.env.SARAFA_API_KEY}`,
      "Content-Type": "application/json",
    },
    data,
  });

  return response.data;
}

export async function getExchangeRate(from: string, to: string) {
  return sarafaRequest("GET", `/rates?from=${from}&to=${to}`);
}

export async function createConversion(data: {
  from: string;
  to: string;
  amount: number;
}) {
  return sarafaRequest("POST", "/conversions", data);
}
