export interface Notification {
  content: string;
  timeout?: number;
  cancelable?: boolean;
  onCancel?: () => void;
  onFinish?: () => void;
}
const defaultNotification: Notification = {
  content: "",
  timeout: 6000,
};
class NotificationElement {
  public cancelJob = () => {};
  public finishJob = () => {};
  constructor(public notification: Notification, public onFinish?: () => void) {
    new Promise<void>((resolve, reject) => {
      setTimeout(resolve, notification.timeout);
      this.finishJob = resolve;
      this.cancelJob = reject;
    })
      .then(() => {
        if (notification.onFinish) notification.onFinish();
        notification.onCancel = undefined;
        notification.onFinish = undefined;
      })
      .catch(() => {
        if (notification.onCancel) notification.onCancel();
        notification.onCancel = undefined;
        notification.onFinish = undefined;
      })
      .finally(() => onFinish && onFinish());
  }
}
export const notificationStore = defineStore("global-notification", () => {
  const notificationStack: Ref<NotificationElement[]> = ref([]);

  const pushNotification = (notification: Notification) => {
    const ne = new NotificationElement(
      { ...defaultNotification, ...notification },
      () => {
        const index = notificationStack.value.findIndex(
          (each) => toRaw(each) === ne
        );
        if (index >= 0) notificationStack.value.splice(index, 1);
      }
    );
    notificationStack.value.unshift(ne);
  };
  return { pushNotification, notificationStack };
});
