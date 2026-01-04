# Introduction to Slash Commands - Examples

This folder contains three simple command examples demonstrating key slash command features.

## Commands Overview

### 1. `command-example.md` - Command Structure

**Purpose:** Shows the high-level structure of how a command works

**What it demonstrates:**
- Commands are markdown files containing prompts
- Clear structure: Context (INPUT) → Process (PROCESS) → Output Format (OUTPUT)
- This structure will be covered in detail in the next video

**Usage:** This is a template/reference, not meant to be invoked directly

---

### 2. `fix-issue.md` - Arguments Example

**Purpose:** Shows how to pass dynamic values to commands using arguments

**What it demonstrates:**
- `$1`, `$2` = positional arguments for specific values
- Arguments make commands reusable with different inputs

**Two ways to use arguments:**
- `$1`, `$2`, `$3`, etc. - Individual positional arguments
- `$ARGUMENTS` - All arguments as a single string (alternative approach)

**Usage:** `/fix-issue 123 high`
- `$1` becomes `123` (issue number)
- `$2` becomes `high` (priority)
- Expands to: "Fix issue #123 with priority high following our coding standards..."

**Note:** If you used `$ARGUMENTS` instead, `/fix-issue 123 high` would become `"123 high"` as a single string

---

### 3. `create-commit.md` - Bash Execution Example

**Purpose:** Shows how to automatically run bash commands within slash commands

**What it demonstrates:**
- `!` prefix executes bash commands and loads output into context
- Frontmatter with `allowed-tools` to permit specific commands
- Command output is available before the prompt runs

**Usage:** `/create-commit`
- Runs `git status` and `git diff HEAD` automatically
- Includes the output in context
- Claude creates a commit based on the actual changes

**Key feature:** The `!` makes bash commands run immediately when the command is invoked

---

### 4. `create-tool.md` - File Reference Example

**Purpose:** Shows how to reference other files to load their content into context

**What it demonstrates:**
- `@` prefix references files and loads their content
- Useful for loading documentation, guides, or reference materials
- Combines with arguments for dynamic prompts

**Usage:** `/create-tool authentication system`
- Loads `reference/adding_tools_guide.md` content automatically
- `$ARGUMENTS` becomes `authentication system`
- Claude creates a tool following the guide's patterns

**Key feature:** The `@` loads file contents into context before the prompt runs
