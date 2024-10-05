import { publicProcedure, router } from "~/server/trpc/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const user = router({
  login: publicProcedure
    .input(
      z.object({
        name: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx: { db, ev } }) => {
      const res = await db.user.findFirst({
        select: { name: true, id: true },
        where: {
          AND: [{ name: input.name }, { password: input.password }],
        },
      });
      if (!res) return null;
      await setUserSession(ev, { user: { id: res.id } });
      return { res };
    }),
  register: publicProcedure
    .input(
      z.object({
        name: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input: { password, name }, ctx: { db, ev } }) => {
      const res = await db.user.findFirst({
        select: { id: true },
        where: { name },
      });

      if (res)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "用户名不可用",
        });
      const { id } = await db.user.create({
        data: {
          password,
          name,
        },
      });
      await setUserSession(ev, { user: { id } });
      return;
    }),
  checkName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(async ({ input: { name }, ctx: { db } }) => {
      const res = await db.user.findFirst({
        select: { id: true },
        where: { name },
      });

      return { isAvailable: !res };
    }),
});
