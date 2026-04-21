import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleStartTest = () => {
    if (isAuthenticated) {
      navigate("/mirror-moment");
    } else {
      window.location.href = getLoginUrl("/mirror-moment");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logos/logo-icon.png" alt="MindPrint" className="h-9 w-9" />
            <img src="/logos/logo-text.png" alt="MindPrint+AI" className="h-7 w-auto hidden sm:block" />
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Ciao, {user?.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
              </>
            ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    window.location.href = getLoginUrl();
                  }}
                >
                Accedi
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background grid effect */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(90deg, #8B5CF6 1px, transparent 1px), linear-gradient(0deg, #8B5CF6 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#8B5CF6] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#C084FC] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />

        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="glow-neon-pink">La tua impronta</span>
                  <br />
                  <span className="glow-neon-cyan">emotiva</span>
                  <br />
                  in 90 secondi
                </h2>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Scopri il tuo archetipo emotivo con un test adattivo
                  potenziato dall'AI. Non è un oroscopo generico — è
                  precisione identitaria.
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white font-bold text-base animate-glow"
                  onClick={handleStartTest}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Scopri il tuo archetipo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#C084FC] text-[#C084FC] hover:bg-[#C084FC]/10"
                >
                  Come funziona
                </Button>
              </div>

              {/* Social Proof */}
              <div className="space-y-3 pt-4">
                <p className="text-sm text-muted-foreground font-mono">
                  ✓ 50.000+ archetipi scoperti
                </p>
                <div className="flex gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-border bg-gradient-to-br from-[#8B5CF6] to-[#C084FC]"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Unisciti a migliaia di cercatori curiosi
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Visual Card Preview */}
            <div className="relative h-96 md:h-full flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                {/* Outer glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] rounded-lg blur-2xl opacity-30" />

                {/* Card */}
                <div className="relative bg-card border border-[#8B5CF6]/30 rounded-lg p-8 space-y-6 backdrop-blur-sm">
                  {/* HUD Brackets */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#8B5CF6]" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#C084FC]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#D946EF]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#8B5CF6]" />

                  {/* Card Content */}
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-[#8B5CF6]/20 to-[#C084FC]/20 rounded border border-border/50 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-[#C084FC] opacity-50" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold glow-neon-pink">
                        Elaboratore Profondo
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sei nel 12% delle persone con questo profilo
                      </p>
                    </div>

                    <p className="text-sm italic text-[#C084FC]">
                      "Finalmente qualcuno mi capisce davvero"
                    </p>

                    <div className="pt-4 space-y-2">
                      <p className="text-xs text-muted-foreground font-mono">
                        TRATTI CHIAVE
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["Introspettivo", "Sensibile", "Creativo"].map(
                          (trait) => (
                            <span
                              key={trait}
                              className="px-3 py-1 text-xs border border-[#C084FC]/50 rounded text-[#C084FC] font-mono"
                            >
                              {trait}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-t border-border/50 bg-card/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Come funziona <span className="glow-neon-cyan">MindPrint</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un processo semplice ma profondo per scoprire la tua vera
              impronta emotiva
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Mirror Moment",
                description:
                  "Rispondi a 5-7 domande dinamiche in 90 secondi. Il test si adatta alle tue risposte.",
                icon: "🪞",
              },
              {
                step: "02",
                title: "Analisi AI",
                description:
                  "L'intelligenza artificiale genera il tuo archetipo emotivo unico e personalizzato.",
                icon: "⚡",
              },
              {
                step: "03",
                title: "Scoperta",
                description:
                  "Ricevi la tua MindPrint Card con insight sorprendenti e condivisibili.",
                icon: "✨",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative group p-8 border border-border/50 rounded-lg hover:border-[#8B5CF6]/50 transition-all duration-300 hover:bg-card/50"
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>

                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">
                Perché <span className="glow-neon-pink">MindPrint</span> è
                diverso
              </h2>

              <div className="space-y-4">
                {[
                  "Archetipi evoluti che cambiano con te nel tempo",
                  "Insight generati da AI, non template generici",
                  "Condivisione virale della tua card personale",
                  "Analisi premium con punti di forza e zone d'ombra",
                  "Consigli pratici settimanali personalizzati",
                ].map((feature) => (
                  <div key={feature} className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-[#D946EF] flex-shrink-0 mt-1" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-96 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-[#C084FC]/10 rounded-lg blur-2xl" />
              <div className="relative text-center space-y-4">
                <div className="text-6xl font-bold glow-neon-cyan">50K+</div>
                <p className="text-muted-foreground">
                  Archetipi scoperti in 8 settimane
                </p>
                <div className="text-sm text-[#D946EF] font-mono">
                  NPS: 55 | Retention D7: 28%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/5 to-[#C084FC]/5" />

        <div className="container relative z-10 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Pronto a scoprire la tua impronta emotiva?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Il test dura solo 90 secondi. Nessuna registrazione richiesta.
            Inizia ora.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] hover:opacity-90 text-white font-bold text-base animate-glow"
            onClick={handleStartTest}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Inizia il Mirror Moment
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 glow-neon-pink">MindPrint</h3>
              <p className="text-sm text-muted-foreground">
                Scopri la tua impronta emotiva
              </p>
            </div>
            {[
              { title: "Prodotto", links: ["Test", "Dashboard", "Premium"] },
              { title: "Azienda", links: ["About", "Blog", "Contatti"] },
              { title: "Legal", links: ["Privacy", "Termini", "Cookie"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2026 MindPrint. Tutti i diritti riservati.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              {["Twitter", "Instagram", "LinkedIn"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#8B5CF6] transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
