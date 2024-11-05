<template>
  <VMenu>
    <template v-slot:activator="{ props }">
      <XCommonBtn
        icon
        v-bind="props"
        variant="text"
        tooltip-location="top"
        :use-tooltip="$L.common.language"
        use-icon="i-mdi-translate"
      />
    </template>
    <VList nav width="150">
      <VListItem
        density="compact"
        v-for="(item, i) in locales"
        :variant="$i18n.locale.value.code === item.code ? `tonal` : undefined"
        :key="i"
        :title="item.name"
        @click="$i18n.setLang(item.code)"
      >
      </VListItem>
    </VList>
  </VMenu>
</template>
<script setup lang="ts">
import { locales, VLangs } from "~/lang/core/conf";
const locale = useNuxtApp().$i18n.locale;
const vLocal = useLocale();
vLocal.messages.value = VLangs;

watch(locale, () => (vLocal.current.value = locale.value.code), {
  immediate: true,
});
</script>
