import type { I18nLang } from "./helper";

export default {
  common: {
    chat: "聊天",
    setting: "设置",
    module: "模型",
    name: "名字",
    edit: "编辑",
    cancel: "取消",
    submit: "提交",
    allModules: "所有模型",
    update: "更新",
    delete: "删除",
    create: "创建",
  },
  chat: {
    new: "新聊天",
    untitled: "无标题",
    send: "发送",
    inputTips: "在这里输入你的问题",
  },
  setting: {
    defaultModule: "默认模型",
    setDefault: "设为默认",
    addModel: "新增模型",
    editModule: {
      press: "按下",
      enter: "回车",
      toAdd: "创建一个新的",
      noData: "没有数据，尝试获取一下或者手动创建",
      fetch: "获取模型",
    },
  },
  module: {
    config: "配置模型",
    secretKey: "密钥",
  },
} /* satisfies I18nLang */ as I18nLang;
