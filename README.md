<div align="center">

# Harness Starter

一套开箱即用的 Claude Code Harness Engineering 模板  
新项目和已有项目均可使用

<p>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
  <img src="https://img.shields.io/badge/Claude_Code-2.1%2B-blue" alt="Claude Code 2.1+">
</p>

</div>

---

## 设计思路

每次新建项目或打开已有项目时，都需要反复告诉 AI 同样的规则：技术栈是什么、测试怎么跑、哪些文件不能动。

Harness Starter 把这些重复劳动固化为三层自动化机制。装一次，所有项目通用。

---

## 三层体系

| 层级 | Hook | 作用 |
|------|------|------|
| 安全 | PreToolUse | 拦截 AI 对 `.env` 等敏感文件的修改 |
| 感知 | SessionStart | 每次对话自动注入当前 git 状态 |
| 审查 | Stop | 对话结束后检查改动是否符合规则 |

---

## 使用方式

### AI 自动初始化（推荐）

将模板复制到项目目录后，在 Claude Code 中输入：

```
帮我初始化 Harness
```

AI 会自动检测项目情况：

- **新项目**：询问用途和技术栈，补充 CLAUDE.md，安装依赖
- **已有项目**：从 `package.json` / `pyproject.toml` / `go.mod` 推断技术栈，只补充缺失配置，不影响已有内容

完整的初始化流程定义在 `.claude/skills/harness-init/SKILL.md` 中。

### 手动设置

```bash
# 复制模板文件
cp -r .claude/  /path/to/your-project/.claude/
cp    CLAUDE.md /path/to/your-project/CLAUDE.md
cp    .lsp.json /path/to/your-project/.lsp.json

# 安装语言服务（根据项目选择）
npm install -g typescript-language-server   # TypeScript
pip install pyright                         # Python
go install golang.org/x/tools/gopls@latest  # Go
```

### 验证

```bash
node scripts/check.mjs
```

---

## 项目结构

```
your-project/
├── CLAUDE.md                   AI 行为规则
├── .lsp.json                   LSP 配置
├── scripts/
│   └── check.mjs               健康检查
│
├── .claude/
│   ├── settings.json           Hook 注册
│   ├── skills/
│   │   └── harness-init/
│   │       └── SKILL.md        AI 安装向导
│   └── hooks/
│       ├── pre-tool-check.mjs  .env 文件保护
│       ├── session-context.mjs git 状态注入
│       └── session-review.mjs  变更审查报告
```

---

## 自定义

### 语言支持

`.lsp.json` 默认为 TypeScript。其他语言：

```json
// Python
{ "python": { "command": "pyright-langserver", "args": ["--stdio"], "extensionToLanguage": { ".py": "python" } } }

// Go
{ "go": { "command": "gopls", "args": [], "extensionToLanguage": { ".go": "go" } } }
```

---

## 扩展指南

以下功能默认不开启，需要时按需解锁。

### 安全增强

`pre-tool-check.mjs` 中注释了更多拦截规则，取消注释即可启用：
- `rm -rf` 危险操作拦截
- `git push --force` 拦截
- `git reset --hard` 拦截

### 质量评估（Eval）

将 Stop Hook 的审查结果接入自动化评估，跟踪 AI 输出质量趋势：
- 在审查报告中增加正确性评分
- 记录每次改动的缺陷率
- 建立质量基线，低于阈值时告警

### 多 Agent 团队

复杂任务可以拆分为多个 Agent 分工协作。适用场景：
- 同时探索多个方案并对比结果
- 前端/后端/测试分离并行
- 长期运行的任务与主会话隔离

---

## 迁移

```bash
cp -r .claude/ CLAUDE.md .lsp.json /path/to/new-project/
```

修改 CLAUDE.md 前三行，重新安装 language server，即可在新项目中使用。

---

<div align="center">

[English](README.en.md) · MIT License

</div>
