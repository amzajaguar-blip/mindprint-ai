# Image Gen Fix + Quiz Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fixare il bug del bottone "Genera immagine" (fallimenti silenziosi) e arricchire il quiz MirrorMoment con domande/risposte più profonde e una UI più bella per i bottoni risposta.

**Architecture:**
- Bug fix: aggiungere `onError` alla mutation client-side + fallback URL Pollinations diretto se Supabase storage fallisce + stato errore visibile in UI.
- Quiz enrichment: riscrivere `QUESTIONS` con testo più evocativo e 5 opzioni per domanda (da 4), + redesign dei bottoni opzione in MirrorMoment.tsx.

**Tech Stack:** React + TypeScript, tRPC, Framer Motion, Tailwind CSS, Pollinations.ai, Supabase Storage

---

## File Map

| File | Ruolo | Azione |
|---|---|---|
| `client/src/pages/MindPrintCard.tsx` | UI card archetipo + bottone Genera | Modify: aggiungere `onError`, stato errore, retry |
| `server/_core/imageGeneration.ts` | Chiamata Pollinations + upload Supabase | Modify: fallback URL diretto se storage fallisce |
| `client/src/pages/MirrorMoment.tsx` | Quiz + opzioni risposta | Modify: riscrivere QUESTIONS, redesign option buttons |

---

## Task 1: Fix bug — errore silenzioso su "Genera immagine"

**Files:**
- Modify: `client/src/pages/MindPrintCard.tsx:23-25` (mutation genImage)
- Modify: `client/src/pages/MindPrintCard.tsx:147-174` (area immagine)

### Problema
La mutation `genImage` non ha `onError` → se Pollinations fallisce o Supabase storage lancia errore, l'UI resta bloccata senza feedback. Il bottone sparisce durante `isPending` ma poi riappare senza spiegazione.

### Fix server-side: fallback URL diretto se storage fallisce

- [ ] **Step 1: Modificare `imageGeneration.ts` per restituire URL Pollinations in fallback**

Aprire `server/_core/imageGeneration.ts` e sostituire il corpo della funzione:

