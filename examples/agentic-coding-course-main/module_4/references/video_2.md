# Video 2: Command Patterns - Understanding Output and Flow

**Duration**: 15-18 minutes
**Purpose**: Understand how commands differ by what they produce, who consumes it, and how they connect in workflows

---

## Meta Key Points

**Core Message**: All commands are reusable processes. What differs is what they produce (context vs documents vs actions), who consumes it (you vs another agent), and how they chain together in systematic workflows.

**Connection**: Videos 0-1 taught WHAT commands are and WHY they matter. Now we understand how to think about different command patterns based on their outputs and connections.

**Student Outcome**: Students understand command patterns, can design outputs optimized for their consumer (human or agent), and see how commands chain together in workflows.

---

## What Students Learn

- All commands are reusable processes (that's why you create them)
- Commands differ in what they produce: context, documents, or actions
- Output optimization: human-readable vs agent-readable
- How commands chain together (one's output feeds another)
- Thinking about workflows, not just individual commands
- Real patterns from the course project

---

## Content Outline

### [0:00-1:30] Hook & Introduction

**Hook**: "You've learned to think from the agent's perspective. But here's the key insight: `/prime` and `/planning` are both reusable commands you'll use again and again. So what makes them different?"

**Setup**:

- Videos 0-1: You know WHAT commands are and WHY they matter
- Today: Understanding command patterns
- Key insight: ALL commands are reusable (that's the point!)
- What differs: What they produce, who consumes it, how they connect
- Not about "types" of commands - about understanding patterns

---

### [1:30-5:00] Part 1: All Commands Are Reusable

**Key Point**: Every command you create is a reusable process. Specificity comes from input, process definition and outputs, not the command itself.

**Content**:

**The Core Insight:**

When you create a command, you're defining a **reusable process**:

- The process/workflow doesn't change
- You invoke it many times
- Arguments make each invocation specific
- Outputs vary per invocation

**Example: The `/rca` Command**

```markdown
# .claude/commands/rca.md

## Root Cause Analysis: Issue #$ARGUMENTS

### 1. Understand the Issue

- Read issue details
- Reproduce if possible
- Identify affected components

### 2. Investigate Root Cause

- Search codebase for relevant code
- Check recent git history
- Review related test failures

### 3. Document Findings

Create analysis document with:

- Root cause identified
- Impact assessment
- Proposed fix approach

Save as: `docs/rca/issue-$ARGUMENTS.md`
```

**This command is highly reusable:**

- `/rca 123` → Creates `docs/rca/issue-123.md`
- `/rca 456` → Creates `docs/rca/issue-456.md`
- `/rca 789` → Creates `docs/rca/issue-789.md`

The **process** is constant (RCA workflow).
The **output** is specific (RCA doc for that issue).

**Another Example: The `/planning` Command**

```markdown
# .claude/commands/planning.md

## Feature Planning: $ARGUMENTS

Research and create implementation plan for: $ARGUMENTS

1. Research existing patterns in codebase
2. Research external documentation
3. Design implementation approach
4. Document step-by-step tasks

Save as: `plans/$ARGUMENTS.md`
```

**This command is highly reusable:**

- `/planning user-authentication` → Creates `plans/user-authentication.md`
- `/planning search-feature` → Creates `plans/search-feature.md`
- `/planning export-data` → Creates `plans/export-data.md`

The **process** is constant (research and planning workflow).
The **output** is specific (plan for that feature).

**The Pattern:**

- You create the command once
- You use it many times
- Arguments identify what it operates on
- Outputs are specific to each invocation
- The process itself doesn't change

**Show/Demo**:

---

### [5:00-9:00] Part 2: Understanding Command Patterns by Output

**Key Point**: Commands differ in what they produce and who consumes it. Understanding this helps you design better commands.

**Content**:

**Three Common Output Patterns:**

**Pattern 1: Context Loading Commands**

Purpose: Load information into the agent's current context/state

```markdown
# .claude/commands/prime.md

## Prime Context

Execute to understand the codebase:

1. List tracked files: !`git ls-files`
2. Show structure: !`tree -L 3`
3. Read CLAUDE.md
4. Read core README files
5. Identify and read key files

Report back:

- Project purpose
- Architecture patterns
- Tech stack
- Core principles
- Current state
```

**Characteristics:**

- **Produces**: Agent understanding (loaded into context)
- **Consumer**: YOU (human) read the summary so you can verify agent understanding
- **Output format**: Conversational, easy to scan
- **When to use**: Session start, switching context

**Pattern 2: Document Creation Commands**

Purpose: Research and create artifacts for future use

```markdown
# .claude/commands/planning.md

## Feature Planning: $ARGUMENTS

Research and plan implementation of: $ARGUMENTS

Research process:

1. Analyze existing codebase patterns
2. Research external documentation
3. Design implementation approach
4. Document step-by-step tasks

Create plan at: `plans/$ARGUMENTS.md`

Format plan for:

- Clear task breakdown
- File-level specificity
- Validation commands
- Another agent to execute
```

**Characteristics:**

- **Produces**: Document/artifact (saved to file)
- **Consumer**: ANOTHER AGENT (and you to refine/verify)
- **Output format**: Structured, explicit, detailed
- **When to use**: When you need reusable intelligence

**Key difference from Pattern 1:**

- Prime: Loads context into THIS agent
- Planning: Creates document for NEXT agent

**Pattern 3: Action/Process Automation Commands**

Purpose: Execute workflow and complete actions

```markdown
# .claude/commands/commit.md

## Create Git Commit

For files: $1 $2 $3 $4 $5 (or all changes if not specified)

Process:

1. Review changes: !`git diff HEAD`
2. Check status: !`git status`
3. Stage changes appropriately
4. Create conventional commit message
5. Execute commit

Report:

- Commit message used
- Commit hash
- Files committed
```

**Characteristics:**

- **Produces**: Action completed (git commit created)
- **Consumer**: SYSTEM (git) and YOU (confirmation)
- **Output format**: Confirmation of action taken
- **When to use**: Repetitive workflows you want automated

**The Decision Framework:**

When designing a command, ask:

1. **What does this produce?**
   - Agent state (context) → Pattern 1
   - Document/artifact → Pattern 2
   - Action/side effect → Pattern 3

2. **Who consumes the output?**
   - Human (you) → Optimize for readability
   - Agent (next step) → Optimize for clarity and structure
   - System (git, APIs) → Follow required format

3. **Does this feed into another command?**
   - Yes → Think about the consuming command's needs
   - No → Optimize for end consumer (you or system)

**Show/Demo**:

- Show `/prime` output (human-readable summary)
- Take exercise prompt from piv loop plan creation and show it
- Show `/commit` output (action confirmation commit the plan form previous)
- Highlight optimization for consumer (next will be exercise to optimize the planning command for the coding-agent consumer)

---

### [9:00-13:00] Part 3: Agent-to-Agent Communication

**Key Point**: The most powerful pattern is commands that create outputs for other commands. Think about chaining workflows.

**Content**:

**The Command Chain Pattern:**

Commands can feed into each other, creating systematic workflows:

```
/prime → You understand the project
    ↓
/planning [feature] → Creates plan document
    ↓
/execute [plan-file] → Reads plan, implements feature
    ↓
/commit → Creates git commit
```

**Example: Planning → Execute Chain**

**Step 1: Create the plan** (`/planning user-authentication`)

```markdown
# .claude/commands/planning.md

Create plan at: `plans/$ARGUMENTS.md`

Important: Format this plan for another agent to execute.

Include:

- **Relevant Files**: Specific files with line numbers
- **Step by Step Tasks**: Explicit, ordered tasks
- **Validation Commands**: Exact commands to run
- **Testing Strategy**: What tests to create

Make it so detailed that an agent who hasn't seen this conversation
can execute it successfully.
```

**Output**: `plans/user-authentication.md` (optimized for agent consumption)

**Step 2: Execute the plan** (`/execute user-authentication`)

```markdown
# .claude/commands/execute.md

## Execute Plan: $ARGUMENTS

Read plan file: `plans/$ARGUMENTS.md`

Instructions:

- Read the ENTIRE plan carefully
- Execute EVERY step in "Step by Step Tasks" in order
- Follow "Testing Strategy" to create proper tests
- Complete all "Validation Commands"
- Ensure linters and tests pass

Report:

- Files created/modified
- Tests added
- Validation results
```

**The Power of This Pattern:**

1. **Separation of concerns**
   - Planning session: Research, think, document
   - Execution session: Focus, implement, validate

2. **Intelligence reuse**
   - Plan captures research once
   - Can be executed multiple times
   - Can be reviewed and refined

3. **Agent optimization**
   - Planning command optimizes FOR the execute command
   - Execute command knows EXACTLY what to expect

**Designing for Agent Consumption:**

When creating documents for other agents, be explicit:

**Bad (Vague):**

```markdown
## Tasks

- Add authentication
- Update the API
- Add tests
```

**Good (Explicit for agents):**

```markdown
## Step by Step Tasks

### Task 1: Create Authentication Schema

File: `app/schemas/auth.py`

- Define UserCredentials pydantic model
- Define AuthToken response model
- Include type hints for all fields

### Task 2: Implement Auth Endpoint

File: `app/api/auth.py` (create new)

- POST /auth/login endpoint
- Use UserCredentials schema for input
- Return AuthToken schema
- Add structured logging

### Task 3: Create Tests

File: `tests/test_auth.py` (create new)

- Test successful login
- Test invalid credentials
- Test missing fields

### Task 4: Validation

Run commands in order:

- `uv run ruff check app/`
- `uv run mypy app/`
- `uv run pytest tests/ -v`
```

**Why this matters:**

- Specific file names and locations
- Explicit schemas to use
- Exact validation commands
- No ambiguity for executing agent

**Show/Demo**:

---

### [13:00-15:00] Part 4: Building Command Workflows

**Key Point**: Think in workflows, not just individual commands. Design commands to work together.

**Content**:

**lets build one:**

**Pattern: Investigate → Document → Fix**

```
1. /rca [id]     → Analyze and document RCA
2. /implement-fix [id] → Read RCA, implement fix, add/fix tests
3. /commit             → Create commit
```

**Designing for Workflows:**

When creating commands, think about:

1. **What comes before this?**
   - What context does this command need?
   - What documents should exist?
   - Can it load them automatically?

2. **What comes after this?**
   - What output would help the next step?
   - How should the output be structured?
   - Where should artifacts be saved?

3. **Can this be broken down?**
   - Is this doing too much?
   - Should it be multiple commands?
   - Would splitting improve reusability?

**Example: Breaking Down a Monolithic Command**

**Bad (One huge command):**

```markdown
# .claude/commands/build-feature.md

Plan feature, implement it, test it, and deploy it
```

**Good (Chainable commands):**

```markdown
# .claude/commands/planning.md

Research and plan the feature → Create plan document

# .claude/commands/execute.md

Implement from plan document → Create implementation

# .claude/commands/commit.md

Create git commit → Commit created
```

**Why better?**

- Each command is reusable independently
- Can plan without implementing
- Can implement different plans
- Can commit non-plan work
- More flexible workflows

**The Command Library Mental Model:**

Think of your `.claude/commands/` as a toolkit that is part of your agentic layer:

- Each command is a reusable tool
- Tools can work independently
- Tools can chain together
- More specific tools = more flexibility
- Build workflows by chaining tools

**Show/Demo**:

- Show directory of commands organized by pattern
- Walk through a complete workflow
- Demonstrate flexibility of chainable commands

---

### [15:00-17:00] Closing - The Command Workflow Mindset

**Key Takeaway**:

"All commands are reusable processes. What differs is what they produce, who consumes it, and how they connect:

**Key Insights:**

1. **Commands are reusable** - That's why you create them
   - Process is constant
   - Arguments make invocations specific
   - Outputs vary per use

2. **Three output patterns:**
   - Context loading (for the agent to fontload and understand your coebase)
   - Artefact creation (for agents or humans to consume)
   - Action automation (for systems to execute)

3. **Optimize for the consumer:**
   - Human-readable for you
   - Structured and explicit for agents
   - Format-compliant for systems

4. **Think in workflows:**
   - Commands chain together
   - Design outputs for next command
   - Build flexible, composable tools

Next: Hands-on exercise building your command library with these patterns."

**Bridge to Next**:

"You understand command patterns and workflows. Now build your own commands.

In the exercise, you'll:

- build a priming commands using the ai_coding_course/module_3_global_rules/02_exercise_create_your_claudemd/results/adding_tools_guide.md file from the previous module.
- 2 Build a output format for our planning command we used in the ai_coding_course/module_2_plan_implement_validate/01_planning_two_layers/planning_prompts.md prompt 5
