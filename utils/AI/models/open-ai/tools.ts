import type OpenAI from "openai";
import { randomDataId } from "~/utils/dragAndDrop";
import { jsIcon } from "./icon";
import type { ChatCompletionTool } from "openai/resources/index.mjs";
const name = "JavaScript";
const JsTools: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name,
    description:
      "使用JS进行数学计算和调用公开的Web API。可以访问隔离的DOM、BOM等API，无法访问indexDB。",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: `要执行的JavaScript 代码，在最后调用\`sendResult2Chat\`以返回代码结果（类似promise的resolve）,或者调用\`sendError2Chat\`返回Error，同时代码会立刻退出。
          \`sendResult2Chat\`的参数可以为是任何类型，但是必须可以被\`structuredClone\`函数拷贝。
          例如如果包含回调函数则会报错。如果传入被Proxy代理的对象也会报错，此时建议调用前使用\`JSON.parse(JSON.stringify())\`先处理一遍。
          \`sendError2Chat\`的参数只能是一个Error的实例。
          注意：必须在代码结束时调用sendResult2Chat或sendError2Chat，否则代码不会结束并且会导致超时错误。console.log目前无法用于输出。
            `,
        },
      },
      required: ["code"],
      additionalProperties: false,
    },
  },
};

const jsRun = (code: string) =>
  new Promise<ToolCallReturn>((resolve) => {
    const id = randomDataId();

    const template = `
    <html><head><meta charset="UTF-8"></head><body>
    <script>
    window.__send_msg = (data = {}) => parent.postMessage(
      {...data, id: "${id}"}, "${location.origin}"
    );
    window.sendResult2Chat = (res) => __send_msg({code: 0, res});
    window.sendError2Chat = (err) => __send_msg({code: 1, err});
    </script>
    <script>
    try {
      ${code}
    } catch (err) {
      try {
        __send_msg({ code: 1, err });
      } catch (_) {
        const errorCP = new Error(err.message);
        errorCP.name = err.name;
        __send_msg({ code: 1, err: errorCP});
      }
    }
    </script></body></html>`;

    const htmlFile = new Blob([template], { type: "text/html" });
    const src = URL.createObjectURL(htmlFile);
    const iframe = document.createElement("iframe");
    iframe.hidden = true;
    iframe.src = src;
    // make vue-tsc happy
    // iframe.sandbox = "allow-scripts";
    // error TS2540: Cannot assign to 'sandbox' because it is a read-only property.
    iframe.setAttribute("sandbox", "allow-scripts");

    let isDone = false;
    // 在这里判断超时
    const callback = (ev: MessageEvent) => {
      if (isDone) return;
      const data: ToolCallReturn = ev.data;
      if (data.id !== id) return;
      resolve(data);
      final();
      isDone = true;
    };
    const timeout = setTimeout(() => {
      if (isDone) return;
      const err = new Error("timeout");
      err.name = "Code error";
      resolve({ code: ToolCallResStatus.error, id, err });
      final();
      isDone = true;
    }, 30000);
    const final = () => {
      globalThis.removeEventListener("message", callback, false);
      document.body.removeChild(iframe);
      clearTimeout(timeout);
    };
    globalThis.addEventListener("message", callback, false);
    document.body.appendChild(iframe);
  });
export const tools: (ChatTool & { tool: ChatCompletionTool })[] = [
  {
    exec: async (toolCall) => {
      const arg = JSON.parse(toolCall.arg);
      if (!arg.code)
        return {
          code: ToolCallResStatus.error,
          id: toolCall.id,
          err: new Error(
            "Missing property `code` from arg. \n Maybe is AI make a mistake?",
          ),
        };

      return await jsRun(arg.code);
    },
    tool: JsTools,
    defaultEnable: true,
    icon: jsIcon,
    name,
    i18nKey: "oai-javascript-tool",
  },
];
