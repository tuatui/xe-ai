<template>
  <VMenu>
    <template v-slot:activator="{ props }">
      <XCommonBtn
        icon
        variant="text"
        v-bind="props"
        tooltip-location="top"
        :use-tooltip="$t('setting.user')"
      >
        <VBadge
          :model-value="ls.isLogin"
          color="success"
          dot
          location="bottom right"
        >
          <VIcon icon="i-mdi-account-circle" />
        </VBadge>
      </XCommonBtn>
    </template>
    <VList nav width="150">
      <VListItem @click="handleLogout()">
        <template v-slot:prepend>
          <VAvatar icon="i-mdi-logout" />
        </template>
        {{ $t("common.logout") }}
      </VListItem>
    </VList>
  </VMenu>
</template>
<script setup lang="ts">
const ls = loginStore();
const handleLogout = () => (ls.userInfo = undefined);
</script>
