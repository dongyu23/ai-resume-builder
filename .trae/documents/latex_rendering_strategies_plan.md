# LaTeX 简历渲染多重回退策略方案 (Multi-Strategy Compilation Plan)

## Summary (摘要)
当前系统中，LaTeX 编译服务强依赖于本地系统安装的完整 TeXLive 环境（调用 `latexmk` 和 `xelatex`）。在云沙箱或未配置环境的宿主机中，这会导致编译失败且无法轻易通过 `apt-get` 修复。本计划旨在实现一个**多级回退编译策略 (Fallback Compilation Strategy)**，确保在一种编译方式失败时，能自动切换到其他可靠的编译引擎（如按需下载宏包的 Tectonic），从根本上解决渲染失败的问题。

## Current State Analysis (现状分析)
1. **现有实现**：`backend/app/services/compile_runner.py` 直接使用 `asyncio.create_subprocess_exec` 调用 `latexmk -xelatex -shell-escape ...`。
2. **存在的问题**：
   - 当前沙箱环境未预装 `latexmk` 或 `xelatex`。
   - 由于沙箱网络和源的问题，无法通过常规 `apt-get install texlive-full` 安装（且耗时极长）。
   - 一旦 `latexmk` 失败，整个编译流程直接中断，无备用方案。
3. **探索结论**：经过在沙箱内的实际测试，发现 **Tectonic**（一个现代的、独立的、按需下载宏包的 LaTeX 引擎）在当前环境中可以完美运行，且原生支持 `xeCJK`/`ctex` 和 `-Z shell-escape`。

## Proposed Changes (改动方案)

我们将重构 `compile_runner.py`，引入策略模式（Strategy Pattern），按优先级依次尝试不同的编译方法：

### 1. 策略 A: System TeXLive (`latexmk` + `xelatex`)
- **What**: 优先检查系统中是否已存在 `latexmk` 或 `xelatex`。
- **How**: 
  - 使用 `shutil.which('latexmk')` 进行检测。
  - 如果存在，则执行原有的编译命令。
  - 如果失败或不存在，记录日志并进入**策略 B**。

### 2. 策略 B: Tectonic Engine (按需拉取的独立引擎)
- **What**: Tectonic 会在后台自动从云端拉取缺失的 `.sty` 和字体文件，无需预装庞大的 TeXLive。
- **How**:
  - 检测 `backend/bin/tectonic` 二进制文件是否存在。
  - 如果不存在，在 Python 代码中自动执行下载脚本：`curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh` 并将其移动到 `backend/bin/`。
  - 使用命令：`tectonic -Z shell-escape -Z continue-on-errors main.tex` 进行编译。
  - 将 Tectonic 的输出流实时写入 `compile.log`，前端可同步查看。

### 3. 策略 C: Fallback to Simple pdflatex (可选)
- **What**: 针对某些极简模板，如果 `xelatex` 失败，退回到最基础的 `pdflatex`。由于 Tectonic 已经非常强大，此策略主要作为极端情况下的补充。

### 4. 完善日志反馈
- 在 `compile.log` 中明确输出当前正在尝试的编译策略（例如 `> [SYSTEM] Attempting compilation with System TeXLive...` -> `> [SYSTEM] TeXLive failed, falling back to Tectonic Engine...`），让用户在前端界面清晰了解后端的自适应过程。

## Assumptions & Decisions (假设与决策)
- **网络条件**：假设服务器或沙箱具备访问外网（GitHub / drop-sh.fullyjustified.net）的权限，以便下载 Tectonic 和 TeX 宏包（已通过 curl 测试验证）。
- **默认字体**：Tectonic 编译中文时默认使用 TeXLive 自带的 `Fandol` 字体（通过 `ctex` 宏包），这无需依赖操作系统的本地中文字体文件。
- **架构兼容性**：Tectonic 下载脚本会自动识别 Linux x86_64 或 ARM 架构并下载对应二进制，具有很好的跨平台性。

## Verification (验证步骤)
1. **无环境测试**：在没有安装 TeXLive 的沙箱中点击前端“Compile”按钮。
2. **日志验证**：观察终端输出面板，确认日志显示“System TeXLive not found/failed”，然后显示“Downloading Tectonic...”以及“Running Tectonic...”。
3. **产物验证**：确认右侧 PDF 预览区成功加载生成的中文简历，且格式与字体显示正常。
