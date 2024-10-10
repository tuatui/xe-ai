import type { ProcessFn } from "..";

import markdown from "./markdown";
import purify from "./purify";

export default [markdown, purify] as ProcessFn[];
