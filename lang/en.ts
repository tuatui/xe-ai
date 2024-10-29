import type { BaseLang } from "./primary";
export default {
  common: {
    chat: "Chat",
    setting: "Setting",
    module: "Module",
    model: "Model",
    name: "Name",
    edit: "Edit",
    cancel: "Cancel",
    submit: "Submit",
    allModules: "All Modules",
    allModels: "All Models",
    update: "Update",
    delete: "Delete",
    create: "Create",
    moreOptions: "More Options",
    close: "Close",
    language: "Language",
    notEnoughSpace: "Not Enough Space",
    password: "Password",
    account: "Account",
    login: "Login",
    logout: "Logout",
    repeatPwd: "Repeat Password",
    back: "Back",
    register: "Register",
    low: "Low",
    middle: "Middle",
    hight: "High",
    strength: "Strength",
    revocation: "Revocation",
    notSelected: "Not Selected",
    save: "Save",
    layouts: "Layouts",
    use: "Use",
    copy: "Copy",
    options: "Options",
    lineBreak: "Line break",
    about: "About",
    input: "Input",
  },
  action: {
    deleteSome: (item) => `Deleted "${item}"`,
    ask: (name) => `Ask ${name || "AI"}`,
  },
  aria: {
    sideNav: "Side Navigation",
    chatHistory: "Chat History",
  },
  chat: {
    collapse: "Collapse Input",
    setting: "Chat Settings",
    stop: "Stop Chat",
    splitRight: "Split Chat Right",
    splitDown: "Split Chat Down",
    download: "Download Chat",
    new: "New Chat",
    untitled: "Untitled",
    send: "Send",
    inputTips: "Type your question here",
    scrollToBottom: "Scroll to Bottom",
    memo: "Conversation memory",
    prompt: "Prompt",
  },
  setting: {
    apiUrl: "Provider URL",
    noBotTitle: "No Models Yet",
    botShowArea: "Models will appear here once added",
    switchTheme: "Switch Light/Dark Theme",
    defaultModule: "Default Model",
    setDefault: "Set as Default",
    addModel: "Add New Model",
    editModule: {
      press: "Press",
      enter: "Enter",
      toAdd: "to create a new one",
      noData: "No Data, try fetching or manually creating",
      fetch: "Fetch Model",
      preferredModel: "Preferred Model",
    },
    topic: {
      title: "Topic Settings",
      tip: "Changes here only affect the current topic",
    },
    user: "User",
    layouts: {
      name: "Layout Selection",
      all: "All Layouts",
      new: "New Layout",
      empTitle: "No Layouts",
      dataShowArea: "Will display here after adding a layout",
      setAsDefault: "Set as Default",
      memo: "Remember layout on close",
    },
    shortcut: {
      sendImm: "Did you press Enter to send the conversation immediately?",
      send: "Sending method",
    },
    mdInput: "Enable full MARKDOWN syntax for the content you input",
  },
  model: {
    config: "Configure Model",
    secretKey: "Secret Key",
    provider: "Model Provider",
  },
  tips: {
    newChatLong: "New Chat" /* 只有方块字能长点 */,
    collapseMenu: "Collapse Menu",
    expandMenu: "Expand Menu",
    loginFail: "Login Failed, wrong account or password",
    hidePwd: "Show/Hide Password",
    loginAndSync:
      "After login, your models and keys will sync automatically. Keys are encrypted before upload.",
    regAndSync:
      "After registering, models and keys sync automatically. Keys are encrypted before upload.",
    syncTmpChatLabel: "Sync Temporary Chat",
    syncTmpChat:
      "Current temporary chats won't be uploaded, but stay in your browser. Log out to view.",
    mustExist: "Required",
    nameAlreadyUse: "This name is already in use",
    pwdTooShort: "Password must be at least 6 characters",
    pwdTooLooong: "Password too long",
    pwdIsDiff: "Passwords do not match",
    doubleToRestore: "Double-click to restore",
    copySuccess: "Copied successfully",
    nodata: "No data",
    botsEmp: "No data, please create at least one bot",
    primaryModelEmp: "No data, please add at least one model",
    botModulesEmp: "No data, try fetching a model in the edit model interface",
    addBotAndSelect: "Please add a bot and select a model",
    chooseModel: "Please select a model for the conversation",
    needToAddModel: "You need to add a model to start the conversation",
    pwdOrAddrErr: "Incorrect address or key",
    notMemo: "The model will not remember the previous conversation",
    markdownCode:
      "Once enabled, XML code should be wrapped in code blocks or inline code blocks, e.g., `<script>a = 1</script>`",
  },
  theme: {
    switchTo: (mod) => `Switch to ${["Auto", "Light", "Dark"][mod]} mode`,
  },
} satisfies BaseLang;
