# Exercise 2: Design Planning Command Output Structure

**Duration**: 15-20 minutes

**Pattern**: Document Creation (Pattern 2)

**Difficulty**: Intermediate

---

## Goal

Design the output structure for a planning command that creates implementation plans for another agent to execute. This is agent-to-agent communication - the output must be optimized for AGENT consumption, not human reading.

---

## The Problem

In Module 2, you saw this planning workflow (Prompt 5):

```
Prompt 1: Explore codebase
Prompt 2: Research options
Prompt 3: Research technologies
Prompt 4: Consider constraints
Prompt 5: Create implementation plan → [creates coding-prompt.md]
```

The final prompt created a `coding-prompt.md` file that another agent would read to implement the feature.

**The challenge:** What structure should that output have so the coding agent can execute it successfully **without seeing any of the previous conversation?**

---

## Your Task

Design a complete output structure (markdown template) for a planning command that:
1. Captures all the research from the planning session
2. Provides explicit, unambiguous instructions
3. Enables another agent to implement the feature end-to-end
4. Includes everything needed for success (files, tests, validation)

---

## Step-by-Step Instructions

### Step 1: Understand the Consumer (5 min)

**Who will read this output?**
- Another AI agent (not you!)
- In a NEW session (doesn't have your conversation history)
- Tasked with implementing the feature
- Needs to know: what to build, how to build it, how to validate

**What does that agent need?**
Think about a coding agent that will:
- Read this document
- Implement the feature
- Write tests
- Validate it works

What information is absolutely required for success?

### Step 2: Learn from Module 2's Pattern (5 min)

Go back and read: `PlanningPrompts.md`

Look at **Prompt 5** - what sections did it include?
- Feature description
- User story
- Solution statement
- List of relevant files
- Research URLs
- Implementation plan
- Step-by-step tasks
- Testing strategy

**Think:** Why each section? What purpose does it serve for the executing agent?

### Step 3: Design Your Structure (10 min)

Create a file: `planning-output-structure.md`

Design a complete markdown template with sections that enable agent-to-agent handoff.

**Sections to consider (but customize this to your use case!):**

1. **Feature Context**
   - What problem are we solving?
   - Why are we solving it?
   - What's the user value?

2. **Solution Approach**
   - What's the technical approach?
   - Why did we choose this approach?
   - What alternatives did we reject?

3. **Codebase Context**
   - What existing files must the agent read?
   - What patterns should it follow?
   - What conventions apply?

4. **External Research**
   - What documentation is relevant?
   - What libraries/APIs are involved?
   - Where can the agent find examples?

5. **Implementation Tasks**
   - What's the step-by-step process?
   - What order matters?
   - What files to create/modify?

6. **Testing Requirements**
   - What tests are needed?
   - What edge cases to cover?
   - What validation proves success?

7. **Validation Commands**
   - What exact commands to run?
   - What should pass?
   - How to verify success?

**Your design decisions:**
- What sections do you include?
- How do you structure each section?
- How explicit do you make the instructions?
- What level of detail is needed?

---

## Designing for Agent Consumption

Remember there is good and bad output for agents specifially:

### ❌ Bad (Vague):
```markdown
## Tasks
- Add authentication
- Update the API
- Add tests
```

**Why bad?**
- Which files?
- What kind of authentication?
- Where in the API?
- What tests exactly?

### ✅ Good (Explicit):
```markdown
## Step by Step Tasks

### Task 1: Create Authentication Schema
File: `app/schemas/auth.py`
- Define UserCredentials pydantic model
  - email: str (EmailStr validation)
  - password: str (min 8 chars)
- Define AuthToken response model
  - token: str
  - expires_at: datetime

### Task 2: Implement Auth Endpoint
File: `app/api/auth.py` (create new)
- POST /auth/login endpoint
- Use UserCredentials schema for input
- Return AuthToken schema
- Add structured logging for auth attempts

### Task 3: Create Tests
File: `tests/test_auth.py` (create new)
- Test successful login (valid credentials)
- Test invalid credentials (wrong password)
- Test missing fields (email or password missing)

### Task 4: Validation
Run in order:
1. `uv run ruff check app/`
2. `uv run mypy app/`
3. `uv run pytest tests/ -v`

All commands must pass with 0 errors.
```

**Why is this good?**
- Specific files with paths
- Exact models to create
- Clear field requirements
- Explicit test cases
- Exact validation commands

---

## Template Design Challenge

Here's a starter template if you want to use it. **Your job: Fill it in and improve it.**

```markdown
# Feature: [Feature Name]

## Feature Description

[Describe the feature - what problem does it solve?]

## User Story

As a [type of user]
I want to [action/goal]
So that [benefit/value]

## Problem Statement

[What specific problem or opportunity does this address?]

## Solution Statement

[Describe the technical solution approach and why we chose it]

## Relevant Files

The executing agent MUST read these files to understand patterns:

### Core Files
- `[file-path]` - [why relevant, what to learn from it]
- `[file-path]` - [why relevant]

### Similar Features
- `[file-path]` - [example of similar pattern to follow]

## Research Documentation

Use these resources for implementation guidance:

- [Documentation Title](https://url.com/path)
  - Key section: [specific section name]
  - Summary: [1-2 sentences on what to learn]

## Implementation Plan

### Phase 1: Foundation
[What foundational work is needed first?]

### Phase 2: Core Implementation
[What's the main implementation work?]

### Phase 3: Integration
[How does this integrate with existing features?]

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Task 1: [Task Name]
File: `[exact-file-path]`
- [Specific thing to do]
- [Another specific thing]
- [Be explicit about what to create/modify]

### Task 2: [Task Name]
File: `[exact-file-path]` (create new OR modify existing)
- [Specific implementation detail]
- [Expected structure]

[Continue with all tasks needed]

## Testing Strategy

### Unit Tests
Mark with `@pytest.mark.unit`
- [What to test in isolation]
- File: `tests/[path]/test_[name].py`

### Integration Tests
Mark with `@pytest.mark.integration`
- [What to test with multiple components]
- File: `tests/integration/test_[name].py`

### Edge Cases
- [Edge case 1]
- [Edge case 2]

## Acceptance Criteria

How do we know this is complete and correct?
- [ ] [Specific, measurable criterion 1]
- [ ] [Specific, measurable criterion 2]

## Validation Commands

Execute every command to validate with 100% confidence:

# Linting (must pass)
uv run ruff check src/

# Type checking (must pass)
uv run mypy src/

# Unit tests (must pass)
uv run pytest tests/ -m unit -v

# Integration tests (must pass, if applicable)
uv run pytest tests/ -m integration -v

# Full test suite (must pass)
uv run pytest tests/ -v

## Notes

[Any additional context, future considerations, or gotchas]

```

---

## Your Design Task

Take this template and:

1. **Improve it** - What's missing? What could be clearer?
2. **Make it explicit** - Where would an agent get confused?
3. **Add structure** - What helps the agent execute step by step?
4. **Test mentally** - Could an agent with NO context succeed with this?

**Key question for each section:**
"If an agent read ONLY this document, could it implement successfully?"

---

## Success Criteria

Your output structure is successful if:

- [ ] An agent with NO prior context could read it
- [ ] Every task has explicit file paths
- [ ] All requirements are unambiguous
- [ ] Research links are included with context
- [ ] Validation steps are exact commands
- [ ] The agent knows what "done" looks like
- [ ] You'd trust a new agent to execute this alone

**The real test:** Could you hand this to a junior developer who knows nothing about the feature and they could implement it? If yes, an agent can too.

---

## Reflection Questions

After designing your structure:

1. **What was hardest to make explicit?**
   - File paths? Task ordering? Validation criteria?

2. **Where would an agent most likely get stuck?**
   - Missing context? Ambiguous instructions? Unclear success criteria?

3. **How did you optimize for agent consumption?**
   - Structure? Detail level? Explicit ordering?

4. **What trade-offs did you make?**
   - Too much detail vs too little?
   - Flexibility vs specificity?
   - Human readable vs agent parseable?

---

## What You Learned

This exercise demonstrates **Pattern 2: Document Creation**

**Characteristics:**
- Creates documents/artifacts for future use
- Output optimized for ANOTHER AGENT
- Structured, explicit, detailed format
- Enables agent-to-agent handoff
- Used when intelligence must be reusable

**Key insight:** Designing for agent consumption is different than human consumption. Agents need explicit instructions, specific file paths, exact commands, and clear success criteria. Ambiguity is the enemy.

---

## Connection to Workflows

This pattern enables powerful workflows:

```
Session 1: Planning Agent
→ Creates detailed plan document
→ /planning user-authentication

Session 2: Coding Agent
→ Reads the plan document
→ /execute user-authentication
→ Implements following the plan

Session 3: Review Agent
→ Validates implementation
→ /validate user-authentication
```

Each agent reads the previous agent's output. The quality of your document structure determines the success of the entire workflow.

---

## Next Steps

You've now practiced both core patterns:
- **Pattern 1** (Exercise 1): Context Loading for humans
- **Pattern 2** (Exercise 2): Document Creation for agents

The difference? **Consumer optimization.**

Same Input → Process → Output framework, but the OUTPUT is designed for different consumers with different needs.

This is the essence of thinking in command patterns and workflows! 🎯
