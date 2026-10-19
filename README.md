<div align="center">

# ExpertLens · Archival Expert Intelligence

**专家访谈智能调研工作台**

基于 Gemini 的专家网络调研工具 —— 行业研究、专家画像、
LinkedIn 检索关键词与付费咨询邀约话术，一站式生成

React 18 · Vite 5 · Tailwind CSS 3 · Gemini API

</div>

---

## 项目介绍

ExpertLens 是一款面向商业研究人员（专家网络 / 咨询 / 投研场景）的纯前端智能工作台，采用复古博物志（Cabinet of Curiosities）视觉风格，帮助你在一次研究流程中完成从行业扫描到专家邀约的全部工作。

## 功能特性

- **多项目研究管理** — 每个项目独立保存研究记录、专家库与搜索历史，刷新或重启浏览器不丢失（localStorage 持久化 + Schema 版本迁移）
- **Gemini 智能调研** — 输入研究需求并上传参考文件，自动生成行业概览、关键趋势与匹配专家画像
- **专家画像卡片** — 中英双语行业 / 职能 / 职级 / 地域标签，贴合 LinkedIn 真实职位体系
- **LinkedIn 检索关键词** — 自动生成职位、技能、公司关键词与一键复制的布尔检索式
- **付费咨询邀约话术** — 按【Paid Consultations】标准模板生成中英双语邀请函
- **批量导入专家** — 支持 CSV / XLSX，智能识别表头（模糊匹配 + 编码自动检测 + 多分隔符猜测）
- **跨项目历史联想** — 添加新专家时自动提示与历史专家库的相似性
- **全局错误防护** — ErrorBoundary 错误边界 + 类型安全兜底 + API 自动重试

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | React 18 |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3（复古羊皮纸色盘 + 古典衬线字体） |
| 数据解析 | Papaparse（CSV）+ SheetJS（XLSX） |
| 大模型 | Google Gemini API（结构化 JSON 输出 + 503/429 自动重试） |
| 持久化 | localStorage（项目级隔离） |

## 本地运行

### 环境要求

- Node.js ≥ 18
- 一个 Gemini API Key（[免费获取](https://aistudio.google.com/apikey)）

### 步骤

```bash
# 1. 克隆仓库
git clone https://github.com/<your-username>/ExpertLens.git
cd ExpertLens

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env        # Windows: copy .env.example .env
#    编辑 .env，填入你的 VITE_GEMINI_API_KEY

# 4. 启动开发服务器
npm run dev
```

启动后浏览器自动打开 http://localhost:5173

> Windows 用户也可以直接双击 `一键启动.bat`，首次运行会自动安装依赖并启动。

### 环境变量说明

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `VITE_GEMINI_API_KEY` | 是 | Gemini API 密钥 |
| `VITE_GEMINI_MODEL` | 否 | 模型名称，默认 `gemini-3.6-flash` |

> 注意：Vite 只会注入以 `VITE_` 开头的环境变量；修改 `.env` 后需重启开发服务器才能生效。

## 构建与部署

```bash
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览构建产物
```

### Vercel / Netlify（私有部署）

1. 导入 GitHub 仓库
2. 构建命令：`npm run build`；输出目录：`dist`
3. 在平台的环境变量设置中添加 `VITE_GEMINI_API_KEY`

> 仅适合**自己使用**的私有部署。密钥会编译进前端产物，任何能访问该站点的人都可以从页面源码中提取它，请勿将此类部署公开分享。

### GitHub Pages

需先在 `vite.config.js` 中将 `base` 设置为仓库名：

```js
export default defineConfig({
  base: '/ExpertLens/',
  plugins: [react()],
})
```

## 关于 API Key 的安全性

### 开源共享：安全，无需担心

仓库**不包含任何密钥**：`.env` 已被 `.gitignore` 排除，源码中通过 `import.meta.env.VITE_GEMINI_API_KEY` 读取环境变量。每位使用者克隆后参照 `.env.example` 填入**自己的** Gemini API Key 即可运行——代码共享、密钥各带（BYOK, Bring Your Own Key），这是开源 AI 应用的标准模式。

### 公开部署：需要注意

本项目是纯前端应用，`VITE_` 前缀的环境变量在 `npm run build` 时会被**编译进产物**。因此：

- ❌ **不要**把含自己 Key 的构建版本部署成任何人可访问的公开网站——访问者打开浏览器开发者工具即可提取你的密钥并盗用额度
- ✅ 本地运行、仅自己访问的私有部署——没有问题
- ✅ 想提供公开在线 Demo——建议采用以下任一方案：
  1. **用户自填 Key**：在页面上让用户输入自己的 Key（存于 sessionStorage，不打包进产物）
  2. **后端代理**：增加一层轻量服务端（如 Vercel Functions / Cloudflare Workers）转发 Gemini 请求，Key 保留在服务端，同时可附加限流与用量控制

## 项目结构

```
ExpertLens/
├── index.html                     # 入口 HTML（Google Fonts 引入）
├── package.json
├── vite.config.js
├── tailwind.config.js             # 复古色盘配置
├── postcss.config.js
├── .env.example                   # 环境变量模板
├── 一键启动.bat                    # Windows 一键启动脚本
└── src/
    ├── main.jsx                   # 应用入口（挂载 ErrorBoundary）
    ├── App.jsx                    # 三栏布局：侧栏 / 工作区 / 详情面板
    ├── index.css                  # 复古博物志材质与压印效果
    ├── components/
    │   ├── LeftSidebar.jsx        #   项目管理 + 专家库 CRM
    │   ├── MainWorkspace.jsx      #   研究画布与空状态铜版画时间轴
    │   ├── RightSidebar.jsx       #   详情面板
    │   ├── PersonaCard.jsx        #   专家画像卡片
    │   ├── SearchBar.jsx          #   搜索栏
    │   ├── SimilarExpertAlert.jsx #   跨项目相似专家联想
    │   ├── Decorations.jsx        #   SVG 图标与铜版画装饰
    │   └── ErrorBoundary.jsx      #   全局错误边界（防白屏）
    ├── hooks/
    │   └── useStore.js            # 全局状态 + localStorage 持久化
    ├── services/
    │   └── geminiService.js       # Gemini 调用 / JSON 解析 / 自动重试
    └── config/
        └── gemini.js              # API 配置（读取环境变量）
```
