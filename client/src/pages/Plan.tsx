import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

// ─── Feature lists ────────────────────────────────────────────────────────────

const FREE_FEATURES: { text: string; included: boolean }[] = [
  { text: "1 test al mese", included: true },
  { text: "Archetipo base (senza profondità)", included: true },
  { text: "Card condivisibile standard", included: true },
  { text: "Accesso community", included: true },
  { text: "Analisi psicologica profonda AI", included: false },
  { text: "Immagine archetipale generata da AI", included: false },
  { text: "Zone d'ombra e punti di forza", included: false },
  { text: "Evoluzione archetipo nel tempo", included: false },
];

const PREMIUM_FEATURES: { text: string }[] = [
  { text: "Test illimitati" },
  { text: "Analisi psicologica profonda (AI Gemini)" },
  { text: "Immagine archetipale generata da AI" },
  { text: "Zone d'ombra e punti di forza personali" },
  { text: "Consigli pratici settimanali" },
  { text: "Evoluzione del tuo archetipo nel tempo" },
  { text: "Card animata premium" },
  { text: "Supporto prioritario" },
];

const COMPARISON_ROWS: { feature: string; free: boolean; premium: boolean }[] = [
  { feature: "Test mensili", free: true, premium: true },
  { feature: "Archetipo base", free: true, premium: true },
  { feature: "Card condivisibile", free: true, premium: true },
  { feature: "Accesso community", free: true, premium: true },
  { feature: "Test illimitati", free: false, premium: true },
  { feature: "Analisi profonda con AI Gemini", free: false, premium: true },
  { feature: "Immagine archetipale AI", free: false, premium: true },
  { feature: "Zone d'ombra e forze personali", free: false, premium: true },
  { feature: "Consigli pratici settimanali", free: false, premium: true },
  { feature: "Card animata premium", free: false, premium: true },
  { feature: "Evoluzione archetipo nel tempo", free: false, premium: true },
  { feature: "Supporto prioritario", free: false, premium: true },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Posso annullare quando voglio?",
    a: "Sì, sempre. Nessun vincolo, nessun costo nascosto. Gestisci o cancella l'abbonamento con un click dal tuo pannello.",
  },
  {
    q: "La garanzia di rimborso è reale?",
    a: "Assolutamente. Se entro 7 giorni dall'acquisto non sei soddisfatto al 100%, ti rimborsiamo senza domande. Ci crediamo.",
  },
  {
    q: "Come funziona l'analisi AI?",
    a: "Le tue risposte al Mirror Moment vengono elaborate da un modello AI specializzato su psicologia archetipale junghiana. Il risultato è unico — generato apposta per te, non da template.",
  },
  {
    q: "Posso fare il test più volte?",
    a: "Con il piano gratuito hai 1 test al mese. Con Premium i test sono illimitati e puoi tracciare la tua evoluzione nel tempo.",
  },
  {
    q: "I miei dati sono al sicuro?",
    a: "I tuoi dati non vengono mai venduti a terzi. Usiamo Supabase con encryption at rest e in transit. Puoi richiedere la cancellazione completa in qualsiasi momento.",
  },
];

// ─── Componenti helper ────────────────────────────────────────────────────────

