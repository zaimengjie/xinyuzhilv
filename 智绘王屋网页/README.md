# 智绘王屋 · 网站启动指南

---

## 一、整体架构

```
智绘王屋网页/
│
├── index.html          # 前端页面入口
├── app.js              # 前端交互逻辑（轮播、AI聊天等）
├── styles.css          # 样式表
│
└── server/
    ├── server.js       # Node.js 后端服务（AI聊天接口）
    ├── package.json    # 依赖配置
    ├── .api-key        # DeepSeek API 密钥（需手动创建）
    └── .dashscope-key  # 阿里云百炼 API 密钥（需手动创建）
```

本项目分为**前端**和**后端**两部分：

| 模块 | 说明 | 端口 |
|------|------|------|
| 前端 | 静态页面（HTML/CSS/JS） | 3000 |
| 后端 | AI 对话接口（Node.js + Express） | 3000 |

> 后端 `server.js` 同时托管了前端静态文件，所以只需启动后端，前端会自动加载。

---

## 二、环境准备

### 2.1 安装 Node.js

下载并安装 [Node.js（建议 18+）](https://nodejs.org/zh-cn/download/prebuilt-installer)。

验证安装成功：

```powershell
node -v
npm -v
```

### 2.2 获取 AI 密钥

#### DeepSeek（文本聊天）

1. 访问 [https://platform.deepseek.com](https://platform.deepseek.com) 注册并充值
2. 在「API Keys」页面创建密钥（`sk-` 开头）
3. 创建文件 `server/.api-key`，内容为密钥（一行，不要有多余空格/换行）

#### 阿里云百炼 Qwen-VL（图片识别）

1. 访问 [https://bailian.console.aliyun.com](https://bailian.console.aliyun.com) 注册并充值
2. 在「API Keys」页面创建密钥
3. 创建文件 `server/.dashscope-key`，内容为密钥（一行）

> 密钥文件已加入 `.gitignore`，不会提交到 Git。

---

## 三、启动网站

### 3.1 启动后端服务

```powershell
# 进入项目目录
cd "c:\Users\Administrator\Desktop\智绘王屋网页"

# 进入 server 目录
cd server

# 启动服务
node server.js
```
看到以下输出表示启动成功：
```
╔══════════════════════════════════════════════════╗
║        智绘王屋 AI 服务已启动                      ║
╠══════════════════════════════════════════════════╣
║  前端页面:  http://localhost:3000                ║
║  文本聊天:  POST http://localhost:3000/api/chat   ║
╠══════════════════════════════════════════════════╣
║  DeepSeek 文本密钥:  server/.api-key            ║
║  阿里云百炼识图密钥: server/.dashscope-key       ║
╚══════════════════════════════════════════════════╝
```

### 3.2 访问网站

在浏览器打开：**http://localhost:3000**

---

## 四、启动后端失败常见问题

### 提示：端口 3000 被占用

```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（将 PID 换成查到的数字）
taskkill /PID <PID> /F
```

### 提示：未配置 API Key

```
error: 未配置 API Key
```

- 文本聊天无法使用 → 检查 `server/.api-key` 是否存在、内容是否正确
- 图片识别无法使用 → 检查 `server/.dashscope-key` 是否存在、内容是否正确

### 提示：AI 返回错误

查看终端输出的详细错误信息，常见原因：

- `insufficient balance` → 账户余额不足，需充值
- `rate limit` → 请求过于频繁，稍后再试
- `invalid API key` → 密钥格式错误或已失效

---

## 五、本地开发说明

### 5.1 修改前端

直接编辑 `index.html`、`app.js`、`styles.css`，保存后刷新浏览器即可看到变化（无需重启后端）。

### 5.2 修改后端

编辑 `server/server.js` 后，需重启后端：

1. 在终端按 `Ctrl + C` 停止当前服务
2. 重新运行 `node server.js`

### 5.3 修改 AI 提示词

提示词在 `server/server.js` 顶部：

- `TEXT_SYSTEM_PROMPT` → 文本聊天的系统提示词
- `VISION_SYSTEM_PROMPT` → 图片识别的系统提示词

修改后重启后端生效。

---

## 六、部署上线（可选）

### 方式一：保持 Node.js 后端

将整个项目部署到有 Node.js 环境的主机（如阿里云 ECS、腾讯云、Railway、Render 等），启动命令：

```bash
cd server
node server.js
```

### 方式二：纯静态部署

如果不需要 AI 聊天功能，可以将 `index.html`、`app.js`、`styles.css` 和图片资源部署到任意静态托管服务（如 Vercel、Netlify、阿里云 OSS）。

> 纯静态部署时 AI 聊天功能不可用。

---

## 七、目录结构说明

| 文件/目录 | 说明 |
|-----------|------|
| `index.html` | 网站首页 |
| `app.js` | 前端交互脚本（轮播图、AI聊天、图片预览等） |
| `styles.css` | 全站样式 |
| `server/` | 后端服务目录 |
| `server/server.js` | Express 服务，托管前端 + 提供 AI 接口 |
| `server/node_modules/` | 已安装的 npm 依赖 |

---

## 八、联系方式

如有问题，可通过网站右下角 **AI 智能咨询** 留言，或查看 `server/server.js` 中的错误提示。
