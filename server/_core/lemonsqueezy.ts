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

export async function createCheckoutUrl(userId: number, userEmail: string): Promise<string> {
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_options: { embed: false, media: true, logo: true },
        checkout_data: {
          email: userEmail,
          custom: { user_id: String(userId) },
        },
        product_options: {
          redirect_url: `${ENV.appUrl}/dashboard?premium=success`,
          receipt_button_text: "Torna al tuo profilo",
          receipt_thank_you_note: "Benvenuto nel club dei MindPrint Premium!",
        },
      },
      relationships: {
        store: { data: { type: "stores", id: ENV.lemonsqueezyStoreId } },
        variant: { data: { type: "variants", id: ENV.lemonsqueezyVariantId } },
      },
    },
  };

  const data = await lsRequest("/checkouts", { method: "POST", body: JSON.stringify(body) });
  const url = data?.data?.attributes?.url;
  if (!url) throw new Error("Lemon Squeezy checkout: no URL returned");
  return url;
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
