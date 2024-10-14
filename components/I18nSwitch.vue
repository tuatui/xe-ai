<template>
  <VMenu>
    <template v-slot:activator="{ props }">
      <XCommonBtn
        icon
        v-bind="props"
        variant="text"
        tooltip-location="top"
        :use-tooltip="$t('common.language')"
        use-icon="i-mdi-translate"
      />
    </template>
    <VList nav width="150">
      <VListItem
        density="compact"
        v-for="(item, i) in locales"
        :variant="locale === item.code ? `tonal` : undefined"
        :key="i"
        :title="item.name"
        @click="setLocale(item.code)"
      >
      </VListItem>
    </VList>
  </VMenu>
</template>
<script setup lang="ts">
const { setLocale, locales, locale, localeProperties } = useI18n();
useHead({
  htmlAttrs: {
    lang: () => localeProperties.value?.language,
    dir: () => localeProperties.value?.dir ?? "ltr",
  },
});
</script>
