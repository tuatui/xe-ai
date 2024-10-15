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
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined) delete obj[k];
  });
  return obj;
};
type AnyRecord = Record<string, any>;

export const isObject = (item: unknown): item is AnyRecord =>
  Boolean(item && typeof item === "object" && !Array.isArray(item));

import { deepMerge } from "@antfu/utils";
export const mergeDeep = deepMerge;
/**
 * 用于将对象从代理中提取出来，不同于深拷贝，不会创建新对象。
 */
export const toRawDeep = <T extends object>(source: T): T => {
  return deepMerge({}, source) as T;
};
