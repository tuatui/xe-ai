export class ViewTree {
  public readonly uniqueKey = Symbol("xe-view-tree");
  public view?: VNode;
  constructor(
    public isLeaf: boolean,
    public createVNode?: (uniqueKey: Symbol) => VNode,

    public isVertical: boolean = false,
    public children: ViewTree[] = [],
    public space: number = 1
  ) {
    if (createVNode) this.view = createVNode(this.uniqueKey);
  }
}
