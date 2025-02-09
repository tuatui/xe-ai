export const XeAiMetaEleName = "xe-ai-chat-meta";
export const chatMetaExamplePrompt =
  '```\n你是一个Ai助手。\n你需要按用户的语言回答问题，首次回复需要提炼简短的标题，并在回答最后插入<xe-ai-chat-meta title="[提炼出的标题]"/>\n```';

interface XeAiChatMeta {
  title: string;
}
export const findChatMeta = (content: string): XeAiChatMeta | void => {
  const temp = document.createElement("template");
  temp.innerHTML = content;
  const res = temp.content.querySelector(XeAiMetaEleName);
  if (!res) {
    temp.innerHTML = "";
    return;
  }

  const metaInfo = {
    title: (res as HTMLElement).title,
  };

  temp.innerHTML = "";
  return metaInfo;
};
