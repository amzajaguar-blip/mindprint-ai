import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#08080F] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-80 h-80"
          style={{
            background: "radial-gradient(circle, rgba(217,70,239,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Sacred geometry spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 mx-auto mb-10 opacity-40"
        >
          <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
            <circle cx="40" cy="40" r="36" stroke="#8B5CF6" strokeWidth="0.5" />
            <circle cx="40" cy="40" r="24" stroke="#C084FC" strokeWidth="0.5" />
            <polygon points="40,8 68,56 12,56" stroke="#8B5CF6" strokeWidth="0.5" fill="none" />
            <polygon points="40,72 12,24 68,24" stroke="#D946EF" strokeWidth="0.5" fill="none" />
            <circle cx="40" cy="40" r="3" fill="#8B5CF6" />
          </svg>
        </motion.div>

        {/* 404 number */}
        <div
          className="text-[clamp(5rem,20vw,9rem)] font-bold leading-none mb-2 select-none"
          style={{
            fontFamily: "Cinzel, serif",
            background: "linear-gradient(135deg, #8B5CF6 0%, #C084FC 50%, #D946EF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: 0.9,
          }}
        >
          404
        </div>

        <p
          className="text-[10px] uppercase tracking-[0.5em] mb-5 font-mono"
          style={{ color: "#8B5CF6" }}
        >
          Pagina non trovata
        </p>

        <h1
          className="text-2xl font-bold text-white mb-3 leading-snug"
          style={{ fontFamily: "Cinzel, serif" }}
        >
          Questo specchio è vuoto
        </h1>

        <p
          className="text-gray-500 text-[1.05rem] mb-10 leading-relaxed"
          style={{ fontFamily: "Cormorant Garamond, serif" }}
        >
          La pagina che cerchi non esiste o è stata spostata.
          <br />
          Il tuo archetipo ti aspetta ancora.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(139,92,246,0.5)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation("/")}
            className="px-8 py-3.5 rounded-xl font-semibold text-white text-sm"
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #C084FC)",
              boxShadow: "0 0 24px rgba(139,92,246,0.3)",
              fontFamily: "Cinzel, serif",
              letterSpacing: "0.04em",
            }}
          >
            Torna all'inizio
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation("/dashboard")}
            className="px-8 py-3.5 rounded-xl text-gray-400 text-sm border border-white/8 hover:border-[#8B5CF6]/30 hover:text-white transition-all"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
