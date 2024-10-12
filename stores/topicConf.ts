interface ShowTopicReturnVal {
  newBot?: BotsData;
  newModelName?: string;
}
export const topicConf = defineStore("topic-conf-store", () => {
  const selectedBot = ref<BotsData>();
  const selectedModel = ref<string>();
  const isShow = ref<boolean>(false);

  const confirmSetting = shallowRef<(returnVal: ShowTopicReturnVal) => void>(
    () => {},
  );
  const cancelSetting = shallowRef<() => void>(() => {});

  const showTopicConfDialog = (oldBot?: BotsData, oldModelName?: string) => {
    selectedBot.value = oldBot;
    selectedModel.value = oldModelName;
    isShow.value = true;
    return new Promise<ShowTopicReturnVal>((resolve, reject) => {
      confirmSetting.value = resolve;
      cancelSetting.value = reject;
    });
  };
  return {
    selectedBot,
    selectedModel,
    isShow,
    confirmSetting,
    cancelSetting,
    showTopicConfDialog,
  };
});
