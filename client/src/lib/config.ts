// =============================================================================
// Config — Variabili d'ambiente centralizzate per il client
// =============================================================================
// Tutte le letture di import.meta.env passano da qui.
// In produzione, Vite sostituisce import.meta.env.VITE_* al build time.
// =============================================================================

function getEnv(name: string, fallback = ""): string {
  const value = import.meta.env[name] as string | undefined;
  return value ?? fallback;
}

function getEnvBool(name: string, fallback = false): boolean {
  const value = getEnv(name);
  if (!value) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

export const config = {
  // === Supabase ===
  supabaseUrl: getEnv("VITE_SUPABASE_URL"),
  supabaseAnonKey: getEnv("VITE_SUPABASE_ANON_KEY"),

  // === App ===
  appId: getEnv("VITE_APP_ID", "mindprint-app"),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,

  // === Frontend Forge (opzionale) ===
  forgeApiKey: getEnv("VITE_FRONTEND_FORGE_API_KEY"),
  forgeApiUrl: getEnv("VITE_FRONTEND_FORGE_API_URL", "https://forge.butterfly-effect.dev"),

  // === Feature flags ===
  enableDebugTools: getEnvBool("VITE_ENABLE_DEBUG_TOOLS", import.meta.env.DEV),
} as const;

export type AppConfig = typeof config;
