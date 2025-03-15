import type { renderToString } from "temml";
import type { ProcessCtx } from "~/utils";
const BlockLeft = "\\[";
const BlockRight = "\\]";
const InlineLeft = "\\(";
const InlineRight = "\\)";

const CodeBlock = "```";
const CodeInline = "`";

class FindResult {
  constructor(
    public left: number,
    public right: number,
  ) {}
}

let latex2Mathml: typeof renderToString | undefined = undefined;

export default async (ctx: ProcessCtx): Promise<ProcessCtx> => {
  const { text: input } = ctx;
  const resInline: FindResult[] = [];
  const resBlock: FindResult[] = [];

  let inputIndex = 0;

  while (inputIndex < input.length) {
    if (input[inputIndex] === CodeInline) {
      if (input.startsWith(CodeBlock, inputIndex)) {
        const right = input.indexOf(CodeBlock, inputIndex + CodeBlock.length);
        if (right < 0) break;
        inputIndex = right + CodeBlock.length;
      } else {
        const right = input.indexOf(CodeInline, inputIndex + CodeInline.length);
        if (right < 0) break;
        inputIndex = right + CodeInline.length;
      }
    } else if (input.startsWith(BlockLeft, inputIndex)) {
      const right = input.indexOf(BlockRight, inputIndex + BlockRight.length);
      if (right < 0) break;
      resBlock.push(new FindResult(inputIndex + BlockRight.length, right));
      inputIndex = right + BlockRight.length;
    } else if (input.startsWith(InlineLeft, inputIndex)) {
      const right = input.indexOf(InlineRight, inputIndex + InlineRight.length);
      if (right < 0) break;
      resInline.push(new FindResult(inputIndex + InlineRight.length, right));
      inputIndex = right + InlineRight.length;
    } else inputIndex++;
  }

  let output: string = "";
  let cursor = 0;
  if (resInline.length > 0 || resBlock.length > 0) {
    if (latex2Mathml === undefined) {
      const {
        default: { renderToString },
      } = await import("temml");
      latex2Mathml = renderToString;
    }

    for (let iI = 0, iB = 0; iI < resInline.length || iB < resBlock.length; ) {
      const inlineL = resInline[iI]?.left ?? Infinity;
      const blockL = resBlock[iB]?.left ?? Infinity;
      if (inlineL < blockL) {
        const { left, right } = resInline[iI];
        output += input.slice(cursor, left - 2);
        output += latex2Mathml(input.slice(left, right));
        cursor = right + 2;
        iI++;
      } else {
        const { left, right } = resBlock[iB];
        output += input.slice(cursor, left - 2);
        output += latex2Mathml(input.slice(left, right), {
          displayMode: true,
        });
        cursor = right + 2;
        iB++;
      }
    }
  }
  ctx.text = output + input.slice(cursor);
  return ctx;
};
