import { type ReactNode } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <h2 className="text-lg font-semibold text-white mb-3" style={{ fontFamily: "Cinzel, serif" }}>
        {title}
      </h2>
      <div className="text-gray-400 leading-relaxed space-y-2" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.05rem" }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function Cookie() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#08080F] text-white">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <nav className="relative z-10 border-b border-[#8B5CF6]/10 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <span className="cursor-pointer text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setLocation("/")}
          style={{ fontFamily: "EB Garamond, serif" }}>
          ← MindPrint
        </span>
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#8B5CF6]/60 font-mono">Cookie Policy</span>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-14">
          <p className="text-[10px] uppercase tracking-[0.45em] mb-4 font-mono" style={{ color: "#8B5CF6" }}>Documento legale</p>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Cinzel, serif" }}>Cookie Policy</h1>
          <p className="text-gray-600 text-sm" style={{ fontFamily: "EB Garamond, serif" }}>
            Aggiornata il 28 aprile 2026 · Valida per mindprint.it
          </p>
          <div className="mt-6 h-px" style={{ background: "linear-gradient(90deg, #8B5CF640, transparent)" }} />
        </motion.div>

        <Section title="1. Cosa sono i cookie">
          <p>I cookie sono piccoli file di testo salvati nel tuo browser quando visiti un sito web. Servono a ricordare le tue preferenze e a mantenere attiva la tua sessione.</p>
        </Section>

        <Section title="2. Cookie tecnici essenziali">
          <p>MindPrint utilizza <strong className="text-white/70">solo cookie tecnici necessari</strong> al funzionamento del servizio. Non usiamo cookie di profilazione, pubblicitari o di terze parti per scopi di marketing.</p>
          <div className="mt-4 rounded-xl overflow-hidden border border-white/5">
            {[
              { nome: "session", scopo: "Mantiene attiva la sessione autenticata", durata: "7 giorni", tipo: "Tecnico" },
              { nome: "theme", scopo: "Ricorda la preferenza del tema visivo", durata: "1 anno", tipo: "Preferenza" },
            ].map((c, i) => (
              <div key={c.nome} className={`grid grid-cols-[100px_1fr_80px_80px] gap-2 px-4 py-3 text-xs ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                <span className="font-mono text-[#8B5CF6]">{c.nome}</span>
                <span className="text-gray-500">{c.scopo}</span>
                <span className="text-gray-600">{c.durata}</span>
                <span className="text-gray-600">{c.tipo}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="3. Cookie di terze parti">
          <p>Alcune funzionalità del servizio utilizzano risorse di terze parti che potrebbero impostare i propri cookie:</p>
          <ul className="list-none space-y-1 mt-2">
            {[
              "Google Fonts — per il caricamento dei font tipografici",
              "LemonSqueezy — durante il processo di pagamento (checkout esterno)",
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span style={{ color: "#C084FC" }} className="flex-shrink-0 mt-1">◈</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="4. Come gestire i cookie">
          <p>Puoi gestire, bloccare o eliminare i cookie dalle impostazioni del tuo browser. Disabilitare i cookie tecnici potrebbe compromettere il corretto funzionamento del login e della sessione.</p>
        </Section>

        <Section title="5. Contatti">
          <p>Per domande sui cookie: <strong className="text-white/70">privacy@mindprint.it</strong></p>
        </Section>
      </div>

      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center">
        <p className="text-gray-700 text-xs" style={{ fontFamily: "EB Garamond, serif" }}>
          &copy; 2026 MindPrint &middot;{" "}
          <button onClick={() => setLocation("/privacy")} className="hover:text-gray-400 transition-colors">Privacy</button>
          {" "}&middot;{" "}
          <button onClick={() => setLocation("/termini")} className="hover:text-gray-400 transition-colors">Termini</button>
        </p>
      </footer>
    </div>
  );
}