```typescript
import { storagePut } from "server/storage";

export type GenerateImageOptions = {
  prompt: string;
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResponse> {
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(options.prompt)}?width=512&height=768&nologo=true&enhance=true&seed=${Date.now()}`;

  const response = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(75000) });
  if (!response.ok) throw new Error(`Pollinations failed: ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());

  try {
    const { url: storageUrl } = await storagePut(`generated/${Date.now()}.jpg`, buffer, "image/jpeg");
    return { url: storageUrl };
  } catch (storageErr) {
    // Storage fallisce (bucket mancante, credenziali, ecc.) → restituiamo l'URL Pollinations diretto
    console.error("[ImageGen] Storage upload failed, using Pollinations URL:", storageErr);
    return { url: pollinationsUrl };
  }
}
```

- [ ] **Step 2: Verificare che il server compili**

```bash
cd /home/locoomo/Scrivania/app_edge_gold/mindprint-app/mindprint-app && npx tsc --noEmit 2>&1 | grep -E "error|imageGen"
```
Expected: nessun errore su imageGeneration.ts

### Fix client-side: stato errore + retry

- [ ] **Step 3: Aggiungere stato errore e `onError` alla mutation in MindPrintCard.tsx**

Trovare il blocco mutation alle righe 23-25:
```typescript
const genImage = trpc.mindprint.generateImage.useMutation({
    onSuccess: (data) => { if (data.imageUrl) setLocalImageUrl(data.imageUrl); },
  });
```

Aggiungere uno stato errore PRIMA della mutation (dopo `useState` esistenti, es. riga 21):
```typescript
const [imageError, setImageError] = useState<string | null>(null);
```

Sostituire l'intera mutation con:
```typescript
const genImage = trpc.mindprint.generateImage.useMutation({
    onSuccess: (data) => {
      if (data.imageUrl) {
        setLocalImageUrl(data.imageUrl);
        setImageError(null);
      }
    },
    onError: (err) => {
      setImageError(err.message || "Generazione fallita. Riprova.");
    },
  });
```

- [ ] **Step 4: Aggiungere display errore + pulsante retry nell'area immagine**

Trovare il blocco del bottone "Genera immagine" (righe ~158-170) e sostituirlo con:

```tsx
) : (
  <>
    <div className="w-10 h-10 rounded-full opacity-15"
      style={{ background: `radial-gradient(circle, ${palette.a}, ${palette.c})` }} />
    {imageError && (
      <p className="text-xs font-mono text-red-400 text-center px-4 mb-1">{imageError}</p>
    )}
    <button
      onClick={() => {
        setImageError(null);
        card?.testId && genImage.mutate({ testId: card.testId });
      }}
      className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
      style={{ background: `linear-gradient(135deg, ${palette.a}, ${palette.b})`, boxShadow: `0 0 16px ${palette.glow}` }}
    >
      {imageError ? "↺ Riprova" : "✦ Genera immagine"}
    </button>
  </>
)}
```

- [ ] **Step 5: Verifica TypeScript**

```bash
cd /home/locoomo/Scrivania/app_edge_gold/mindprint-app/mindprint-app && npx tsc --noEmit 2>&1 | grep MindPrintCard
```
Expected: nessun errore

- [ ] **Step 6: Commit**

```bash
git add server/_core/imageGeneration.ts client/src/pages/MindPrintCard.tsx
git commit -m "fix: silent image generation errors — add onError handler and storage fallback"
```

---

## Task 2: Arricchire le domande del quiz (QUESTIONS)

**Files:**
- Modify: `client/src/pages/MirrorMoment.tsx:22-58` (array QUESTIONS)

### Obiettivo
Riscrivere le 7 domande con:
- Testo più evocativo e psicologicamente profondo (stile oracolo/Jung)
- **5 opzioni** per domanda invece di 4 (più sfumature archetipali)
- Opzioni che coprono spettro introversione/estroversione, ombra/luce, logos/eros

- [ ] **Step 1: Sostituire l'array QUESTIONS in MirrorMoment.tsx**

Trovare `const QUESTIONS: Question[] = [` (riga 22) e sostituire l'intero array fino alla chiusura `];` (riga 58):

```typescript
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Quando sei completamente solo nel silenzio, cosa accade dentro di te?",
    options: [
      "Mi dissolvo — è il mio habitat naturale",
      "Mi ricarico lentamente, ma poi ho bisogno di connessione",
      "Dipende dallo stato interiore in cui arrivo",
      "Sento un disagio sottile, come se mancasse qualcosa",
      "Il silenzio mi spaventa — preferisco il rumore del mondo",
    ],
  },
  {
    id: 2,
    text: "Qualcuno ti mostra uno specchio scomodo — una verità su di te che non vuoi vedere. Cosa fai?",
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
      "Un'intuizione che sento nel corpo prima di capirla con la testa",
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
    text: "Qual è la paura più antica che porti? Quella che non dici ad alta voce.",
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
```

- [ ] **Step 2: Aggiornare l'interfaccia Question per supportare 5 opzioni**

L'interfaccia `Question` usa `options: string[]` — già compatibile con qualsiasi numero. Nessuna modifica necessaria.

- [ ] **Step 3: Verifica TypeScript**

```bash
cd /home/locoomo/Scrivania/app_edge_gold/mindprint-app/mindprint-app && npx tsc --noEmit 2>&1 | grep MirrorMoment
```
Expected: nessun errore

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/MirrorMoment.tsx
git commit -m "feat: enrich quiz with deeper questions and 5 options per question"
```

---

## Task 3: Redesign bottoni risposta (UI MirrorMoment)

**Files:**
- Modify: `client/src/pages/MirrorMoment.tsx` — sezione `currentQ.options.map()`

### Obiettivo
Trasformare i bottoni risposta da semplici elementi di lista a **card scelte** con:
- Lettera identificativa (A/B/C/D/E) in badge a sinistra
- Testo più leggibile
- Selected state più evidente (bordo glowing, sfondo colorato)
- Hover animate con Framer Motion
- Layout verticale che respira

- [ ] **Step 1: Trovare il blocco `currentQ.options.map()` in MirrorMoment.tsx**

Cercare attorno alla riga 302 il blocco:
```tsx
{currentQ.options.map((option, i) => {
  const selected = selectedAnswer === option;
```

- [ ] **Step 2: Sostituire l'intera sezione map con il nuovo design**

Trovare l'intero blocco `currentQ.options.map(...)` fino alla sua chiusura `)}` e sostituirlo con:

```tsx
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
        background: selected
          ? "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(217,70,239,0.15))"
          : "rgba(255,255,255,0.03)",
        border: selected
          ? "1px solid rgba(139,92,246,0.7)"
          : "1px solid rgba(255,255,255,0.06)",
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
      <span
        className="text-sm leading-snug"
        style={{ color: selected ? "#E2D9F3" : "rgba(255,255,255,0.65)" }}
      >
        {option}
      </span>
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto flex-shrink-0 text-[#8B5CF6] text-base"
        >
          ✦
        </motion.span>
      )}
    </motion.button>
  );
})}
```

- [ ] **Step 3: Verifica TypeScript + import motion**

Verificare che `motion` sia già importato (lo è, riga 5: `import { motion, AnimatePresence } from "framer-motion"`).

```bash
cd /home/locoomo/Scrivania/app_edge_gold/mindprint-app/mindprint-app && npx tsc --noEmit 2>&1 | grep MirrorMoment
```
Expected: nessun errore

- [ ] **Step 4: Avviare dev server e testare visivamente**

```bash
cd /home/locoomo/Scrivania/app_edge_gold/mindprint-app/mindprint-app && npm run dev
```

Verificare:
- Ogni risposta mostra il badge lettera (A/B/C/D/E)
- Click → bordo viola glowing + checkmark ✦ a destra
- Hover → leggera traslazione a destra
- Layout non si rompe con testi lunghi (5 opzioni)

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/MirrorMoment.tsx
git commit -m "feat: redesign quiz option buttons with letter badges and glow selected state"
```

---

## Self-Review

### Spec coverage
- [x] Bug "Genera immagine" silenzioso → Task 1 (onError + fallback storage)
- [x] Fallback URL Pollinations se Supabase storage fallisce → Task 1 server
- [x] Domande più ricche → Task 2 (7 domande, 5 opzioni ciascuna)
- [x] UI bottoni risposta più bella → Task 3 (badge lettera, glow, motion)

### Placeholder scan
- Nessun TBD, TODO, o "implement later" presente.

### Type consistency
- `Question.options: string[]` — compatibile con 3, 4, 5 opzioni senza modifica interfaccia.
- `imageError: string | null` — usato coerentemente in useState e onError.
- `genImage.mutate({ testId: card.testId })` — `testId` è `number`, coerente con lo schema tRPC.
