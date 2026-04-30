import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

function getSupabase() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error("Supabase storage not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey);
}

const BUCKET = "IMAGES";

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const supabase = getSupabase();
  const key = appendHashSuffix(relKey.replace(/^\/+/, ""));

  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data as Uint8Array);

  const { error } = await supabase.storage.from(BUCKET).upload(key, buffer, {
    contentType,
    upsert: false,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: urlData.publicUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const supabase = getSupabase();
  const key = relKey.replace(/^\/+/, "");
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: data.publicUrl };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const supabase = getSupabase();
  const key = relKey.replace(/^\/+/, "");
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(key, 3600);
  if (error || !data) throw new Error(`Signed URL failed: ${error?.message}`);
  return data.signedUrl;
}
