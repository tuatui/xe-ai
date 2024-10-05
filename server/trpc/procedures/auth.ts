import { TRPCError } from "@trpc/server";
import { publicProcedure } from "~/server/trpc/trpc";
export const authorizedProcedure = publicProcedure.use(
  async ({ ctx: { ev, ...other }, next }) => {
    const ses = await getUserSession(ev);
    if (ses.user === undefined) throw new TRPCError({ code: "UNAUTHORIZED" });

    return next({ ctx: { ...other, ev, user: ses.user } });
  }
);
