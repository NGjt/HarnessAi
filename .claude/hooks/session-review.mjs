import { execSync } from "child_process";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "../..");
const reviewsDir = join(projectRoot, ".claude/reviews");

const run = (cmd) => {
  try {
    return execSync(cmd, { cwd: projectRoot, encoding: "utf-8", timeout: 8000 }).trim();
  } catch {
    return "";
  }
};

// 1. 统计改动
const allChanged = run("git diff --name-only").split("\n").filter(Boolean);
const stagedFiles = run("git diff --cached --name-only").split("\n").filter(Boolean);
allChanged.push(...stagedFiles);

const added = run("git diff --diff-filter=A --name-only").split("\n").filter(Boolean);
const modified = run("git diff --diff-filter=M --name-only").split("\n").filter(Boolean);
const deleted = run("git diff --diff-filter=D --name-only").split("\n").filter(Boolean);

// 2. 敏感文件检查
const sensitivePatterns = [/(^|\/)\.env/, /node_modules/, /\.gitignore$/];
const sensitiveChanges = allChanged.filter((f) =>
  sensitivePatterns.some((p) => p.test(f))
);

// 3. Diff 大小分析（Simplicity First 检查）
const diffStat = run("git diff --stat");
const totalChanges = diffStat ? (diffStat.match(/(\d+) insertions?/)?.[1] || "0") : "0";
const totalDeletions = diffStat ? (diffStat.match(/(\d+) deletions?/)?.[1] || "0") : "0";
const totalLines = parseInt(totalChanges) + parseInt(totalDeletions);
const tooManyFiles = allChanged.length > 10;
const tooManyLines = totalLines > 500;

// 4. 读取 CLAUDE.md 规则
const claudeMdPath = join(projectRoot, "CLAUDE.md");
let hasSurgicalRule = false;
let hasGoalRule = false;
if (existsSync(claudeMdPath)) {
  const rules = readFileSync(claudeMdPath, "utf-8");
  hasSurgicalRule = rules.includes("Surgical Changes");
  hasGoalRule = rules.includes("Goal-Driven");
}

// 5. OpenSpec 验证
const hasOpenSpec = existsSync(join(projectRoot, "openspec"));
const pendingChanges = hasOpenSpec
  ? run("ls openspec/changes/ 2>/dev/null | grep -v archive | grep -v '^\\.'") || ""
  : "";
const openspecValidate = hasOpenSpec ? run("openspec validate 2>&1") : "";
const openspecPassed = openspecValidate && !openspecValidate.includes("error") && !openspecValidate.includes("FAIL");

// 写入报告
mkdirSync(reviewsDir, { recursive: true });

const flags = [];
if (sensitiveChanges.length > 0) flags.push("⚠️ 涉及敏感文件");
if (tooManyFiles) flags.push("⚠️ 改动文件过多（>10 个），是否违反 Simplicity First？");
if (tooManyLines) flags.push("⚠️ 改动行数过多（>500 行），建议分多次提交");
if (pendingChanges) flags.push("ℹ️ 有待归档的 OpenSpec 变更，请运行 openspec archive");
if (openspecValidate && !openspecPassed) flags.push("❌ OpenSpec 验证未通过，请检查规范一致性");
if (openspecPassed) flags.push("✅ OpenSpec 验证通过");

const report = [
  "## Stop Hook 审查报告",
  `时间: ${new Date().toLocaleString("zh-CN")}`,
  "",
  "### 改动统计",
  `文件数: ${allChanged.length}`,
  added.length > 0 ? `新增: ${added.length}` : "",
  modified.length > 0 ? `修改: ${modified.length}` : "",
  deleted.length > 0 ? `删除: ${deleted.length}` : "",
  `总行数: +${totalChanges}/-${totalDeletions}`,
  "",
  "### 规则检查",
  ...(flags.length > 0 ? flags : ["✅ 未发现问题"]),
  "",
  sensitiveChanges.length > 0
    ? `### ⚠️ 敏感文件\n${sensitiveChanges.join("\n")}`
    : "",
  pendingChanges
    ? `### 待归档变更\n${pendingChanges}`
    : "",
  "",
  `CLAUDE.md 规则状态: ${hasSurgicalRule ? "✅ Surgical Changes" : "❌ 缺少 Surgical Changes"}`,
  `${hasGoalRule ? "✅" : "❌"} Goal-Driven Execution`,
  "",
  "---",
  "审查报告已累积至 .claude/reviews/，SessionStart 将自动加载最近几次记录。",
].filter(Boolean).join("\n");

const dateStr = new Date().toISOString().slice(0, 10).replace(/:/g, "-");
writeFileSync(join(reviewsDir, `${dateStr}.md`), report, "utf-8");
