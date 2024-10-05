// https://trpc-nuxt.vercel.app/get-started/usage/simple
// https://trpc.io/docs/server/routers

import { initTRPC } from "@trpc/server";
import { Context } from "./context";
const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;

export const router = t.router;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;
