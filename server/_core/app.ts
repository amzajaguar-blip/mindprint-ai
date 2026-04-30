import express, { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { verifyWebhookSignature } from "./lemonsqueezy";
import { upsertSubscription } from "../db";

export function createApp() {
  const app = express();

  // Webhook PRIMA di express.json() — serve raw body per HMAC
  app.post("/api/webhook/lemonsqueezy", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    const signature = req.headers["x-signature"] as string;
    const rawBody = (req.body as Buffer).toString("utf-8");

    if (!verifyWebhookSignature(rawBody, signature)) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    let payload: any;
    try { payload = JSON.parse(rawBody); } catch { res.status(400).json({ error: "Invalid JSON" }); return; }

    const eventName: string = payload.meta?.event_name ?? "";
    const userId = parseInt(payload.meta?.custom_data?.user_id ?? "0");
    if (!userId) { res.status(400).json({ error: "Missing user_id in custom_data" }); return; }

    const attrs = payload.data?.attributes ?? {};

    if (["subscription_created", "subscription_updated", "subscription_resumed"].includes(eventName)) {
      await upsertSubscription({
        userId,
        lemonsqueezyCustomerId: String(attrs.customer_id ?? ""),
        lemonsqueezySubscriptionId: String(payload.data?.id ?? ""),
        status: attrs.status === "on_trial" ? "on_trial" : attrs.status === "active" ? "active" : "past_due",
        currentPeriodStart: attrs.renews_at ? new Date(attrs.renews_at) : undefined,
        currentPeriodEnd: attrs.ends_at ? new Date(attrs.ends_at) : undefined,
      });
    }

    if (["subscription_cancelled", "subscription_expired"].includes(eventName)) {
      await upsertSubscription({ userId, status: "canceled" });
    }

    if (eventName === "order_created") {
      await upsertSubscription({ userId, lemonsqueezyOrderId: String(payload.data?.id ?? ""), status: "active" });
    }

    res.json({ received: true });
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  return app;
}
