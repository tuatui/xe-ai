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
const specialChar = /[!-\/:-@[-`{-~]+/;
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

import { deepMerge } from "@antfu/utils";
export const mergeDeep = deepMerge;
/**
 * 用于将对象从代理中提取出来，不同于深拷贝，不会创建新对象。
 * @deprecated 不再使用，使用toRaw手动解除代理
 */
export const toRawDeep = <T extends object>(source: T): T => {
  return deepMerge({}, source) as T;
};

export const bufferedOut = (
  strBuff = "",
  tick = 16,
  duration = 5000,
  stopFlag = false,
  len = strBuff.length,
) => ({
  out: (async function* () {
    while (true) {
      await new Promise<void>((resolve) => setTimeout(resolve, tick));
      if (stopFlag && !strBuff) return;
      if (!strBuff) continue;
      const i = Math.ceil((tick / duration) * len);
      yield strBuff.slice(0, i);
      strBuff = strBuff.slice(i);
    }
  })(),
  stop: (time: number = 1000) => ((stopFlag = true), (duration = time)),
  push: (str: string) => ((strBuff += str), (len = strBuff.length)),
  clear: () => (strBuff = ""),
});
