import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createTest,
  getTestById,
  getUserTests,
  createTestResponse,
  createMindprintCard,
  getUserMindprintCards,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateTest,
  getMindprintCardByShareToken,
  getUserById,
  getSubscriptionByUserId,
  upsertSubscription,
  incrementRewardCount,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { createCheckoutUrl } from "./_core/lemonsqueezy";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  test: router({
    startTest: protectedProcedure.mutation(async ({ ctx }) => {
      const userId = ctx.user.id;
      const result = await createTest({ userId });
      if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Impossibile creare il test" });
      return {
        testId: result.id,
        sessionId: `test-${Date.now()}`,
      };
    }),

    submitAnswers: protectedProcedure
      .input(z.object({
        testId: z.number(),
        answers: z.record(z.string(), z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const { testId, answers } = input;

        for (const [questionNum, answer] of Object.entries(answers)) {
          await createTestResponse({
            testId,
            questionNumber: parseInt(questionNum),
            questionText: `Question ${questionNum}`,
            selectedAnswer: answer,
          });
        }

        // Build answer narrative for LLM
        const questionLabels: Record<string, string> = {
          "0": "Il silenzio quando sei solo",
          "1": "Come reagisci a verità scomode",
          "2": "L'emozione guida nelle decisioni",
          "3": "Come esprimi sentimenti profondi",
          "4": "Cosa ti fa sentire vivo",
          "5": "La tua paura più profonda",
          "6": "Come vuoi essere ricordato",
        };
        const answerNarrative = Object.entries(answers)
          .map(([k, v]) => `- ${questionLabels[k] || `Domanda ${k}`}: "${v}"`)
          .join("\n");

        const llmResponse = await invokeLLM({
          temperature: 1.5,
          messages: [
            {
              role: "system",
              content: `Sei un oracolo di psicologia archetipale junghiana. Il tuo compito è CREARE un archetipo UNICO, MAI VISTO PRIMA, che emerge ESCLUSIVAMENTE da queste specifiche risposte umane.

REGOLE ASSOLUTE:
1. Il NOME dell'archetipo deve essere INVENTATO da zero combinando le parole chiave emerse dalle risposte. VIETATO usare archetipi comuni (Eroe, Mago, Ribelle, Saggio, Ombra, Guerriero, Custode ecc). Il nome deve rispecchiare QUESTA persona specifica.
2. OGNI frase deve contenere elementi CONCRETI presi dalle risposte date. Mai frasi generiche.
3. La surprisePhrase deve essere una rivelazione che fa dire "come hai fatto a saperlo?" — deve sembrare che tu abbia letto l'anima di questa persona.
4. rarityPercentage: calcola in modo REALISTICO basandoti sulla combinazione unica delle risposte. La maggior parte degli utenti sarà tra 3% e 25%.
5. keyTraits: ESATTAMENTE 4 tratti, derivati LETTERALMENTE dal contenuto delle risposte.
6. strengthPoints e shadowZones: usa PAROLE SPECIFICHE tratte dalle risposte.
7. premiumAnalysis: 180-220 parole, deve menzione esplicitamente pattern emersi dalle risposte.

Genera qualcosa di PROFONDAMENTE PERSONALE, non un template. Ogni utente deve sentire che questa analisi è stata scritta solo per lui.`,
            },
            {
              role: "user",
              content: `Queste sono le mie risposte al Mirror Moment. Analizzale e crea il mio archetipo unico:\n\n${answerNarrative}\n\nRicorda: il nome dell'archetipo deve essere INVENTATO E UNICO, mai sentito prima.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "archetype_full",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Nome poetico UNICO e INVENTATO dell'archetipo in italiano — mai generico, deve rispecchiare questa persona specifica" },
                  description: { type: "string", description: "Descrizione in 2-3 frasi emozionali che contengono riferimenti CONCRETI alle risposte date" },
                  keyTraits: { type: "array", items: { type: "string" }, description: "ESATTAMENTE 4 tratti chiave, derivati letteralmente dal contenuto delle risposte — non usare tratti generici" },
                  surprisePhrase: { type: "string", description: "Una frase shock che rivela qualcosa che l'utente non ha detto esplicitamente ma emerge dalle risposte — deve far venire i brividi" },
                  rarityPercentage: { type: "number", description: "Percentuale realistica di persone con questa esatta combinazione di tratti (1-40). Valori bassi per combinazioni molto specifiche." },
                  strengthPoints: { type: "array", items: { type: "string" }, description: "3-5 punti di forza SPECIFICI — ogni punto deve fare riferimento a qualcosa emerso nelle risposte" },
                  shadowZones: { type: "array", items: { type: "string" }, description: "3-5 zone d'ombra SPECIFICHE scritte con empatia — devono sembrare rivelazioni, non critiche" },
                  weeklyAdvice: { type: "array", items: { type: "string" }, description: "Esattamente 3 consigli PRATICI e SPECIFICI per questa settimana, concreti e azionabili per QUESTA persona" },
                  premiumAnalysis: { type: "string", description: "Analisi profonda di 180-220 parole che menziona pattern espliciti emersi dalle risposte. Deve sembrare scritta da un terapeuta che conosce questa persona da anni." },
                  dominantColor: { type: "string", description: "Colore esadecimale (#RRGGBB) che rappresenta l'energia emotiva di questo archetipo — scegli in base al mood delle risposte (es. #7C3AED per mistero, #DC2626 per passione, #0EA5E9 per libertà, #10B981 per crescita, #F59E0B per calore)" },
                },
                required: ["name", "description", "keyTraits", "surprisePhrase", "rarityPercentage", "strengthPoints", "shadowZones", "weeklyAdvice", "premiumAnalysis", "dominantColor"],
                additionalProperties: false,
              },
            },
          },
        });

        let archetypeData: {
          name: string;
          description: string;
          keyTraits: string[];
          surprisePhrase: string;
          rarityPercentage: number;
          strengthPoints: string[];
          shadowZones: string[];
          weeklyAdvice: string[];
          premiumAnalysis: string;
          dominantColor?: string;
        };

        try {
          const content = llmResponse.choices[0]?.message.content;
          const contentStr = typeof content === "string" ? content : JSON.stringify(content);
          archetypeData = JSON.parse(contentStr || "{}");
        } catch {
          archetypeData = {
            name: "Cercatore di Verità",
            description: "Sei una persona che cerca autenticità e significato profondo in ogni aspetto della vita. La tua sensibilità è una forza, non una debolezza.",
            keyTraits: ["Introspettivo", "Sensibile", "Creativo", "Consapevole"],
            surprisePhrase: "Finalmente qualcuno mi capisce davvero",
            rarityPercentage: 12,
            strengthPoints: ["Profonda capacità empatica", "Intuizione acuta nelle relazioni", "Creatività nell'elaborare le emozioni"],
            shadowZones: ["Tendenza all'ipersensibilità", "Difficoltà a lasciar andare", "Autocritica eccessiva"],
            weeklyAdvice: ["Dedica 10 minuti al giorno alla scrittura libera", "Cerca una conversazione autentica con qualcuno di fiducia", "Celebra un piccolo successo quotidiano"],
            premiumAnalysis: "Come Cercatore di Verità, porti nelle relazioni un livello di profondità raro. Nel lavoro, eccelli quando puoi esprimere creatività e autonomia. La tua crescita personale passa dall'imparare a bilanciare l'introspezione con l'azione concreta.",
          };
        }

        let imageUrl: string | undefined;
        try {
          // Personalized image prompt derived from the specific archetype traits
          const traitsStr = archetypeData.keyTraits.slice(0, 3).join(", ");
          const imageResult = await generateImage({
            prompt: `Jungian archetype "${archetypeData.name}" — ${traitsStr}. ${archetypeData.description.slice(0, 80)}. Sacred geometry Metatron Cube, dark cosmic void, unique symbolic figure, ethereal bioluminescent glow, tarot card vertical composition, cinematic mystical portrait`,
          });
          imageUrl = imageResult.url;
        } catch (error) {
          console.error("[ImageGen] FAILED:", error instanceof Error ? error.message : error);
        }

        await updateTest(testId, {
          archetypeName: archetypeData.name,
          archetypeDescription: archetypeData.description,
          keyTraits: JSON.stringify(archetypeData.keyTraits),
          surprisePhrase: archetypeData.surprisePhrase,
          rarityPercentage: archetypeData.rarityPercentage,
          imageUrl,
          strengthPoints: JSON.stringify(archetypeData.strengthPoints),
          shadowZones: JSON.stringify(archetypeData.shadowZones),
          weeklyAdvice: JSON.stringify(archetypeData.weeklyAdvice),
          premiumAnalysis: archetypeData.premiumAnalysis,
        });

        const shareToken = nanoid(32);
        await createMindprintCard({ userId, testId, shareToken, cardImageUrl: imageUrl });

        const userProfile = await getUserProfile(userId);
        if (userProfile) {
          await updateUserProfile(userId, {
            currentArchetype: archetypeData.name,
            currentTestId: testId,
            totalTestsTaken: (userProfile.totalTestsTaken || 0) + 1,
            lastTestDate: new Date(),
          });
        } else {
          await createUserProfile({
            userId,
            currentArchetype: archetypeData.name,
            currentTestId: testId,
            totalTestsTaken: 1,
            lastTestDate: new Date(),
            isPublicProfile: 1,
          });
        }

        return { testId, shareToken };
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return getUserTests(ctx.user.id);
    }),
  }),

  profile: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return getUserProfile(ctx.user.id);
    }),

    getCurrentArchetype: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      if (!profile?.currentTestId) return null;
      const test = await getTestById(profile.currentTestId);
      if (!test) return null;
      return {
        name: test.archetypeName,
        description: test.archetypeDescription,
        traits: test.keyTraits ? JSON.parse(test.keyTraits) : [],
        surprisePhrase: test.surprisePhrase,
        rarityPercentage: test.rarityPercentage,
        imageUrl: test.imageUrl,
      };
    }),
  }),

  mindprint: router({
    // Pubblica — nessun login richiesto per pagina condivisibile
    getCard: publicProcedure
      .input(z.object({ shareToken: z.string() }))
      .query(async ({ input }) => {
        const card = await getMindprintCardByShareToken(input.shareToken);
        if (!card) return null;
        const test = await getTestById(card.testId);
        return { card, test: test || null };
      }),

    getUserCards: protectedProcedure.query(async ({ ctx }) => {
      const cards = await getUserMindprintCards(ctx.user.id);
      const withTests = await Promise.all(
        cards.map(async card => {
          const test = await getTestById(card.testId);
          return { ...card, test: test || null };
        })
      );
      return withTests;
    }),

    generateImage: protectedProcedure
      .input(z.object({ testId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const test = await getTestById(input.testId);
        if (!test || test.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Test non trovato" });
        }
        if (test.imageUrl) return { imageUrl: test.imageUrl };
        const result = await generateImage({
          prompt: `Masterpiece ultra-detailed sacred geometry (Metatron's Cube, Flower of Life) pulsating with bioluminescent violet and indigo energy. Central Jungian archetype silhouette "${test.archetypeName}" emerging from deep cosmic void. Intricate gold alchemical linework, ethereal smoke, stardust textures. Dark oracle aesthetic, tarot-inspired vertical composition, high contrast dramatic chiaroscuro lighting. 8k resolution, cinematic depth of field, mystical atmospheric glow, subtle scan-line overlay.`,
        });
        if (!result.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Generazione immagine fallita" });
        await updateTest(input.testId, { imageUrl: result.url });
        return { imageUrl: result.url };
      }),
  }),

  subscription: router({
    checkStatus: protectedProcedure.query(async ({ ctx }) => {
      const [sub, profile] = await Promise.all([
        getSubscriptionByUserId(ctx.user.id),
        getUserProfile(ctx.user.id),
      ]);
      const isActive = sub?.status === "active" || sub?.status === "on_trial";
      const rewardCount = profile?.rewardCount ?? 0;
      const isRewardUnlocked = rewardCount >= 3;
      return {
        isPremium: isActive || isRewardUnlocked,
        isRewardUnlocked,
        rewardCount,
        status: sub?.status ?? null,
        currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      };
    }),

    useReward: protectedProcedure.mutation(async ({ ctx }) => {
      const newCount = await incrementRewardCount(ctx.user.id);
      return { rewardCount: newCount, isRewardUnlocked: newCount >= 3 };
    }),

    createCheckout: protectedProcedure.input(z.object({ yearly: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Utente non trovato" });
      const checkoutUrl = await createCheckoutUrl(user.id, user.email ?? "", input.yearly);
      return { checkoutUrl };
    }),
  }),
});

export type AppRouter = typeof appRouter;
