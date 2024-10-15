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
      <VListItem @click="handleLogout()" v-if="ls.isLogin">
        <template v-slot:prepend>
          <VAvatar icon="i-mdi-logout" />
        </template>
        {{ $t("common.logout") }}
      </VListItem>
      <template v-else>
        <VListItem @click="$router.push('/login')">
          <template v-slot:prepend>
            <VAvatar icon="i-mdi-login" />
          </template>
          {{ $t("common.login") }} </VListItem
        ><VListItem @click="$router.push('/login?reg=1')">
          <template v-slot:prepend>
            <VAvatar icon="i-mdi-register" />
          </template>
          {{ $t("common.register") }}
        </VListItem>
      </template>
    </VList>
  </VMenu>
</template>
<script setup lang="ts">
const ls = loginStore();
const handleLogout = () => (ls.userInfo = undefined);
</script>
