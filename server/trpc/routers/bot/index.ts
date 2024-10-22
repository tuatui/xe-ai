import { authorizedProcedure } from "~/server/trpc/procedures";
import { router } from "~/server/trpc/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const botInputParser = z.object({
  id: z.number(),
  secretKey: z.string(),
  iv: z.string(),
  nickName: z.string(),
  name: z.string(),
  apiUrl: z.string(),
  provider: z.number(),
  availableModel: z.array(z.object({ name: z.string(), owner: z.string() })),
  createTime: z.string(),
  primaryModel: z.string().nullish(),
});

export const bot = router({
  sync: authorizedProcedure
    .input(z.array(botInputParser))
    .mutation(async ({ ctx: { db, user }, input }) => {
      const idList = await db.$transaction(
        input.map((i) =>
          db.botProvider.create({
            select: { id: true },
            data: {
              ...i,
              id: undefined,
              availableModel: undefined,
              localId: i.id,
              ownerId: user.id,
            },
          }),
        ),
      );

      await db.modelList.createMany({
        data: idList.flatMap(({ id }, index) =>
          input[index].availableModel.map((model) => ({
            ...model,
            botProviderId: id,
          })),
        ),
      });
      const { localBotsLen } = await db.user.findUniqueOrThrow({
        select: { localBotsLen: true },
        where: { id: user.id },
      });
      const max = Math.max(-1, ...input.map((i) => i.id)) + 1;
      if (max > localBotsLen)
        await db.user.update({
          select: { id: true },
          where: { id: user.id },
          data: { localBotsLen: max },
        });
      return;
    }),
  create: authorizedProcedure
    .input(
      z.object({
        secretKey: z.string(),
        iv: z.string(),
        nickName: z.string(),
        name: z.string(),
        apiUrl: z.string(),
        provider: z.number(),
        availableModel: z.array(
          z.object({ name: z.string(), owner: z.string() }),
        ),
        createTime: z.string(),
        primaryModel: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx: { db, user }, input }) => {
      const { localBotsLen } = await db.user.findUniqueOrThrow({
        select: { localBotsLen: true },
        where: { id: user.id },
      });
      const [_, newBot] = await db.$transaction([
        db.user.update({
          select: { id: true },
          where: { id: user.id },
          data: { localBotsLen: localBotsLen + 1 },
        }),
        db.botProvider.create({
          data: {
            ...input,
            localId: localBotsLen,
            ownerId: user.id,
            availableModel: {
              create: input.availableModel,
            },
          },
        }),
      ]);

      return newBot;
    }),
  update: authorizedProcedure
    .input(botInputParser)
    .mutation(async ({ ctx: { db, user }, input }) => {
      const res = await db.botProvider.findFirstOrThrow({
        select: { ownerId: true, id: true },
        where: { localId: input.id, ownerId: user.id },
      });
      if (res.ownerId !== user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      await db.botProvider.update({
        where: { id: res.id },
        data: {
          ...input,
          id: undefined,
          availableModel: { create: input.availableModel },
          localId: input.id,
          ownerId: user.id,
        },
      });
    }),
  // TODO 删除应该同步多设备
  delete: authorizedProcedure
    .input(z.number())
    .mutation(async ({ ctx: { db, user }, input }) => {
      const res = await db.botProvider.findFirstOrThrow({
        select: { ownerId: true, id: true },
        where: { localId: input, ownerId: user.id },
      });
      if (res.ownerId !== user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      await db.botProvider.delete({ where: { id: res.id } });
    }),
  getAll: authorizedProcedure.query(async ({ ctx: { db, user } }) => {
    const [bots, info] = await db.$transaction([
      db.botProvider.findMany({
        where: { ownerId: user.id },
        include: { availableModel: true },
      }),
      db.user.findUniqueOrThrow({
        select: { localBotsLen: true },
        where: { id: user.id },
      }),
    ]);
    return { bots, info };
  }),
});
