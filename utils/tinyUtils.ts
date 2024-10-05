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
  conf?: HidePartialStrConf
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
