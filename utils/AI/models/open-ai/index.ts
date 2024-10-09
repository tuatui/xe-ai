import type { ChatChunk, ChatService, ChatStream } from "../base";
import { defaultChatSessionConf, Provider } from "../base";

import { icon } from "./icon";

import OpenAI from "openai";
import type { ClientOptions } from "openai";
import type { Stream } from "openai/streaming.mjs";

class OpenAIStream implements ChatStream {
  constructor(
    public steam: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
  ) {}
  stop = () => this.steam.controller.abort();
  [Symbol.asyncIterator] = () => {
    const stream = this.steam;
    return (async function* () {
      for await (const chunk of stream)
        yield { context: chunk.choices[0]?.delta?.content ?? "", chunk };
    })();
  };
}

const toOpenAiMessages = (chats: ChatData[]): OpenAiMessage[] =>
  chats.map((chat) => ({
    content: chat.context,
    role: (ChatRole[chat.from] ?? "system") as keyof typeof ChatRole,
  }));

export type OpenAiMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type GPTModel = OpenAI.Chat.ChatModel | (string & {});

export interface GPTChatChunk extends ChatChunk {
  chunk: OpenAI.Chat.Completions.ChatCompletionChunk;
}

export const GPTChatService: ChatService = {
  info: {
    provider: "Open AI",
    key: Provider.OpenAI,
    icon,
    defaultBaseUrl: "https://api.openai.com/v1/",
  },
  createChatSession: (conf) => {
    const finalConf: Partial<ClientOptions> = {
      // 目前服务端将不会直接保存用户的secret key，并且不代理用户的请求。
      // 因为用户可能不愿意将secret key暴露给服务端。
      // 未来可能会为用户提供代理，但是从浏览器发出请求仍然是保留选项。
      dangerouslyAllowBrowser: true,

      ...defaultChatSessionConf,
      ...conf,
      maxRetries: 1,
    };
    const openAI = new OpenAI(finalConf);

    return {
      async createChat(chats: ChatData[], model: GPTModel) {
        const messages = toOpenAiMessages(chats);
        const stream = await openAI.chat.completions.create({
          model,
          stream: true,
          messages,
        });
        return new OpenAIStream(stream);
      },
      formatMessage: toOpenAiMessages,
      getModelList: async () =>
        (await openAI.models.list()).data.map((each) => ({
          name: each.id,
          owner: each.owned_by,
        })),
    };
  },
};
