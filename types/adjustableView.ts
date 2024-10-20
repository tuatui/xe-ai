import type { DefineComponent } from "vue";

export type LeafComponentUniqueKey = symbol;
export type SplitLeafFn = (
  isVertical: boolean,
  lc: LeafComponent,
  onLeftSide: boolean,
) => LeafComponentUniqueKey;
export type CutLeafFn = () => LeafComponentUniqueKey;
export type LeafComponentProps = {
  uniqueKey: LeafComponentUniqueKey;
  splitLeaf?: SplitLeafFn;
  cutLeaf?: CutLeafFn;
};

/**
 * 叶子节点应该具有的类型
 * @description 这并不一定是最精确的类型，可能需要进一步调整
 */
export type LeafComponent = DefineComponent<
  LeafComponentProps,
  {},
  void,
  {},
  {}
>;
