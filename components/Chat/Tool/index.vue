<template>
  <div class="relative">
    <pre v-if="showType === state.noWrap">{{ ctx }}</pre>
    <pre class="ws-pre-wrap" v-else-if="showType === state.wrap">{{ ctx }}</pre>
    <div class="py7 px4" v-else>{{ chat.context }}</div>
    <div class="absolute right-0 top-0">
      <button
        class="p2 text-medium-emphasis"
        @click="showType = (showType + 1) % 3"
      >
        <div
          class="i-mdi-wrap-disabled w5 h5"
          :title="$L.chat.noWrap"
          v-if="showType === state.noWrap"
        ></div>
        <div
          class="i-mdi-wrap w5 h5"
          :title="$L.chat.wrap"
          v-else-if="showType === state.wrap"
        ></div>
        <div class="i-mdi-raw w5 h5" :title="$L.chat.raw" v-else></div>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
const { chat } = defineProps<{ chat: ChatData }>();
enum state {
  noWrap,
  wrap,
  raw,
}
const showType = ref<state>(state.noWrap);
const ctx = computed(() => {
  try {
    return JSON.stringify(JSON.parse(chat.context), null, "\t");
  } catch (error) {
    return chat.context;
  }
});
</script>
