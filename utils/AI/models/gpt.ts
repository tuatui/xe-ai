import OpenAI from "openai";
import type { ChatChunk, ChatService } from "./base";
import { defaultChatSessionConf } from "./base";

export type OpenAiMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type GPTModel = OpenAI.Chat.ChatModel | (string & {});

export interface GPTChatChunk extends ChatChunk {
  chunk: OpenAI.Chat.Completions.ChatCompletionChunk;
}
const toOpenAiMessages = (chats: ChatData[]): OpenAiMessage[] =>
  chats.map((chat) => ({
    content: chat.context,
    role: (ChatRole[chat.from] ?? "system") as keyof typeof ChatRole,
  }));
export const GPTChatService: ChatService = {
  info: { provider: "Open AI" },
  createChatSession: (conf) => {
    Object.assign(conf, defaultChatSessionConf);
    const openAI = new OpenAI({
      baseURL: conf.baseURL,
      apiKey: conf.apiKey,
      timeout: conf.timeout,
      // 目前服务端将不会直接保存用户的secret key，并且不代理用户的请求。
      // 因为用户可能不愿意将secret key暴露给服务端。
      // 未来可能会为用户提供代理，但是从浏览器发出请求仍然是保留选项。
      dangerouslyAllowBrowser: true,
    });
    return {
      async *createChat(
        chats: ChatData[],
        model: GPTModel
      ): AsyncGenerator<GPTChatChunk> {
        const messages = toOpenAiMessages(chats);
        const stream = await openAI.chat.completions.create({
          model,
          stream: true,
          messages,
        });

        for await (const chunk of stream)
          yield { context: chunk.choices[0]?.delta?.content ?? "", chunk };
      },
      formatMessage: toOpenAiMessages,
    };
  },
};
