#!/usr/bin/env node
// =============================================================================
// Pre-build Env Check — Blocca la build se variabili obbligatorie mancano
// =============================================================================
// Usage:
//   node scripts/check-env.mjs              # controlla .env (default)
//   node scripts/check-env.mjs production    # controlla .env.production
//   VITE_SUPABASE_URL=... node scripts/check-env.mjs  # controlla env di sistema
//
// Exit code: 0 = OK, 1 = ERROR

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// === Configurazione ===

const REQUIRED_CLIENT = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

const REQUIRED_SERVER = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "JWT_SECRET",
  "GEMINI_API_KEY",
];

const ALL_REQUIRED = [...REQUIRED_CLIENT, ...REQUIRED_SERVER];

// === Lettura env ===

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Rimuovi quoting
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function getMode() {
  const mode = process.argv[2] || "development";
  if (mode === "production") return "production";
  return "development";
}

function main() {
  const mode = getMode();
  const envFile = mode === "production" ? ".env.production" : ".env";
  const envPath = path.join(ROOT, envFile);

  console.log(`\n🔍 [Env Check] Modalità: ${mode}`);
  console.log(`   File: ${envFile}${fs.existsSync(envPath) ? " (trovato)" : " (NON trovato — uso env di sistema)"}`);

  // Leggi da file + process.env (process.env sovrascrive)
  const fileVars = parseEnvFile(envPath);
  const allVars = { ...fileVars, ...process.env };

  const missing = [];
  const present = [];

  for (const name of ALL_REQUIRED) {
    const value = allVars[name];
    if (value && value.length > 0 && !value.startsWith("[") && !value.startsWith("your-")) {
      present.push(name);
    } else {
      missing.push(name);
    }
  }

  // Report
  console.log(`\n📊 Risultati:`);
  console.log(`   ✅ Presenti: ${present.length}/${ALL_REQUIRED.length}`);
  if (missing.length > 0) {
    console.log(`   ❌ Mancanti: ${missing.length}/${ALL_REQUIRED.length}`);
    console.log(`\n   Variabili mancanti:`);
    for (const name of missing) {
      const isClient = REQUIRED_CLIENT.includes(name);
      const hint = isClient
        ? `   → Aggiungi ${name} nel file .env o nelle env di deploy (Vercel/Netlify)`
        : `   → Aggiungi ${name} nel file .env o nelle env del server`;
      console.log(`     • ${name}`);
      console.log(hint);
    }

    if (mode === "production") {
      console.log(`\n❌ BUILD BLOCCATA: variabili d'ambiente obbligatorie mancanti.`);
      console.log(`   Correggi e riprova.`);
      process.exit(1);
    } else {
      console.log(`\n⚠️  Attenzione: variabili mancanti in sviluppo.`);
      console.log(`   L'app potrebbe funzionare con funzionalità ridotte.`);
      console.log(`   Build NON bloccata (modalità sviluppo).`);
      process.exit(0);
    }
  }

  console.log(`\n✅ Tutte le variabili obbligatorie sono presenti. Build può procedere.`);
  process.exit(0);
}

main();
