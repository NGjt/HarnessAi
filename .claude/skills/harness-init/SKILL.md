---
name: harness-init
description: Initialize this project with the Harness Engineering starter template. Detects project language, installs dependencies, and updates CLAUDE.md placeholders. Use when the user wants to set up or reset the Harness configuration.
---

# Harness Init

适用三种场景：
- **GitHub 安装**：用户说"帮我用 Harness Starter 初始化"——还没有模板文件
- **新项目**：模板刚复制过来，CLAUDE.md 含占位符
- **已有项目**：项目已经开发到一半，想加入 Harness

## Step 0：检查模板文件是否存在

检查项目根目录下是否有 `.claude/hooks/` 和 `CLAUDE.md`。

### 如果不存在（GitHub 安装场景）

用户直接让 AI 安装 Harness Starter，还没有模板文件。需要：

1. 从 `package.json` 的 `repository` 字段获取仓库地址，克隆到临时目录：
   ```
   git clone https://github.com/<package.json repository>.git /tmp/harness-starter
   ```
2. 复制核心文件到项目：
   ```
   cp -r /tmp/harness-starter/.claude/  .claude/
   cp    /tmp/harness-starter/CLAUDE.md ./
   cp    /tmp/harness-starter/.lsp.json ./
   cp    /tmp/harness-starter/.gitignore ./.gitignore 2>/dev/null || true
   cp -r /tmp/harness-starter/scripts/  ./scripts/ 2>/dev/null || true
   mkdir -p .github/workflows 2>/dev/null
   cp -r /tmp/harness-starter/.github/ ./.github/ 2>/dev/null || true
   ```
3. 清理临时目录
4. 继续执行 Step 1

### 如果已存在

跳过 Step 0，直接执行 Step 1。

## Step 1: 检测项目信息

优先从已有文件自动推断，推断不到再问用户：

检查以下文件，提取项目信息：
- `package.json` → 项目名、技术栈（React/Vue/Next 等）、测试框架（jest/vitest 等）
- `pyproject.toml` → 项目名、Python 依赖
- `go.mod` → 模块名、Go 版本
- `Cargo.toml` → 项目名、Rust 依赖
- `composer.json` → PHP 项目
- `Gemfile` → Ruby 项目
- `CMakeLists.txt` → C/C++ 项目

对于多语言项目，选择主要技术栈填写。

## Step 2: 填写 CLAUDE.md

### 如果是新项目（含占位符）

用 Step 1 检测到的信息替换 CLAUDE.md 中的 `【待填写】` 占位符。
如果无法自动推断，询问用户：
- 用途：这个项目是做什么的？
- 技术栈：用什么语言/框架？
- 跑测试：用什么命令？

### 如果是已有项目（不含占位符）

检查 CLAUDE.md 是否已包含以下核心章节：
- Karpathy 原则（Think Before Coding / 消除信息差 / 讨论与执行分离 / Simplicity First / Surgical Changes / Goal-Driven Execution）
- 全局约定
- 自动审查闭环

如果缺失，补充进去。已有的内容不要覆盖。

## Step 3: 检查 Hook 文件

检查 `.claude/hooks/` 下四个文件是否存在：
- `pre-tool-check.mjs` — 防止 AI 修改 .env
- `session-context.mjs` — 自动注入 git 状态
- `session-review.mjs` — 对话结束生成审查报告
- `post-tool-check.mjs` — 自动格式化（可选，L3 升级）

缺失则从模板复制。已有则跳过，不要覆盖。

检查 `.claude/settings.json` 中是否注册了三个核心 Hook。
缺失则补充，已有的其他配置不要删除。

询问用户是否需要启用 PostToolUse Hook（自动格式化）。
如果用户确认：在 settings.json 中取消 PostToolUse 相关行的注释。

## Step 4: 检查并安装 LSP

检查 `typescript-language-server` 是否可用。
如果不可用，根据 Step 1 检测到的语言安装对应的 language server。

如果 `.lsp.json` 里的语言配置和项目不符，根据检测结果修改。

## Step 5: 检查 OpenSpec（可选）

询问用户是否需要规范驱动开发工作流。
如果用户确认：
- 安装 CLI：`npm install -g @fission-ai/openspec`
- 初始化：`openspec init`
- OpenSpec 会在 `.claude/` 下添加 commands 和 skills，不要阻止

## Step 6: 运行健康检查

执行 `node scripts/check.mjs`，向用户展示结果。
如果有失败项，逐一处理。

## Step 7: 完成提示

向用户说明当前 Harness 状态：
- 已启用的安全机制（三层 Hook）
- 已安装的依赖（LSP / OpenSpec / codegraph）
- 还需要用户手动做的事（如果有）
