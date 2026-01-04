# Global Rules - Two Approaches

This folder demonstrates two different approaches to organizing global rules (CLAUDE.md, AGENTS.md, etc.) for your project.

> Note that while I specifically call out CLAUDE.md in the following READMEs for module 3, all of this applies to AGENTS.md and other global rule files too.

## Version 1: Single File (`version_1_rules/`)

**Approach:** All rules in one consolidated CLAUDE.md file

**Pros:**
- Simple to navigate - everything in one place
- Easy to search with Ctrl+F

**Cons:**
- Can become large and unwieldy as project grows
- Harder to maintain different sections independently

**Best for:**
- Small to medium projects
- Projects with very stable conventions
- Teams that want simplicity over modularity

---

## Version 2: Modular Files (`version_2_rules/`)

**Approach:** Rules split into separate files, referenced via @ syntax in main CLAUDE.md

**Structure:**
```
version_2_rules/
├── CLAUDE.md                      # Main file with @references
└── sections/                      # Modular rule sections
    ├── 01_core_principles.md      # Core development principles
    ├── 02_tech_stack.md           # Technology choices
    ├── 03_architecture.md         # Project structure patterns
    ├── 04_code_style.md           # Naming and formatting
    ├── 05_logging.md              # Logging patterns
    ├── 06_testing.md              # Testing standards
    ├── 07_api_contracts.md        # API design patterns
    ├── 08_dev_commands.md         # Development workflow
    ├── 09_common_patterns.md      # Code examples
    └── 10_ai_instructions.md      # AI assistant guidelines
```

**Pros:**
- Easy to maintain individual sections
- Can update one aspect without touching others
- Easier to version control (smaller diffs)

**Cons:**
- Not as simple to maintain
- Requires navigating multiple files

**Best for:**
- Large or growing projects
- Teams with multiple contributors
- Projects that frequently update conventions
- Organizations with different domain owners

---

## @ Syntax for Referencing Files

In your CLAUDE.md, you can reference other markdown files using:

```markdown
@path/to/file.md
```

When Claude Code loads the CLAUDE.md, it automatically loads the content from referenced files. This keeps your main CLAUDE.md clean and modular.

**Example:**
```markdown
## Core Principles
@sections/01_core_principles.md
```

---

## Converting Between Versions

**From Version 1 → Version 2:**
1. Split your CLAUDE.md into logical sections
2. Save each section as a separate .md file
3. Create a new CLAUDE.md with @references

**From Version 2 → Version 1:**
1. Copy content from all modular files
2. Paste into a single CLAUDE.md
3. Remove @ references
4. Add section dividers (---)

---

## Best Practices

Regardless of which version you choose:

1. **Keep it updated** - Stale rules are worse than no rules
2. **Be specific** - Vague rules lead to inconsistent code
3. **Include examples** - Show, don't just tell
4. **Review regularly** - Update as project evolves
5. **Start small** - Can always expand later
