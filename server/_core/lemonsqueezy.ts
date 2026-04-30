import crypto from "crypto";
import { ENV } from "./env";

const LS_API = "https://api.lemonsqueezy.com/v1";

async function lsRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${LS_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${ENV.lemonsqueezyApiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lemon Squeezy API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createCheckoutUrl(userId: number, userEmail: string, yearly = false): Promise<string> {
  const base = yearly ? ENV.lemonsqueezyCheckoutUrlYearly : ENV.lemonsqueezyCheckoutUrl;
  if (!base) throw new Error("LEMONSQUEEZY_CHECKOUT_URL not configured");
  const url = new URL(base);
  url.searchParams.set("checkout[email]", userEmail);
  url.searchParams.set("checkout[custom][user_id]", String(userId));
  return url.toString();
}

export async function getLemonSubscription(subscriptionId: string) {
  return lsRequest(`/subscriptions/${subscriptionId}`);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!ENV.lemonsqueezyWebhookSecret || !signature) return false;
  try {
    const hmac = crypto.createHmac("sha256", ENV.lemonsqueezyWebhookSecret);
    const digest = hmac.update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}
