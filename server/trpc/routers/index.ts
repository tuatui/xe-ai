import { router } from "~/server/trpc/trpc";
import { user } from "./user";
import { bot } from "./bot";
import { topic } from "./topic";
import { chat } from "./chat";

export const appRouter = router({
  user,
  bot,
  topic,
  chat,
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;
