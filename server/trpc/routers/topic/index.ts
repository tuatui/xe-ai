import { authorizedProcedure } from "~/server/trpc/procedures";
import { router } from "~/server/trpc/trpc";
import { z } from "zod";

export const topic = router({
  create: authorizedProcedure
    .input(
      z.object({
        title: z.string().nullish(),
        preferSetting: z
          .object({
            preferBotID: z.number().optional(),
            preferModelName: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(({ ctx: { db, user }, input }) =>
      db.topic.create({
        select: { id: true },
        data: {
          title: input.title,
          authorId: user.id,
          updateTime: new Date(),
          preferBotID: input.preferSetting?.preferBotID,
          preferModelName: input.preferSetting?.preferModelName,
        },
      })
    ),
  update: authorizedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().nullish(),
        preferSetting: z
          .object({
            preferBotID: z.number().optional(),
            preferModelName: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(({ ctx: { db, user }, input }) =>
      db.topic.update({
        where: {
          id: input.id,
          authorId: user.id,
        },
        data: {
          title: input.title,
          authorId: user.id,
          updateTime: new Date(),
          preferBotID: input.preferSetting?.preferBotID,
          preferModelName: input.preferSetting?.preferModelName,
        },
      })
    ),
  delete: authorizedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx: { db, user }, input }) =>
      db.topic.delete({
        where: {
          id: input.id,
          authorId: user.id,
        },
      })
    ),
  get: authorizedProcedure
    .input(
      z.object({
        id: z.number().nullish(),
      })
    )
    .mutation(async ({ ctx: { db, user }, input }) => {
      if (typeof input.id !== "number") {
        return (
          await db.topic.findMany({
            where: { authorId: user.id },
          })
        ).map(({ preferBotID, preferModelName, ...left }) => ({
          ...left,
          preferSetting: {
            preferBotID,
            preferModelName,
          },
        }));
      } else {
        const { preferBotID, preferModelName, ...topic } =
          await db.topic.findUniqueOrThrow({
            where: { id: input.id, authorId: user.id },
          });
        return [
          {
            ...topic,
            preferSetting: {
              preferBotID,
              preferModelName,
            },
          },
        ];
      }
    }),
});
