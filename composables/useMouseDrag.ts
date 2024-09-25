interface MousePosition {
  x: number;
  y: number;
}
type tryDragFn = (
  pos: MousePosition,
  ev: { mouseEvent?: MouseEvent; resizeObserverSize?: ResizeObserverSize }
) => Partial<MousePosition>;

interface UseMouseDragConf {
  init: MousePosition;
  triggerOnElemResize: boolean;
  triggerOnWindowResize: boolean;
}
const defaultConf: UseMouseDragConf = {
  init: { x: 0, y: 0 },
  triggerOnElemResize: true,
  triggerOnWindowResize: true,
};
export const useMouseDrag = (
  htmlRef: MaybeRefOrGetter<HTMLElement | undefined | null>,
  useConf: Partial<UseMouseDragConf> = {},
  event = { onTryDrag: ((pos) => pos) as tryDragFn }
) => {
  const conf = { ...defaultConf, ...useConf };
  const htmlElem = toRef(htmlRef);
  const isDragging = ref(false);
  const position = ref(conf.init);
  const handleMouseMove = (ev: MouseEvent) => {
    Object.assign(
      position.value,
      event.onTryDrag({ x: ev.pageX, y: ev.pageY }, { mouseEvent: ev })
    );
  };
  const handleStart = () => {
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("dragend", handleEnd);
    isDragging.value = true;
  };
  const handleEnd = () => {
    window.removeEventListener("mouseup", handleEnd);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("dragend", handleEnd);
    isDragging.value = false;
  };
  onUnmounted(() => {
    htmlElem.value?.removeEventListener("mousedown", handleStart);
    window.removeEventListener("mouseup", handleEnd);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("dragend", handleEnd);
    resizeObs.disconnect();
  });
  const resizeObs = new ResizeObserver((entries) => {
    const size = entries[0]?.contentBoxSize[0];
    if (!size) return;
    Object.assign(
      position.value,
      event.onTryDrag({ ...position.value }, { resizeObserverSize: size })
    );
  });
  onMounted(() => {
    if (!htmlElem.value) throw new Error("Can't find html element on mounted");

    htmlElem.value.addEventListener("mousedown", handleStart);
    if (conf.triggerOnElemResize) resizeObs.observe(htmlElem.value);
    if (conf.triggerOnWindowResize) resizeObs.observe(document.body);
  });

  return { isDragging, position };
};
