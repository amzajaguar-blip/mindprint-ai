// =============================================================================
// Env Debug — Verifica runtime delle variabili d'ambiente lato client
// =============================================================================
// Questo modulo NON deve essere importato in produzione.
// Usa: import { checkClientEnv } from "@/lib/env-debug";
//       checkClientEnv(); // in dev mode

export interface EnvCheckResult {
  variable: string;
  present: boolean;
  note: string;
}

const REQUIRED_CLIENT_ENV = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
] as const;

const OPTIONAL_CLIENT_ENV = [
  "VITE_APP_ID",
  "VITE_FRONTEND_FORGE_API_KEY",
  "VITE_FRONTEND_FORGE_API_URL",
] as const;

export function checkClientEnv(): EnvCheckResult[] {
  const results: EnvCheckResult[] = [];

  for (const name of REQUIRED_CLIENT_ENV) {
    const value = import.meta.env[name] as string | undefined;
    results.push({
      variable: name,
      present: !!value,
      note: value
        ? `OK (${value.substring(0, 20)}...)`
        : "MANCANTE — L'app funzionerà con funzionalità ridotte",
    });
  }

  for (const name of OPTIONAL_CLIENT_ENV) {
    const value = import.meta.env[name] as string | undefined;
    results.push({
      variable: name,
      present: !!value,
      note: value ? `OK` : "Non impostata (opzionale)",
    });
  }

  return results;
}

/**
 * Stampa a console lo stato completo delle env client.
 * Chiamata automaticamente in dev mode.
 */
export function logClientEnvStatus(): void {
  if (!import.meta.env.DEV) return;

  const results = checkClientEnv();
  const missing = results.filter((r) => !r.present && r.variable.startsWith("VITE_SUPABASE"));

  console.group("[Env Debug] Client Environment Variables");
  console.table(results);
  if (missing.length > 0) {
    console.warn(
      `⚠️  ${missing.length} variabile/i obbligatoria/e mancante/i. ` +
        "L'app non potrà usare Supabase per autenticazione."
    );
  } else {
    console.log("✅ Tutte le variabili obbligatorie sono presenti.");
  }
  console.groupEnd();
}

// Auto-esecuzione in dev
if (import.meta.env.DEV) {
  logClientEnvStatus();
}
