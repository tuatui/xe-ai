<template>
  <div>
    <h6>
      JavaScript
      <div class="float-right" v-if="timeout !== undefined">
        代码执行时间限制: {{ timeout }} 秒
      </div>
    </h6>
    <div ref="code"></div>
  </div>
</template>
<script setup lang="ts">
import type { ToolCallCompProps } from "~/utils";

const { toolCall } = defineProps<ToolCallCompProps>();
const matchCode = /"code".*?"(.*?)((?<!\\)"|$)/;
const code = ref<HTMLDivElement>();
const timeout = ref<number>();
const tasks = new CyclicTasks(async () => {
  let codeStr;
  try {
    const res = JSON.parse(toolCall.arg);
    codeStr = res.code;
    timeout.value = res.timeout;
  } catch (error) {
    try {
      const codeJson = matchCode.exec(toolCall.arg)?.at(1) ?? "";
      const escapeChar =
        codeJson.endsWith("\\") && !codeJson.endsWith("\\\\") ? "\\" : "";
      codeStr = JSON.parse(`{"a": "${codeJson}${escapeChar}"}`).a;
    } catch (error) {
      console.warn(error);
      return;
    }
  }
  const codeHtml = await htmlRender(`\`\`\`javascript\n${codeStr}\n\`\`\``);
  if (code.value) code.value.innerHTML = codeHtml;
});
watch(() => toolCall, tasks.exec, { immediate: true, deep: true });
</script>
