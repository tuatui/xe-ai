import type { AppRouter } from "~/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";

export const customErrorHandleLink: TRPCLink<AppRouter> =
  () =>
  ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next: (value) => observer.next(value),
        error: (err) => {
          if (err.data?.code === "UNAUTHORIZED") {
            notificationStore().pushNotification({
              content: "登录失效，请重新登录",
              timeout: 3000,
            });

            loginStore().userInfo = undefined;
          } else if (err.data?.code === "INTERNAL_SERVER_ERROR") {
            notificationStore().pushNotification({
              content: "服务器错误，可以在控制台看到更详细的信息",
              timeout: 3000,
            });
          }
          observer.error(err);
        },
        complete: () => observer.complete(),
      });
      return unsubscribe;
    });
  };
