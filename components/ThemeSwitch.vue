<template>
  <XCommonBtn
    variant="text"
    icon
    @click="theme.global.name.value = isDarkTheme ? 'light' : 'dark'"
    :use-tooltip="$t('setting.switchTheme')"
    use-icon="i-mdi-theme-light-dark"
  />
</template>
<script setup lang="ts">
const theme = useTheme();

const isDarkTheme = computed(() => theme.global.current.value.dark);
</script>
