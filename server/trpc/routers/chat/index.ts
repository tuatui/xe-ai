import { authorizedProcedure } from "~/server/trpc/procedures";
import { router } from "~/server/trpc/trpc";
import { z } from "zod";
import { ChatRole } from "~/utils/CRUD";

export const chat = router({
  create: authorizedProcedure
    .input(
      z.object({
        context: z.string(),
        from: z.nativeEnum(ChatRole),
        topicId: z.number(),
      })
    )
    .mutation(async ({ ctx: { db, user }, input }) => {
      await db.topic.findUniqueOrThrow({
        select: { id: true },
        where: {
          id: input.topicId,
          authorId: user.id,
        },
      });

      return await db.chat.create({
        select: { id: true },
        data: { ...input, authorId: user.id },
      });
    }),
  update: authorizedProcedure
    .input(
      z.object({
        id: z.number(),
        context: z.string().optional(),
        from: z.nativeEnum(ChatRole).optional(),
      })
    )
    .mutation(({ ctx: { db, user }, input }) =>
      db.chat.update({
        select: { id: true },
        where: {
          id: input.id,
          authorId: user.id,
        },
        data: {
          context: input.context,
          from: input.from,
        },
      })
    ),
  delete: authorizedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx: { db, user }, input }) =>
      db.chat.delete({
        where: {
          id: input.id,
          authorId: user.id,
        },
      })
    ),
  getFromTopic: authorizedProcedure
    .input(z.number())
    .query(({ ctx: { db, user }, input }) =>
      db.topic.findUniqueOrThrow({
        include: { Chat: true },
        where: { id: input, authorId: user.id },
      })
    ),
});
