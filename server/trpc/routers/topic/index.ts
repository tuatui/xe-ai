import { authorizedProcedure } from "~/server/trpc/procedures";
import { router } from "~/server/trpc/trpc";
import { z } from "zod";
import { ChatRole } from "~/utils";
import type { Prisma } from "@prisma/client";
import type { CommonPagination } from "~/types/page";

export const topic = router({
  sync: authorizedProcedure
    .input(
      z.array(
        z.object({
          title: z.string().nullish(),
          preferSetting: z
            .object({
              preferBotID: z.number().optional(),
              preferModelName: z.string().optional(),
            })
            .optional(),
          updateTime: z.string().or(z.date()),
          chats: z.array(
            z.object({
              context: z.string(),
              from: z.nativeEnum(ChatRole),
            }),
          ),
        }),
      ),
    )
    .mutation(async ({ ctx: { db, user }, input }) => {
      const topics: Prisma.TopicCreateManyInput[] = input.map(
        ({ chats: _, preferSetting, ...topic }) => ({
          ...topic,
          ...preferSetting,
          authorId: user.id,
          updateTime: new Date(topic.updateTime),
        }),
      );
      const res = await db.topic.createManyAndReturn({
        select: { id: true },
        data: topics,
      });
      const chatData: Prisma.ChatCreateManyInput[] = res.flatMap(
        ({ id }, index) =>
          input[index].chats.map((chat) => ({
            ...chat,
            topicId: id,
          })),
      );
      await db.chat.createMany({ data: chatData });
    }),
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
      }),
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
      }),
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
      }),
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
      }),
    ),
  delete: authorizedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx: { db, user }, input }) =>
      db.topic.delete({
        where: {
          id: input.id,
          authorId: user.id,
        },
      }),
    ),
  get: authorizedProcedure
    .input(
      z.object({
        id: z.number().nullish(),
        page: z
          .object({
            size: z.number(),
            step: z.number(),
          })
          .nullish(),
      }),
    )
    .mutation(async ({ ctx: { db, user }, input }) => {
      if (!input.page) {
        if (typeof input.id !== "number") {
          const [res, total] = await db.$transaction([
            db.topic.findMany({
              where: { authorId: user.id },
              orderBy: { updateTime: "desc" },
            }),
            db.topic.count({ where: { authorId: user.id } }),
          ]);
          const page: CommonPagination = {
            total,
            size: total,
            step: 0,
          };
          return {
            res: res.map(({ preferBotID, preferModelName, ...left }) => ({
              ...left,
              preferSetting: {
                preferBotID,
                preferModelName,
              },
            })),
            page,
          };
        } else {
          const { preferBotID, preferModelName, ...topic } =
            await db.topic.findUniqueOrThrow({
              where: { id: input.id, authorId: user.id },
            });
          const page: CommonPagination = {
            total: 1,
            size: 1,
            step: 0,
          };
          return {
            res: [
              {
                ...topic,
                preferSetting: {
                  preferBotID,
                  preferModelName,
                },
              },
            ],
            page,
          };
        }
      }
      const { size, step } = input.page;
      const offset = size * step;
      const [res, total] = await db.$transaction([
        db.topic.findMany({
          where: { authorId: user.id },
          orderBy: { updateTime: "desc" },
          skip: offset,
          take: size,
        }),
        db.topic.count({ where: { authorId: user.id } }),
      ]);
      const page: CommonPagination = {
        ...input.page,
        total,
      };

      return {
        res: res.map(({ preferBotID, preferModelName, ...left }) => ({
          ...left,
          preferSetting: {
            preferBotID,
            preferModelName,
          },
        })),
        page,
      };
    }),
});
