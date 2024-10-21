import { publicProcedure, router } from "~/server/trpc/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { authorizedProcedure } from "../../procedures";
import { checkDerivePwdFast, derivePwdFast } from "~/utils/jsCrypto";
import { type AuthData, secretKey } from "~/server/trpc/procedures/auth";
import jwt from "jsonwebtoken";

export const user = router({
  login: publicProcedure
    .input(
      z.object({
        name: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx: { db } }) => {
      const loginRes = await db.user.findFirst({
        select: { name: true, id: true, password: true },
        where: {
          AND: [{ name: input.name }],
        },
      });
      if (!loginRes) return null;
      const isCorrect = await checkDerivePwdFast(
        input.password,
        loginRes.password,
      );
      if (!isCorrect) return null;
      const authData: AuthData = { user: { id: loginRes.id } };
      const token = jwt.sign(authData, secretKey);
      return { res: { ...loginRes, token } };
    }),
  register: publicProcedure
    .input(
      z.object({
        name: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input: { password, name }, ctx: { db } }) => {
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
          password: await derivePwdFast(password),
          name,
        },
      });
      const authData: AuthData = { user: { id: newUser.id } };
      const token = jwt.sign(authData, secretKey);

      return { res: { ...newUser, token } };
    }),
  checkName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
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
    }),
  ),
});
