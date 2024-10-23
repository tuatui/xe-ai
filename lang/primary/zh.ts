const lang = {
  common: {
    chat: "聊天",
    setting: "设置",
    module: "模块",
    model: "模型",
    name: "名字",
    edit: "编辑",
    cancel: "取消",
    submit: "提交",
    allModules: "所有模块",
    allModels: "所有模型",
    update: "更新",
    delete: "删除",
    create: "创建",
    moreOptions: "更多选项",
    close: "关闭",
    language: "语言",
    notEnoughSpace: "空间不足",
    password: "密码",
    account: "账号",
    login: "登录",
    logout: "注销",
    repeatPwd: "重复密码",
    back: "返回",
    register: "注册",
    low: "低",
    middle: "中",
    hight: "高",
    strength: "强度",
    revocation: "撤销",
    notSelected: "未选择",
    save: "保存",
    layouts: "布局",
    use: "使用",
  },
  action: {
    deleteSome: (item: string) => `已删除“${item}”`,
  },
  aria: {
    sideNav: "侧边导航栏",
    chatHistory: "聊天历史记录",
  },
  chat: {
    collapse: "折叠输入框",
    setting: "对话设置",
    stop: "停止对话",
    splitRight: "向右拆分聊天框",
    splitDown: "向下拆分聊天框",
    download: "下载当前聊天",
    new: "新聊天",
    untitled: "无标题",
    send: "发送",
    inputTips: "在这里输入你的问题",
    scrollToBottom: "滑至底部",
  },
  setting: {
    apiUrl: "服务提供商地址",
    noBotTitle: "还没有模型",
    botShowArea: "添加模型后，会显示在这里",
    switchTheme: "切换浅色/深色主题",
    defaultModule: "默认模型",
    setDefault: "设为默认",
    addModel: "新增模型",
    editModule: {
      press: "按下",
      enter: "回车",
      toAdd: "创建一个新的",
      noData: "没有数据，尝试获取一下或者手动创建",
      fetch: "获取模型",
      preferredModel: "首选模型",
    },
    topic: {
      title: "话题设置",
      tip: "在这里做出的改动只会影响当前话题",
    },
    layouts: {
      name: "布局选择",
      all: "所有布局",
      new: "新增布局",
      empTitle: "还没有布局",
      dataShowArea: "添加布局后，会显示在这里",
      setAsDefault: "设为默认",
      memo: "记住上次关闭时的布局",
    },
    user: "用户",
  },
  model: {
    config: "配置模型",
    secretKey: "密钥",
    provider: "模型提供商",
  },
  tips: {
    newChatLong: "开始新对话",
    collapseMenu: "收起菜单",
    expandMenu: "展开菜单",
    loginFail: "登陆失败，账号或密码错误",
    hidePwd: "显示/隐藏密码",
    loginAndSync:
      "登录后，会自动同步你的模型和密钥信息。密钥在上传前会被加密。",
    regAndSync: "登录后，会自动同步你的模型和密钥信息。密钥在上传前会被加密。",
    syncTmpChatLabel: "同步当前的临时聊天记录",
    syncTmpChat:
      "当前的临时聊天记录将不会被上传，但仍保存在你的浏览器中。只需注销登录即可查看。",
    mustExist: "必填项",
    nameAlreadyUse: "这个名字已经被使用了",
    pwdTooShort: "密码不应小于六位数",
    pwdTooLooong: "密码过长",
    pwdIsDiff: "前后输入的密码不一致",
  },
};
/* 
  通过 as const 不仅可以收缩类型，还能在代码提示中显示文字信息。
  然而这种方式不利于对其他翻译做类型检查，并且只能显示一种语言。
  是否有办法实现不同语言的开发者能在类型提示中看到自己的语言？
  或许我们可以通过插件和代码生成做到。
  我对目前的情况已经比较满意，我实现了（相对的）类型安全以及较大的性能提升
  或许某一天可以将这个i18n方案抽离成一个库。
*/

export default lang;
