import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import type { Express, Request, Response } from "express";

// Called by the frontend after Supabase login to set the httpOnly session cookie
export function registerOAuthRoutes(app: Express) {
  app.post("/api/auth/session", (req: Request, res: Response) => {
    const { access_token } = req.body as { access_token?: string };
    if (!access_token) {
      res.status(400).json({ error: "access_token required" });
      return;
    }
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, access_token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.json({ ok: true });
  });

  app.delete("/api/auth/session", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ ok: true });
  });
}
