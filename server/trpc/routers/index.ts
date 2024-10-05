import { router } from "~/server/trpc/trpc";
import { user } from "./user";
import { bot } from "./bot";

export const appRouter = router({
  user,
  bot,
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;
