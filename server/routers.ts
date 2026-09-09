import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { createRegistration, deleteRegistration, listRegistrations, updateRegistration } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

const registrationInput = z.object({
  playerTitle: z.string().min(1),
  playerFirstName: z.string().min(2),
  playerLastName: z.string().min(2),
  dateOfBirth: z.string().min(4),
  placeOfBirth: z.string().min(2),
  ageGroup: z.enum(["U7", "U9", "U11", "U13"]),
  address: z.string().min(5),
  guardianName: z.string().min(2),
  guardianRelation: z.string().min(2),
  guardianPhone: z.string().min(8),
  guardianPhone2: z.string().optional().nullable(),
  hasHealthIssue: z.boolean(),
  healthDetails: z.string().optional().nullable(),
  birthCertificate: z.boolean(),
  medicalCertificate: z.boolean(),
  photos: z.boolean(),
  guardianIdCopy: z.boolean(),
});

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
  registrations: router({
    create: publicProcedure.input(registrationInput).mutation(async ({ input }) => {
      const registrationNumber = `IP-${Date.now().toString(36).toUpperCase()}`;
      return createRegistration({ ...input, registrationNumber });
    }),
    list: adminProcedure
      .input(z.object({ search: z.string().optional(), ageGroup: z.string().optional() }).optional())
      .query(({ input }) => listRegistrations(input?.search ?? "", input?.ageGroup ?? "all")),
    update: adminProcedure
      .input(registrationInput.partial().extend({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateRegistration(id, data);
      }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteRegistration(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
