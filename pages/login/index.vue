<template>
  <div class="w-full h-full flex bg-#f0f4f9 relative">
    <div class="w-full max-w-[450px] ma">
      <VScrollXReverseTransition hide-on-leave>
        <UserLogin
          v-if="!isRegister"
          @close="dialog = false"
          @change="isRegister = !isRegister"
          @success="handleLoginSuccess"
        />
        <UserRegister
          v-else
          @close="dialog = false"
          @change="isRegister = !isRegister"
          @success="handleLoginSuccess"
        />
      </VScrollXReverseTransition>
    </div>
  </div>
</template>
<script setup lang="ts">
const dialog = ref(false);
const isRegister = ref(false);
const handleLoginSuccess = (syncAll: boolean) => {
  const userInfo = loginStore().userInfo;
  if (!userInfo) return;
  useRouter().push("/");
  useBots().diffServerAndLocalBot(userInfo.derivedPassword);
  if (!syncAll) return;
  setTimeout(() => topicStore().syncTopic(), 1000);
};
</script>
