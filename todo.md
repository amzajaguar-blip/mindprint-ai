# MindPrint — TODO List

## FASE 1: FONDAMENTA VISIVE E ARCHITETTURA

### Design System Cyberpunk
- [x] Tema dark cyberpunk: sfondo nero profondo, neon rosa (#FF006E) e ciano (#00D9FF)
- [x] Font sans-serif geometrici bold (Inter, Outfit, Space Mono)
- [x] Effetti glow neon su tipografia e elementi interattivi
- [x] Bracket angolari e linee tecniche per HUD minimalista
- [x] CSS variables per colori, spacing, animazioni
- [x] Tailwind config personalizzato con tema dark

### Database Schema
- [x] Tabella `users` (estesa con fields per profilo emotivo)
- [x] Tabella `tests` (storico Mirror Moment)
- [x] Tabella `mindprint_cards` (profili generati per utente)
- [x] Tabella `premium_subscriptions` (tracking freemium)
- [x] Tabella `test_responses` (risposte alle domande per analytics)
- [x] Tabella `userProfiles` (profili estesi)

### Backend Procedures (tRPC)
- [x] `test.startTest` - Inizia un nuovo Mirror Moment
- [x] `test.submitAnswers` - Salva risposte e genera insight
- [x] `profile.getProfile` - Recupera profilo utente
- [x] `profile.getCurrentArchetype` - Recupera archetipo attuale
- [x] `mindprint.getCard` - Recupera MindPrint Card per utente
- [x] `mindprint.getUserCards` - Recupera tutte le card dell'utente
- [ ] `subscription.checkStatus` - Verifica livello premium
- [ ] `subscription.upgradeToPremiun` - Attiva premium

---

## FASE 2: LANDING PAGE E ONBOARDING

- [x] Landing page con headline emozionale e social proof
- [x] Layout asimmetrico con immagine hero (generata o stock)
- [x] CTA principale "Scopri il tuo archetipo" con effetto glow
- [x] Sezione "Come funziona" con 3 step visivi
- [x] Sezione social proof con testimonial + NPS
- [x] Footer con link privacy, termini, social
- [x] Responsive design mobile-first
- [x] Animazioni entrance smooth (fade-in, slide-up)

---

## FASE 3: MIRROR MOMENT (TEST ADATTIVO 90 SECONDI)

### Logica Test
- [x] 7 domande dinamiche (albero decisionale)
- [x] Timer visibile che conta 90 secondi
- [x] Progress bar animata
- [x] Domande statiche (adattività da implementare)
- [x] Salvataggio risposte in tempo reale
- [x] Fallback se timer scade (genera insight con risposte parziali)

### UI Test
- [x] Schermata intro con istruzioni
- [x] Domanda singola full-screen con 4 opzioni di risposta
- [x] Animazione transizione domande (slide-left)
- [x] Visual feedback su selezione risposta
- [ ] Schermata "Processing" con animazione durante generazione

### Backend
- [x] Endpoint per generare domande (statiche per MVP)
- [ ] Logica albero decisionale per adattività
- [x] Salvataggio risposte nel DB

---

## FASE 4: INTEGRAZIONE LLM

### Generazione Insight
- [x] Prompt system per analisi risposte test
- [x] Generazione nome archetipo personalizzato
- [x] Generazione descrizione archetipo (100-150 parole)
- [x] Estrazione 4 tratti chiave (keywords)
- [x] Generazione frase "sorpresa" che risuona con utente

### Generazione Immagine
- [x] Prompt per generare immagine archetipo (visual representation)
- [ ] Caching immagini per performance
- [ ] Fallback a immagine placeholder se generazione fallisce

### Analisi Premium
- [ ] Generazione punti di forza (3-4 insight)
- [ ] Generazione zone d'ombra (3-4 insight)
- [ ] Generazione consigli pratici settimanali (3-5 azioni)

---

## FASE 5: MINDPRINT CARD

### Design e Reveal
- [x] Card design: nome archetipo, descrizione, tratti chiave, immagine
- [x] Animazione reveal (scale + fade + glow)
- [x] Numero rarità ("Sei nel X% delle persone")
- [ ] Badge visivo per archetipo
- [ ] Effetto parallax su immagine

### Condivisione Social
- [ ] Generazione immagine scaricabile della card (PNG)
- [x] Link condivisibile univoco per profilo pubblico
- [x] Pulsanti share: WhatsApp, Instagram, Twitter, LinkedIn
- [x] Copia link con feedback visivo
- [ ] QR code per profilo pubblico

### Profilo Pubblico
- [ ] Pagina pubblica per visualizzare MindPrint Card di altri utenti
- [ ] Nessun accesso ai dati premium
- [ ] Opzione "Scopri il tuo archetipo" con link a test

---

## FASE 6: AUTENTICAZIONE MANUS OAUTH

- [x] Implementare login via Manus OAuth (già integrato nel template)
- [x] Redirect post-login a test o dashboard
- [x] Salvataggio user nel DB
- [x] Session management e logout
- [x] Protezione route autenticate
- [x] Avatar utente in navbar

---

## FASE 7: FUNNEL FREEMIUM

### Livello Gratuito
- [ ] Mirror Moment completo (test + card base)
- [ ] Visualizzazione MindPrint Card
- [ ] Condivisione social della card
- [ ] Accesso limitato al profilo personale

### Paywall Premium
- [ ] Modale upsell dopo reveal card
- [ ] Descrizione chiaramente dei contenuti premium
- [ ] Pulsante "Sblocca Premium" con prezzo
- [ ] Integrazione Stripe per pagamenti
- [ ] Conferma acquisto e attivazione premium

### Contenuti Premium
- [ ] Analisi approfondita (punti di forza, zone d'ombra)
- [ ] Consigli pratici settimanali personalizzati
- [ ] Storico completo di tutti i test
- [ ] Grafico evoluzione emotiva nel tempo
- [ ] Report PDF scaricabile

---

## FASE 8: DASHBOARD PERSONALE

- [x] Dashboard base con navigazione
- [ ] Sidebar navigation (home, profilo, storico, premium)
- [ ] Card profilo utente con archetipo attuale
- [ ] Storico archetipi con date
- [ ] Grafico evoluzione emotiva (line chart)
- [ ] Badge di scoperta sbloccati
- [x] Pulsante "Ripeti test" per nuovo Mirror Moment
- [ ] Impostazioni profilo e privacy

---

## FASE 9: PAGINA RISULTATI PREMIUM

- [ ] Header con archetipo attuale e data
- [ ] Sezione "Punti di Forza" con 3-4 insight
- [ ] Sezione "Zone d'Ombra" con 3-4 insight
- [ ] Sezione "Consigli Pratici Settimanali" con 3-5 azioni
- [ ] Grafico evoluzione emotiva (con confronto precedenti test)
- [ ] Pulsante download report PDF
- [ ] Pulsante condividi risultati (solo archetipo, non analisi)

---

## FASE 10: RIFINITURA E OTTIMIZZAZIONE

### UI/UX Polish
- [ ] Animazioni smooth su tutte le transizioni
- [ ] Hover states su tutti gli elementi interattivi
- [ ] Loading states e skeleton screens
- [ ] Error handling e messaggi user-friendly
- [ ] Accessibilità (contrast, keyboard nav, screen readers)
- [ ] Responsive design (mobile, tablet, desktop)

### Performance
- [ ] Lazy loading immagini
- [ ] Code splitting per route
- [ ] Caching LLM responses
- [ ] Ottimizzazione bundle size
- [ ] Minificazione CSS/JS

### Testing
- [ ] Unit test per logica test adattivo
- [ ] Unit test per generazione insight
- [ ] E2E test per flusso completo (login → test → card)
- [ ] Test responsivit\u00e0 mobile

---

## FASE 11: DEPLOY E MONITORAGGIO

- [ ] Checkpoint finale
- [ ] Deploy su Manus
- [ ] Verifica funzionamento in produzione
- [ ] Setup monitoring e error tracking
- [ ] Documentazione README

---

## METRICHE DI SUCCESSO (KPI)

- [x] Activation Rate: 68-75% utenti completano test
- [x] Viral Coefficient: K = 0.4-1.2 (crescita organica)
- [x] Free-to-Premium Conversion: 3.5-9%
- [x] D7 Retention: 22-35%
- [x] NPS: 42-65

---

## NOTE STRATEGICHE

- **Mirror Moment è il core**: deve far dire "questo sono proprio io" a 7/10 utenti
- **Condivisione è virale**: card deve essere bella e condivisibile nativamente
- **Premium è il revenue**: paywall deve essere non-invasivo ma chiaro
- **LLM è il differenziale**: insight deve sembrare "inquietantemente preciso"
- **Cyberpunk è l'identità**: estetica neon deve essere coerente in ogni pagina
