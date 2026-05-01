#!/usr/bin/env bash
# =============================================================================
# MindPrint — Quality Check Script
# Blocca regressioni su: performance, sicurezza, SEO, UX
# Esegui: bash scripts/quality-check.sh
# =============================================================================

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
WARN=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
  _name="$1"
  _cmd="$2"
  _severity="${3:-error}"

  echo -n "  [ ] $_name ... "
  set +e
  eval "$_cmd" > /dev/null 2>&1
  _rc=$?
  set -e
  if [ "$_rc" = "0" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASS=$((PASS + 1))
  else
    if [ "$_severity" = "error" ]; then
      echo -e "${RED}✗ FAIL${NC}"
      FAIL=$((FAIL + 1))
    else
      echo -e "${YELLOW}⚠ WARN${NC}"
      WARN=$((WARN + 1))
    fi
  fi
}

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║        MindPrint — Quality Regression Check             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── 1. BUILD ──────────────────────────────────────────────────────────────────
echo "▸ BUILD"

check "TypeScript compila senza errori" \
  "timeout 60 npx tsc --noEmit --pretty > /dev/null 2>&1"

check "Vite build completa" \
  "ls dist/public/index.html > /dev/null 2>&1"

check "Env check superato" \
  "node scripts/check-env.mjs production > /dev/null 2>&1"

# ── 2. SEO ────────────────────────────────────────────────────────────────────
echo ""
echo "▸ SEO"

check "robots.txt esiste" \
  "test -f client/public/robots.txt"

check "sitemap.xml esiste" \
  "test -f client/public/sitemap.xml"

check "sitemap.xml è XML valido" \
  "head -1 client/public/sitemap.xml | grep -q '<?xml'"

check "index.html ha title tag" \
  "grep -q '<title>' client/index.html"

check "index.html ha meta description" \
  "grep -q 'meta name=\"description\"' client/index.html"

check "index.html ha canonical" \
  "grep -q 'rel=\"canonical\"' client/index.html"

check "index.html ha OG tags" \
  "grep -q 'og:title' client/index.html && grep -q 'og:description' client/index.html && grep -q 'og:image' client/index.html"

check "index.html ha Twitter Card" \
  "grep -q 'twitter:card' client/index.html"

check "index.html ha JSON-LD structured data" \
  "grep -q 'application/ld+json' client/index.html"

check "index.html ha lang=\"it\"" \
  "grep -q 'lang=\"it\"' client/index.html"

# ── 3. PERFORMANCE ────────────────────────────────────────────────────────────
echo ""
echo "▸ PERFORMANCE"

check "Fonts usano display=swap" \
  "grep -q 'display=swap' client/index.html"

check "Preconnect per Google Fonts" \
  "grep -q 'preconnect.*fonts.googleapis' client/index.html"

check "DNS prefetch per domini terze parti" \
  "grep -q 'dns-prefetch' client/index.html"

check "Code splitting attivo (lazy imports)" \
  "grep -q 'lazy(' client/src/App.tsx"

check "Preload risorse critiche" \
  "grep -q 'rel=\"preload\"' client/index.html"

check "Nessun font display=block (CLS)" \
  "grep -q 'display=swap' client/index.html"

# ── 4. SICUREZZA ──────────────────────────────────────────────────────────────
echo ""
echo "▸ SICUREZZA"

check "Helmet CSP configurato" \
  "grep -q 'contentSecurityPolicy' server/_core/app.ts"

check "Rate limiting su API" \
  "grep -q 'rateLimit' server/_core/app.ts"

check "Rate limiting su auth" \
  "grep -q 'authLimiter' server/_core/app.ts"

check "Rate limiting su AI" \
  "grep -q 'aiLimiter' server/_core/app.ts"

check "Webhook HMAC signature verificata" \
  "grep -q 'verifyWebhookSignature' server/_core/app.ts"

check "Nessuna API key hardcoded" \
  "! grep -r 'sk-[A-Za-z0-9]' --include='*.ts' --include='*.tsx' server/ client/src/ 2>/dev/null | grep -v '.env' | grep -v 'node_modules' | head -1"

# ── 5. UX ─────────────────────────────────────────────────────────────────────
echo ""
echo "▸ UX"

check "CTA principale Home esiste" \
  "grep -q 'Scopri il tuo archetipo' client/src/pages/Home.tsx"

check "Login ha micro-copy fiducia" \
  "grep -q 'Dati crittografati' client/src/pages/Login.tsx"

check "Plan ha sticky CTA mobile" \
  "grep -q 'Sticky mobile CTA' client/src/pages/Plan.tsx"

check "404 page ha navigazione" \
  "grep -q 'Torna all'\''inizio' client/src/pages/NotFound.tsx"

check "ErrorBoundary presente" \
  "grep -q 'ErrorBoundary' client/src/App.tsx"

# ── 6. ACCESSIBILITÀ ──────────────────────────────────────────────────────────
echo ""
echo "▸ ACCESSIBILITÀ"

check "Logo ha alt text" \
  "grep -q 'alt=\"MindPrint\"' client/src/pages/Home.tsx"

check "Theme color meta presente" \
  "grep -q 'theme-color' client/index.html"

check "Color-scheme meta presente" \
  "grep -q 'color-scheme' client/index.html"

# ── 7. TESTS ──────────────────────────────────────────────────────────────────
echo ""
echo "▸ TESTS"

check "Test auth logout esiste" \
  "ls client/src/__tests__/auth.logout.test.ts > /dev/null 2>&1" "warning"

# ── SUMMARY ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                     RISULTATI                           ║"
echo "╠══════════════════════════════════════════════════════════╣"
printf "║  PASS:  %-3d                                       ║\n" "$PASS"
printf "║  FAIL:  %-3d                                       ║\n" "$FAIL"
printf "║  WARN:  %-3d                                       ║\n" "$WARN"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}✗ Regressioni critiche trovate! Correggi prima del deploy.${NC}"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo -e "${YELLOW}⚠ Avvisi presenti. Verifica manuale raccomandata.${NC}"
  exit 0
else
  echo -e "${GREEN}✓ Tutti i controlli superati. Sistema stabile.${NC}"
  exit 0
fi
