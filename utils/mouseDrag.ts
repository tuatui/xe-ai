interface MouseDragImpConf<T = any> {
  onDrag: (ev: MouseEvent, ex: { source: EventTarget; meta: T }) => void;
  onStop: (ev: MouseEvent, ex: { source: EventTarget; meta: T }) => void;
}
const defaultConf: MouseDragImpConf = {
  onDrag: () => {},
  onStop: () => {},
};
export const mouseDragImp = <T = null>(
  ev: MouseEvent,
  useConf: Partial<MouseDragImpConf<T>> = {},
  meta: T = null as T
) => {
  const target = ev.target;
  const conf = { ...defaultConf, ...useConf };
  if (!target) throw new Error("can't find target element");

  const handleMouseMove = (ev: MouseEvent) =>
    conf.onDrag(ev, { source: target, meta });

  const handleEnd = (ev: MouseEvent) => {
    window.removeEventListener("mouseup", handleEnd);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("dragend", handleEnd);
    conf.onStop(ev, { source: target, meta });
  };

  window.addEventListener("mouseup", handleEnd);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("dragend", handleEnd);
};
