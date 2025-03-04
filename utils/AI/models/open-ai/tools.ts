import type OpenAI from "openai";
import { randomDataId } from "~/utils/dragAndDrop";
import { jsIcon } from "./icon";
import type { ChatCompletionTool } from "openai/resources/index.mjs";
import { ChatToolOpenAIJavaScript } from "#components";

const name = "JavaScript";
const JsTools: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name,
    description:
      "使用原生JS获取时间、数学计算和调用公开的Web API。可以访问隔离的DOM、BOM等API，无法访问indexDB。",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: `要执行的JavaScript 代码。
\`sendResult2Chat\`是本工具的全局特殊函数，在最后调用\`sendResult2Chat\`以返回代码结果（类似promise的resolve）,
或者调用\`sendError2Chat\`返回Error，同时代码会立刻退出。
\`sendResult2Chat\`的参数可以为是任何类型，但是必须可以被\`structuredClone\`函数拷贝。
例如如果包含回调函数则会报错。如果传入被Proxy代理的对象也会报错，此时建议调用前使用\`JSON.parse(JSON.stringify())\`先处理一遍。
\`sendError2Chat\`的参数只能是一个Error的实例。
注意：必须在代码结束时调用sendResult2Chat或sendError2Chat（即使参数为空），否则代码不会结束并且会导致超时错误，如果还是没有，则js代码会以表达式的形式执行。
AI助手无法获得console.log warn和 error的输出，而用户只有打开控制台才能看到。
代码运行在用户浏览器而并非node.js。`,
        },
        timeout: {
          type: "number",
          description: `代码的超时时间（秒），同步任务推荐为5秒，异步任务推荐为10秒。如果调用需要长时间才能返回的WebAPI（如AI），请设为30秒。默认：5，最大：无限制，但是可能被用户切断。`,
        },
      },
      required: ["code"],
      additionalProperties: false,
    },
  },
};
const permissionAllow = `accelerometer;attribution-reporting;autoplay;bluetooth;browsing-topics;compute-pressure;display-capture;encrypted-media;gamepad;geolocation;gyroscope;hid;identity-credentials-get;idle-detection;magnetometer;midi;otp-credentials;screen-wake-lock;serial;usb;web-share;window-management;xr-spatial-tracking`;
const jsRun = ({ code, timeout }: { code: string; timeout?: number }) =>
  new Promise<ToolCallReturn>((resolve) => {
    const id = randomDataId();

    // 有些小模型确实会忘记使用`sendResult2Chat`，尽力执行代码。
    if (!code.includes("sendResult2Chat"))
      code = `
    (async () => {
    try {
      const res = await ${code};
      sendResult2Chat(res);
    } catch (error) {
      sendError2Chat(error)
    }
    })();`;

    const template = `
    <html><head><meta charset="UTF-8"></head><body>
    <script>
    window.__send_msg = (data = {}) => parent.postMessage(
      {...data, id: "${id}"}, "${location.origin}"
    );
    window.sendResult2Chat = (res) => __send_msg({code: 0, res});
    window.sendError2Chat = (err) => __send_msg({code: 1, err});
    window.addEventListener("error", (ev) => {
      __send_msg({ code: 1, err: ev.error});
    });
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

    const iframe = document.createElement("iframe");
    iframe.hidden = true;
    iframe.srcdoc = template;

    if (!defaultSettingSync().setting.allowUnsafeJsExecution) {
      iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-downloads allow-modals",
      );
      iframe.setAttribute("allow", permissionAllow);
    }

    let isDone = false;
    const callback = (ev: MessageEvent) => {
      if (isDone) return;
      const data: ToolCallReturn = ev.data;
      if (data.id !== id) return;
      resolve(data);
      final();
      isDone = true;
    };
    const timeLimit = setTimeout(
      () => {
        if (isDone) return;
        const err = new Error("timeout");
        err.name = "Code error";
        resolve({ code: ToolCallResStatus.error, id, err });
        final();
        isDone = true;
      },
      (timeout ?? 5) * 1000,
    );
    const final = () => {
      globalThis.removeEventListener("message", callback, false);
      document.body.removeChild(iframe);
      clearTimeout(timeLimit);
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

      return await jsRun(arg);
    },
    component: ChatToolOpenAIJavaScript,
    tool: JsTools,
    icon: jsIcon,
    name,
    i18nKey: "oai-javascript-tool",
  },
];
