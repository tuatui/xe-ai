export interface HideParticalStrConf {
  replaceChar: string;
  hidePercentage: number;
  align: "left" | "center" | "right";
}
const defalutConf: Readonly<HideParticalStrConf> = {
  replaceChar: "*",
  hidePercentage: 0.6,
  align: "center",
};

export const hideParticalStr = (
  input: string,
  conf?: HideParticalStrConf
): string => {
  if (!input) return "";
  const finalConf = conf ? { ...defalutConf, ...conf } : defalutConf;
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
