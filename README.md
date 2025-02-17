# Xenon AI

只是想做一个好用的AI聊天界面，面向ChatGPT的API用户。

Aiming to create a user-friendly AI chat interface tailored for ChatGPT API users.

## 特点 Features

- 小，zstd压缩后首屏无缓存仅需300多kb
- 快，打开一个新标签页只需要30ms
- 流畅，充分利用本地缓存，最大可能减少卡顿感
- 安全，不需要上传你的API密钥
- 灵活，可以以静态文件部署，现在就可以在<https://chat.xenoncore.cc/>体验
- 像VScode一样灵活分屏
- 保存你的分屏布局，并随时恢复
- 自适应多语言
- 自适应深色浅色模式
- 支持显示Latex格式的数学公式
- 支持近两百种编程语言的高亮（使用highlight.js）
- 支持一键导出当前聊天为html文件
- 聊天跨窗口通讯
- 在<https://pwa.xenoncore.cc/>试一试Web APP版本

- Lightweight: Initial load is only around 300KB with zstd compression, even without - caching.
- Fast: Opens a new tab in just 30ms.
- Smooth: Fully utilizes local caching to minimize lag.
- Secure: No need to upload your API key.
- Flexible: Deployable as static files; try it now at <https://chat.xenoncore.cc/>.
- Split-screen interface, as flexible as VSCode.
- Save and restore split-screen layouts.
- Adaptive to multiple languages.
- Supports both dark and light themes.
- Latex formula display support.
- Syntax highlighting for nearly 200 programming languages (using highlight.js).
- One-click export of chat history to an HTML file.
- Cross-window communication for chats.
- Try the Web APP version at <https://pwa.xenoncore.cc/>

### Lighthouse

![Lighthouse](https://github.com/user-attachments/assets/d262d2c7-960d-49f3-9508-d8fe79fe88bf)

### 分屏 Split-screen

[](https://github.com/user-attachments/assets/2363c857-c4ff-4665-a4ca-bce77775166a)

### 保存布局 Save layouts

[](https://github.com/user-attachments/assets/e6ecd615-7a33-400c-870a-b49ba4d80683)

### 深色主题 Dark themes

[](https://github.com/user-attachments/assets/77cbf8df-3b03-4003-9e07-8a90a46c591e)

## 开发进度 Development Progress

- [x] 基本框架
- [x] 横竖分屏，大小调整
- [x] 本地聊天保存
- [x] 账号注册和跨端信息共享(需要自行部署)
- [ ] 其他API供应商支持 (如果你的供应商能以openAI格式转发，那可以忽略这条)
- [ ] 图片、文件和实时语言聊天

- [x] Basic framework
- [x] Horizontal and vertical split-screen with resizable panes
- [x] Account registration and cross-device data sync (requires self-deployment)
- [x] User registration and cross-device information sharing
- [ ] Support for other API providers (skip if your provider can forward requests in OpenAI format)
- [ ] Image, file, and live voice chat support

## 安装 Install

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.
Make sure to install the dependencies:

```bash
# node >= 20
# pnpm yarn bun npm 应该都行。
pnpm install
```

## 配置环境 Setup

在项目根目录下创建`.env`文件，你可以在`.env.example`中找到模板
Create a .env file in the project root directory, using .env.example as a template.

## 生成数据库和类型（必须）Generate Database and Types (required)

```bash
pnpm db:generate
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm run dev

```

## Production

Build the application for production:

```bash
pnpm run build
# 以静态文件部署
pnpm run generate

```

Locally preview production build:

```bash
pnpm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## TODO

- add ESLint
- add Gulp
- add unit test
- add e2e test
