/**
 * This is the API-handler of your app that contains all your API routes.
 * On a bigger app, you will probably want to split this file up into multiple files.
 */
import { createNuxtApiHandler } from "trpc-nuxt";
import { appRouter } from "~/server/trpc/routers";
// export API handler
export default createNuxtApiHandler({
  router: appRouter,
  createContext: (a) => ({}),
});
