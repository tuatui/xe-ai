import { TRPCError } from "@trpc/server";
import { publicProcedure } from "~/server/trpc/trpc";
import { TOKEN_HEADER_KEY } from "~/constants/server";
import jwt from "jsonwebtoken";
import c from "crypto";

const secretKeyStr = process.env.XE_AI_JWT_SECRET_KEY;

if (!secretKeyStr)
  console.warn(
    `你需要创建.env文件并设置JWT变量以便正常使用JWT，
    在./env.example文件中可以看到更多信息`,
  );

export const secretKey = c.createSecretKey(
  secretKeyStr
    ? Buffer.from(secretKeyStr)
    : c.getRandomValues(new Uint8Array(32)),
);

export interface AuthData {
  user: { id: number };
}
export const authorizedProcedure = publicProcedure.use(
  async ({ ctx: { ev, ...other }, next }) => {
    const token = ev.headers.get(TOKEN_HEADER_KEY);
    if (token === null) throw new TRPCError({ code: "UNAUTHORIZED" });
    try {
      const res = jwt.verify(token, secretKey) as AuthData;
      return next({ ctx: { ...other, ...res, ev } });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new TRPCError({ code: "UNAUTHORIZED", message: "JWT 过期" });
      else if (error instanceof jwt.NotBeforeError)
        throw new TRPCError({ code: "UNAUTHORIZED" });
      else throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  },
);
