import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Sparkles, Zap } from "lucide-react";
import { TRPCClientError } from "@trpc/client";

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

export default function MirrorMoment() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);

  const startTestMutation = trpc.test.startTest.useMutation({
    onSuccess: (data) => setCurrentTestId(data.testId),
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Initialize test
  const initializeTest = useCallback(() => {
    const questions: Question[] = [
      {
        id: 1,
        text: "Quando sei solo, il silenzio ti ricarica o ti pesa?",
        options: [
          "Mi ricarica profondamente",
          "Mi pesa, preferisco il rumore",
          "Dipende dal mio stato emotivo",
          "Mi mette a disagio",
        ],
      },
      {
        id: 2,
        text: "Come reagisci quando scopri una verità scomoda su te stesso?",
        options: [
          "La affronti subito e rifletti",
          "La eviti il più possibile",
          "La elabori lentamente nel tempo",
          "La condividi con qualcuno di fiducia",
        ],
      },
      {
        id: 3,
        text: "Quale emozione ti guida più spesso nelle decisioni?",
        options: [
          "L'intuizione e l'istinto",
          "La logica e l'analisi",
          "L'empatia verso gli altri",
          "La paura di sbagliare",
        ],
      },
      {
        id: 4,
        text: "Come preferisci esprimere i tuoi sentimenti più profondi?",
        options: [
          "Attraverso l'arte o la creatività",
          "Con parole dirette e sincere",
          "Attraverso le azioni",
          "Preferisco non esprimerli",
        ],
      },
      {
        id: 5,
        text: "Cosa ti fa sentire più vivo?",
        options: [
          "Scoprire nuovi aspetti di me stesso",
          "Aiutare gli altri",
          "Raggiungere obiettivi ambiziosi",
          "Stare in connessione autentica",
        ],
      },
      {
        id: 6,
        text: "Quale paura è più profonda per te?",
        options: [
          "Non essere abbastanza",
          "Perdere il controllo",
          "Essere incompreso",
          "Restare solo",
        ],
      },
      {
        id: 7,
        text: "Come desideri essere ricordato?",
        options: [
          "Come qualcuno di profondo e consapevole",
          "Come qualcuno di affidabile e leale",
          "Come qualcuno di creativo e innovativo",
          "Come qualcuno di compassionevole",
        ],
      },
    ];

    const session: TestSession = {
      sessionId: `test-${Date.now()}`,
      currentQuestion: 0,
      totalQuestions: questions.length,
      answers: {},
      startTime: Date.now(),
      questions,
    };

    setTestSession(session);
    setTimeRemaining(90);
    setShowIntro(false);
    startTestMutation.mutate();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!testSession || showIntro) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - submit test
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testSession, showIntro]);

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!testSession || !selectedAnswer) return;

    const updatedAnswers = {
      ...testSession.answers,
      [testSession.currentQuestion]: selectedAnswer,
    };

    if (testSession.currentQuestion < testSession.totalQuestions - 1) {
      setTestSession({
        ...testSession,
        currentQuestion: testSession.currentQuestion + 1,
        answers: updatedAnswers,
      });
      setSelectedAnswer(null);
    } else {
      // All questions answered
      handleSubmitTest(updatedAnswers);
    }
  };

  const handleSubmitTest = useCallback(
    (finalAnswers?: Record<number, string>) => {
      if (!testSession || isProcessing) return;

      setIsProcessing(true);
      const answers = finalAnswers || testSession.answers;

      const testId = currentTestId ?? 0;
      const stringAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([k, v]) => { stringAnswers[k] = v; });

      sessionStorage.setItem("pendingTestData", JSON.stringify({ testId, answers: stringAnswers }));
      navigate("/processing");
    },
    [testSession, isProcessing, navigate, currentTestId]
  );

  if (!isAuthenticated) {
    return null;
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-16 h-16 glow-neon-pink animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold">
              <span className="glow-neon-pink">Mirror Moment</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Scopri la tua impronta emotiva in 90 secondi
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-6 bg-card border border-border/50 rounded-lg p-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Come funziona</h2>
              <ul className="space-y-3">
                {[
                  "Rispondi a 7 domande personali e introspettive",
                  "Ogni risposta adatta le domande successive",
                  "Il timer è di 90 secondi — non c'è fretta",
                  "Sii autentico — non ci sono risposte giuste o sbagliate",
                  "L'AI genererà il tuo archetipo emotivo unico",
                ].map((instruction, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-[#C084FC] font-bold">✓</span>
                    <span className="text-foreground">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border/50 pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Pronto? Clicca il pulsante qui sotto per iniziare. Avrai 90
                secondi per completare il test.
              </p>
              <Button
                size="lg"
                className="w-full bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white font-bold animate-glow"
                onClick={initializeTest}
              >
                <Zap className="w-5 h-5 mr-2" />
                Inizia il Mirror Moment
              </Button>
            </div>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-muted-foreground text-center">
            I tuoi dati sono privati e protetti. Leggi la nostra{" "}
            <a href="#" className="text-[#C084FC] hover:underline">
              privacy policy
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (!testSession) {
    return null;
  }

  const currentQuestion = testSession.questions[testSession.currentQuestion];
  const progress =
    ((testSession.currentQuestion + 1) / testSession.totalQuestions) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header with timer */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="text-sm font-mono text-muted-foreground">
              Domanda {testSession.currentQuestion + 1} di{" "}
              {testSession.totalQuestions}
            </div>
          </div>

          <div
            className={`text-2xl font-bold font-mono ${
              timeRemaining <= 10
                ? "text-red-500 animate-pulse"
                : "glow-neon-cyan"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-border/50">
          <div
            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8 animate-slide-up">
          {/* Question */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === option
                      ? "border-[#8B5CF6] bg-[#8B5CF6]/10 text-foreground"
                      : "border-border/50 bg-card/50 hover:border-[#C084FC]/50 hover:bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === option
                          ? "border-[#8B5CF6] bg-[#8B5CF6]"
                          : "border-border/50"
                      }`}
                    >
                      {selectedAnswer === option && (
                        <span className="text-white text-sm font-bold">✓</span>
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Next button */}
          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1 bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white font-bold"
              onClick={handleNextQuestion}
              disabled={!selectedAnswer || isProcessing}
            >
              {testSession.currentQuestion === testSession.totalQuestions - 1
                ? "Completa il test"
                : "Prossima domanda"}
            </Button>
          </div>

          {/* Hint */}
          <p className="text-sm text-muted-foreground text-center">
            Rispondi con sincerità. Non ci sono risposte giuste o sbagliate.
          </p>
        </div>
      </div>
    </div>
  );
}
