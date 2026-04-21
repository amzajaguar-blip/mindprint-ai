import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Share2, Download, Heart, Zap, Copy, Check, MessageCircle, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import html2canvas from "html2canvas";

export default function MindPrintCard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: cards, isLoading } = trpc.mindprint.getUserCards.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: subStatus } = trpc.subscription.checkStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: ({ checkoutUrl }) => { window.location.href = checkoutUrl; },
  });

  const card = cards?.[0];
  const test = card?.test;
  const isPremium = subStatus?.isPremium ?? false;

  const traits: string[] = test?.keyTraits ? JSON.parse(test.keyTraits) : [];
  const strengthPoints: string[] = test?.strengthPoints ? JSON.parse(test.strengthPoints) : [];
  const shadowZones: string[] = test?.shadowZones ? JSON.parse(test.shadowZones) : [];
  const weeklyAdvice: string[] = test?.weeklyAdvice ? JSON.parse(test.weeklyAdvice) : [];

  // shareToken from sessionStorage (set by Processing page) or from card
  const shareToken = sessionStorage.getItem("lastShareToken") || card?.shareToken;
  const shareUrl = shareToken ? `${window.location.origin}/card/${shareToken}` : window.location.href;

  useEffect(() => {
    if (!isAuthenticated) { navigate("/"); return; }
    const timer = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  const handleShare = (platform: string) => {
    const text = `Ho scoperto il mio archetipo emotivo: ${test?.archetypeName}. "${test?.surprisePhrase}" Scopri il tuo su MindPrint 🧠✨`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
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
      {/* Grid bg */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      <nav className="relative z-10 border-b border-[#8B5CF6]/15 px-6 py-4 flex items-center justify-between backdrop-blur">
        <img src="/logos/logo-text.png" alt="MindPrint+AI" className="h-8 w-auto" />
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 text-sm hover:text-white transition-colors">
          Dashboard
        </button>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-5xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[#8B5CF6] text-sm">Caricamento della tua card...</motion.div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left — Card */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -20 }}
                animate={revealed ? { scale: 1, opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-sm"
              >
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-2xl blur-2xl opacity-30 pointer-events-none"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }} />

                {/* Card (ref per PNG download) */}
                <div ref={cardRef} className="relative bg-black border border-[#8B5CF6]/40 rounded-2xl p-7 space-y-5"
                  style={{ boxShadow: "0 0 50px #8B5CF620" }}>
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[#8B5CF6] rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-[#C084FC] rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-[#D946EF] rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[#8B5CF6] rounded-br-xl" />

                  <div className="h-44 bg-gradient-to-br from-[#8B5CF6]/15 to-[#C084FC]/15 rounded-xl flex items-center justify-center overflow-hidden border border-white/5">
                    {test?.imageUrl ? (
                      <img src={test.imageUrl} alt={test.archetypeName ?? ""} className="w-full h-full object-cover" />
                    ) : (
                      <Zap className="w-20 h-20 opacity-20 text-[#C084FC]" />
                    )}
                  </div>

                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">Archetipo</p>
                    <h2 className="text-2xl font-bold" style={{ color: "#8B5CF6", textShadow: "0 0 20px #8B5CF655" }}>
                      {test?.archetypeName ?? "—"}
                    </h2>
                    <p className="text-[#C084FC] text-xs mt-1">Sei nel {test?.rarityPercentage ?? "—"}% delle persone</p>
                  </div>

                  {test?.surprisePhrase && (
                    <p className="text-[#C084FC] italic text-sm border-l-2 border-[#C084FC] pl-3">
                      "{test.surprisePhrase}"
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {traits.map(trait => (
                      <span key={trait} className="px-2.5 py-1 text-xs border border-[#C084FC]/30 text-[#C084FC] rounded-full">
                        {trait}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-center pt-1">
                    <Heart className="w-5 h-5 text-[#8B5CF6] fill-[#8B5CF6] animate-pulse" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right — Azioni + Premium */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Descrizione */}
              <div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: "#C084FC", textShadow: "0 0 15px #C084FC55" }}>
                  Chi sei
                </h2>
                <p className="text-gray-300 leading-relaxed">{test?.archetypeDescription}</p>
              </div>

              {/* Share */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}
                >
                  <Share2 className="w-4 h-4" /> Condividi la tua card
                </button>
                {showShareMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-gray-800 rounded-xl p-3 space-y-1 z-20">
                    {[
                      { id: "twitter", label: "Twitter / X", color: "#1DA1F2" },
                      { id: "whatsapp", label: "WhatsApp", color: "#25D366" },
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
                      {copied ? <><Check className="w-4 h-4 text-[#D946EF]" /><span className="text-[#D946EF]">Copiato!</span></> : <><Copy className="w-4 h-4" /><span>Copia link</span></>}
                    </button>
                  </div>
                )}
              </div>

              {/* Download PNG */}
              <button onClick={downloadCard}
                className="w-full py-2.5 border border-gray-700 rounded-xl text-gray-400 text-sm hover:border-[#C084FC] hover:text-[#C084FC] transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Scarica come immagine
              </button>

              {/* Premium content o paywall */}
              {isPremium ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#D946EF]" style={{ boxShadow: "0 0 8px #D946EF" }} />
                    <span className="text-[#D946EF] text-sm font-medium">Premium attivo</span>
                  </div>

                  {strengthPoints.length > 0 && (
                    <div className="border border-[#D946EF]/20 rounded-xl p-5 bg-[#D946EF]/5">
                      <h3 className="text-[#D946EF] font-semibold mb-3 text-sm">✦ I tuoi punti di forza</h3>
                      <ul className="space-y-2">
                        {strengthPoints.map(s => (
                          <li key={s} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-[#D946EF] mt-0.5 flex-shrink-0">→</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {shadowZones.length > 0 && (
                    <div className="border border-[#C084FC]/20 rounded-xl p-5 bg-[#C084FC]/5">
                      <h3 className="text-[#C084FC] font-semibold mb-3 text-sm">◈ Zone di crescita</h3>
                      <ul className="space-y-2">
                        {shadowZones.map(s => (
                          <li key={s} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-[#C084FC] mt-0.5 flex-shrink-0">→</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weeklyAdvice.length > 0 && (
                    <div className="border border-[#8B5CF6]/20 rounded-xl p-5 bg-[#8B5CF6]/5">
                      <h3 className="text-[#8B5CF6] font-semibold mb-3 text-sm">⟡ Consigli per questa settimana</h3>
                      <ul className="space-y-2">
                        {weeklyAdvice.map((a, i) => (
                          <li key={a} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-[#8B5CF6] font-bold mt-0.5 flex-shrink-0">{i + 1}.</span> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {test?.premiumAnalysis && (
                    <div className="border border-gray-800 rounded-xl p-5">
                      <h3 className="text-white font-semibold mb-3 text-sm">Analisi approfondita</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{test.premiumAnalysis}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-[#8B5CF6]/30 rounded-xl p-6 bg-[#8B5CF6]/5">
                  <h3 className="text-white font-bold mb-1">Sblocca Premium</h3>
                  <p className="text-gray-400 text-sm mb-4">Scopri cosa c'è davvero dentro di te</p>
                  <ul className="space-y-2 text-sm text-gray-400 mb-5">
                    <li>✦ Punti di forza specifici alle tue risposte</li>
                    <li>✦ Zone d'ombra e aree di crescita</li>
                    <li>✦ 3 consigli pratici per questa settimana</li>
                    <li>✦ Analisi approfondita (relazioni, lavoro, crescita)</li>
                  </ul>
                  <button
                    onClick={() => createCheckout.mutate()}
                    disabled={createCheckout.isPending}
                    className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}
                  >
                    {createCheckout.isPending ? "Preparazione..." : "€4,99/mese — Sblocca ora"}
                  </button>
                </div>
              )}

              {/* Secondary buttons */}
              <div className="flex gap-3">
                <button onClick={() => navigate("/mirror-moment")}
                  className="flex-1 py-2.5 border border-gray-700 rounded-xl text-gray-400 text-sm hover:border-[#8B5CF6]/40 hover:text-[#8B5CF6] transition-colors">
                  Ripeti il test
                </button>
                <button onClick={() => navigate("/dashboard")}
                  className="flex-1 py-2.5 border border-gray-700 rounded-xl text-gray-400 text-sm hover:border-gray-500 hover:text-white transition-colors">
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
