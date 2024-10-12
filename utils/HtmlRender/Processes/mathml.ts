import temml from "temml";

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

export default (input: string) => {
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
  for (let iI = 0, iB = 0; iI < resInline.length || iB < resBlock.length; ) {
    const inlineL = resInline[iI]?.left ?? Infinity;
    const blockL = resBlock[iB]?.left ?? Infinity;
    if (inlineL < blockL) {
      const { left, right } = resInline[iI];
      output += input.slice(cursor, left - 2);
      output += temml.renderToString(input.slice(left, right));
      cursor = right + 2;
      iI++;
    } else {
      const { left, right } = resBlock[iB];
      output += input.slice(cursor, left - 2);
      output += temml.renderToString(input.slice(left, right), {
        displayMode: true,
      });
      cursor = right + 2;
      iB++;
    }
  }
  return output + input.slice(cursor);
};
