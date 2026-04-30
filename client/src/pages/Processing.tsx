import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

const STEPS = [
  { text: "Decifrando i pattern emotivi...", icon: "◈" },
  { text: "Mappando le frequenze archetipali...", icon: "⟡" },
  { text: "Invocando il tuo archetipo unico...", icon: "✦" },
  { text: "Tessendo i tuoi insight personali...", icon: "◉" },
  { text: "La tua MindPrint è quasi pronta...", icon: "❋" },
];

const ORACLE_PHRASES = [
  "L'AI sta leggendo le tracce più profonde di chi sei...",
  "Ogni risposta rivela qualcosa che sapevi già...",
  "Il tuo archetipo emerge dall'ombra...",
  "La mappa interiore prende forma...",
];

export default function Processing() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [dots, setDots] = useState(1);

  const submitAnswers = trpc.test.submitAnswers.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("lastTestId", String(data.testId));
      sessionStorage.setItem("lastShareToken", data.shareToken);
      setTimeout(() => setLocation("/mindprint-card"), 800);
    },
    onError: () => {
      setLocation("/mirror-moment");
    },
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingTestData");
    if (!raw) { setLocation("/mirror-moment"); return; }

    let parsed: { testId: number; answers: Record<string, string> };
    try { parsed = JSON.parse(raw); } catch { setLocation("/mirror-moment"); return; }

    submitAnswers.mutate({ testId: parsed.testId, answers: parsed.answers });
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }, 4000);
    const phraseInterval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % ORACLE_PHRASES.length);
    }, 3200);
    const dotsInterval = setInterval(() => {
      setDots(prev => prev >= 3 ? 1 : prev + 1);
    }, 500);
    return () => {
      clearInterval(stepInterval);
      clearInterval(phraseInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#08080F] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Ambient pulse glows */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 65%)", filter: "blur(60px)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #D946EF 0%, transparent 65%)", filter: "blur(50px)" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 text-center max-w-md w-full"
      >
        {/* Sacred geometry — Metatron layers */}
        <div className="relative w-44 h-44 mx-auto mb-12">
          {/* Outer slow ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <svg viewBox="0 0 160 160" fill="none" className="w-full h-full opacity-25">
              <circle cx="80" cy="80" r="74" stroke="#8B5CF6" strokeWidth="0.6" strokeDasharray="4 6" />
              <circle cx="80" cy="80" r="60" stroke="#C084FC" strokeWidth="0.4" />
              <polygon points="80,12 140,104 20,104" stroke="#8B5CF6" strokeWidth="0.5" fill="none" />
              <polygon points="80,148 20,56 140,56" stroke="#D946EF" strokeWidth="0.5" fill="none" />
            </svg>
          </motion.div>

          {/* Middle counter-rotate */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6"
          >
            <svg viewBox="0 0 120 120" fill="none" className="w-full h-full opacity-30">
              <circle cx="60" cy="60" r="54" stroke="#C084FC" strokeWidth="0.5" />
              <circle cx="60" cy="60" r="38" stroke="#8B5CF6" strokeWidth="0.4" />
              <line x1="60" y1="6" x2="60" y2="114" stroke="#C084FC" strokeWidth="0.3" />
              <line x1="6" y1="60" x2="114" y2="60" stroke="#C084FC" strokeWidth="0.3" />
              <line x1="18" y1="18" x2="102" y2="102" stroke="#D946EF" strokeWidth="0.3" />
              <line x1="102" y1="18" x2="18" y2="102" stroke="#D946EF" strokeWidth="0.3" />
            </svg>
          </motion.div>

          {/* Inner pulsing core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-full"
              style={{
                background: "radial-gradient(circle, #C084FC 0%, #8B5CF6 50%, transparent 80%)",
                filter: "blur(8px)",
              }}
            />
            {/* Step icon */}
            <AnimatePresence mode="wait">
              <motion.span
                key={currentStep}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute text-2xl"
                style={{ color: "#E2D9F3" }}
              >
                {STEPS[currentStep].icon}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Logo + title */}
        <img src="/logos/logo-text.png" alt="MindPrint+AI" className="h-9 w-auto mx-auto mb-5 opacity-70" />

        <h1
          className="text-xl font-bold text-white mb-2"
          style={{ fontFamily: "Cinzel, serif", letterSpacing: "0.04em" }}
        >
          Rivelazione in corso
          <span className="inline-block w-6 text-left" style={{ color: "#8B5CF6" }}>
            {".".repeat(dots)}
          </span>
        </h1>

        {/* Oracle phrase */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
            className="text-gray-500 text-sm mb-10 italic"
            style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1rem" }}
          >
            {ORACLE_PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Steps list */}
        <div className="space-y-3 text-left">
          {STEPS.map((step, i) => (
            <AnimatePresence key={step.text}>
              {i <= currentStep && (
                <motion.div
                  initial={{ opacity: 0, x: -16, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={
                      i === currentStep
                        ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
                        : {}
                    }
                    transition={{ duration: 1, repeat: i === currentStep ? Infinity : 0 }}
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background: i < currentStep ? "#34D399" : "#C084FC",
                      boxShadow: `0 0 8px ${i < currentStep ? "#34D399" : "#C084FC"}80`,
                    }}
                  />
                  <span
                    className="text-sm font-mono transition-colors"
                    style={{ color: i < currentStep ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.75)" }}
                  >
                    {i < currentStep ? "✓ " : ""}{step.text}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        <p
          className="text-gray-700 text-xs mt-12 font-mono"
        >
          ⟡ circa 20-40 secondi — non chiudere la pagina
        </p>
      </motion.div>
    </div>
  );
}
