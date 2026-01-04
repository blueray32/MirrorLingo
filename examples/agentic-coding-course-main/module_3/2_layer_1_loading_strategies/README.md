# Layer 1 Planning: Two Loading Strategies

This folder demonstrates the two different ways to manage Layer 1 planning context in AI-assisted coding.

## The Layer 1 Context Problem

When building with AI coding assistants, you need stable architectural rules and conventions (Layer 1 planning). However, not all Layer 1 context should be loaded all the time:

- **Global rules** = Core principles, architecture, tech stack (always needed)
- **Task-specific guides** = Detailed patterns for specific tasks (only needed sometimes)

Loading everything at once causes **context bloat** and wastes tokens. The solution: two loading strategies.

---

## Strategy 1: Always-Loaded Context (Global Rules)

**Purpose:** Core principles and architecture that apply to ALL development tasks

**Location:** `CLAUDE.md` (root of project or module)

**Content:**
- Core development principles (naming, logging, types)
- Tech stack decisions
- Overall architecture patterns
- Code style standards
- Development commands

**When loaded:** Automatically when Claude Code starts or enters the directory

**Example from this project:**
```markdown
## Core Principles
- VERBOSE NAMING IS NON-NEGOTIABLE
- AI-FRIENDLY LOGGING IS MANDATORY
- TYPE SAFETY IS REQUIRED
```

---

## Strategy 2: Load-On-Demand Context (Reference Guides)

**Purpose:** Detailed patterns for specific task types

**Location:** `reference/` folder with task-specific guides

**Content:**
- Step-by-step guides for specific tasks
- Detailed code examples
- Task-specific checklists
- Common patterns and anti-patterns

**When loaded:** Only when working on that specific task type

### Reference Guides in This Project

1. **`reference/API_guide.md`**
   - Task type: Building API endpoints
   - Covers: Models → Services → API three-layer pattern
   - When to use: Creating routes, implementing backend features

2. **`reference/frontend_component_guide.md`**
   - Task type: Building React components
   - Covers: Props, state, shadcn/ui, styling, accessibility
   - When to use: Creating UI components, implementing views

---

## Two Ways to Load Reference Guides

### Method 1: Reference in Global Rules (This Folder)

Add a section to `CLAUDE.md` telling the AI when to read guides:

```markdown
## Task-Specific Reference Guides

### Building API Endpoints
**When to use:** Creating new REST API endpoints

Read: `reference/API_guide.md`

### Building Frontend Components
**When to use:** Creating React components

Read: `reference/frontend_component_guide.md`
```

**Pros:**
- Maximum flexibility - AI decides when to read
- Works without additional infrastructure

**Cons:**
- AI must remember to read the guides
- Less explicit control over when guides are loaded

### Method 2: Include in Commands/Workflows (Module 4) ⭐ RECOMMENDED

Specify reference guides as part of reusable prompts (commands):

```markdown
# .claude/commands/build-api-endpoint.md

Read @reference/API_guide.md before proceeding.

Now create a new API endpoint for {feature}...
```

**Pros:**
- Guarantees guide is loaded for the task
- More explicit and reliable
- Integrates with workflow automation
- Better for team consistency

**Cons:**
- Requires command infrastructure (covered in Module 4)

---

## When to Use Each Strategy

### Use Always-Loaded (Global Rules) for:
- Core architectural principles that apply everywhere
- Tech stack and tooling decisions
- Universal code style standards
- Logging and error handling patterns
- Testing requirements that apply to all code

### Use Load-On-Demand (Reference Guides) for:
- Step-by-step guides for specific tasks
- Detailed implementation patterns
- Task-specific checklists
- Examples and templates
- Domain-specific conventions

---

## Real-World Example

Consider an AI agent project with tool development:

**Global Rules (always loaded):**
```markdown
- Type safety with Pydantic
- Structured logging required
- All tools must have docstrings
- Integration tests required
```

**Reference Guide (load on demand):**
```markdown
# reference/tool_development_guide.md

1. Create tool schema with Pydantic
2. Implement tool function with error handling
3. Add structured logging at key points
4. Write agent-optimized docstring
5. Add integration test
6. Update tool registry
```

Why separate? The global rules apply to all code. The tool guide is 50+ lines of specific steps only needed when building tools, not when working on API endpoints, database models, or other tasks.

---

## Best Practices

1. **Keep global rules concise** - Only universal principles
2. **Be specific in reference guides** - Include code examples
3. **Reference guides < 500 lines** - Quick to read and digest
4. **Update both together** - Keep conventions in sync
5. **Prefer Method 2** - Use commands (Module 4) for reliability
6. **Name guides clearly** - `{task_type}_guide.md` format

---

## Structure of This Folder

```
2_layer_one_loading_strategies/
├── README.md                          # This file
├── CLAUDE.md                          # Global rules with references
└── reference/                         # Task-specific guides
    ├── API_guide.md                   # Building API endpoints
    └── frontend_component_guide.md    # Building React components
```

---

## Key Takeaway

**Global rules = Principles that apply everywhere**
**Reference guides = Detailed steps for specific task types**

By separating these, you avoid context bloat while ensuring the AI has access to detailed guidance when needed. The ideal approach is to reference guides in commands (Module 4), but referencing them in global rules provides a flexible fallback.
