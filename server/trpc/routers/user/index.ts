import { publicProcedure, router } from "~/server/trpc/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { authorizedProcedure } from "../../procedures";

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
      const newUser = await db.user.create({
        select: { id: true, name: true },
        data: {
          password,
          name,
        },
      });
      await setUserSession(ev, { user: { id: newUser.id } });
      return newUser;
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
  getLocalDBLen: authorizedProcedure.query(({ ctx: { db, user } }) =>
    db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        localBotsLen: true,
        localChatsLen: true,
        localTopicsLen: true,
      },
    })
  ),
});
