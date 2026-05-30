import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const checks = [];

// 1. CLAUDE.md
const claudeOk = existsSync(join(projectRoot, "CLAUDE.md"));
checks.push({ name: "CLAUDE.md", ok: claudeOk, hint: claudeOk ? "" : "缺少 CLAUDE.md" });

// 2. .claude 目录
const claudeDirOk = existsSync(join(projectRoot, ".claude"));
checks.push({ name: ".claude/ 目录", ok: claudeDirOk, hint: claudeDirOk ? "" : "缺少 .claude/ 目录" });

// 3. settings.json
const settingsOk = existsSync(join(projectRoot, ".claude/settings.json"));
checks.push({ name: "settings.json", ok: settingsOk, hint: settingsOk ? "" : "缺少 settings.json，Hook 无法注册" });

// 4. Hooks
const hooks = ["pre-tool-check.mjs", "session-context.mjs", "session-review.mjs"];
for (const h of hooks) {
  const ok = existsSync(join(projectRoot, ".claude/hooks", h));
  checks.push({ name: `hooks/${h}`, ok, hint: ok ? "" : `${h} 缺失` });
}

// 5. LSP 配置
const lspOk = existsSync(join(projectRoot, ".lsp.json"));
checks.push({ name: ".lsp.json", ok: lspOk, hint: lspOk ? "" : "缺少 .lsp.json" });

// 6. typescript-language-server
try {
  execSync("typescript-language-server --version", { stdio: "pipe", timeout: 3000 });
  checks.push({ name: "typescript-language-server", ok: true, hint: "" });
} catch {
  checks.push({ name: "typescript-language-server", ok: false, hint: "未安装，执行 npm install -g typescript-language-server" });
}

// 7. OpenSpec
try {
  execSync("openspec --version", { stdio: "pipe", timeout: 3000 });
  checks.push({ name: "OpenSpec CLI", ok: true, hint: "" });
} catch {
  checks.push({ name: "OpenSpec CLI", ok: false, hint: "未安装，执行 npm install -g @fission-ai/openspec" });
}

// 8. harness-init Skill
const skillOk = existsSync(join(projectRoot, ".claude/skills/harness-init/SKILL.md"));
checks.push({ name: "harness-init Skill", ok: skillOk, hint: skillOk ? "" : "缺少初始化 Skill，用户无法一键安装" });

// 9. CLAUDE.md 内容完整性
if (claudeOk) {
  const content = readFileSync(join(projectRoot, "CLAUDE.md"), "utf-8");
  const hasTemplatePlaceholder = content.includes("【待填写");
  checks.push({
    name: "CLAUDE.md 已初始化",
    ok: !hasTemplatePlaceholder,
    hint: hasTemplatePlaceholder ? "还有占位符未替换，首次使用请对 AI 说「帮我初始化 Harness」" : "",
  });
}

// 输出
const okCount = checks.filter((c) => c.ok).length;
console.log(`\nHarness 健康检查: ${okCount}/${checks.length} 通过\n`);
for (const c of checks) {
  const icon = c.ok ? "✅" : "❌";
  console.log(`  ${icon} ${c.name}${c.hint ? " — " + c.hint : ""}`);
}
console.log("");
