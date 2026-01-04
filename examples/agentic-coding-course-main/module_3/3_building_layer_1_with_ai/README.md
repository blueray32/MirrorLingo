# Building Layer 1 Context with AI

This folder provides copy-paste prompts to help you build your Layer 1 planning context using AI coding assistants.

## What is Layer 1 Context?

Layer 1 is your **planning and architectural context** - the stable rules and patterns that guide all development. It consists of two types:

1. **Global Rules (Autoload)** - Always-loaded core principles
2. **Reference Guides (On-Demand)** - Task-specific patterns loaded when needed

See [module_3/2_layer_1_loading_strategies](../2_layer_1_loading_strategies) for details on these two loading strategies.

---

## The Two Prompts in This Folder

### 1. Global Rules Creation (`create_global_rules_prompt.md`)

**Purpose:** Generate your project's global rules (CLAUDE.md or similar)

**What it creates:**
- Core development principles
- Tech stack decisions
- Architecture patterns
- Code style standards
- Logging conventions
- Testing requirements
- Development commands
- AI assistant instructions

**When to use:**
- Starting a new project
- Documenting an existing codebase
- Updating outdated global rules

**Output:** A 100-500 line CLAUDE.md file with comprehensive project-wide conventions

**Process:**
1. Copy the prompt from `create_global_rules_prompt.md`
2. Paste into your AI coding assistant
3. For existing projects: AI analyzes your codebase automatically
4. For new projects: AI asks clarifying questions, then researches best practices
5. AI generates a complete CLAUDE.md following the template

---

### 2. Reference Guide Creation (`create_reference_guide_prompt.md`)

**Purpose:** Generate task-specific reference guides for on-demand loading

**What it creates:**
- Step-by-step implementation guides
- Code examples for specific task types
- Quick checklists
- Task-specific patterns

**When to use:**
- Creating guides for common development tasks
- Documenting patterns discovered during development
- After researching best practices for a specific technique

**Output:** A 50-200 line reference guide (e.g., `reference/building_api_endpoints.md`)

**Process:**
1. Copy the prompt from `create_reference_guide_prompt.md`
2. Paste into your AI coding assistant
3. Fill in:
   - Task type (e.g., "building API endpoints")
   - Research link (documentation, blog post, best practices guide)
4. AI researches the link and analyzes your codebase
5. AI generates a focused, actionable reference guide

---

## How These Work Together

```
Global Rules (CLAUDE.md)
├─ Core Principles: "Use structured logging"
├─ Tech Stack: "FastAPI + React"
├─ Architecture: "Three-layer pattern"
└─ References: "See reference/ for task-specific guides"
    │
    └─> Reference Guides (reference/)
        ├─ reference/api_guide.md        ← Step-by-step API building
        ├─ reference/component_guide.md  ← Step-by-step component building
        └─ reference/testing_guide.md    ← Step-by-step test writing
```

**Global rules** define the "what" and "why" (principles, standards, tech choices)

**Reference guides** define the "how" (detailed steps, code examples, checklists)

---

## Example Workflow

### Starting a New Project

1. Use `create_global_rules_prompt.md`:
   ```
   - AI asks: What type of project? Tech preferences?
   - You answer: "FastAPI backend + React frontend for e-commerce"
   - AI researches 2025 best practices
   - AI generates CLAUDE.md with tech stack, architecture, conventions
   ```

2. Use `create_reference_guide_prompt.md` for common tasks:
   ```
   Task: "Building API endpoints"
   Link: "https://fastapi.tiangolo.com/tutorial/"
   Output: reference/api_guide.md with step-by-step endpoint creation
   ```

   ```
   Task: "Creating React components with shadcn/ui"
   Link: "https://ui.shadcn.com/docs"
   Output: reference/component_guide.md with component patterns
   ```

### Documenting Existing Codebase

1. Use `create_global_rules_prompt.md`:
   ```
   - AI automatically analyzes existing files
   - AI extracts conventions, patterns, tech stack
   - AI generates CLAUDE.md documenting what exists
   ```

2. Use `create_reference_guide_prompt.md` to formalize patterns:
   ```
   - Identify a complex task you do often (e.g., adding database models)
   - Find documentation/guide for best practices
   - AI creates reference guide matching your existing patterns
   ```

---

## Key Takeaway

Use AI to help build your Layer 1 context instead of writing it manually:

- **Global rules** = AI analyzes your codebase or researches best practices
- **Reference guides** = AI researches a topic and creates step-by-step guide

This ensures:
1. Comprehensive coverage without manual effort
2. Best practices based on current documentation
3. Consistency with your existing codebase
4. Maintainable, concise guides

> Be a part of the process still - you should be reviewing the rules and other layer 1 context and making sure it fits to your specifications!

Start with global rules, then add reference guides for your most common tasks.
