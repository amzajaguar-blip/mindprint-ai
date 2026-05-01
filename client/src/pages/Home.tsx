import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// ─── Dati archetipi demo ──────────────────────────────────────────────────────

const ARCHETYPES_DEMO = [
  { name: "L'Esploratore Silenzioso", rarity: 8, trait: "Introspettivo" },
  { name: "Il Guardiano del Caos", rarity: 4, trait: "Intuitivo" },
  { name: "La Mente Speculare", rarity: 11, trait: "Riflessivo" },
];

const ARCHETYPES_GRID = [
  { name: "L'Oracolo", rarity: 3, color: "#A78BFA", glow: "#7C3AED", desc: "Vedere oltre il visibile" },
  { name: "Il Custode", rarity: 12, color: "#34D399", glow: "#059669", desc: "Forza silenziosa e protezione" },
  { name: "L'Alchimista", rarity: 5, color: "#FCD34D", glow: "#D97706", desc: "Trasformare il dolore in oro" },
  { name: "La Fenice", rarity: 7, color: "#F87171", glow: "#DC2626", desc: "Rinascita dalle ceneri" },
  { name: "Il Nomade", rarity: 9, color: "#60A5FA", glow: "#2563EB", desc: "Libertà come destino" },
  { name: "La Sibilla", rarity: 2, color: "#F9A8D4", glow: "#DB2777", desc: "Intuizione arcana pura" },
  { name: "Il Sovrano", rarity: 6, color: "#C084FC", glow: "#9333EA", desc: "Comando nato dall'interno" },
  { name: "L'Umbra", rarity: 1, color: "#94A3B8", glow: "#475569", desc: "L'ombra che illumina" },
];

const TESTIMONIALS = [
  {
    quote: "L'analisi più precisa che abbia mai letto su me stessa. Ho pianto. Ho riso. Ho capito.",
    author: "Maria G.",
    role: "Designer, Milano",
    avatar: "#8B5CF6",
  },
  {
    quote: "Dopo anni di terapia, in 90 secondi ho avuto la mappa che cercavo. È inquietante quanto sia accurato.",
    author: "Luca T.",
    role: "Imprenditore, Roma",
    avatar: "#D946EF",
  },
  {
    quote: "Non credevo nelle analisi AI. Ora la uso ogni trimestre per capire dove sono nella mia evoluzione.",
    author: "Sara M.",
    role: "Psicologa clinica, Firenze",
    avatar: "#C084FC",
  },
];

// ─── Componenti ───────────────────────────────────────────────────────────────

