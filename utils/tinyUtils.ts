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

// TODO TEST

/**
 * 深合并多个对象
 * @description 数组会按索引合并。不会保留源的proxy。
 */
export const mergeDeep = (
  target: AnyRecord,
  ...sources: AnyRecord[]
): AnyRecord => {
  console.log("call");
  if (!sources.length) return target;
  const source = sources.shift();

  for (const key in source) {
    if (isObject(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      mergeDeep(target[key] as AnyRecord, source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }

  return mergeDeep(target, ...sources);
};
/**
 * 深拷贝一个变量。
 * @description 仅支持JSON内的数据类型，不支持symbol、function。不会保留proxy。
 */
export const cloneDeep = <T extends any>(source: T): T => {
  if (source === null) return source;
  if (Array.isArray(source)) return source.map((each) => cloneDeep(each)) as T;
  if (typeof source !== "object") return source;

  const newObj: AnyRecord = {};
  for (const key in source) {
    const element = source[key];
    newObj[key] = cloneDeep(element);
  }
  return newObj as T;
};
