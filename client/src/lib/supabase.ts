import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

// =============================================================================
// Supabase Client — Inizializzazione sicura con validazione runtime
// =============================================================================
// Legge le credenziali da config.ts (centralizzato).
// Se le env mancano, exporta null invece di crashare.
// =============================================================================

const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

// Crea il client solo se le credenziali sono presenti
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null;

// Helper per verificare se Supabase è disponibile
export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}

// Debug helper — stampa lo stato delle env (solo in dev)
if (config.isDev) {
  console.log("[Supabase] Inizializzazione:", {
    urlPresent: !!supabaseUrl,
    keyPresent: !!supabaseAnonKey,
    clientReady: !!supabase,
  });
}
