# Video 0: What Are Slash Commands?

**Duration**: 8-10 minutes
**Purpose**: Understand what slash commands are, how they work technically, and their key features

---

## Meta Key Points

**Core Message**: Slash commands are reusable markdown files that act as on-demand prompts - they're a practical implementation of Module 3's on-demand loading strategy

**Connection**: Module 3 taught that Layer 1 constants can be auto-loaded (CLAUDE.md) or on-demand. Slash commands is a great way to implement on-demand loading.

**Student Outcome**: Students understand the technical mechanism of slash commands and can visualize how to create and use them

---

## What Students Learn

- What slash commands are (reusable prompts stored as markdown files)
- Where they live (project vs personal scope)
- File structure, naming, and basic syntax
- Key features: arguments, bash execution, file references, frontmatter
- How slash commands implement Module 3's on-demand loading concept

---

## Content Outline

### [0:00-1:00] Hook & Introduction

**Hook**: "In Module 3, you learned that Layer 1 constants can load on-demand for specific task types. But HOW can you actually implement that? Claude codes solution is slashcommands."

**Setup**:

- Callback to Module 3: Auto-load vs on-demand loading strategies
- Today: The mechanism for on-demand loading
- Slash commands = reusable prompts you invoke when needed
- Technical understanding: What they are, where they live, how they work

---

### [1:00-3:30] Part 1: What Slash Commands Are

**Key Point**: Slash commands are markdown files containing prompts that you invoke on-demand with `/command-name`

**Content**:

**The Basic Concept:**

- Reusable prompts stored as markdown files
- Invoke with `/command-name` in Claude Code
- Alternative to re-typing the same prompt every time
- Strategic context loading when you need it

**The Mechanism:**

```
You type: /optimize
Claude reads: Contents of optimize.md file
Claude executes: The prompt instructions in that file
```

**Where They Live:**

Two scopes for different use cases:

1. **Project Commands** (`.claude/commands/`)
   - Location: In your repository root
   - Scope: Shared with your team (version controlled)
   - Use for: Team standards, project-specific workflows
   - Example: `.claude/commands/review-pr.md` → `/review-pr`
   - Shows as "(project)" in `/help`

2. **Personal Commands** (`~/.claude/commands/`)
   - Location: Your home directory
   - Scope: Just you, across all projects
   - Use for: Personal workflows, preferences
   - Example: `~/.claude/commands/explain.md` → `/explain`
   - Shows as "(user)" in `/help`

**Naming Convention:**

- Filename (without .md) becomes command name
- `optimize.md` → `/optimize`
- `fix-bug.md` → `/fix-bug`
- Subdirectories create namespaces (covered in Video 2)

**Show/Demo**:

- Show directory structure: `.claude/commands/` with example files
- Demonstrate creating simple command: `echo "Review this code for bugs" > .claude/commands/review.md`
- Show using the command: `/review`
- Show `/help` output listing available commands

---

### [3:30-6:00] Part 2: Key Features

**Key Point**: Slash commands support powerful features that make them flexible and reusable

**Content**:

**Feature 1: Arguments**

Pass dynamic values to commands:

**$ARGUMENTS** - All arguments as single string:

```markdown
# fix-issue.md

Fix issue #$ARGUMENTS following our coding standards
```

Usage: `/fix-issue 123 high-priority`
→ `$ARGUMENTS` becomes `"123 high-priority"`

**$1, $2, $3** - Individual positional arguments:

```markdown
# review-pr.md

Review PR #$1 with priority $2 and assign to $3
```

Usage: `/review-pr 456 high alice`
→ `$1`="456", `$2`="high", `$3`="alice"

**Feature 2: Bash Command Execution**

Execute commands and include output in context using `!` prefix:

```markdown
---
allowed-tools: Bash(git status:*), Bash(git diff:*)
---

Current status: !`git status`
Recent changes: !`git diff HEAD`

Based on the above, create a commit.
```

The output of bash commands is loaded into context before the prompt runs.

**Feature 3: File References**

Include file contents using `@` syntax:

```markdown
Review the implementation in @src/utils/helpers.js

Compare @src/old-version.js with @src/new-version.js
```

**Feature 4: Frontmatter Metadata**

Configure command behavior with YAML frontmatter:

```markdown
---
description: Create a git commit with conventional format
allowed-tools: Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
model: claude-sonnet-4
---

Command content here...
```

**Key frontmatter fields:**

- `description`: Brief description (shown in `/help`)
- `allowed-tools`: Restrict which tools the command can use
- `argument-hint`: Show expected arguments in autocomplete
- `model`: Override the conversation's model for this command

**Show/Demo**:

- Example command with all features combined
- Show autocomplete with argument-hint
- Demonstrate bash execution output
- Show file reference loading content

---

### [6:00-8:00] Part 3: Connection to Module 3's Mental Model

**Key Point**: Slash commands implement the on-demand loading strategy from Module 3

**Content**:

**Recall from Module 3:**

Layer 1 constants have TWO loading strategies:

1. Auto-loaded (CLAUDE.md) - needed every session
2. On-demand - needed for specific task types

**Slash Commands = On-Demand Loading Implementation**

They load Layer 1 constants when you need them:

```
CLAUDE.md (Auto-loaded every session):
├── Tech stack: Python + FastAPI
├── Architecture: Vertical slice pattern
├── Type safety: Strict mypy required
└── Core conventions used in ALL tasks

Slash Commands (On-demand for specific task types):
├── /api-patterns → Load API building conventions
├── /db-migration → Load database migration workflow
├── /commit → Load commit message standards
└── /primer → Load full project context
```

**The Strategy:**

- CLAUDE.md: Foundational constants needed everywhere
- Slash commands: Task-type specific constants loaded when relevant
- Together: Complete Layer 1 context without bloat

**Benefits:**

- Clean context window (only load what you need now)
- Strategic loading (constants available when relevant)
- No re-prompting (invoke command instead of re-typing)
- Team standardization (shared commands in git)

**Show/Demo**:

- Visual diagram: Auto-loaded vs On-demand loading strategies
- Show CLAUDE.md alongside .claude/commands/ directory
- Demonstrate: Session starts with CLAUDE.md, then `/commit` loads commit standards on-demand

---

### [8:00-10:00] Closing

**Key Takeaway**:

"Slash commands are reusable markdown files that store reusable prompts, and they can be used for implementing on-demand context loading.

You now know:

- WHAT they are (markdown prompts you invoke)
- WHERE they live (project or personal scope)
- KEY FEATURES (arguments, bash, file refs, frontmatter)
- CONNECTION to Module 3 (on-demand loading implementation)

Next video: WHY slash commands matter and how to think about them from the agent's perspective."

**Bridge to Next**:

"Understanding the mechanism is step one. Next: WHY they're strategically valuable, how to think about what the agent sees vs what you want it to output, and the mental model for designing effective commands."
