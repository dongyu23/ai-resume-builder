# AI 智能简历构建器 (AI Resume Builder)

一款专为软件工程师和产品经理设计的云原生 LaTeX 智能简历编辑器。本项目允许用户使用标准的 LaTeX 语法编写简历，实时预览编译出的 PDF，并能够利用强大的大语言模型 (LLM) 根据目标公司的职位描述 (Job Description, JD) 自动进行简历内容的对齐和深度优化。

## 🌟 核心特性

- **基于浏览器的 LaTeX 沉浸式编辑**: 采用 Monaco Editor 驱动，提供原生的语法高亮、自动补全与极其流畅的代码编写体验。
- **实时云端 PDF 编译**: 后端接入了现代化的 Rust-based TeX 引擎 `Tectonic`。修改代码后毫秒级触发重构，完全无需在本地折腾庞大臃肿的 TeX Live 环境。
- **完美兼容中文字体**: 开箱即用支持 `ctex` 和 `xeCJK`，内部预置了标准的 `Fandol` 字体家族，彻底消灭云端/Linux 环境下臭名昭著的 LaTeX 中英文混排与 `nullfont` (字体丢失) 报错。
- **AI 驱动的 JD 深度优化 (产品经理交互流)**:
  - 填入你心仪的职位描述 (JD)，让 AI (支持 DeepSeek-V3.2、GLM-4 等) 智能分析你的简历与职位的匹配度。
  - 提供左右双栏的可视化 Diff 界面，清楚解释修改动机（如“使用 STAR 法则重写”、“突出量化数据”等）。
  - **无损式更新**: 拒绝简单粗暴的“覆盖”。点击应用后，系统会自动为你当前的目标职位生成一份带有时间戳的专属定制版简历 (例如 `main_tailored_1719xxx.tex`)，完美保留原始底稿。
- **生产级别的容错与超时机制**: 考虑到诸如 DeepSeek 等强大的大模型在处理几千字 LaTeX 代码时可能长达数分钟，系统从前端 Axios 客户端 -> Vite 代理层 -> FastAPI 路由层 -> 后端 OpenAI 客户端，打通并配置了极致的 3 分钟防 504 熔断机制，保障服务高可用。

## 🏗 技术架构

- **前端**: React 18, Vite, TailwindCSS v4, Monaco Editor, Lucide Icons.
- **后端**: FastAPI (Python 3.10+), Uvicorn.
- **LaTeX 引擎**: Tectonic (一款自包含、全自动依赖下载的现代 TeX 引擎).
- **AI 集成**: 采用标准的 OpenAI 接口规范 (Python `openai` 包)，可无缝接入任何兼容该协议的模型供应商（如 Paratera、DeepSeek 官方、智谱 GLM 等）。

## 🚀 快速启动

### 环境要求

- Python 3.10 及以上
- Node.js 18 及以上
- Tectonic (需在全局安装，或将其二进制文件放置于 `/workspace/bin/tectonic`)

### 后端服务启动

1. 进入后端目录:
   ```bash
   cd backend
   ```
2. 安装 Python 依赖:
   ```bash
   pip install -r requirements.txt
   ```
3. 配置大模型 API 环境变量:
   ```bash
   export OPENAI_API_KEY="your-api-key"
   export OPENAI_BASE_URL="https://your-llm-provider.com/v1"
   ```
4. 启动 FastAPI 服务:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### 前端页面启动

1. 进入前端目录:
   ```bash
   cd frontend
   ```
2. 安装 NPM 依赖:
   ```bash
   npm install
   ```
3. 启动 Vite 开发服务器:
   ```bash
   npm run dev
   ```
   启动后，在浏览器访问 `http://localhost:3000` (或控制台提示的 3001 端口) 即可。

## 🧪 端到端 (E2E) 自动化测试

本项目包含了基于 Playwright 的端到端自动化测试脚本，用于真实模拟用户输入 JD、等待 AI 响应、以及无损应用修改的全链路流程。

1. 安装 Playwright 及其依赖:
   ```bash
   pip install playwright requests
   playwright install chromium
   ```
2. 运行测试脚本 (需确保前后端服务已启动):
   ```bash
   python test_jd_optimizer.py
   ```

## 🤝 参与贡献

欢迎提出任何改进建议、提交 Issue 或直接发起 Pull Request 参与共建！

## 📝 开源协议

本项目基于 MIT 协议开源。