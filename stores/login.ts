const USER_NAME = "USER_NAME";
const PASSWORD = "PASSWORD";

export const loginStore = defineStore("login-store", () => {
  const userInfo = ref<{
    name: string;
    derivedPassword: string;
    id?: number;
  }>();
  {
    const name = localStorage.getItem(USER_NAME);
    const derivedPassword = localStorage.getItem(PASSWORD);
    if (name && derivedPassword) userInfo.value = { name, derivedPassword };
  }
  watch(userInfo, () => {
    if (!userInfo.value) {
      localStorage.removeItem(USER_NAME);
      localStorage.removeItem(PASSWORD);
      return;
    }
    localStorage.setItem(USER_NAME, userInfo.value.name);
    localStorage.setItem(PASSWORD, userInfo.value.derivedPassword);
  });

  const isLogin = computed(() => Boolean(userInfo.value));
  return { userInfo, isLogin };
});
