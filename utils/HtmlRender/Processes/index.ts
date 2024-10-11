import type { ProcessFn } from "..";

import markdown from "./markdown";
import purify from "./purify";
import mathml from "./mathml";

export default [mathml, markdown, purify] satisfies ProcessFn[];
