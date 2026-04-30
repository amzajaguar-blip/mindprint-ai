import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { createClient } from "@supabase/supabase-js";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

function getSupabaseAdmin() {
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) return new Map<string, string>();
    return new Map(Object.entries(parseCookieHeader(cookieHeader)));
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const token = cookies.get(COOKIE_NAME);

    if (!token) throw ForbiddenError("No session cookie");

    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) throw ForbiddenError("Invalid or expired session");

    const name = (user.user_metadata?.full_name as string)
      || (user.user_metadata?.name as string)
      || user.email
      || "User";

    await db.upsertUser({
      openId: user.id,
      name,
      email: user.email ?? null,
      loginMethod: (user.app_metadata?.provider as string) ?? "email",
      lastSignedIn: new Date(),
    });

    const dbUser = await db.getUserByOpenId(user.id);
    if (!dbUser) throw ForbiddenError("User not found");
    return dbUser;
  }
}

export const sdk = new SDKServer();