function FadeUp({
  i,
  children,
  className,
  style,
}: {
  i: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.09, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CheckIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}
      >
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-700 flex-shrink-0">
      <svg width="9" height="2" viewBox="0 0 9 2" fill="none">
        <path d="M1 1h7" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function TableCheck({ ok }: { ok: boolean }) {
  if (ok) {
    return (
      <span
        className="inline-flex w-6 h-6 rounded-full items-center justify-center"
        style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}
      >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return <span className="inline-block w-5 h-0.5 bg-gray-700 rounded-full" />;
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="border-b border-white/6"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span
          className="text-white/80 text-base group-hover:text-white transition-colors pr-8"
          style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.08rem" }}
        >
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex-shrink-0 w-6 h-6 rounded-full border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="text-gray-500 text-[1rem] leading-relaxed pb-5"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────

export default function Plan() {
  useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [yearly, setYearly] = useState(false);
  const { data: subStatus } = trpc.subscription.checkStatus.useQuery();
  const isPremium = subStatus?.isPremium ?? false;

  const checkout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
  });

  const monthlyPrice = "€4,99";
  const yearlyPrice = "€39,99";
  const yearlyMonthly = "€3,33";
  const saving = "33%";

  return (
    <div
      className="min-h-screen bg-[#08080F] text-white overflow-x-hidden"
      style={{ fontFamily: "EB Garamond, serif" }}
    >
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.025,
          mixBlendMode: "overlay",
        }}
      />

      {/* Grid texture */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.13) 0%, transparent 65%)",
        }}
      />

      {/* ── Navbar ── */}
      <nav className="relative z-20 border-b border-[#8B5CF6]/12 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <img
          src="/logos/logo-text.png"
          alt="MindPrint+AI"
          className="h-8 w-auto cursor-pointer"
          onClick={() => setLocation("/dashboard")}
        />
        <button
          onClick={() => setLocation("/dashboard")}
          className="text-gray-500 text-sm hover:text-white transition-colors"
          style={{ fontFamily: "EB Garamond, serif" }}
        >
          &larr; Dashboard
        </button>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">

        {/* ── HEADER ── */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.45em] mb-5 font-mono">
            Piano &amp; Prezzi
          </p>
          <h1
            className="leading-tight mb-5"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            <span className="block text-[clamp(1.6rem,4vw,2.6rem)] font-normal text-white/70">
              Il prezzo di un caffè.
            </span>
            <span
              className="block text-[clamp(2rem,5vw,3.4rem)] font-bold"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #C084FC, #D946EF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Il valore di anni di terapia.
            </span>
          </h1>
          <p
            className="text-gray-500 text-[1.1rem] max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Scegli il percorso che fa per te. Sempre annullabile, mai vincolante.
          </p>
        </motion.div>

        {/* ── BILLING TOGGLE ── */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <span
            className={`text-sm transition-colors ${!yearly ? "text-white" : "text-gray-500"}`}
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Mensile
          </span>

          <button
            onClick={() => setYearly((v) => !v)}
            className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
            style={{
              background: yearly
                ? "linear-gradient(135deg, #8B5CF6, #C084FC)"
                : "rgba(255,255,255,0.1)",
            }}
            aria-pressed={yearly}
          >
            <motion.span
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
              animate={{ x: yearly ? 26 : 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </button>

          <span
            className={`text-sm flex items-center gap-2 transition-colors ${yearly ? "text-white" : "text-gray-500"}`}
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Annuale
            <AnimatePresence>
              {yearly && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)", color: "white" }}
                >
                  -{saving}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.div>

        {/* ── PLAN CARDS ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">

          {/* Free */}
          <FadeUp
            i={0}
            className="flex flex-col rounded-2xl p-8"
            style={{
              background: "rgba(15,11,26,0.4)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="mb-7">
              <p
                className="text-gray-600 text-[10px] uppercase tracking-[0.4em] mb-3"
                style={{ fontFamily: "EB Garamond, serif" }}
              >
                Gratuito
              </p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-white" style={{ fontFamily: "Cinzel, serif" }}>
                  €0
                </span>
                <span className="text-gray-600 mb-1.5" style={{ fontFamily: "EB Garamond, serif" }}>
                  /mese
                </span>
              </div>
              <p className="text-gray-700 text-sm mt-1" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Per cominciare il viaggio
              </p>
            </div>

            <ul className="space-y-3.5 flex-1 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-3">
                  <CheckIcon filled={f.included} />
                  <span
                    className={`text-[0.97rem] ${f.included ? "text-gray-400" : "text-gray-700 line-through"}`}
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className="px-4 py-3 rounded-xl text-center text-gray-600 text-sm"
              style={{ border: "1px solid rgba(255,255,255,0.07)", fontFamily: "EB Garamond, serif" }}
            >
              Piano attuale
            </div>
          </FadeUp>

          {/* Premium */}
          <FadeUp
            i={1}
            className="relative rounded-2xl p-8 flex flex-col overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0f0b1a 0%, #130d20 100%)",
              border: "1px solid rgba(139,92,246,0.45)",
              boxShadow:
                "0 0 100px rgba(139,92,246,0.22), 0 0 40px rgba(217,70,239,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Top center floating badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
              <span className="text-[10px] px-4 py-1 rounded-full font-bold uppercase tracking-widest text-white"
                style={{ background: "linear-gradient(135deg, #7C3AED, #C084FC)", boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}>
                ✦ Più scelto
              </span>
            </div>
            {/* Inner top-right glow */}
            <div
              className="absolute top-0 right-0 w-52 h-52 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 100% 0%, rgba(139,92,246,0.14) 0%, transparent 60%)",
              }}
            />

            {/* Founder badge */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
              <span
                className="text-[9px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)", color: "white" }}
              >
                Consigliato
              </span>
              <span
                className="text-[8px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border"
                style={{
                  borderColor: "rgba(217,70,239,0.35)",
                  color: "#D946EF",
                  background: "rgba(217,70,239,0.08)",
                }}
              >
                Offerta fondatori
              </span>
            </div>

            <div className="mb-7">
              <p
                className="text-[#C084FC] text-[10px] uppercase tracking-[0.4em] mb-3"
                style={{ fontFamily: "EB Garamond, serif" }}
              >
                Premium
              </p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={yearly ? "yearly" : "monthly"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="flex items-end gap-2">
                    <span
                      className="text-5xl font-bold text-white"
                      style={{ fontFamily: "Cinzel, serif" }}
                    >
                      {yearly ? yearlyPrice : monthlyPrice}
                    </span>
                    <span className="text-gray-500 mb-1.5" style={{ fontFamily: "EB Garamond, serif" }}>
                      /{yearly ? "anno" : "mese"}
                    </span>
                  </div>
                  {yearly ? (
                    <p className="text-[#C084FC] text-sm mt-1" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                      {yearlyMonthly}/mese &middot; risparmi il {saving}
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                      Annulla quando vuoi &middot; nessun vincolo
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <ul className="space-y-3.5 flex-1 mb-8">
              {PREMIUM_FEATURES.map((f, i) => (
                <motion.li
                  key={f.text}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (i + 2) * 0.07, duration: 0.4 }}
                >
                  <CheckIcon filled={true} />
                  <span
                    className="text-gray-300 text-[0.97rem]"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {f.text}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Social proof */}
            <p
              className="text-center text-[#8B5CF6]/60 text-xs mb-3"
              style={{ fontFamily: "EB Garamond, serif" }}
            >
              847 persone hanno fatto upgrade questo mese
            </p>

            {isPremium ? (
              <div
                className="py-3.5 rounded-xl text-center text-sm font-medium"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(192,132,252,0.12))",
                  border: "1px solid rgba(139,92,246,0.28)",
                  color: "#C084FC",
                  fontFamily: "EB Garamond, serif",
                }}
              >
                ✓ Sei gi&agrave; Premium
              </div>
            ) : (
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 0 70px rgba(139,92,246,0.65), 0 8px 32px rgba(0,0,0,0.5)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => checkout.mutate({ yearly })}
                disabled={checkout.isPending}
                className="relative py-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 overflow-hidden"
                style={{
                  background: checkout.isPending
                    ? "linear-gradient(135deg, #6D28D9, #8B5CF6)"
                    : "linear-gradient(135deg, #7C3AED, #8B5CF6, #C084FC)",
                  boxShadow: "0 4px 32px rgba(139,92,246,0.45)",
                  fontFamily: "Cinzel, serif",
                  letterSpacing: "0.04em",
                }}
              >
                {/* Shimmer */}
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                />
                {checkout.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="32"
                        strokeDashoffset="12"
                        strokeLinecap="round"
                      />
                    </svg>
                    Caricamento&hellip;
                  </span>
                ) : yearly ? (
                  "Inizia con Premium Annuale →"
                ) : (
                  "Inizia con Premium →"
                )}
              </motion.button>
            )}
          </FadeUp>
        </div>

        {/* ── COMPARISON TABLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2
            className="text-center text-xl font-semibold mb-8 text-white/70"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Confronto dettagliato
          </h2>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(15,11,26,0.5)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_100px] border-b border-white/6">
              <div className="px-6 py-4" />
              <div className="px-2 py-4 text-center">
                <span
                  className="text-gray-500 text-xs uppercase tracking-widest"
                  style={{ fontFamily: "EB Garamond, serif" }}
                >
                  Gratuito
                </span>
              </div>
              <div className="px-2 py-4 text-center">
                <span
                  className="text-[#C084FC] text-xs uppercase tracking-widest"
                  style={{ fontFamily: "EB Garamond, serif" }}
                >
                  Premium
                </span>
              </div>
            </div>

            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_100px_100px] border-b border-white/4 last:border-0 transition-colors hover:bg-white/[0.015] ${
                  !row.free ? "bg-transparent" : ""
                }`}
              >
                <div className="px-6 py-4">
                  <span
                    className={`text-[0.97rem] ${
                      i < 4 ? "text-gray-400" : "text-gray-300"
                    }`}
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {row.feature}
                  </span>
                </div>
                <div className="px-2 py-4 flex items-center justify-center">
                  <TableCheck ok={row.free} />
                </div>
                <div className="px-2 py-4 flex items-center justify-center">
                  <TableCheck ok={row.premium} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── GARANZIA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-16 p-8 rounded-2xl text-center overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(15,11,26,0.8), rgba(20,14,35,0.7))",
            border: "1px solid rgba(139,92,246,0.18)",
          }}
        >
          {/* Background radial */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.08) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10">
            {/* Shield icon */}
            <div
              className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(217,70,239,0.1))",
                border: "1px solid rgba(139,92,246,0.25)",
              }}
            >
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                <path
                  d="M12 2L3 6v8c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6L12 2z"
                  stroke="#8B5CF6"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M8 14l3 3 5-5"
                  stroke="#C084FC"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3
              className="text-white text-xl font-bold mb-2"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Garanzia 7 giorni
            </h3>
            <p
              className="text-gray-500 text-[1rem] max-w-sm mx-auto leading-relaxed"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              Soddisfatti o rimborsati, senza domande, senza procedure lunghe.
              Se entro 7 giorni non ti rispecchi nell&apos;analisi, rimborsiamo tutto.
            </p>
            <p
              className="mt-3 text-[#8B5CF6]/60 text-xs"
              style={{ fontFamily: "EB Garamond, serif" }}
            >
              Perch&eacute; ci crediamo davvero.
            </p>
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2
            className="text-center text-xl font-semibold mb-8 text-white/70"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Domande frequenti
          </h2>

          <div
            className="rounded-2xl px-6 py-2"
            style={{
              background: "rgba(15,11,26,0.4)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={item.q} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </motion.div>

        {/* ── FOOTER NOTE ── */}
        <motion.p
          className="text-center text-gray-700 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{ fontFamily: "EB Garamond, serif" }}
        >
          Pagamento sicuro tramite LemonSqueezy &middot; Nessun vincolo &middot; Disdici in qualsiasi momento
        </motion.p>
      </div>
    </div>
  );
}
