<div align="center">

# Harness Starter

A ready-to-use Claude Code Harness Engineering template  
Works with both new and existing projects

<p>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
  <img src="https://img.shields.io/badge/Claude_Code-2.1%2B-blue" alt="Claude Code 2.1+">
</p>

</div>

---

## Design

Every new project requires repeating the same rules to the AI: tech stack, test commands, files to avoid.

Harness Starter automates this through three layers. Install once, use across all projects.

---

## Three Layers

| Layer | Hook | Purpose |
|-------|------|---------|
| Safety | PreToolUse | Prevents AI from modifying `.env` and other sensitive files |
| Awareness | SessionStart | Injects current git status automatically on each session |
| Review | Stop | Audits changes after the conversation ends |

---

## Usage

### AI Setup (Recommended)

Copy the template into your project, then run this in Claude Code:

```
initialize Harness
```

The AI will detect your project's state:

- **New project**: Prompts for tech stack, fills CLAUDE.md, installs dependencies
- **Existing project**: Reads `package.json` / `pyproject.toml` / `go.mod`, infers settings, doesn't touch existing config

The full initialization flow is defined in `.claude/skills/harness-init/SKILL.md`.

### Manual Setup

```bash
# Copy template files
cp -r .claude/  /path/to/your-project/.claude/
cp    CLAUDE.md /path/to/your-project/CLAUDE.md
cp    .lsp.json /path/to/your-project/.lsp.json

# Install language server (pick one)
npm install -g typescript-language-server   # TypeScript
pip install pyright                         # Python
go install golang.org/x/tools/gopls@latest  # Go
```

### Verification

```bash
node scripts/check.mjs
```

---

## Project Structure

```
your-project/
├── CLAUDE.md                   AI behavior rules
├── .lsp.json                   LSP configuration
├── scripts/
│   └── check.mjs               Health check
│
├── .claude/
│   ├── settings.json           Hook registration
│   ├── skills/
│   │   └── harness-init/
│   │       └── SKILL.md        AI setup workflow
│   └── hooks/
│       ├── pre-tool-check.mjs  .env file protection
│       ├── session-context.mjs Git status injection
│       └── session-review.mjs  Change review report
```

---

## Customization

### Language Support

`.lsp.json` defaults to TypeScript. For other languages:

```json
// Python
{ "python": { "command": "pyright-langserver", "args": ["--stdio"], "extensionToLanguage": { ".py": "python" } } }

// Go
{ "go": { "command": "gopls", "args": [], "extensionToLanguage": { ".go": "go" } } }
```

---

## Extensions

The following features are disabled by default. Enable them as needed.

### Enhanced Safety

`pre-tool-check.mjs` contains additional safety rules (commented out). Uncomment to enable:
- Block `rm -rf` dangerous operations
- Block `git push --force`
- Block `git reset --hard`

### Quality Evaluation (Eval)

Connect Stop Hook review results to automated evaluation to track AI output quality:
- Add correctness scores to review reports
- Track defect rate per change
- Set a quality baseline and alert when it drops

### Multi-Agent Teams

Split complex tasks across multiple agents for parallel work:
- Explore multiple approaches simultaneously and compare results
- Separate frontend/backend/testing into parallel streams
- Isolate long-running tasks from the main conversation

---

## Migration

```bash
cp -r .claude/ CLAUDE.md .lsp.json /path/to/new-project/
```

Edit the first three lines of CLAUDE.md, reinstall the language server, and you're ready to go.

---

<div align="center">

[中文版](README.md) · MIT License

</div>
