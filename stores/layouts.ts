export const useLayoutsStore = defineStore("layout-store", () => {
  const local = new LayoutsLocal();
  const layouts = shallowRef<VTLayoutData[]>([]);
  const update = async (data: UpdateVTLayoutData) => {
    if (data.id === undefined) {
      data.id = await local.update(data);
      layouts.value.push(data as VTLayoutData);
    } else {
      const id = await local.update(data);
      const res = layouts.value.find((layout) => layout.id === id);
      if (res) mergeDeep(res, data);
    }
    triggerRef(layouts);
  };
  const remove = async (id: number) => {
    await local.remove(id);
    const i = layouts.value.findIndex((lay) => lay.id === id);
    if (i < 0) return;
    layouts.value.splice(i, 1);
    triggerRef(layouts);
  };
  const get = (id?: number) => local.get(id);
  get().then((v) => (layouts.value = v));
  return { layouts, update, remove, get };
});
