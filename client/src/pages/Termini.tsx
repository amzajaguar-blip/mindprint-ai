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

export default function Termini() {
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
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#8B5CF6]/60 font-mono">Termini di Servizio</span>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-14">
          <p className="text-[10px] uppercase tracking-[0.45em] mb-4 font-mono" style={{ color: "#8B5CF6" }}>Documento legale</p>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Cinzel, serif" }}>Termini di Servizio</h1>
          <p className="text-gray-600 text-sm" style={{ fontFamily: "EB Garamond, serif" }}>
            Aggiornati il 28 aprile 2026 · Validi per mindprint.it
          </p>
          <div className="mt-6 h-px" style={{ background: "linear-gradient(90deg, #8B5CF640, transparent)" }} />
        </motion.div>

        <Section title="1. Accettazione">
          <p>Utilizzando MindPrint accetti integralmente i presenti Termini. Se non sei d&apos;accordo, non utilizzare il Servizio.</p>
        </Section>

        <Section title="2. Descrizione del Servizio">
          <p>MindPrint è una piattaforma che utilizza intelligenza artificiale e psicologia archetipale junghiana per generare profili psicologici personalizzati (&ldquo;MindPrint Card&rdquo;). L&apos;analisi è a scopo di intrattenimento e riflessione personale — non costituisce consulenza psicologica, medica o terapeutica professionale.</p>
        </Section>

        <Section title="3. Account utente">
          <p>Per accedere al Servizio devi creare un account tramite email OTP o Google OAuth. Sei responsabile della riservatezza delle tue credenziali. Puoi avere un solo account per email.</p>
        </Section>

        <Section title="4. Piano gratuito e Premium">
          <p><strong className="text-white/70">Piano gratuito:</strong> 1 test al mese, MindPrint Card base, condivisione social.</p>
          <p><strong className="text-white/70">Piano Premium:</strong> test illimitati, analisi psicologica approfondita AI, immagine archetipale generata, zone d&apos;ombra e punti di forza, consigli settimanali. Il piano Premium è soggetto a pagamento ricorrente (mensile o annuale) gestito da LemonSqueezy.</p>
        </Section>

        <Section title="5. Pagamenti e rimborsi">
          <p>I pagamenti sono elaborati da LemonSqueezy (provider di pagamento certificato). Offriamo una garanzia di rimborso di 7 giorni dalla prima attivazione, senza domande. Per richieste di rimborso: <strong className="text-white/70">support@mindprint.it</strong></p>
          <p>Puoi annullare l&apos;abbonamento in qualsiasi momento dal tuo pannello LemonSqueezy. La disdetta è effettiva al termine del periodo già pagato.</p>
        </Section>

        <Section title="6. Proprietà intellettuale">
          <p>I contenuti generati dall&apos;AI (archetipo, descrizione, immagine) sono di tua proprietà per uso personale. Non puoi rivendere, addebitare o sfruttare commercialmente i contenuti generati da MindPrint senza autorizzazione scritta.</p>
        </Section>

        <Section title="7. Limitazione di responsabilità">
          <p>MindPrint non è un servizio di psicologia clinica. I risultati sono generati da AI e hanno scopo riflessivo. Il Servizio è fornito &ldquo;così com&apos;è&rdquo;; non garantiamo l&apos;accuratezza assoluta dei profili generati.</p>
        </Section>

        <Section title="8. Modifiche ai Termini">
          <p>Ci riserviamo il diritto di modificare questi Termini. Le modifiche sostanziali saranno comunicate via email o notifica in-app con almeno 14 giorni di preavviso.</p>
        </Section>

        <Section title="9. Legge applicabile">
          <p>I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Foro di Milano, salvo diversa previsione di legge.</p>
        </Section>

        <Section title="10. Contatti">
          <p>Per qualsiasi questione legale: <strong className="text-white/70">legal@mindprint.it</strong></p>
        </Section>
      </div>

      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center">
        <p className="text-gray-700 text-xs" style={{ fontFamily: "EB Garamond, serif" }}>
          &copy; 2026 MindPrint &middot;{" "}
          <button onClick={() => setLocation("/privacy")} className="hover:text-gray-400 transition-colors">Privacy</button>
          {" "}&middot;{" "}
          <button onClick={() => setLocation("/cookie")} className="hover:text-gray-400 transition-colors">Cookie</button>
        </p>
      </footer>
    </div>
  );
}
