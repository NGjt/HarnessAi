import { readFileSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "../..");

const input = readFileSync(0, "utf-8").trim();
if (!input) process.exit(0);

let call;
try {
  call = JSON.parse(input);
} catch {
  process.exit(0);
}

const tool = call.tool || "";
const args = call.input || {};
const filePath = args.file_path || args.path || "";

// 硬拦截：禁止 AI 直接修改 .env 文件
const PROTECTED_FILES = [/(^|\/|\\)\.env$/, /(^|\/|\\)\.env\.local$/];

if (tool === "Write" || tool === "Edit") {
  const fullPath = resolve(projectRoot, filePath || "");
  const isProtected = PROTECTED_FILES.some((p) => p.test(fullPath));

  if (isProtected) {
    const result = {
      block: true,
      reason: `🔒 安全拦截：禁止直接修改 ${filePath}。请手动编辑此文件。`,
    };
    process.stdout.write(JSON.stringify(result));
    process.exit(0);
  }
}

// 若需额外拦截规则，可在此文件添加，或在 settings.json 中配置。
const DANGEROUS_COMMANDS = [
  /rm -rf/,            // 危险删除
  /git push --force/,  // 强制推送
];
if ((tool === "Bash" || tool === "PowerShell") && DANGEROUS_COMMANDS.some(p => p.test(args.command || ""))) {
  process.stdout.write(JSON.stringify({ block: true, reason: "已拦截危险命令" }));
  process.exit(0);
}

process.exit(0);
