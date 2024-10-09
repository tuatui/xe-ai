import { GPTChatService } from "./open-ai";

export const services: ChatService[] = [];

services[GPTChatService.info.key] = GPTChatService;
