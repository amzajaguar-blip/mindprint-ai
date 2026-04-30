import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  text: string;
  options: string[];
}

interface TestSession {
  sessionId: string;
  currentQuestion: number;
  totalQuestions: number;
  answers: Record<number, string>;
  startTime: number;
  questions: Question[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Quando sei completamente solo nel silenzio, cosa accade dentro di te?",
    options: [
      "Mi dissolvo — è il mio habitat naturale",
      "Mi ricarico lentamente, poi ho bisogno di connessione",
      "Dipende dallo stato interiore in cui arrivo",
      "Sento un disagio sottile, come se mancasse qualcosa",
      "Il silenzio mi spaventa — preferisco il rumore del mondo",
    ],
  },
  {
    id: 2,
    text: "Qualcuno ti mostra una verità scomoda su di te. Cosa fai?",
    options: [
      "La guardo dritta negli occhi, anche se fa male",
      "La elaboro lentamente, da solo, nel tempo",
      "Cerco qualcuno di fiducia con cui confrontarmi",
      "La razionalizzo finché non sembra più una minaccia",
      "La rifiuto — non è una verità, è un'opinione",
    ],
  },
  {
    id: 3,
    text: "Quando devi prendere una decisione importante, cosa governa davvero la scelta?",
    options: [
      "Un'intuizione che sento nel corpo prima della testa",
      "L'analisi logica — peso pro e contro fino alla chiarezza",
      "Come si sentirà l'altra persona coinvolta",
      "Il precedente — cosa ho già fatto in situazioni simili",
      "La paura delle conseguenze se sbaglio",
    ],
  },
  {
    id: 4,
    text: "Hai qualcosa di profondo da dire. Come lo esprimi?",
    options: [
      "Attraverso la creazione — arte, musica, scrittura",
      "Con parole dirette, anche se scomode",
      "Con gesti e azioni più che con le parole",
      "Aspetto il momento giusto, poi mi apro completamente",
      "La maggior parte delle volte lo tengo dentro",
    ],
  },
  {
    id: 5,
    text: "In quale momento ti senti davvero vivo — quasi bruciante?",
    options: [
      "Quando scopro qualcosa di nuovo su me stesso",
      "Quando sono nel pieno flusso creativo",
      "Quando aiuto qualcuno a trasformare il proprio dolore",
      "Quando conquisto un obiettivo che sembrava impossibile",
      "Quando sono in connessione autentica con un'altra persona",
    ],
  },
  {
    id: 6,
    text: "Qual è la paura più antica che porti dentro?",
    options: [
      "Non essere mai abbastanza — qualunque cosa faccia",
      "Perdere il controllo su tutto ciò che conta",
      "Non essere capito davvero da nessuno",
      "Essere abbandonato proprio quando mi fido",
      "Scoprire che in fondo sono vuoto",
    ],
  },
  {
    id: 7,
    text: "Quando non ci sei più, cosa vuoi che rimanga di te?",
    options: [
      "Una profondità che ha cambiato il modo di vedere di qualcuno",
      "La fedeltà — essere stato presente quando contava",
      "Qualcosa di bello che hai creato e lasciato al mondo",
      "L'esempio di qualcuno che non si è mai arreso",
      "Il calore — che qualcuno si senta ancora amato grazie a te",
    ],
  },
];

function CircularTimer({ seconds, total }: { seconds: number; total: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = seconds / total;
  const danger = seconds <= 15;
  const color = danger ? "#EF4444" : "#8B5CF6";

  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <circle
          cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s", filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-mono text-sm font-bold ${danger ? "text-red-400" : "text-white"}`}>
          {seconds}
        </span>
      </div>
    </div>
  );
}

