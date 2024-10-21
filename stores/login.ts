const LoginLocalStoreKey = "Xe-AI-LoginLocalStoreKey";

export const loginStore = defineStore("login-store", () => {
  const userInfo = ref<{
    name: string;
    derivedPassword: string;
    token: string;
    id: number;
  }>();
  const res = localStorage.getItem(LoginLocalStoreKey);

  if (res) userInfo.value = JSON.parse(res);

  watch(userInfo, () => {
    if (!userInfo.value) {
      localStorage.removeItem(LoginLocalStoreKey);
      return;
    }
    localStorage.setItem(LoginLocalStoreKey, JSON.stringify(userInfo.value));
  });

  const isLogin = computed(() => Boolean(userInfo.value));
  return { userInfo, isLogin };
});
