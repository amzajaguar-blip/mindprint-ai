import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Share2, Download, Heart, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import html2canvas from "html2canvas";
import { getPalette } from "@/lib/archetypePalette";
import { RarityBar, CardPattern, CornerBrackets, ScanLineOverlay, HolographicSheen } from "@/components/ArchetypeCard";

export default function MindPrintCard() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: cards, isLoading } = trpc.mindprint.getUserCards.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const { data: subStatus } = trpc.subscription.checkStatus.useQuery(undefined, { enabled: isAuthenticated });
  const genImage = trpc.mindprint.generateImage.useMutation({
    onSuccess: (data) => { if (data.imageUrl) { setLocalImageUrl(data.imageUrl); setImageError(null); } },
    onError: (err) => { setImageError(err.message || "Generazione fallita. Riprova tra poco."); },
  });

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: ({ checkoutUrl }) => { window.location.href = checkoutUrl; },
  });
  const useReward = trpc.subscription.useReward.useMutation({
    onSuccess: () => utils.subscription.checkStatus.invalidate(),
  });

  const card = cards?.[0];
  const test = card?.test;
  const isPremium = subStatus?.isPremium ?? false;
  const rewardCount = subStatus?.rewardCount ?? 0;
  const isRewardUnlocked = subStatus?.isRewardUnlocked ?? false;

  const palette = getPalette(test?.archetypeName);
  const traits: string[] = test?.keyTraits ? JSON.parse(test.keyTraits) : [];
  const strengthPoints: string[] = test?.strengthPoints ? JSON.parse(test.strengthPoints) : [];
  const shadowZones: string[] = test?.shadowZones ? JSON.parse(test.shadowZones) : [];
  const weeklyAdvice: string[] = test?.weeklyAdvice ? JSON.parse(test.weeklyAdvice) : [];

  const shareToken = sessionStorage.getItem("lastShareToken") || card?.shareToken;
  const shareUrl = shareToken ? `${window.location.origin}/card/${shareToken}` : window.location.href;

  useEffect(() => {
    if (!isAuthenticated) { navigate("/"); return; }
    const t = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(t);
  }, [isAuthenticated, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  const handleShare = (platform: string) => {
    const text = `Ho scoperto il mio archetipo: ${test?.archetypeName}. "${test?.surprisePhrase}" Scopri il tuo archetipo junghiano su MindPrint 🧠✨`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: "#08080F", scale: 2 });
    const link = document.createElement("a");
    link.download = `mindprint-${(test?.archetypeName ?? "card").replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#08080F] text-white overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10"
          style={{ background: `radial-gradient(circle at 100% 0%, ${palette.a} 0%, transparent 60%)`, filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 opacity-8"
          style={{ background: `radial-gradient(circle at 0% 100%, ${palette.c} 0%, transparent 60%)`, filter: "blur(80px)" }} />
      </div>

      <nav className="relative z-10 border-b border-[#8B5CF6]/12 px-6 py-4 flex items-center justify-between backdrop-blur">
        <img src="/logos/logo-text.png" alt="MindPrint+AI" className="h-8 w-auto cursor-pointer" onClick={() => navigate("/dashboard")} />
        <button onClick={() => navigate("/dashboard")} className="text-gray-500 text-sm hover:text-white transition-colors">
          Dashboard
        </button>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-5xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm font-mono" style={{ color: palette.a }}>
              Caricamento della tua card...
            </motion.div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12 items-start">

            {/* LEFT — The Card */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: -24 }}
                animate={revealed ? { scale: 1, opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="w-full max-w-[340px]"
              >
                {/* Outer aura */}
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${palette.a}, ${palette.c})` }} />

                  {/* The printable card */}
                  <div ref={cardRef} className="relative rounded-2xl overflow-hidden"
                    style={{
                      background: "linear-gradient(145deg, #0A0714 0%, #0F0B1A 60%, #110D20 100%)",
                      border: `1px solid ${palette.a}40`,
                      boxShadow: `0 0 60px ${palette.glow}, inset 0 1px 0 ${palette.a}20`,
                    }}>

                    {/* Sacred geometry overlay */}
                    <CardPattern palette={palette} />
                    <HolographicSheen palette={palette} />

                    <CornerBrackets palette={palette} />

                    <div className="relative z-10 p-7 space-y-5">
                      {/* Image */}
                      <div className="h-52 rounded-xl overflow-hidden relative"
                        style={{ background: `linear-gradient(135deg, ${palette.a}20, ${palette.c}15)`, border: `1px solid ${palette.a}20` }}>
                        {(localImageUrl || test?.imageUrl) ? (
                          <img src={localImageUrl || test!.imageUrl!} alt={test?.archetypeName ?? ""} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            {genImage.isPending ? (
                              <>
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="w-12 h-12 rounded-full"
                                  style={{ background: `radial-gradient(circle, ${palette.a}, ${palette.c})`, filter: "blur(8px)" }}
                                />
                                <p className="text-xs font-mono" style={{ color: palette.b }}>Generazione in corso…</p>
                              </>
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${palette.a}, ${palette.c})` }} />
                                {imageError && (
                                  <p className="text-xs font-mono text-red-400 text-center px-4 mb-1 leading-snug">{imageError}</p>
                                )}
                                <button
                                  onClick={() => { setImageError(null); card?.testId && genImage.mutate({ testId: card.testId }); }}
                                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                  style={{ background: `linear-gradient(135deg, ${palette.a}, ${palette.b})`, boxShadow: `0 0 16px ${palette.glow}` }}
                                >
                                  {imageError ? "↺ Riprova" : "✦ Genera immagine"}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                        <ScanLineOverlay />
                      </div>

                      {/* Header info */}
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.4em] mb-1 font-mono opacity-50">Archetipo Emotivo</p>
                        <h2 className="text-2xl font-bold mb-2 leading-tight"
                          style={{ color: palette.a, textShadow: `0 0 30px ${palette.a}60`, fontFamily: "Cinzel, serif" }}>
                          {test?.archetypeName ?? "—"}
                        </h2>
                        <RarityBar value={test?.rarityPercentage ?? 12} palette={palette} />
                      </div>

                      {/* Surprise phrase */}
                      {test?.surprisePhrase && (
                        <p className="italic text-sm leading-relaxed pl-3"
                          style={{ color: palette.b, borderLeft: `2px solid ${palette.a}60` }}>
                          "{test.surprisePhrase}"
                        </p>
                      )}

                      {/* Traits */}
                      <div className="flex flex-wrap gap-1.5">
                        {traits.map(t => (
                          <span key={t} className="px-2.5 py-1 text-[10px] rounded-full font-mono"
                            style={{ border: `1px solid ${palette.a}40`, color: palette.b, background: `${palette.a}10` }}>
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Footer watermark */}
                      <div className="flex items-center justify-between pt-2 border-t"
                        style={{ borderColor: `${palette.a}15` }}>
                        <span className="text-[9px] font-mono opacity-30 uppercase tracking-widest">MindPrint+AI</span>
                        <Heart className="w-3.5 h-3.5 opacity-30" style={{ color: palette.c }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT — Details & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="space-y-6"
            >
              {/* Description */}
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] mb-2 font-mono" style={{ color: palette.a }}>
                  Chi sei
                </p>
                <h2 className="text-xl font-bold mb-3" style={{ color: palette.b, fontFamily: "Cinzel, serif" }}>
                  {test?.archetypeName}
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm">{test?.archetypeDescription}</p>
              </div>

              {/* Share button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${palette.a}, ${palette.b})`, boxShadow: `0 4px 20px ${palette.glow}` }}
                >
                  <Share2 className="w-4 h-4" /> Condividi la tua card
                </button>

                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#0F0B1A] border border-gray-800 rounded-xl p-3 space-y-1 z-20"
                    >
                      <p className="text-[10px] text-center text-gray-600 pb-1 border-b border-gray-800 mb-1">
                        Condividi e sblocca reward &rarr;
                      </p>
                      {[
                        { id: "twitter", label: "Twitter / X", color: "#1DA1F2" },
                        { id: "whatsapp", label: "WhatsApp", color: "#25D366" },
                        { id: "telegram", label: "Telegram", color: "#0088CC" },
                        { id: "linkedin", label: "LinkedIn", color: "#0A66C2" },
                      ].map(p => (
                        <button key={p.id} onClick={() => handleShare(p.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-gray-300 text-sm">
                          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                          {p.label}
                        </button>
                      ))}
                      <button onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-gray-300 text-sm">
                        {copied
                          ? <><Check className="w-4 h-4" style={{ color: palette.a }} /><span style={{ color: palette.a }}>Copiato!</span></>
                          : <><Copy className="w-4 h-4" /><span>Copia link</span></>}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Download */}
              <button onClick={downloadCard}
                className="w-full py-2.5 border border-gray-800 rounded-xl text-gray-500 text-sm hover:text-white hover:border-gray-600 transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Scarica come immagine
              </button>

              {/* Premium content / paywall */}
              {isPremium || isRewardUnlocked ? (
                /* ── PREMIUM UNLOCKED ── */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg"
                    style={{ background: `${palette.a}12`, border: `1px solid ${palette.a}30` }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: palette.a, boxShadow: `0 0 8px ${palette.a}` }} />
                    <span className="text-xs font-mono uppercase tracking-widest" style={{ color: palette.b }}>Analisi Premium attiva</span>
                  </div>

                  {strengthPoints.length > 0 && (
                    <div className="rounded-xl p-5 space-y-3"
                      style={{ border: `1px solid ${palette.a}25`, background: `${palette.a}08` }}>
                      <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: palette.a }}>
                        <span>✦</span> I tuoi punti di forza
                      </h3>
                      <ul className="space-y-2.5">
                        {strengthPoints.map(s => (
                          <li key={s} className="text-gray-300 text-sm flex items-start gap-2 leading-relaxed">
                            <span className="mt-0.5 flex-shrink-0 text-xs" style={{ color: palette.a }}>→</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {shadowZones.length > 0 && (
                    <div className="rounded-xl p-5 space-y-3"
                      style={{ border: `1px solid ${palette.c}25`, background: `${palette.c}08` }}>
                      <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: palette.c }}>
                        <span>◈</span> Zone d'ombra e crescita
                      </h3>
                      <ul className="space-y-2.5">
                        {shadowZones.map(s => (
                          <li key={s} className="text-gray-300 text-sm flex items-start gap-2 leading-relaxed">
                            <span className="mt-0.5 flex-shrink-0 text-xs" style={{ color: palette.c }}>→</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weeklyAdvice.length > 0 && (
                    <div className="rounded-xl p-5 space-y-3"
                      style={{ border: `1px solid ${palette.b}20`, background: `${palette.b}06` }}>
                      <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: palette.b }}>
                        <span>⟡</span> Consigli per questa settimana
                      </h3>
                      <ul className="space-y-2.5">
                        {weeklyAdvice.map((adv, i) => (
                          <li key={adv} className="text-gray-300 text-sm flex items-start gap-3 leading-relaxed">
                            <span className="font-mono text-xs font-bold flex-shrink-0 mt-0.5 w-4" style={{ color: palette.b }}>{i + 1}.</span>
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {test?.premiumAnalysis && (
                    <div className="rounded-xl p-5 border border-gray-800 bg-white/[0.02]">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <span style={{ color: palette.a }}>◉</span> Analisi approfondita
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{test.premiumAnalysis}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* ── PAYWALL — blurred preview ── */
                <div className="space-y-4">
                  {/* Blurred ghost sections — user sees shape, not content */}
                  <div className="relative rounded-xl overflow-hidden">
                    {/* Ghost content (blurred) */}
                    <div className="p-5 space-y-3 select-none pointer-events-none"
                      style={{ filter: "blur(5px)", opacity: 0.35 }}>
                      <p className="text-sm font-semibold" style={{ color: palette.a }}>✦ I tuoi punti di forza</p>
                      {["Capacità di elaborazione emotiva profonda", "Intuizione acuta nelle relazioni", "Creatività nell'esprimere il mondo interiore"].map(s => (
                        <div key={s} className="flex items-start gap-2 text-sm text-gray-300">
                          <span style={{ color: palette.a }}>→</span> {s}
                        </div>
                      ))}
                    </div>
                    <div className="p-5 space-y-3 select-none pointer-events-none -mt-2"
                      style={{ filter: "blur(5px)", opacity: 0.35 }}>
                      <p className="text-sm font-semibold" style={{ color: palette.c }}>◈ Zone d'ombra</p>
                      {["Tendenza all'autocritica eccessiva", "Difficoltà a lasciar andare il passato"].map(s => (
                        <div key={s} className="flex items-start gap-2 text-sm text-gray-300">
                          <span style={{ color: palette.c }}>→</span> {s}
                        </div>
                      ))}
                    </div>
                    <div className="p-5 space-y-3 select-none pointer-events-none -mt-2"
                      style={{ filter: "blur(5px)", opacity: 0.35 }}>
                      <p className="text-sm font-semibold" style={{ color: palette.b }}>⟡ Consigli questa settimana</p>
                      {["1. Dedica 10 min al giorno alla scrittura libera", "2. Cerca una conversazione autentica"].map(s => (
                        <div key={s} className="text-sm text-gray-300">{s}</div>
                      ))}
                    </div>

                    {/* Lock overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ background: "linear-gradient(to bottom, rgba(8,8,15,0) 0%, rgba(8,8,15,0.7) 30%, rgba(8,8,15,0.92) 100%)" }}>
                      <div className="mt-auto pb-6 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                          style={{ background: `${palette.a}20`, border: `1px solid ${palette.a}40` }}>
                          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                            <rect x="1" y="8" width="14" height="11" rx="2" stroke={palette.a} strokeWidth="1.5" />
                            <path d="M4 8V5a4 4 0 018 0v3" stroke={palette.a} strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="8" cy="14" r="1.5" fill={palette.a} />
                          </svg>
                        </div>
                        <p className="text-white text-sm font-semibold text-center">L'analisi completa è nascosta</p>
                        <p className="text-gray-500 text-xs text-center">Punti di forza · Zone d'ombra · Consigli · Analisi profonda</p>
                      </div>
                    </div>
                  </div>

                  {/* Reward unlock */}
                  {rewardCount < 3 && (
                    <div className="rounded-xl p-4"
                      style={{ border: `1px solid ${palette.c}35`, background: `${palette.c}08` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold" style={{ color: palette.c }}>
                          Sblocca gratis
                        </p>
                        <span className="text-xs font-mono" style={{ color: palette.c }}>{rewardCount}/3 reward</span>
                      </div>
                      <div className="flex gap-2 mb-3">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                            style={{
                              background: i < rewardCount
                                ? `linear-gradient(90deg, ${palette.c}, ${palette.a})`
                                : "rgba(255,255,255,0.07)",
                              boxShadow: i < rewardCount ? `0 0 6px ${palette.c}80` : "none",
                            }} />
                        ))}
                      </div>
                      <p className="text-gray-600 text-xs mb-3">
                        Completa {3 - rewardCount} altro/i reward per sbloccare il premium permanentemente
                      </p>
                      <button
                        onClick={() => useReward.mutate()}
                        disabled={useReward.isPending}
                        className="w-full py-2.5 rounded-xl font-semibold text-white text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                        style={{ background: `linear-gradient(135deg, ${palette.c}, ${palette.a})` }}
                      >
                        {useReward.isPending ? "..." : `Usa reward (${rewardCount + 1}/3)`}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-gray-800 text-xs">
                    <div className="flex-1 h-px bg-gray-800" />
                    <span>oppure sblocca subito</span>
                    <div className="flex-1 h-px bg-gray-800" />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/plan")}
                    className="w-full py-4 rounded-xl font-bold text-white transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${palette.a}, ${palette.b})`,
                      boxShadow: `0 0 30px ${palette.glow}, 0 4px 16px rgba(0,0,0,0.4)`,
                    }}
                  >
                    <span className="block text-sm">Sblocca Premium — da €4,99/mese</span>
                    <span className="block text-[10px] opacity-70 mt-0.5 font-normal">Forze · Ombre · Consigli · Analisi completa</span>
                  </motion.button>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => navigate("/mirror-moment")}
                  className="flex-1 py-2.5 border border-gray-800 rounded-xl text-gray-500 text-sm hover:border-gray-600 hover:text-gray-300 transition-all">
                  Ripeti il test
                </button>
                <button onClick={() => navigate("/dashboard")}
                  className="flex-1 py-2.5 border border-gray-800 rounded-xl text-gray-500 text-sm hover:border-gray-600 hover:text-gray-300 transition-all">
                  Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
