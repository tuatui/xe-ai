import { ChatRole, type ChatToolCall } from "~/utils/CRUD";
import type { ChatChunk, ChatService, ChatStream } from "../base";
import { defaultChatSessionConf, Provider, ToolCallResStatus } from "../base";
import { tools } from "./tools";
import { icon } from "./icon";

import type OpenAI from "openai";
import type { ClientOptions } from "openai";

// 兼容DeepSeek的reason格式
interface DsReasonContent {
  reasoning_content?: string;
}

export type OpenAiMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type GPTModel = OpenAI.Chat.ChatModel | (string & {});

export interface GPTChatChunk extends ChatChunk {
  chunk: OpenAI.Chat.Completions.ChatCompletionChunk;
}

let OpenAIClass: typeof OpenAI | undefined = undefined;

export const GPTChatService: ChatService = {
  info: {
    provider: "Open AI",
    key: Provider.OpenAI,
    icon,
    defaultBaseUrl: "https://api.openai.com/v1/",
    sessionParamsDocLink:
      "https://platform.openai.com/docs/api-reference/chat/create",
  },
  tools,
  createChatSession: async (conf) => {
    const finalConf: Partial<ClientOptions> = {
      // 目前服务端将不会直接保存用户的secret key，并且不代理用户的请求。
      // 因为用户可能不愿意将secret key暴露给服务端。
      // 未来可能会为用户提供代理，但是从浏览器发出请求仍然是保留选项。
      dangerouslyAllowBrowser: true,

      ...defaultChatSessionConf,
      ...conf,
      maxRetries: 1,
    };
    if (OpenAIClass === undefined) {
      const { default: d } = await import("openai");
      OpenAIClass = d;
    }
    const openAI = new OpenAIClass(finalConf);

    return {
      createChat(
        chats: ChatData[],
        model: GPTModel,
        opt?: { toolNames?: string[]; exConf?: string },
      ) {
        const messages = toOpenAiMessages(chats);
        const chatTools = opt?.toolNames
          ? opt.toolNames
              .map((toolName) => {
                const res = tools.find((tool) => tool.name === toolName);
                if (!res) console.warn("Missing tool: " + toolName);
                else return res.tool;
              })
              .filter((each) => each !== undefined)
          : undefined;
        const exConfParam = opt?.exConf ? JSON.parse(opt.exConf) : {};
        return new OpenAIStream(
          {
            model,
            stream: true,
            messages,
            tools: chatTools?.length ? chatTools : undefined,
            ...exConfParam,
          },
          openAI,
        );
      },
      formatMessage: toOpenAiMessages,
      getModelList: async () =>
        (await openAI.models.list()).data.map((each) => ({
          name: each.id,
          owner: each.owned_by,
          provider: (each as { provider?: string }).provider,
        })),
    };
  },
};
class OpenAIStream implements ChatStream {
  public completions;
  public stop;
  private opt: OpenAI.RequestOptions;
  constructor(
    public req: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming,
    private cls: OpenAI,
  ) {
    const ac = new AbortController();
    this.stop = () => ac.abort();
    this.opt = { signal: ac.signal };
    this.completions = cls.chat.completions.create(req, this.opt);
  }

