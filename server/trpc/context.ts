import type { CreateContextFn } from "trpc-nuxt";
import type { AnyRouter } from "@trpc/server";
import { db } from "~/server/db";

export const createContext = (
  e: Parameters<CreateContextFn<AnyRouter>>["0"],
) => ({
  db,
  ev: e,
});
export type Context = typeof createContext;