export default function MirrorMoment() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [session, setSession] = useState<TestSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);
  const [questionKey, setQuestionKey] = useState(0);

  const startTestMutation = trpc.test.startTest.useMutation({
    onSuccess: (data) => setCurrentTestId(data.testId),
  });

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const initializeTest = useCallback(() => {
    setSession({
      sessionId: `test-${Date.now()}`,
      currentQuestion: 0,
      totalQuestions: QUESTIONS.length,
      answers: {},
      startTime: Date.now(),
      questions: QUESTIONS,
    });
    setTimeRemaining(90);
    setShowIntro(false);
    startTestMutation.mutate();
  }, []);

  useEffect(() => {
    if (!session || showIntro) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { handleSubmitTest(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session, showIntro]);

  const handleSubmitTest = useCallback((finalAnswers?: Record<number, string>) => {
    if (!session || isProcessing) return;
    setIsProcessing(true);
    const answers = finalAnswers || session.answers;
    const testId = currentTestId ?? 0;
    const stringAnswers: Record<string, string> = {};
    Object.entries(answers).forEach(([k, v]) => { stringAnswers[k] = v; });
    sessionStorage.setItem("pendingTestData", JSON.stringify({ testId, answers: stringAnswers }));
    navigate("/processing");
  }, [session, isProcessing, navigate, currentTestId]);

  const handleNextQuestion = () => {
    if (!session || !selectedAnswer) return;
    const updatedAnswers = { ...session.answers, [session.currentQuestion]: selectedAnswer };
    if (session.currentQuestion < session.totalQuestions - 1) {
      setSession({ ...session, currentQuestion: session.currentQuestion + 1, answers: updatedAnswers });
      setSelectedAnswer(null);
      setQuestionKey(k => k + 1);
    } else {
      handleSubmitTest(updatedAnswers);
    }
  };

  if (!isAuthenticated) return null;

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#08080F] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8"
            style={{ background: "radial-gradient(circle, #D946EF 0%, transparent 70%)", filter: "blur(50px)" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-lg w-full"
        >
          {/* Ritual glyph */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-8"
          >
            <svg viewBox="0 0 80 80" fill="none" className="w-full h-full opacity-60">
              <circle cx="40" cy="40" r="36" stroke="#8B5CF6" strokeWidth="0.5" />
              <circle cx="40" cy="40" r="24" stroke="#C084FC" strokeWidth="0.5" />
              <polygon points="40,8 68,56 12,56" stroke="#8B5CF6" strokeWidth="0.5" fill="none" />
              <polygon points="40,72 12,24 68,24" stroke="#D946EF" strokeWidth="0.5" fill="none" />
              <circle cx="40" cy="40" r="3" fill="#8B5CF6" />
            </svg>
          </motion.div>

          <div className="text-center mb-10">
            <p className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.4em] mb-3 font-mono">Protocollo di Rivelazione</p>
            <h1 className="text-4xl font-bold mb-3 text-white" style={{ fontFamily: "Cinzel, serif", lineHeight: 1.2 }}>
              Mirror Moment
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
              7 domande. 90 secondi. L'AI costruirà la tua impronta emotiva unica — il tuo archetipo psicologico profondo.
            </p>
          </div>

          <div className="border border-[#8B5CF6]/15 rounded-2xl p-6 bg-[#0F0B1A]/80 mb-6 space-y-3">
            {[
              { icon: "◈", text: "Rispondi con istinto, non con la mente razionale" },
              { icon: "⟡", text: "Non ci sono risposte giuste o sbagliate" },
              { icon: "✦", text: "Il timer è orientativo — prenditi il tempo necessario" },
              { icon: "◉", text: "Il risultato ti sorprenderà per la sua precisione" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <span className="text-[#C084FC] text-sm flex-shrink-0 mt-0.5">{item.icon}</span>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={initializeTest}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #C084FC 100%)",
              boxShadow: "0 0 40px rgba(139, 92, 246, 0.4)",
            }}
          >
            <span style={{ fontFamily: "Cinzel, serif" }}>Inizia il Rituale</span>
          </motion.button>

          <p className="text-center text-gray-700 text-xs mt-4">
            I tuoi dati sono privati e non vengono condivisi con terzi
          </p>
        </motion.div>
      </div>
    );
  }

  if (!session) return null;

  const currentQ = session.questions[session.currentQuestion];
  const progress = (session.currentQuestion + 1) / session.totalQuestions;

  return (
    <div className="min-h-screen bg-[#08080F] flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {session.questions.map((_, i) => (
              <div key={i} className="h-0.5 w-6 rounded-full transition-all duration-500"
                style={{
                  background: i < session.currentQuestion ? "#8B5CF6" :
                    i === session.currentQuestion ? "linear-gradient(90deg, #8B5CF6, #C084FC)" :
                    "rgba(255,255,255,0.08)",
                  boxShadow: i === session.currentQuestion ? "0 0 8px #8B5CF680" : "none",
                }}
              />
            ))}
          </div>
          <span className="text-gray-600 text-xs font-mono">
            {session.currentQuestion + 1}/{session.totalQuestions}
          </span>
        </div>
        <CircularTimer seconds={timeRemaining} total={90} />
      </div>

      {/* Progress bar */}
      <div className="relative z-10 h-px mx-6 bg-white/5 mb-4">
        <motion.div className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #7C3AED, #C084FC)", boxShadow: "0 0 10px #8B5CF680" }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Question */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={questionKey}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <p className="text-[#8B5CF6] text-[10px] uppercase tracking-[0.4em] mb-5 font-mono text-center">
                Domanda {session.currentQuestion + 1}
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10 leading-snug"
                style={{ fontFamily: "Cinzel, serif" }}>
                {currentQ.text}
              </h2>

              <div className="space-y-3">
                {currentQ.options.map((option, i) => {
                  const selected = selectedAnswer === option;
                  const letter = ["A", "B", "C", "D", "E"][i];
                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      whileHover={{ scale: 1.015, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedAnswer(option)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        background: selected ? "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(217,70,239,0.15))" : "rgba(255,255,255,0.03)",
                        border: selected ? "1px solid rgba(139,92,246,0.7)" : "1px solid rgba(255,255,255,0.06)",
                        boxShadow: selected ? "0 0 20px rgba(139,92,246,0.2)" : "none",
                      }}
                    >
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold font-mono"
                        style={{
                          background: selected ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.05)",
                          color: selected ? "#fff" : "rgba(255,255,255,0.3)",
                          border: selected ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {letter}
                      </span>
                      <span className="text-sm leading-snug" style={{ color: selected ? "#E2D9F3" : "rgba(255,255,255,0.65)" }}>
                        {option}
                      </span>
                      {selected && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto flex-shrink-0 text-[#8B5CF6] text-base">
                          ✦
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <motion.button
              whileHover={selectedAnswer ? { scale: 1.01 } : {}}
              whileTap={selectedAnswer ? { scale: 0.99 } : {}}
              onClick={handleNextQuestion}
              disabled={!selectedAnswer || isProcessing}
              className="w-full py-4 rounded-xl font-semibold text-sm transition-all duration-300"
              style={{
                background: selectedAnswer
                  ? "linear-gradient(135deg, #8B5CF6, #C084FC)"
                  : "rgba(255,255,255,0.04)",
                color: selectedAnswer ? "white" : "rgba(255,255,255,0.2)",
                boxShadow: selectedAnswer ? "0 0 30px rgba(139,92,246,0.35)" : "none",
                cursor: selectedAnswer ? "pointer" : "default",
              }}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
                  </svg>
                  Elaborazione...
                </span>
              ) : session.currentQuestion === session.totalQuestions - 1 ? (
                "Rivela il mio archetipo →"
              ) : (
                "Prossima domanda →"
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
