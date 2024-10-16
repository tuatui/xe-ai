<template>
  <XCommonBtn
    icon
    variant="text"
    @click.stop="$emit('handleNewChat')"
    use-icon="i-mdi-plus"
    :use-tooltip="$L.chat.new"
  />
  <XCommonBtn
    icon
    variant="text"
    @click.stop="$emit('splitVertHandle')"
    use-icon="i-mdi-view-split-vertical"
    :use-tooltip="$L.chat.splitRight"
  />
  <XCommonBtn
    icon
    variant="text"
    @click.stop="$emit('splitHorizHandle')"
    use-icon="i-mdi-view-split-horizontal"
    :use-tooltip="$L.chat.splitDown"
  />
  <XCommonBtn
    icon
    variant="text"
    @click.stop="$emit('close')"
    use-icon="i-mdi-close"
    :use-tooltip="$L.common.close"
  />
</template>
<script setup lang="ts">
defineEmits<{
  handleNewChat: [];
  splitVertHandle: [];
  splitHorizHandle: [];
  close: [];
}>();
</script>
