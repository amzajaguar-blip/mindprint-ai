import { useParams } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Share2 } from "lucide-react";
import { getPalette } from "@/lib/archetypePalette";
import { RarityBar, CardPattern, CornerBrackets, ScanLineOverlay, HolographicSheen } from "@/components/ArchetypeCard";

export default function PublicCard() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data: result, isLoading, error } = trpc.mindprint.getCard.useQuery(
    { shareToken: shareToken ?? "" },
    { enabled: !!shareToken }
  );
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const { test } = result ?? {};
  const palette = getPalette(test?.archetypeName);
  const traits: string[] = test?.keyTraits ? JSON.parse(test.keyTraits) : [];

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Ho scoperto il mio archetipo psicologico: ${test?.archetypeName}. "${test?.surprisePhrase}" — Scopri il tuo su MindPrint 🧠✨`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    setShowShare(false);
  };

  const handlePlatform = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank", "width=600,height=420");
    setShowShare(false);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#08080F] flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-mono"
        style={{ color: "#8B5CF6" }}
      >
        Invocando l'archetipo...
      </motion.div>
    </div>
  );

  if (error || !result) return (
    <div className="min-h-screen bg-[#08080F] flex flex-col items-center justify-center text-center p-8 gap-6 relative">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 opacity-30 mb-2"
      >
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <circle cx="32" cy="32" r="28" stroke="#8B5CF6" strokeWidth="0.5" />
          <polygon points="32,8 54,46 10,46" stroke="#C084FC" strokeWidth="0.5" fill="none" />
          <circle cx="32" cy="32" r="2" fill="#8B5CF6" />
        </svg>
      </motion.div>
      <p className="text-gray-500 text-sm">Card non trovata o non più disponibile.</p>
      <a href="/"
        className="px-6 py-3 rounded-xl text-white text-sm font-semibold"
        style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)", boxShadow: "0 0 24px rgba(139,92,246,0.3)" }}>
        Scopri il tuo archetipo →
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08080F] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Grid */}
      <div className="fixed inset-0 opacity-[0.022] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px]"
          style={{ background: `radial-gradient(circle at 100% 0%, ${palette.a} 0%, transparent 60%)`, filter: "blur(80px)" }}
        />
        <div className="absolute bottom-0 left-0 w-80 h-80"
          style={{ background: `radial-gradient(circle at 0% 100%, ${palette.c} 0%, transparent 60%)`, filter: "blur(60px)", opacity: 0.08 }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Label */}
          <p className="text-center text-[9px] uppercase tracking-[0.5em] mb-5 font-mono" style={{ color: palette.a }}>
            ✦ Archetipo Emotivo Condiviso
          </p>

          {/* The card */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0A0714 0%, #0F0B1A 60%, #110D20 100%)",
              border: `1px solid ${palette.a}35`,
              boxShadow: `0 0 80px ${palette.glow}, 0 0 160px ${palette.glow}40, inset 0 1px 0 ${palette.a}15`,
            }}
          >
            <CardPattern palette={palette} />
            <CornerBrackets palette={palette} />
            <HolographicSheen palette={palette} />

            <div className="relative z-10 p-6 space-y-5">
              {/* Image — sempre visibile, placeholder se manca URL */}
              <div className="h-52 rounded-xl overflow-hidden relative"
                style={{ border: `1px solid ${palette.a}20`, background: `linear-gradient(135deg, ${palette.a}10, ${palette.c}08)` }}>
                {test?.imageUrl ? (
                  <>
                    <img
                      src={test.imageUrl}
                      alt={test.archetypeName ?? "archetipo"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <ScanLineOverlay />
                    <div className="absolute inset-0"
                      style={{ background: `linear-gradient(to top, ${palette.a}30, transparent 45%)` }} />
                    <div
                      className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-mono backdrop-blur-sm"
                      style={{ background: `${palette.a}30`, border: `1px solid ${palette.a}50`, color: palette.b }}
                    >
                      top {test.rarityPercentage}%
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <svg viewBox="0 0 120 120" fill="none" className="w-28 h-28 opacity-20">
                      <circle cx="60" cy="60" r="54" stroke={palette.a} strokeWidth="0.7" />
                      <circle cx="60" cy="60" r="36" stroke={palette.b} strokeWidth="0.6" />
                      <circle cx="60" cy="60" r="18" stroke={palette.c} strokeWidth="0.5" />
                      <polygon points="60,14 100,82 20,82" stroke={palette.a} strokeWidth="0.6" fill="none" />
                      <polygon points="60,106 20,38 100,38" stroke={palette.c} strokeWidth="0.6" fill="none" />
                      <circle cx="60" cy="60" r="4" fill={palette.a} />
                    </svg>
                    <p className="text-[10px] font-mono uppercase tracking-widest opacity-40" style={{ color: palette.b }}>
                      {test?.archetypeName ?? "Archetipo"}
                    </p>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <p className="text-[9px] uppercase tracking-[0.4em] mb-1 font-mono opacity-40">Archetipo</p>
                <h1
                  className="text-2xl font-bold mb-3 leading-tight"
                  style={{ color: palette.a, textShadow: `0 0 30px ${palette.a}60`, fontFamily: "Cinzel, serif" }}
                >
                  {test?.archetypeName}
                </h1>
                <RarityBar value={test?.rarityPercentage ?? 12} palette={palette} />
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed">{test?.archetypeDescription}</p>

              {/* Surprise phrase */}
              {test?.surprisePhrase && (
                <p className="italic text-sm pl-3 leading-snug"
                  style={{ color: palette.b, borderLeft: `2px solid ${palette.a}50` }}>
                  &ldquo;{test.surprisePhrase}&rdquo;
                </p>
              )}

              {/* Traits */}
              <div className="flex flex-wrap gap-1.5">
                {traits.map(t => (
                  <span key={t} className="px-2.5 py-1 text-[10px] rounded-full font-mono"
                    style={{ border: `1px solid ${palette.a}35`, color: palette.b, background: `${palette.a}10` }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Watermark */}
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: `${palette.a}12` }}>
                <span className="text-[9px] font-mono opacity-25 uppercase tracking-widest">MindPrint+AI</span>
                <span className="text-[10px] font-mono" style={{ color: `${palette.a}50` }}>mindprint.it</span>
              </div>
            </div>
          </div>

          {/* Share button */}
          <div className="relative mt-5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowShare(v => !v)}
              className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm"
              style={{
                background: `linear-gradient(135deg, ${palette.a}, ${palette.b})`,
                boxShadow: `0 4px 24px ${palette.glow}`,
                fontFamily: "Cinzel, serif",
                letterSpacing: "0.03em",
              }}
            >
              <Share2 className="w-4 h-4" />
              Condividi questa card
            </motion.button>

            <AnimatePresence>
              {showShare && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 right-0 mb-2 rounded-xl p-2 space-y-1 z-20"
                  style={{ background: "#0F0B1A", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {[
                    { id: "twitter", label: "Twitter / X", color: "#1DA1F2" },
                    { id: "whatsapp", label: "WhatsApp", color: "#25D366" },
                    { id: "telegram", label: "Telegram", color: "#0088CC" },
                  ].map(p => (
                    <button key={p.id} onClick={() => handlePlatform(p.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-gray-300 text-sm text-left">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      {p.label}
                    </button>
                  ))}
                  <button onClick={handleCopy}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-gray-300 text-sm text-left">
                    {copied
                      ? <><Check className="w-4 h-4 flex-shrink-0" style={{ color: palette.a }} /><span style={{ color: palette.a }}>Link copiato!</span></>
                      : <><Copy className="w-4 h-4 flex-shrink-0" /><span>Copia link</span></>
                    }
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA scopri il tuo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-4 p-5 rounded-xl text-center"
            style={{
              background: "rgba(15,11,26,0.7)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] mb-2 font-mono" style={{ color: palette.a }}>
              Il tuo archetipo ti aspetta
            </p>
            <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1rem" }}>
              7 domande. 90 secondi. Un'analisi che ti sorprenderà.
            </p>
            <a
              href="/"
              className="inline-block w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${palette.a}cc, ${palette.b}cc)`,
                fontFamily: "Cinzel, serif",
              }}
            >
              Scopri il tuo archetipo →
            </a>
          </motion.div>

          {/* Watermark bottom */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <img src="/logos/logo-icon.png" alt="" className="h-4 w-4 opacity-25" />
            <span className="text-gray-700 text-[10px] font-mono uppercase tracking-widest">MindPrint+AI · mindprint.it</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
