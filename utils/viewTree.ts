export class ViewTree {
  public readonly uniqueKey = Symbol("xe-view-tree");
  public view?: VNode;
  constructor(
    public isLeaf: boolean,
    public createVNode?: (uniqueKey: symbol) => VNode,

    public isVertical: boolean = false,
    public children: ViewTree[] = [],
    public space: number = 1,
  ) {
    this.view = createVNode?.(this.uniqueKey);
  }

  public parse = <T>(leafParse: (vt: ViewTree) => T): ViewTreeWithMeta<T> => ({
    isLeaf: this.isLeaf,
    isVertical: this.isVertical,
    space: this.space,
    meta: leafParse(this),
    children: this.children.map((each) => each.parse(leafParse)),
  });
}

type ViewTreeOrd = Pick<ViewTree, "isLeaf" | "isVertical" | "space">;
export interface ViewTreeWithMeta<T> extends ViewTreeOrd {
  meta?: T;
  children: ViewTreeWithMeta<T>[];
}
