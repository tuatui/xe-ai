import { GPTChatService, Provider, type ChatService } from "./models";

export * from "./models";

export const Services: ChatService[] = [];
Services[Provider.OpenAI] = GPTChatService;
