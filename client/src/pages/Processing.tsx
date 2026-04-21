import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

const STEPS = [
  "Analisi delle tue risposte...",
  "Identificazione dei pattern emotivi...",
  "Generazione del tuo archetipo unico...",
  "Creazione degli insight personali...",
  "MindPrint Card quasi pronta...",
];

export default function Processing() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  const submitAnswers = trpc.test.submitAnswers.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("lastTestId", String(data.testId));
      sessionStorage.setItem("lastShareToken", data.shareToken);
      setTimeout(() => setLocation("/mindprint-card"), 600);
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

    const interval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#08080F] flex flex-col items-center justify-center p-8">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-md w-full"
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-28 h-28 mx-auto mb-10 rounded-full"
          style={{ background: "radial-gradient(circle at center, #8B5CF6 0%, #C084FC 60%, transparent 80%)", filter: "blur(10px)" }}
        />

        <img src="/logos/logo-text.png" alt="MindPrint+AI" className="h-10 w-auto mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">in elaborazione</h1>
        <p className="text-gray-500 mb-10 text-sm">L'AI sta costruendo la tua impronta emotiva unica</p>

        <div className="space-y-4 text-left">
          <AnimatePresence>
            {STEPS.map((step, i) =>
              i <= currentStep ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={i === currentStep ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
                    transition={{ duration: 1, repeat: i === currentStep ? Infinity : 0 }}
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background: i < currentStep ? "#D946EF" : "#C084FC",
                      boxShadow: `0 0 8px ${i < currentStep ? "#D946EF" : "#C084FC"}`,
                    }}
                  />
                  <span className={`text-sm ${i < currentStep ? "text-gray-600 line-through" : "text-gray-200"}`}>
                    {step}
                  </span>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>

        <p className="text-gray-700 text-xs mt-12">Circa 20-40 secondi...</p>
      </motion.div>
    </div>
  );
}
