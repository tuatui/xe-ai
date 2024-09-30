export const useT = (key: string | number) => {
  const { t, locale } = useI18n();
  return computed(() => {
    // 切换语言时触发响应
    unref(locale);
    return t(key);
  });
};
