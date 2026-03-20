import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  user: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserById(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        visionText: z.string().max(500).optional(),
        currentWeek: z.number().min(0).max(8).optional(),
        onboardingComplete: z.boolean().optional(),
        privacyAccepted: z.boolean().optional(),
        subscriptionStatus: z.enum(["none", "active", "cancelled"]).optional(),
        journeyStartDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const data: Parameters<typeof db.updateUserProfile>[1] = {};
        if (input.visionText !== undefined) data.visionText = input.visionText;
        if (input.currentWeek !== undefined) data.currentWeek = input.currentWeek;
        if (input.onboardingComplete !== undefined) data.onboardingComplete = input.onboardingComplete;
        if (input.privacyAccepted !== undefined) data.privacyAccepted = input.privacyAccepted;
        if (input.subscriptionStatus !== undefined) data.subscriptionStatus = input.subscriptionStatus;
        if (input.journeyStartDate !== undefined) data.journeyStartDate = new Date(input.journeyStartDate);
        await db.updateUserProfile(ctx.user.id, data);
        return { success: true };
      }),

    deleteData: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deleteUserData(ctx.user.id);
      return { success: true };
    }),
  }),

  practices: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPractices(ctx.user.id);
    }),

    getByWeek: protectedProcedure
      .input(z.object({ weekNum: z.number().min(1).max(4) }))
      .query(async ({ ctx, input }) => {
        return db.getPracticeByWeek(ctx.user.id, input.weekNum);
      }),

    save: protectedProcedure
      .input(z.object({
        weekNum: z.number().min(1).max(4),
        practiceText: z.string().min(1).max(500),
        weekColor: z.enum(["blue", "yellow", "green", "red"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.upsertPractice({
          userId: ctx.user.id,
          weekNum: input.weekNum,
          practiceText: input.practiceText,
          weekColor: input.weekColor,
        });
        return { id };
      }),
  }),

  journal: router({
    getEntry: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getDailyEntry(ctx.user.id, input.date);
      }),

    listEntries: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserDailyEntries(ctx.user.id);
    }),

    saveMorning: protectedProcedure
      .input(z.object({
        date: z.string(),
        weekNum: z.number(),
        dayNum: z.number(),
        gratitude1: z.string().optional(),
        gratitude2: z.string().optional(),
        gratitude3: z.string().optional(),
        gratitude4: z.string().optional(),
        gratitude5: z.string().optional(),
        focus: z.string().optional(),
        important: z.string().optional(),
        betterMoments: z.string().optional(),
        practiceIntended: z.boolean().optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.upsertDailyEntry(ctx.user.id, input.date, {
          weekNum: input.weekNum,
          dayNum: input.dayNum,
          morningGratitude1: input.gratitude1,
          morningGratitude2: input.gratitude2,
          morningGratitude3: input.gratitude3,
          morningGratitude4: input.gratitude4,
          morningGratitude5: input.gratitude5,
          morningFocus: input.focus,
          morningImportant: input.important,
          morningBetterMoments: input.betterMoments,
          practiceIntended: input.practiceIntended,
          morningCompleted: input.completed ?? false,
        });
        return { id };
      }),

    saveEvening: protectedProcedure
      .input(z.object({
        date: z.string(),
        weekNum: z.number(),
        dayNum: z.number(),
        gratitude1: z.string().optional(),
        gratitude2: z.string().optional(),
        gratitude3: z.string().optional(),
        moment: z.string().optional(),
        learned: z.string().optional(),
        letGo: z.string().optional(),
        practiceCompleted: z.enum(["yes", "partly", "no", "pending"]).optional(),
        practiceFeeling: z.string().optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.upsertDailyEntry(ctx.user.id, input.date, {
          weekNum: input.weekNum,
          dayNum: input.dayNum,
          eveningGratitude1: input.gratitude1,
          eveningGratitude2: input.gratitude2,
          eveningGratitude3: input.gratitude3,
          eveningMoment: input.moment,
          eveningLearned: input.learned,
          eveningLetGo: input.letGo,
          practiceCompleted: input.practiceCompleted,
          practiceFeeling: input.practiceFeeling,
          eveningCompleted: input.completed ?? false,
        });
        return { id };
      }),
  }),

  freeWrite: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserFreeWrites(ctx.user.id);
    }),

    getByDate: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getFreeWriteByDate(ctx.user.id, input.date);
      }),

    save: protectedProcedure
      .input(z.object({ date: z.string(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.upsertFreeWrite(ctx.user.id, input.date, input.content);
        return { id };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteFreeWrite(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  reflections: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserReflections(ctx.user.id);
    }),

    getByWeek: protectedProcedure
      .input(z.object({ weekNum: z.number().min(1).max(8) }))
      .query(async ({ ctx, input }) => {
        return db.getWeeklyReflection(ctx.user.id, input.weekNum);
      }),

    save: protectedProcedure
      .input(z.object({
        weekNum: z.number().min(1).max(8),
        answer1: z.string().optional(),
        answer2: z.string().optional(),
        answer3: z.string().optional(),
        answer4: z.string().optional(),
        answer5: z.string().optional(),
        answer6: z.string().optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.upsertWeeklyReflection(ctx.user.id, input.weekNum, {
          answer1: input.answer1,
          answer2: input.answer2,
          answer3: input.answer3,
          answer4: input.answer4,
          answer5: input.answer5,
          answer6: input.answer6,
          completed: input.completed,
          completedDate: input.completed ? new Date() : undefined,
        });
        return { id };
      }),
  }),

  progress: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getJourneyProgress(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        totalDaysCompleted: z.number().optional(),
        week4TransitionShown: z.boolean().optional(),
        week8CompletionShown: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertJourneyProgress(ctx.user.id, input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
