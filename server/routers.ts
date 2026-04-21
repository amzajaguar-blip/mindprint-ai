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
          messages: [
            {
              role: "system",
              content: `Sei un esperto di psicologia archetipale con profonda conoscenza di Jung, Enneagramma e neuroscienze emotive.
Analizza le risposte dell'utente al test Mirror Moment e genera un profilo psicologico personalizzato e accurato.
IMPORTANTE: tutti i contenuti devono essere SPECIFICI alle risposte date, non generici.
Usa un tono empatico, evocativo e preciso. La surprisePhrase deve sembrare che tu conosca l'utente profondamente.
I campi premium (strengthPoints, shadowZones, weeklyAdvice, premiumAnalysis) devono essere concreti e azionabili.`,
            },
            {
              role: "user",
              content: `Genera il profilo completo basandoti su queste risposte:\n\n${answerNarrative}`,
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
                  name: { type: "string", description: "Nome poetico dell'archetipo in italiano (es. 'L'Esploratore Silenzioso')" },
                  description: { type: "string", description: "Descrizione dell'archetipo in 2-3 frasi emozionali e personali" },
                  keyTraits: { type: "array", items: { type: "string" }, description: "Esattamente 4 tratti chiave dell'archetipo" },
                  surprisePhrase: { type: "string", description: "Una frase che sorprende l'utente sulla sua personalità — deve sembrare che tu lo conosca davvero" },
                  rarityPercentage: { type: "number", description: "Percentuale di persone con questo archetipo (5-35, più basso = più raro)" },
                  strengthPoints: { type: "array", items: { type: "string" }, description: "3-5 punti di forza specifici basati sulle risposte" },
                  shadowZones: { type: "array", items: { type: "string" }, description: "3-5 zone d'ombra o aree di crescita, scritte con empatia non giudizio" },
                  weeklyAdvice: { type: "array", items: { type: "string" }, description: "Esattamente 3 consigli pratici per questa settimana" },
                  premiumAnalysis: { type: "string", description: "Analisi approfondita di 150-200 parole: come questo archetipo si manifesta in relazioni, lavoro e crescita personale" },
                },
                required: ["name", "description", "keyTraits", "surprisePhrase", "rarityPercentage", "strengthPoints", "shadowZones", "weeklyAdvice", "premiumAnalysis"],
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
          const imageResult = await generateImage({
            prompt: `Abstract digital art representing the emotional archetype "${archetypeData.name}". Cyberpunk style with neon colors (pink #FF006E, cyan #00D9FF, green #00FF88). Dark background. Emotional and introspective mood. High quality portrait format.`,
          });
          imageUrl = imageResult.url;
        } catch (error) {
          console.warn("[ImageGen] Failed to generate archetype image:", error);
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
      // Attach test data to each card
      const withTests = await Promise.all(
        cards.map(async card => {
          const test = await getTestById(card.testId);
          return { ...card, test: test || null };
        })
      );
      return withTests;
    }),
  }),

  subscription: router({
    checkStatus: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getSubscriptionByUserId(ctx.user.id);
      const isActive = sub?.status === "active" || sub?.status === "on_trial";
      return {
        isPremium: isActive,
        status: sub?.status ?? null,
        currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      };
    }),

    createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Utente non trovato" });
      const checkoutUrl = await createCheckoutUrl(user.id, user.email ?? "");
      return { checkoutUrl };
    }),
  }),
});

export type AppRouter = typeof appRouter;
