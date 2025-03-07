export interface HidePartialStrConf {
  replaceChar: string;
  hidePercentage: number;
  align: "left" | "center" | "right";
}
const defaultConf: Readonly<HidePartialStrConf> = {
  replaceChar: "*",
  hidePercentage: 0.6,
  align: "center",
};
export const hidePartialStr = (
  input: string,
  conf?: HidePartialStrConf,
): string => {
  if (!input) return "";
  const finalConf = conf ? { ...defaultConf, ...conf } : defaultConf;
  const hideCount = finalConf.hidePercentage * input.length;
  const { replaceChar } = finalConf;

  if (finalConf.align === "left") {
    return replaceChar.repeat(hideCount) + input.slice(hideCount);
  } else if (finalConf.align === "right")
    return input.slice(0, hideCount) + replaceChar.repeat(hideCount);
  else {
    const sideLen = input.length / 2 - hideCount / 2;
    return (
      input.slice(0, sideLen) +
      replaceChar.repeat(hideCount) +
      input.slice(input.length - sideLen)
    );
  }
};

const upperChar = /[A-Z]+/;
const lowerChar = /[a-z]+/;
const numberChar = /[0-9]+/;
const specialChar = /[!-/:-@[-`{-~]+/;
export const testPasswordStrong = (pwd: string) => {
  let point = 0;
  if (pwd.length < 6) return point;
  if (upperChar.test(pwd)) point++;
  if (lowerChar.test(pwd)) point++;
  if (numberChar.test(pwd)) point++;
  if (specialChar.test(pwd)) point++;
  if (pwd.length >= 10) point++;
  return point;
};

export const deleteUndefined = <
  T extends Record<string | symbol, unknown> | undefined,
>(
  obj: T,
): T => {
  if (obj === undefined) return obj;
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) delete obj[k];
  }
  return obj;
};

class StringBuff {
  public stopFlag = false;
  public out: AsyncGenerator<string, void, undefined>;
  private originLen: number;
  constructor(
    public strBuff: string,
    public tick: number,
    public duration: number,
  ) {
    this.originLen = strBuff.length;
    this.out = async function* (this: StringBuff) {
      while (true) {
        await new Promise<void>((resolve) => setTimeout(resolve, this.tick));
        if (!this.strBuff) {
          if (this.stopFlag) break;

          const res = await new Promise<void>((resolve, reject) => {
            this.continueGen = resolve;
            this.breakGen = reject;
          }).catch<boolean>(() => true);

          this.continueGen = undefined;
          this.breakGen = undefined;
          if (res) break;
          else continue;
        }
        const i = Math.ceil((this.tick / this.duration) * this.originLen);
        yield this.strBuff.slice(0, i);
        this.strBuff = this.strBuff.slice(i);
      }
    }.call(this);
  }
  public stop = (time: number = 1000) => {
    this.stopFlag = true;
    this.duration = time;
    if (this.breakGen) this.breakGen();
  };
  public push = (str: string) => {
    this.strBuff += str;
    this.originLen = this.strBuff.length;
    if (this.continueGen) this.continueGen();
  };
  public clear = () => (this.strBuff = "");
  private continueGen?: () => void;
  private breakGen?: () => void;
}

export const bufferedOut = (strBuff = "", tick = 16, duration = 5000) =>
  new StringBuff(strBuff, tick, duration);

export type BufferedOut = StringBuff;

export const toModelListSelectItemProps = (item: ModelList) => ({
  title: item.name,
  subtitle: ` ${item.provider ?? ""} ${item.owner}`,
  value: item.name,
});
export class CyclicTasks {
  private isPadding: boolean = false;
  private redo: boolean = false;

  constructor(private task: () => Promise<unknown>) {}
  public exec = async () => {
    if (this.isPadding) {
      this.redo = true;
      return;
    }
    do {
      this.redo = false;
      this.isPadding = true;
      await this.task();
      this.isPadding = false;
    } while (this.redo);
  };
}

export const copy2Clipboard = navigator.clipboard
  ? (str: string) => navigator.clipboard.writeText(str)
  : (str: string) => {
      const i = document.createElement("textarea");
      document.body.appendChild(i);
      i.value = str;
      i.select();
      document.execCommand("copy");
      document.body.removeChild(i);
    };

export { deepMerge as mergeDeep } from "@antfu/utils";
// TODO: 如果能解决d.ts导入的问题，使用nuxt.config的自动导入。
export { cloneDeep } from "lodash-es";
