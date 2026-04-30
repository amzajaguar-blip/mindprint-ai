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
      <h2
        className="text-lg font-semibold text-white mb-3"
        style={{ fontFamily: "Cinzel, serif" }}
      >
        {title}
      </h2>
      <div className="text-gray-400 leading-relaxed space-y-2" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.05rem" }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#08080F] text-white">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#8B5CF6 1px, transparent 1px), linear-gradient(90deg, #8B5CF6 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <nav className="relative z-10 border-b border-[#8B5CF6]/10 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <span
          className="cursor-pointer text-sm text-gray-400 hover:text-white transition-colors"
          onClick={() => setLocation("/")}
          style={{ fontFamily: "EB Garamond, serif" }}
        >
          ← MindPrint
        </span>
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#8B5CF6]/60 font-mono">Privacy Policy</span>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-14">
          <p className="text-[10px] uppercase tracking-[0.45em] mb-4 font-mono" style={{ color: "#8B5CF6" }}>
            Informativa legale
          </p>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Cinzel, serif" }}>
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-sm" style={{ fontFamily: "EB Garamond, serif" }}>
            Aggiornata il 28 aprile 2026 · Valida per mindprint.it
          </p>
          <div className="mt-6 h-px" style={{ background: "linear-gradient(90deg, #8B5CF640, transparent)" }} />
        </motion.div>

        <Section title="1. Chi siamo">
          <p>
            MindPrint (&ldquo;noi&rdquo;, &ldquo;il Servizio&rdquo;) è una piattaforma di psicologia archetipale basata su intelligenza artificiale, accessibile all&apos;indirizzo <strong className="text-white/70">mindprint.it</strong>.
          </p>
          <p>Il titolare del trattamento dei dati è il gestore del sito, raggiungibile all&apos;indirizzo email indicato nella sezione Contatti.</p>
        </Section>

        <Section title="2. Dati raccolti">
          <p>Raccogliamo solo i dati necessari a fornirti il Servizio:</p>
          <ul className="list-none space-y-1 mt-2">
            {[
              "Email e nome utente (forniti durante la registrazione o OAuth Google)",
              "Risposte al test Mirror Moment (anonime, non associate a dati sensibili)",
              "Archetipo generato e relativa analisi AI",
              "Dati di abbonamento (gestiti da LemonSqueezy — non memorizziamo dati di pagamento)",
              "Log tecnici anonimi per il corretto funzionamento del servizio",
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span style={{ color: "#8B5CF6" }} className="flex-shrink-0 mt-1">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="3. Come utilizziamo i dati">
          <ul className="list-none space-y-1">
            {[
              "Fornire il servizio di analisi archetipale",
              "Generare e salvare la tua MindPrint Card",
              "Gestire l'abbonamento Premium",
              "Migliorare la qualità del modello AI (dati aggregati e anonimi)",
              "Inviare comunicazioni di servizio (mai marketing senza consenso esplicito)",
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span style={{ color: "#8B5CF6" }} className="flex-shrink-0 mt-1">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="4. Base giuridica">
          <p>Il trattamento si basa sul consenso espresso (art. 6.1.a GDPR) al momento della registrazione e sull&apos;esecuzione del contratto di servizio (art. 6.1.b GDPR).</p>
        </Section>

        <Section title="5. Conservazione dei dati">
          <p>I tuoi dati vengono conservati per tutta la durata del rapporto contrattuale e per un massimo di 2 anni dopo la cancellazione dell&apos;account, salvo obblighi di legge.</p>
        </Section>

        <Section title="6. I tuoi diritti (GDPR)">
          <p>Hai il diritto di: accedere ai tuoi dati, rettificarli, cancellarli (&ldquo;diritto all&apos;oblio&rdquo;), limitare il trattamento, portarli altrove (portabilità), e opporti al trattamento.</p>
          <p>Per esercitare i tuoi diritti, scrivi a: <strong className="text-white/70">privacy@mindprint.it</strong></p>
        </Section>

        <Section title="7. Terze parti">
          <p>Utilizziamo provider di fiducia:</p>
          <ul className="list-none space-y-1 mt-2">
            {[
              "Supabase — database e autenticazione (server UE)",
              "Google (Gemini) — generazione AI (consulta la privacy policy di Google)",
              "Pollinations.ai — generazione immagini",
              "LemonSqueezy — pagamenti (noi non vediamo i dati della carta di credito)",
              "Vercel — hosting (server UE)",
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span style={{ color: "#C084FC" }} className="flex-shrink-0 mt-1">◈</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="8. Cookie">
          <p>Utilizziamo solo cookie tecnici essenziali (sessione utente). Nessun cookie di profilazione o pubblicitari. Consulta la nostra <button onClick={() => setLocation("/cookie")} className="underline" style={{ color: "#8B5CF6" }}>Cookie Policy</button> per i dettagli.</p>
        </Section>

        <Section title="9. Contatti">
          <p>Per qualsiasi richiesta relativa alla privacy: <strong className="text-white/70">privacy@mindprint.it</strong></p>
        </Section>
      </div>

      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center">
        <p className="text-gray-700 text-xs" style={{ fontFamily: "EB Garamond, serif" }}>
          &copy; 2026 MindPrint &middot;{" "}
          <button onClick={() => setLocation("/termini")} className="hover:text-gray-400 transition-colors">Termini</button>
          {" "}&middot;{" "}
          <button onClick={() => setLocation("/cookie")} className="hover:text-gray-400 transition-colors">Cookie</button>
        </p>
      </footer>
    </div>
  );
}
