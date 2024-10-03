import { publicProcedure, router, mergeRouters } from "~/server/trpc/trpc";
import { z } from "zod";
export const appRouter = mergeRouters(
  router({
    hello: publicProcedure
      // This is the input schema of your procedure
      .input(
        z.object({
          text: z.string().nullish(),
        })
      )
      .query(async ({ input, ctx }) => {
        // This is what you're returning to your client
        return {
          greeting: `hello ${input?.text ?? "world"}`,
        };
      }),
  })
);

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;
