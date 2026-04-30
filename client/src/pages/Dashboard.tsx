import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { it } from "date-fns/locale";

function rarityColor(rarity: number | null | undefined): string {
  const r = rarity ?? 100;
  if (r < 10) return "#FFD700"; // oro — ultra raro
  if (r < 30) return "#8B5CF6"; // viola — raro
  return "#6B7280"; // grigio — comune
}

export default function Dashboard() {
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [location, setLocation] = useLocation();
  const { data: tests, isLoading } = trpc.test.getHistory.useQuery();
  const { data: subStatus } = trpc.subscription.checkStatus.useQuery();
  const { data: archetypeData } = trpc.profile.getCurrentArchetype.useQuery();
  const isPremium = subStatus?.isPremium ?? false;

  const chartData = [...(tests ?? [])].reverse().map(test => ({
    data: format(new Date(test.createdAt), "dd MMM", { locale: it }),
    rarità: test.rarityPercentage ?? 0,
    nome: test.archetypeName ?? "",
  }));

  const latest = tests?.[0];
  const traits: string[] = archetypeData?.traits ?? [];

  const navTabs = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "La mia Card", path: "/mindprint-card" },
    { label: "Mirror Moment", path: "/mirror-moment" },
  ];

  return (
    <div className="min-h-screen bg-[#08080F] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.08]"
          style={{ background: "radial-gradient(circle at 100% 0%, #8B5CF6 0%, transparent 60%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 opacity-[0.06]"
          style={{ background: "radial-gradient(circle at 0% 100%, #D946EF 0%, transparent 60%)", filter: "blur(80px)" }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-[#8B5CF6]/15 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-8">
            <img src="/logos/logo-text.png" alt="MindPrint+AI" className="h-8 w-auto cursor-pointer" onClick={() => setLocation("/dashboard")} />
            <div className="hidden md:flex items-center gap-1">
              {navTabs.map(tab => {
                const active = location === tab.path;
                return (
                  <button key={tab.path} onClick={() => setLocation(tab.path)}
                    className="relative px-4 py-2 text-sm transition-colors rounded-lg"
                    style={{
                      color: active ? "#fff" : "rgba(255,255,255,0.45)",
                      background: active ? "rgba(139,92,246,0.12)" : "transparent",
                    }}>
                    {tab.label}
                    {active && (
                      <motion.span layoutId="nav-underline"
                        className="absolute bottom-0 left-3 right-3 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, #8B5CF6, transparent)" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm hidden sm:inline">{user?.name}</span>
            {isPremium ? (
              <span className="text-xs px-2 py-0.5 rounded-full border border-[#8B5CF6]/40 text-[#8B5CF6]">Premium</span>
            ) : (
              <button onClick={() => setLocation("/plan")} className="text-xs px-3 py-1 rounded-full text-white font-medium"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}>
                Upgrade
              </button>
            )}
            <button onClick={logout} className="text-gray-500 text-sm hover:text-white transition-colors">Esci</button>
          </div>
        </div>
        {/* Mobile tabs */}
        <div className="flex md:hidden items-center gap-1 mt-3 -mb-1 overflow-x-auto">
          {navTabs.map(tab => {
            const active = location === tab.path;
            return (
              <button key={tab.path} onClick={() => setLocation(tab.path)}
                className="px-3 py-1.5 text-xs whitespace-nowrap rounded-lg transition-colors"
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.45)",
                  background: active ? "rgba(139,92,246,0.12)" : "transparent",
                }}>
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* HERO archetipo attuale — elaborato */}
        {latest && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden">
            {/* Ambient glow per la card hero */}
            <div className="absolute -inset-1 rounded-2xl opacity-40 blur-2xl pointer-events-none"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #D946EF)" }} />

            <div className="relative p-7"
              style={{
                background: "linear-gradient(145deg, #0A0714 0%, #0F0B1A 60%, #110D20 100%)",
                border: "1px solid rgba(139,92,246,0.3)",
                boxShadow: "0 0 60px rgba(139,92,246,0.15), inset 0 1px 0 rgba(139,92,246,0.15)",
                borderRadius: "16px",
              }}>
              {/* Sacred geometry decorativo angolo */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 w-16 h-16 opacity-20 pointer-events-none">
                <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                  <circle cx="32" cy="32" r="28" stroke="#8B5CF6" strokeWidth="0.5" />
                  <polygon points="32,8 54,46 10,46" stroke="#C084FC" strokeWidth="0.5" fill="none" />
                  <circle cx="32" cy="32" r="2" fill="#8B5CF6" />
                </svg>
              </motion.div>

              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.4em] font-mono" style={{ color: "#8B5CF6" }}>
                  Archetipo Attuale
                </p>
                <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider"
                  style={{ color: "#10B981" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Live
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-2 leading-tight"
                style={{ color: "#C084FC", textShadow: "0 0 25px rgba(139,92,246,0.5)", fontFamily: "Cinzel, serif" }}>
                {archetypeData?.name ?? latest.archetypeName}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: rarityColor(latest.rarityPercentage), boxShadow: `0 0 8px ${rarityColor(latest.rarityPercentage)}` }} />
                <p className="text-sm" style={{ color: "#C084FC" }}>
                  Sei nel <span className="font-semibold">{latest.rarityPercentage}%</span> delle persone
                </p>
              </div>

              {/* Traits badges */}
              {traits.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {traits.map((trait, i) => (
                    <motion.span
                      key={trait}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                      className="px-2.5 py-1 text-[10px] rounded-full font-mono"
                      style={{
                        border: "1px solid rgba(139,92,246,0.4)",
                        color: "#C084FC",
                        background: "rgba(139,92,246,0.08)",
                      }}>
                      {trait}
                    </motion.span>
                  ))}
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <button onClick={() => setLocation("/mindprint-card")}
                  className="px-4 py-2 text-sm rounded-xl border border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-colors">
                  Vedi la tua card
                </button>
                <button onClick={() => setLocation("/mirror-moment")}
                  className="px-4 py-2 text-sm rounded-xl text-white font-medium"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
                  Ripeti il test →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chart evoluzione */}
        {chartData.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(10,7,20,0.55)",
              border: "1px solid rgba(139,92,246,0.15)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.05) inset",
            }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold" style={{ fontFamily: "Cinzel, serif" }}>Evoluzione emotiva</h3>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#8B5CF6]/50">Rarità nel tempo</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="data" stroke="#333" tick={{ fill: "#555", fontSize: 11 }} />
                <YAxis stroke="#333" tick={{ fill: "#555", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#08080F", border: "1px solid #8B5CF630", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "#666" }}
                  formatter={(value: number, _: string, props: any) => [`${value}% — ${props.payload.nome}`, "Rarità"]}
                />
                <Line type="monotone" dataKey="rarità" stroke="#8B5CF6" strokeWidth={2}
                  dot={{ fill: "#8B5CF6", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#8B5CF6" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Storico archetipi */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{
            background: "rgba(10,7,20,0.55)",
            border: "1px solid rgba(139,92,246,0.12)",
            backdropFilter: "blur(12px)",
          }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold" style={{ fontFamily: "Cinzel, serif" }}>Storico archetipi</h3>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#8B5CF6]/40">Cronologia</span>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-900 rounded-xl animate-pulse" />)}
            </div>
          ) : !tests?.length ? (
            // EMPTY STATE invitante con sacred geometry
            <div className="flex flex-col items-center justify-center text-center py-10 px-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mb-6 opacity-50">
                <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                  <circle cx="40" cy="40" r="36" stroke="#8B5CF6" strokeWidth="0.5" />
                  <circle cx="40" cy="40" r="24" stroke="#C084FC" strokeWidth="0.5" />
                  <polygon points="40,8 68,56 12,56" stroke="#8B5CF6" strokeWidth="0.5" fill="none" />
                  <polygon points="40,72 12,24 68,24" stroke="#D946EF" strokeWidth="0.5" fill="none" />
                  <circle cx="40" cy="40" r="3" fill="#8B5CF6" />
                </svg>
              </motion.div>
              <p className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.4em] mb-3 font-mono">In attesa</p>
              <h4 className="text-white text-lg font-semibold mb-2" style={{ fontFamily: "Cinzel, serif" }}>
                Il tuo specchio è ancora vuoto
              </h4>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">
                Il primo Mirror Moment rivela il tuo archetipo. 7 domande, 90 secondi.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocation("/mirror-moment")}
                className="px-6 py-3 text-sm rounded-xl text-white font-semibold"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)", boxShadow: "0 0 30px rgba(139,92,246,0.35)" }}>
                ✦ Inizia il Mirror Moment
              </motion.button>
            </div>
          ) : (
            <div className="space-y-2">
              {tests.map((test, i) => {
                const dot = rarityColor(test.rarityPercentage);
                return (
                  <motion.div key={test.id}
                    whileHover={{ x: 3, transition: { duration: 0.2 } }}
                    className="group flex items-center justify-between p-4 rounded-xl transition-all cursor-default"
                    style={{
                      border: "1px solid rgba(255,255,255,0.05)",
                      background: "rgba(255,255,255,0.01)",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${dot}30`; (e.currentTarget as HTMLDivElement).style.background = `${dot}08`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.01)"; }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all"
                        style={{ background: dot, boxShadow: `0 0 10px ${dot}90` }} />
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{test.archetypeName}</p>
                        <p className="text-gray-600 text-xs mt-0.5">
                          {format(new Date(test.createdAt), "d MMMM yyyy", { locale: it })} · {test.rarityPercentage}% raro
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {i === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#D946EF]/10 text-[#D946EF] border border-[#D946EF]/20">
                          Attuale
                        </span>
                      )}
                      <span className="text-gray-700 text-sm group-hover:text-gray-400 transition-colors">›</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Premium teaser — blurred preview */}
        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative rounded-2xl overflow-hidden border border-[#8B5CF6]/25">
            {/* Ambient glow */}
            <div className="absolute -inset-1 rounded-2xl opacity-30 blur-2xl pointer-events-none"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #D946EF)" }} />

            <div className="relative">
              {/* Blurred ghost preview */}
              <div className="p-6 space-y-4 select-none pointer-events-none"
                style={{ filter: "blur(6px)", opacity: 0.4, background: "rgba(139,92,246,0.04)" }}>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#8B5CF6" }}>✦ Punti di forza</p>
                  {["Capacità di elaborazione emotiva profonda", "Intuizione acuta nelle relazioni umane"].map(s => (
                    <div key={s} className="flex items-start gap-2 text-sm text-gray-300 mb-1">
                      <span style={{ color: "#8B5CF6" }}>→</span> {s}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#D946EF" }}>◈ Zone d'ombra</p>
                  {["Tendenza all'autocritica eccessiva"].map(s => (
                    <div key={s} className="flex items-start gap-2 text-sm text-gray-300 mb-1">
                      <span style={{ color: "#D946EF" }}>→</span> {s}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#C084FC" }}>⟡ Consigli settimanali</p>
                  <div className="text-sm text-gray-300">1. Dedica 10 min al giorno alla scrittura libera</div>
                </div>
              </div>

              {/* Overlay "Sblocca" centrale */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6"
                style={{ background: "linear-gradient(to bottom, rgba(8,8,15,0.4) 0%, rgba(8,8,15,0.85) 100%)" }}>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(217,70,239,0.2))",
                    border: "1px solid rgba(139,92,246,0.5)",
                    boxShadow: "0 0 30px rgba(139,92,246,0.4)",
                  }}>
                  <svg width="20" height="24" viewBox="0 0 16 20" fill="none">
                    <rect x="1" y="8" width="14" height="11" rx="2" stroke="#C084FC" strokeWidth="1.5" />
                    <path d="M4 8V5a4 4 0 018 0v3" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="14" r="1.5" fill="#C084FC" />
                  </svg>
                </motion.div>
                <p className="text-white text-base font-semibold text-center mb-1" style={{ fontFamily: "Cinzel, serif" }}>
                  Sblocca i tuoi insight premium
                </p>
                <p className="text-gray-400 text-xs text-center mb-5 max-w-sm">
                  Punti di forza · Zone d'ombra · Consigli settimanali · Analisi profonda
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setLocation("/plan")}
                  className="px-6 py-2.5 text-sm rounded-xl text-white font-semibold"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)", boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}>
                  Sblocca Premium →
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