  [Symbol.asyncIterator] = () =>
    async function* (this: OpenAIStream) {
      let stream = await this.completions;
      let isFinish = false;
      const out = {
        curr: 0,
        get index(): number {
          return out.curr++;
        },
      };

      while (!isFinish) {
        const toolCallList: ChatToolCall[] = [];
        const currChatMsg: OpenAiMessage = { role: "assistant", content: "" };
        const index = out.index;
        for await (const chunk of stream) {
          const chatChunk: ChatChunk = {
            delta: {
              context: "",
              from: ChatRole.assistant,
              provider: Provider.OpenAI,
            },
            index,
            chunk,
            accumulative: currChatMsg,
          };
          if (chunk.choices.length <= 0) {
            yield chatChunk;
            continue;
          }
          const { delta, finish_reason } = chunk.choices[0];
          chatChunk.finish_reason = finish_reason;
          if (!delta) {
            yield chatChunk;
            continue;
          }
          if (delta.content) {
            chatChunk.delta.context = delta.content;
            currChatMsg.content += delta.content;
          }

          if ((delta as DsReasonContent).reasoning_content) {
            chatChunk.delta.reasoningContent = (
              delta as DsReasonContent
            ).reasoning_content;
          }

          if (Array.isArray(delta.tool_calls)) {
            currChatMsg.tool_calls ??= [];
            chatChunk.delta.toolCalls = delta.tool_calls
              .map(({ index, function: newFunc, id, type }) => {
                const func = toolCallList[index];
                if (!newFunc) return;
                const { arguments: arg = "", name } = newFunc;

                if (!func) {
                  if (!id || !type || !name) return;
                  toolCallList[index] = { id, type, name, arg, index };
                  currChatMsg.tool_calls![index] = {
                    function: { arguments: arg, name },
                    id,
                    type: "function",
                  };
                  return toolCallList[index];
                } else {
                  func.arg = arg;
                  currChatMsg.tool_calls![index].function.arguments += arg;
                  return func;
                }
              })
              .filter((each) => each !== undefined);
          }

          yield chatChunk;
        }

        if (!currChatMsg.tool_calls || currChatMsg.tool_calls.length === 0)
          isFinish = true;
        else {
          this.req.messages.push(currChatMsg);
          for (const [index, toolReturn] of (
            await Promise.all(
              currChatMsg.tool_calls.map(
                (
                  { function: { name: c_name, arguments: arg }, id, type },
                  index,
                ): Promise<ToolCallReturn> => {
                  const tool = tools.find(({ name }) => name === c_name);
                  if (tool)
                    return tool.exec({ id, arg, name: c_name, type, index });

                  return Promise.resolve({
                    code: ToolCallResStatus.error,
                    err: new Error(`Tool:${c_name} is not exist. Skipping...`),
                    id,
                  });
                },
              ),
            )
          ).entries()) {
            const toolCallId = toolCallList[index].id;
            const toolCallChunk: ChatChunk = {
              delta: {
                context: "",
                from: ChatRole.tool,
                provider: Provider.OpenAI,
                toolCallId,
              },
              index: out.index,
            };
            if (toolReturn.code === ToolCallResStatus.success)
              toolCallChunk.delta.context = JSON.stringify(toolReturn.res);
            else toolCallChunk.delta.context = errorFormatter(toolReturn.err);
            this.req.messages.push({
              role: "tool",
              content: toolCallChunk.delta.context,
              tool_call_id: toolCallId,
            });
            yield toolCallChunk;
          }
          stream = await this.cls.chat.completions.create(this.req, this.opt);
        }
      }
    }.call(this);
}

const toOpenAiMessages = (chats: ChatData[]): OpenAiMessage[] =>
  chats.map((chat): OpenAiMessage => {
    const role = ChatRole[chat.from] as keyof typeof ChatRole;
    if (role === "tool") {
      return {
        content: chat.context,
        role: "tool",
        tool_call_id: chat.toolCallId ?? chat.id.toString(),
      };
    } else if (role === "function") {
      // 已经被OpenAI SDK标记为弃用
      return {
        content: chat.context,
        role: "function",
        name: "123",
      };
    } else if (role === "assistant") {
      return {
        role,
        content: chat.context,
        tool_calls: chat.toolCalls?.map(({ arg, id, name }) => ({
          function: { arguments: arg, name },
          id,
          type: "function", // 目前只有"function"
        })),
      };
    }
    return {
      content: chat.context,
      role,
    };
  });

const errorFormatter = (err: Error) =>
  err.stack ?? `${err.name}: ${err.message}`;
