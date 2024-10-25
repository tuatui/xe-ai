<template>
  <XCommonBtn
    variant="text"
    icon
    @click="handleChange"
    :use-tooltip="$L.setting.switchTheme"
    use-icon="i-mdi-theme-light-dark"
  />
</template>
<script setup lang="ts">
const theme = useTheme();
const ds = defaultSettingSync();

const darkThemeMedia = matchMedia("(prefers-color-scheme: dark)");
let isSystemDark = darkThemeMedia.matches;
watch(
  () => ds.setting.themeMod,
  (mod) => {
    if (!mod) {
      if (isSystemDark) theme.global.name.value = "dark";
      else theme.global.name.value = "light";
    } else if (mod === ThemeMod.dark) theme.global.name.value = "dark";
    else theme.global.name.value = "light";
  },
  { immediate: true },
);

const handleChange = () => {
  const { themeMod } = ds.setting;
  if (!themeMod) ds.setting.themeMod = ThemeMod.dark;
  else if (themeMod === ThemeMod.dark) ds.setting.themeMod = ThemeMod.light;
  else ds.setting.themeMod = ThemeMod.system;
  notificationStore().pushNotification({
    timeout: 3000,
    allowClose: false,
    content: useNuxtApp().$L.theme.switchTo(ds.setting.themeMod),
  });
};

const handleAutoChange = ({ matches }: MediaQueryListEvent) => {
  isSystemDark = matches;
  if (ds.setting.themeMod) return;
  theme.global.name.value = matches ? "dark" : "light";
};
darkThemeMedia.addEventListener("change", handleAutoChange);
onUnmounted(() =>
  darkThemeMedia.removeEventListener("change", handleAutoChange),
);
</script>
