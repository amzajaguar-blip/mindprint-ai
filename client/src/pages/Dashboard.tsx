import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function Dashboard() {
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const { data: tests, isLoading } = trpc.test.getHistory.useQuery();
  const { data: subStatus } = trpc.subscription.checkStatus.useQuery();
  const isPremium = subStatus?.isPremium ?? false;

  const chartData = [...(tests ?? [])].reverse().map(test => ({
    data: format(new Date(test.createdAt), "dd MMM", { locale: it }),
    rarità: test.rarityPercentage ?? 0,
    nome: test.archetypeName ?? "",
  }));

  const latest = tests?.[0];

  return (
    <div className="min-h-screen bg-[#08080F] text-white">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      <nav className="relative z-10 border-b border-[#8B5CF6]/15 px-6 py-4 flex items-center justify-between backdrop-blur">
        <img src="/logos/logo-text.png" alt="MindPrint+AI" className="h-8 w-auto" />
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">{user?.name}</span>
          {isPremium && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-[#8B5CF6]/40 text-[#8B5CF6]">Premium</span>
          )}
          <button onClick={logout} className="text-gray-500 text-sm hover:text-white transition-colors">Esci</button>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8 space-y-6">

        {latest && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="border border-[#8B5CF6]/25 rounded-2xl p-6 bg-black/50">
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">Archetipo attuale</p>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#8B5CF6", textShadow: "0 0 15px #8B5CF640" }}>
              {latest.archetypeName}
            </h2>
            <p className="text-[#C084FC] text-sm mb-5">Sei nel {latest.rarityPercentage}% delle persone</p>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setLocation("/mindprint-card")}
                className="px-4 py-2 text-sm rounded-xl border border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-colors">
                Vedi la tua card
              </button>
              <button onClick={() => setLocation("/mirror-moment")}
                className="px-4 py-2 text-sm rounded-xl text-white font-medium"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}>
                Ripeti il test →
              </button>
            </div>
          </motion.div>
        )}

        {chartData.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="border border-gray-800 rounded-2xl p-6 bg-black/30">
            <h3 className="text-white font-semibold mb-5">Evoluzione emotiva</h3>
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

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="border border-gray-800 rounded-2xl p-6 bg-black/30">
          <h3 className="text-white font-semibold mb-4">Storico archetipi</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-900 rounded-xl animate-pulse" />)}
            </div>
          ) : !tests?.length ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm mb-5">Nessun test ancora.</p>
              <button onClick={() => setLocation("/mirror-moment")}
                className="px-6 py-2 text-sm rounded-xl text-white font-medium"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}>
                Inizia il Mirror Moment
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {tests.map((test, i) => (
                <div key={test.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-800/60 hover:border-[#8B5CF6]/20 transition-colors">
                  <div>
                    <p className="text-white font-medium text-sm">{test.archetypeName}</p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {format(new Date(test.createdAt), "d MMMM yyyy", { locale: it })} · {test.rarityPercentage}% raro
                    </p>
                  </div>
                  {i === 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#D946EF]/10 text-[#D946EF] border border-[#D946EF]/20">
                      Attuale
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="border border-[#8B5CF6]/20 rounded-2xl p-6 bg-[#8B5CF6]/5 text-center">
            <p className="text-white font-semibold mb-2">Sblocca i tuoi insight premium</p>
            <p className="text-gray-400 text-sm mb-4">Punti di forza, zone d'ombra, consigli settimanali</p>
            <button onClick={() => setLocation("/mindprint-card")}
              className="px-6 py-2.5 text-sm rounded-xl text-white font-medium"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}>
              Sblocca Premium →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
