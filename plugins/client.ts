// https://trpc-nuxt.vercel.app/get-started/usage/simple#_2-create-trpc-client-plugin

import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";
import type { AppRouter } from "~/server/trpc/routers";

export default defineNuxtPlugin(() => {
  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of `useAsyncData`.
   */
  const client = createTRPCNuxtClient<AppRouter>({
    links: [
      customErrorHandleLink,
      httpBatchLink({
        url: "/api/trpc",
      }),
    ],
  });

  return { provide: { client } };
});