function FloatingCard({ archetype, delay }: { archetype: typeof ARCHETYPES_DEMO[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: -8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="relative p-5 rounded-2xl backdrop-blur-md"
      style={{
        background: "linear-gradient(145deg, rgba(15,11,26,0.92), rgba(20,14,35,0.88))",
        border: "1px solid rgba(139,92,246,0.18)",
        boxShadow: "0 0 40px rgba(139,92,246,0.07), 0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-[#8B5CF6]/50 rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-[#C084FC]/30 rounded-br-2xl" />

      <p
        className="text-[#8B5CF6] text-[9px] uppercase tracking-[0.35em] mb-2"
        style={{ fontFamily: "EB Garamond, serif" }}
      >
        Archetipo · Raro
      </p>
      <p
        className="text-white text-[15px] font-semibold mb-2 leading-snug"
        style={{ fontFamily: "Cinzel, serif" }}
      >
        {archetype.name}
      </p>
      <div className="flex items-center justify-between">
        <p className="text-[#C084FC] text-[10px]">
          Sei nell&apos;
          <span className="font-bold text-[#D946EF]">{archetype.rarity}%</span> delle persone
        </p>
        <span
          className="px-2 py-0.5 text-[9px] rounded-full border border-[#C084FC]/25 text-[#C084FC]/80"
          style={{ fontFamily: "EB Garamond, serif" }}
        >
          {archetype.trait}
        </span>
      </div>

      {/* Rarity bar */}
      <div className="mt-3 h-px w-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${archetype.rarity * 6}%` }}
          transition={{ delay: delay + 0.4, duration: 0.9, ease: "easeOut" }}
          className="h-full"
          style={{ background: "linear-gradient(90deg, #8B5CF6, #D946EF)" }}
        />
      </div>
    </motion.div>
  );
}

function ArchetypeGridCard({
  a,
  index,
}: {
  a: (typeof ARCHETYPES_GRID)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative p-6 rounded-2xl cursor-default overflow-hidden"
      style={{
        background: "rgba(15,11,26,0.6)",
        border: `1px solid ${a.color}18`,
        boxShadow: `0 0 0 0 ${a.glow}00`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${a.glow}18 0%, transparent 65%)` }}
      />

      {/* Rarity dot */}
      <div
        className="absolute top-4 right-4 w-2 h-2 rounded-full"
        style={{ background: a.color, boxShadow: `0 0 8px ${a.glow}` }}
      />

      <p
        className="text-[9px] uppercase tracking-[0.35em] mb-3"
        style={{ color: a.color, fontFamily: "EB Garamond, serif" }}
      >
        {100 - a.rarity * 10}% rarità
      </p>

      <h3
        className="text-white text-base font-semibold mb-2 leading-snug"
        style={{ fontFamily: "Cinzel, serif" }}
      >
        {a.name}
      </h3>

      <p
        className="text-[13px] leading-relaxed"
        style={{ color: `${a.color}99`, fontFamily: "Cormorant Garamond, serif" }}
      >
        {a.desc}
      </p>

      <div className="mt-4 h-px" style={{ background: `linear-gradient(90deg, ${a.color}40, transparent)` }} />
    </motion.div>
  );
}

// ─── Counter live fake ────────────────────────────────────────────────────────

function LiveCounter() {
  const base = 1247;
  const [count, setCount] = useState(base);

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.7) setCount((c) => c + 1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <span>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="inline-block tabular-nums"
        >
          {count.toLocaleString("it-IT")}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Sacred geometry SVG icons ────────────────────────────────────────────────

const SacredIcon = ({ type }: { type: "mirror" | "ai" | "card" }) => {
  if (type === "mirror") {
    return (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="14" stroke="#8B5CF6" strokeWidth="0.8" strokeOpacity="0.6" />
        <circle cx="18" cy="18" r="8" stroke="#C084FC" strokeWidth="0.6" strokeOpacity="0.5" />
        <circle cx="18" cy="18" r="3" fill="#8B5CF6" fillOpacity="0.7" />
        <line x1="18" y1="4" x2="18" y2="32" stroke="#8B5CF6" strokeWidth="0.5" strokeOpacity="0.3" />
        <line x1="4" y1="18" x2="32" y2="18" stroke="#8B5CF6" strokeWidth="0.5" strokeOpacity="0.3" />
        <line x1="7.5" y1="7.5" x2="28.5" y2="28.5" stroke="#D946EF" strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="28.5" y1="7.5" x2="7.5" y2="28.5" stroke="#D946EF" strokeWidth="0.5" strokeOpacity="0.2" />
      </svg>
    );
  }
  if (type === "ai") {
    return (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <polygon points="18,4 32,28 4,28" stroke="#C084FC" strokeWidth="0.8" strokeOpacity="0.6" fill="none" />
        <polygon points="18,12 26,24 10,24" stroke="#8B5CF6" strokeWidth="0.6" strokeOpacity="0.4" fill="none" />
        <circle cx="18" cy="20" r="3" fill="#C084FC" fillOpacity="0.6" />
        <line x1="18" y1="4" x2="18" y2="28" stroke="#C084FC" strokeWidth="0.4" strokeOpacity="0.3" />
      </svg>
    );
  }
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="4" y="4" width="28" height="28" stroke="#D946EF" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
      <rect
        x="10"
        y="10"
        width="16"
        height="16"
        stroke="#C084FC"
        strokeWidth="0.6"
        strokeOpacity="0.4"
        fill="none"
        transform="rotate(45 18 18)"
      />
      <circle cx="18" cy="18" r="4" fill="#D946EF" fillOpacity="0.5" />
    </svg>
  );
};

// ─── Pagina principale ────────────────────────────────────────────────────────

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleStart = () => {
    if (isAuthenticated) navigate("/mirror-moment");
    else window.location.href = getLoginUrl("/mirror-moment");
  };

  return (
    <div
      className="min-h-screen bg-[#08080F] text-white overflow-x-hidden"
      style={{ fontFamily: "EB Garamond, serif" }}
    >
      {/* ── Grain texture overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.028,
          mixBlendMode: "overlay",
        }}
      />

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)",
            backgroundSize: "70px 70px",
            opacity: 0.018,
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px]"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.14) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-1/3 -left-32 w-[500px] h-[500px]"
          style={{
            background: "radial-gradient(circle, rgba(217,70,239,0.09) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute top-1/2 -right-24 w-[400px] h-[400px]"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* ────────────────────── NAVBAR ────────────────────── */}
      <nav className="relative z-20 border-b border-[#8B5CF6]/10 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src="/logos/logo-icon.png" alt="MindPrint" className="h-8 w-8" loading="eager" />
          <img src="/logos/logo-text.png" alt="MindPrint — Test Personalità AI" className="h-6 w-auto hidden sm:block" loading="eager" />
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-500 text-sm" style={{ fontFamily: "EB Garamond, serif" }}>
                {user?.name}
              </span>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-1.5 text-sm border border-[#8B5CF6]/30 text-[#8B5CF6] rounded-lg hover:bg-[#8B5CF6]/10 transition-colors"
              >
                Dashboard
              </button>
            </>
          ) : (
            <button
              onClick={() => window.location.href = getLoginUrl()}
              className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-all"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #C084FC)",
                fontFamily: "Cinzel, serif",
              }}
            >
              Accedi
            </button>
          )}
        </div>
      </nav>

      {/* ────────────────────── HERO ────────────────────── */}
      <section className="relative z-10 px-6 pt-28 pb-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[1fr_420px] gap-20 items-center">

          {/* Left column */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.5em] mb-8 font-mono"
            >
              Test Personalità AI · Psicologia Junghiana
            </motion.p>

            {/* Headline asimmetrica — SEO ottimizzata */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="leading-[1.0] mb-8"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              <span className="block text-[clamp(3rem,8vw,5.5rem)] font-normal text-white/90 tracking-tight">
                L&apos;anima
              </span>
              <span
                className="block text-[clamp(4rem,10vw,7.5rem)] font-bold tracking-tighter"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #C084FC 45%, #D946EF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ha una firma.
              </span>
              <span className="block text-[clamp(1.5rem,3.5vw,2.2rem)] font-light text-white/40 mt-2 tracking-wide italic"
                style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Scopri il tuo archetipo junghiano unico.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="text-gray-400 text-[1.15rem] leading-[1.75] mb-12 max-w-lg"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              Non un oroscopo. Non un test di personalità generico.
              MindPrint usa la psicologia archetipale di Carl Jung e l&apos;intelligenza artificiale
              per rivelare il tuo archetipo psicologico profondo in{" "}
              <span className="text-white/70 italic">90 secondi</span>.
              <br /><span className="text-gray-600 text-[0.95rem]">48 archetipi unici. Analisi AI Gemini. Gratuito.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 80px rgba(139,92,246,0.7), 0 8px 32px rgba(0,0,0,0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className="relative px-10 py-4 rounded-2xl font-semibold text-white text-base overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #6D28D9, #8B5CF6, #C084FC)",
                  boxShadow: "0 0 40px rgba(139,92,246,0.45), 0 4px 24px rgba(0,0,0,0.4)",
                  fontFamily: "Cinzel, serif",
                  letterSpacing: "0.04em",
                }}
              >
                {/* Shimmer sweep */}
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "linear", repeatDelay: 1.2 }}
                />
                Scopri il tuo archetipo junghiano
              </motion.button>
              <a
                href="#come-funziona"
                className="px-8 py-4 rounded-2xl text-gray-400 text-base border border-white/8 hover:border-[#8B5CF6]/30 hover:text-white transition-all text-center"
                style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1rem" }}
              >
                Come funziona &darr;
              </a>
            </motion.div>

            {/* Social proof inline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-wrap items-center gap-6"
            >
              <div className="flex -space-x-2.5">
                {["#8B5CF6", "#C084FC", "#D946EF", "#7C3AED", "#A78BFA"].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#08080F] flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: `radial-gradient(circle at 35% 35%, ${c}ee, ${c}77)` }}
                  >
                    {["M", "L", "S", "A", "R"][i]}
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-sm" style={{ fontFamily: "EB Garamond, serif" }}>
                <span className="text-white/80 font-medium">
                  <LiveCounter /> persone
                </span>{" "}
                hanno scoperto il loro archetipo oggi
              </p>
            </motion.div>
          </div>

          {/* Right column — floating cards */}
          <div className="relative hidden md:flex flex-col gap-5 px-2">
            {ARCHETYPES_DEMO.map((a, i) => (
              <FloatingCard key={a.name} archetype={a} delay={0.6 + i * 0.18} />
            ))}
            {/* Glow behind cards */}
            <div
              className="absolute inset-0 pointer-events-none -z-10"
              style={{
                background: "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 60%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ────────────────────── SOCIAL PROOF BAR ────────────────────── */}
      <section className="relative z-10 border-y border-white/5 overflow-hidden">
        <div
          className="py-5 px-6"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.04), transparent)" }}
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <p
              className="text-[10px] uppercase tracking-[0.4em] text-[#8B5CF6]/60 font-mono hidden md:block"
            >
              Come ne parlano
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {[
                { icon: "✦", label: "\"La mia mappa interiore\"", src: "Elena B." },
                { icon: "◈", label: "\"Inquietante e preciso\"", src: "Marco V." },
                { icon: "⟡", label: "\"Vale anni di terapia\"", src: "Anna R." },
                { icon: "◉", label: "\"L'analisi più precisa\"", src: "Giulio S." },
              ].map((q) => (
                <div key={q.src} className="flex flex-col items-center gap-1">
                  <span className="text-[#8B5CF6]/50 text-xs">{q.icon}</span>
                  <span
                    className="text-white/40 text-[12px] italic"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {q.label}
                  </span>
                  <span className="text-gray-700 text-[10px]">— {q.src}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── COME FUNZIONA ────────────────────── */}
      <section id="come-funziona" className="relative z-10 px-6 py-32 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <p className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.5em] mb-5 font-mono">Come funziona il test</p>
          <h2
            className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight max-w-xl"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Test archetipo in 3 passi.<br />
            <span className="font-light italic text-white/40" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Una rivelazione che dura per sempre.
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-0 relative">
          {/* Connecting line desktop */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/20 to-transparent" />

          {[
            {
              num: "01",
              icon: <SacredIcon type="mirror" />,
              title: "Mirror Moment",
              desc: "7 domande introspettive. Rispondi di istinto, senza filtrare. Il subconscio sa già la risposta.",
              color: "#8B5CF6",
            },
            {
              num: "02",
              icon: <SacredIcon type="ai" />,
              title: "Analisi Archetipale",
              desc: "L'AI interseca pattern junghiani con le tue risposte e costruisce un profilo di rarità unica al mondo.",
              color: "#C084FC",
            },
            {
              num: "03",
              icon: <SacredIcon type="card" />,
              title: "La tua MindPrint",
              desc: "Una card visiva con il tuo archetipo, immagine generata apposta per te, forze, ombre e consigli pratici.",
              color: "#D946EF",
            },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.13, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative px-8 py-10 group"
            >
              {/* Large number background */}
              <div
                className="absolute top-4 right-6 text-[100px] font-bold leading-none select-none pointer-events-none"
                style={{
                  fontFamily: "Cinzel, serif",
                  color: `${step.color}08`,
                }}
              >
                {step.num}
              </div>

              <div className="relative z-10">
                <div className="mb-6 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  {step.icon}
                </div>
                <h3
                  className="text-white text-lg font-semibold mb-3"
                  style={{ fontFamily: "Cinzel, serif" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-gray-500 text-[15px] leading-relaxed"
                  style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.05rem" }}
                >
                  {step.desc}
                </p>

                <div
                  className="mt-6 h-0.5 w-12 group-hover:w-20 transition-all duration-500"
                  style={{ background: `linear-gradient(90deg, ${step.color}, transparent)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ────────────────────── ARCHETIPI GRID ────────────────────── */}
      <section className="relative z-10 px-6 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <p className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.5em] mb-4 font-mono">
                Il pantheon
              </p>
              <h2
                className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold leading-tight"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Chi potresti essere
              </h2>
            </div>
            <p
              className="text-gray-500 max-w-xs text-right text-[1rem] leading-relaxed hidden md:block"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              48 archetipi unici. Ognuno con la propria frequenza, rarità e percorso evolutivo.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ARCHETYPES_GRID.map((a, i) => (
              <ArchetypeGridCard key={a.name} a={a} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 text-center"
          >
            <p
              className="text-gray-600 text-sm italic"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              e altri 40 archetipi ti aspettano...
            </p>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────── PERCHÉ È DIVERSO + STATS ────────────────────── */}
      <section className="relative z-10 px-6 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">

          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.5em] mb-5 font-mono">
              Perché è diverso dagli altri test
            </p>
            <h2
              className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold mb-10 leading-tight"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Psicologia junghiana + AI,<br />
              <span className="font-light italic text-white/50" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                non un oroscopo generico.
              </span>
            </h2>

            <div className="space-y-5">
              {[
                "Basato su psicologia archetipale junghiana",
                "Insight generati da AI — non template generici",
                "Immagine archetipale generata esclusivamente per te",
                "Analisi di forze, zone d'ombra e consigli pratici",
                "Card condivisibile con rarità unica al mondo",
                "Evoluzione e confronto del tuo archetipo nel tempo",
              ].map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className="flex items-start gap-4"
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #D946EF)" }}
                  >
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span
                    className="text-gray-300 text-[1rem] leading-relaxed"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {f}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 gap-5"
          >
            {[
              { value: "50K+", label: "Archetipi scoperti", sub: "in 6 mesi di beta" },
              { value: "94%", label: "Riconoscimento", sub: "degli utenti si riconosce nell'analisi" },
              { value: "4.9★", label: "Rating medio", sub: "su 3.200 recensioni verificate" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-7 rounded-2xl flex items-center gap-6"
                style={{
                  background: "rgba(15,11,26,0.5)",
                  border: "1px solid rgba(139,92,246,0.12)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="text-5xl font-bold tabular-nums flex-shrink-0"
                  style={{
                    fontFamily: "Cinzel, serif",
                    background: "linear-gradient(135deg, #8B5CF6, #C084FC)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stat.value}
                </div>
                <div>
                  <p className="text-white font-medium text-base">{stat.label}</p>
                  <p
                    className="text-gray-600 text-sm mt-0.5"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {stat.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────────────── TESTIMONIALS ────────────────────── */}
      <section className="relative z-10 px-6 py-28 border-t border-white/5 overflow-hidden">
        {/* Background quote mark */}
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 text-[20rem] leading-none select-none pointer-events-none font-bold"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            color: "rgba(139,92,246,0.04)",
          }}
        >
          &ldquo;
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.5em] mb-4 font-mono">
              Voci dall&apos;interno
            </p>
            <h2
              className="text-[clamp(1.8rem,4vw,3rem)] font-bold"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Chi ha già varcato la soglia
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative p-8 rounded-2xl flex flex-col justify-between overflow-hidden"
                style={{
                  background: "rgba(15,11,26,0.55)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(16px)",
                  borderLeft: `3px solid ${t.avatar}60`,
                }}
              >
                {/* Left accent inner glow */}
                <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none"
                  style={{ background: `linear-gradient(90deg, ${t.avatar}10, transparent)` }} />

                {/* Quote icon */}
                <div
                  className="text-4xl leading-none mb-4 opacity-40"
                  style={{ fontFamily: "Cormorant Garamond, serif", color: t.avatar }}
                >
                  &ldquo;
                </div>

                <p
                  className="text-white/75 text-[1.1rem] leading-[1.7] mb-8 flex-1 italic"
                  style={{ fontFamily: "Cormorant Garamond, serif" }}
                >
                  {t.quote}
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: `radial-gradient(circle at 35% 35%, ${t.avatar}cc, ${t.avatar}55)` }}
                  >
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{t.author}</p>
                    <p className="text-gray-600 text-xs" style={{ fontFamily: "EB Garamond, serif" }}>
                      {t.role}
                    </p>
                  </div>
                </div>

                {/* Bottom accent */}
                <div
                  className="absolute bottom-0 left-8 right-8 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${t.avatar}30, transparent)` }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── CTA FINALE ────────────────────── */}
      <section className="relative z-10 px-6 py-36 overflow-hidden">
        {/* Deep glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.1) 0%, rgba(217,70,239,0.05) 35%, transparent 65%)",
          }}
        />

        {/* Decorative ring */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ border: "1px solid rgba(139,92,246,0.07)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ border: "1px solid rgba(192,132,252,0.05)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <p className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.5em] mb-8 font-mono">
            Inizia il test gratuito
          </p>

          <h2
            className="leading-tight mb-6"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            <span className="block text-[clamp(2.2rem,5.5vw,4rem)] font-normal text-white/90">
              Scopri il tuo
            </span>
            <span
              className="block text-[clamp(2.8rem,7vw,5.5rem)] font-bold"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #C084FC, #D946EF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              archetipo junghiano
            </span>
          </h2>

          <p
            className="text-gray-500 text-[1.1rem] mb-4 leading-relaxed"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Test di personalità AI gratuito. 7 domande, 90 secondi. Nessuna carta di credito.
          </p>

          {/* Live counter badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10 text-sm"
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
              fontFamily: "EB Garamond, serif",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#D946EF" }}
            />
            <span className="text-[#C084FC]">
              <LiveCounter /> persone hanno scoperto il loro archetipo oggi
            </span>
          </div>

          <div className="block">
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: "0 0 80px rgba(139,92,246,0.65), 0 12px 40px rgba(0,0,0,0.6)",
              }}
              whileTap={{ scale: 0.96 }}
              onClick={handleStart}
              className="px-14 py-5 rounded-2xl font-bold text-white text-base"
              style={{
                background: "linear-gradient(135deg, #6D28D9, #8B5CF6, #C084FC)",
                boxShadow: "0 0 60px rgba(139,92,246,0.5), 0 8px 32px rgba(0,0,0,0.5)",
                fontFamily: "Cinzel, serif",
                letterSpacing: "0.05em",
              }}
            >
              Scopri il tuo archetipo &rarr;
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ────────────────────── FOOTER ────────────────────── */}
      <footer className="relative z-10 border-t border-[#8B5CF6]/8 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img src="/logos/logo-icon.png" alt="" className="h-7 w-7 opacity-50" />
              <div>
                <p
                  className="text-white/40 text-sm font-semibold"
                  style={{ fontFamily: "Cinzel, serif", letterSpacing: "0.1em" }}
                >
                  MindPrint
                </p>
                <p className="text-gray-700 text-[11px]">Psicologia Archetipale AI</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Termini di Servizio", href: "/termini" },
                { label: "Cookie", href: "/cookie" },
                { label: "Instagram", href: "https://instagram.com/mindprintai" },
                { label: "TikTok", href: "https://tiktok.com/@mindprintai" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-gray-600 text-sm hover:text-gray-300 transition-colors"
                  style={{ fontFamily: "EB Garamond, serif" }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/4 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-700 text-xs" style={{ fontFamily: "EB Garamond, serif" }}>
              &copy; 2026 MindPrint &mdash; Tutti i diritti riservati
            </p>
            <p
              className="text-gray-800 text-xs italic"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              &ldquo;Conosci te stesso&rdquo; — Delfi, VI sec. a.C.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
