import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";

export default function PublicCard() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data: result, isLoading, error } = trpc.mindprint.getCard.useQuery(
    { shareToken: shareToken ?? "" },
    { enabled: !!shareToken }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-[#08080F] flex items-center justify-center">
      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
        className="text-[#8B5CF6] text-sm">Caricamento...</motion.div>
    </div>
  );

  if (error || !result) return (
    <div className="min-h-screen bg-[#08080F] flex flex-col items-center justify-center text-center p-8">
      <p className="text-gray-400 mb-6">Card non trovata o non disponibile.</p>
      <a href="/" className="px-6 py-3 rounded-lg text-white font-bold"
        style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}>
        Scopri il tuo archetipo →
      </a>
    </div>
  );

  const { test } = result;
  const traits: string[] = test?.keyTraits ? JSON.parse(test.keyTraits) : [];

  return (
    <div className="min-h-screen bg-[#08080F] flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm">
        <div className="relative p-6 rounded-2xl border border-[#8B5CF6]/20 bg-black/80 backdrop-blur"
          style={{ boxShadow: "0 0 60px #8B5CF610" }}>
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#8B5CF6] rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#C084FC] rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#D946EF] rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#8B5CF6] rounded-br-lg" />

          {test?.imageUrl && (
            <img src={test.imageUrl} alt="archetipo" className="w-full h-44 object-cover rounded-xl mb-5" />
          )}

          <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">Archetipo</p>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#8B5CF6", textShadow: "0 0 20px #8B5CF655" }}>
            {test?.archetypeName}
          </h1>
          <p className="text-[#C084FC] text-xs mb-4">
            Sei nel {test?.rarityPercentage}% delle persone
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">{test?.archetypeDescription}</p>
          {test?.surprisePhrase && (
            <p className="text-[#C084FC] italic text-sm mb-5">"{test.surprisePhrase}"</p>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {traits.map(trait => (
              <span key={trait} className="px-3 py-1 text-xs border border-[#8B5CF6]/30 text-[#8B5CF6] rounded-full">
                {trait}
              </span>
            ))}
          </div>

          <a href="/" className="block w-full py-3 text-center font-bold text-white rounded-lg"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}>
            Scopri il tuo archetipo →
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5">
          <img src="/logos/logo-icon.png" alt="MindPrint" className="h-5 w-5" />
          <span className="text-gray-600 text-xs">test psicologico AI</span>
        </div>
      </motion.div>
    </div>
  );
}
