import DOMPurify from "dompurify";
import type { ProcessCtx } from "~/utils";
export default (ctx: ProcessCtx) => {
  ctx.text = DOMPurify.sanitize(ctx.text);
  return ctx;
};
