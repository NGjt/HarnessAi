# 项目概要

> TODO: 首次使用请运行 `harness-init` Skill 完成初始化

用途：【待填写：项目用途】
技术栈：【待填写：例如 Next.js 15 + tRPC + PostgreSQL】
跑测试：【待填写：例如 pnpm test】

# 行为准则（Karpathy 原则）

## Think Before Coding
- 假设必须说清楚，不确定就问
- 有多个方案时列出，不要默默选一个
- 有更简单的方法就说出来

## Simplicity First
- 不多写一行没被要求的代码
- 不加不需要的抽象、配置、灵活性
- 如果写了 200 行但能缩成 50 行，重写

## Surgical Changes
- 只动必须动的代码，不顺手"改善"无关代码
- 不重构没坏的东西
- 每行改动的代码都应能追溯到用户请求

## Goal-Driven Execution
- 每个任务转成可验证的目标
- 多步骤任务先列计划再动手

# 全局约定

- **规则放 CLAUDE.md，工作流放 Skills**
- 讨论阶段不要擅自改代码，等确认后再动手
- 涉及文件操作先问用户意图

# 自动审查闭环

- SessionStart 自动注入 git 状态
- PreToolUse 自动拦截危险操作
- Stop 自动审查 diff，检查是否符合规则
- 上次审查结果会在下次启动时自动加载
