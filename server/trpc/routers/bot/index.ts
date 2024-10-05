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
});

export const bot = router({
  create: authorizedProcedure
    .input(z.array(botInputParser))
    .mutation(async ({ ctx: { db, user }, input }) => {
      const idList = await db.botProvider.createManyAndReturn({
        select: { id: true },
        data: input.map((i) => ({
          ...i,
          id: undefined,
          availableModel: undefined,
          localId: i.id,
          ownerId: user.id,
        })),
      });
      await db.modelList.createMany({
        data: idList.flatMap(({ id }, index) =>
          input[index].availableModel.map((model) => ({
            ...model,
            botProviderId: id,
          }))
        ),
      });

      return;
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
  delete: authorizedProcedure
    .input(botInputParser)
    .mutation(async ({ ctx: { db, user }, input }) => {
      const res = await db.botProvider.findFirstOrThrow({
        select: { ownerId: true, id: true },
        where: { localId: input.id, ownerId: user.id },
      });
      if (res.ownerId !== user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      await db.botProvider.delete({ where: { id: res.id } });
    }),
  getAll: authorizedProcedure.query(({ ctx: { db, user } }) =>
    db.botProvider.findMany({
      where: { ownerId: user.id },
      include: { availableModel: true },
    })
  ),
});
