# plan-feature: Deep Feature Planning with Template Control

**Command**: `/plan-feature [feature description]`

Feature Request: $ARGUMENTS

**Purpose**: Transform a feature request into a comprehensive, implementation-ready plan by systematically gathering context to fill a standardized template.

**Core Principle**: The template is the control mechanism. All research is organized to fill specific sections. Nothing is missed because the template specifies exactly what's needed.

---

## THE TEMPLATE STRUCTURE (CONTROL)

Every plan must fill these sections in this order:

```
# Feature: [name]

## Feature Description
## User Story
## Problem Statement
## Solution Statement
## Feature Metadata
  - Feature Type
  - Estimated Complexity
  - Primary Systems Affected
  - Dependencies

## CONTEXT REFERENCES
  ### Relevant Codebase Files
  ### New Files to Create
  ### Relevant Documentation
  ### Patterns to Follow

## IMPLEMENTATION PLAN
  ### Phase 1: Foundation
  ### Phase 2: Core Implementation
  ### Phase 3: Integration
  ### Phase 4: Testing & Validation

## STEP-BY-STEP TASKS
  (Every task: ACTION, IMPLEMENT, PATTERN, IMPORTS, GOTCHA, VALIDATE)

## TESTING STRATEGY
  ### Unit Tests
  ### Integration Tests
  ### Edge Cases

## VALIDATION COMMANDS
  ### Level 1: Syntax & Style
  ### Level 2: Unit Tests
  ### Level 3: Integration Tests
  ### Level 4: Manual Validation
  ### Level 5: Additional Validation

## ACCEPTANCE CRITERIA
  - [ ] Criterion 1
  - [ ] Criterion 2
  ...

## COMPLETION CHECKLIST
  - [ ] All tasks completed
  - [ ] All validations passed
  ...

## NOTES
```

---

## PHASE 1: FEATURE UNDERSTANDING

**Goal**: Fill these template sections:

- Feature Description
- User Story
- Problem Statement
- Solution Statement
- Feature Metadata

**Process**:

1. Parse the feature request
2. Ask clarifying questions:
   - Feature Type? (New/Enhancement/Refactor/Bug)
   - Complexity? (Low/Medium/High)
   - What systems are affected?
   - Success criteria?
3. Create User Story in: `As [user], I want [goal], So that [benefit]`
4. Clearly state the Problem being solved
5. Describe the Solution approach
6. Document Feature Metadata:
   - Type (classification)
   - Complexity (estimated)
   - Systems affected (list all)
   - Dependencies (external libraries/services)

**Validation**: Can someone understand the feature without additional questions?

---

## PHASE 2: CODEBASE INTELLIGENCE

**Goal**: Fill these template sections:

- Relevant Codebase Files (with line numbers and WHY)
- New Files to Create
- Patterns to Follow (with code examples)

**Process**:
Using Task agent (Explore) to analyze codebase:

1. **Find similar implementations**
   - Search for existing code doing similar things
   - Document file paths with line numbers
   - Extract pattern examples

2. **Map integration points**
   - What files must be modified?
   - What new files must be created?
   - Where do new components go?

3. **Extract project patterns**
   - Naming conventions (from existing code)
   - Error handling (how it's done in project)
   - Logging patterns (exact format used)
   - Type hint patterns (project conventions)
   - Testing patterns (how tests are structured)
   - Database/model patterns (if applicable)
   - API patterns (how endpoints are built)

4. **Document patterns with examples**
   - Show code snippet from actual project
   - Explain why this pattern
   - Note any variations or gotchas

**Output Format for Template**:

```markdown
### Relevant Codebase Files

- `path/to/file.py` (lines 15-45) - Why: Contains pattern for X

### New Files to Create

- `path/to/new_file.py` - Purpose description

### Patterns to Follow

**Pattern Name**:
\`\`\`python

# Code from actual project

\`\`\`

- Why this pattern: explanation
- When to use: conditions
- Common gotchas: warnings
```

**Validation**: Every file reference is specific with line numbers. Every pattern has a code example from the project.

---

## PHASE 3: EXTERNAL RESEARCH & DOCUMENTATION

**Goal**: Fill this template section:

- Relevant Documentation (with section anchors and WHY)

**Process**:
Using Task agent (general-purpose) to research:

1. **Library/framework documentation**
   - Find official docs
   - Identify specific sections needed
   - Get section anchors/links

2. **Best practices for this feature type**
   - What do experts recommend?
   - Common pitfalls?
   - Performance considerations?

3. **Version compatibility**
   - Current library versions?
   - Breaking changes?
   - Migration guides if changing libraries?

4. **Gotchas and known issues**
   - What doesn't work as expected?
   - Common mistakes?
   - Performance traps?

**Output Format for Template**:

```markdown
### Relevant Documentation

- [Documentation Title](https://example.com/docs#section)
  - Specific section: [Section Name]
  - Why: Required for implementing X

- [Best Practices Guide](https://example.com/guide#topic)
  - Specific section: [Topic]
  - Why: Shows recommended approach for Y
```

**Validation**: Every documentation link includes the specific section anchor. Every reference explains WHY it's needed.

---

## PHASE 4: STRATEGIC DESIGN & SYNTHESIS

**Goal**: Fill these template sections:

- IMPLEMENTATION PLAN (phases and their purposes)
- TESTING STRATEGY (approach to testing)
- ACCEPTANCE CRITERIA (what success looks like)

**Process**:

1. **Design the implementation approach**
   - How new components fit with existing
   - What needs to be built first
   - Dependencies between parts
   - Order of implementation

2. **Identify phases**
   - Phase 1: Foundation (base structures, types)
   - Phase 2: Core Implementation (main logic)
   - Phase 3: Integration (connect to existing)
   - Phase 4: Testing & Validation (verify everything)

3. **Plan testing strategy**
   - Unit tests needed (what to test)
   - Integration tests needed (what to verify)
   - Edge cases to test (what breaks?)

4. **Define acceptance criteria**
   - What must work?
   - What must be tested?
   - What validates success?

**Output Format for Template**:

```markdown
## IMPLEMENTATION PLAN

### Phase 1: Foundation

<Description of what this phase accomplishes>

**Tasks:**

- Set up X structure
- Create Y utilities
- Configure Z

### Phase 2: Core Implementation

<Description>

**Tasks:**

- Implement A
- Create B service
- Add C endpoints
```

**Validation**: Clear phase breakdown. Each phase has clear purpose. No ambiguity.

---

## PHASE 5: STEP-BY-STEP TASK GENERATION

**Goal**: Fill this template section:

- STEP-BY-STEP TASKS (exact implementation steps)

**Critical**: Each task must include:

- **ACTION**: CREATE/UPDATE/ADD/REMOVE/REFACTOR/MIRROR
- **TARGET**: Specific file path
- **IMPLEMENT**: What to implement
- **PATTERN**: Reference to codebase pattern (file:line)
- **IMPORTS**: Exact imports needed
- **GOTCHA**: Known pitfalls and how to avoid
- **VALIDATE**: Executable command to verify task completion

**Process**:

1. Break down phases into atomic tasks
2. Order by dependency (what must happen first)
3. For EACH task, specify:
   - Exactly what to implement (code-level detail)
   - Pattern from Phase 2 to follow (exact file:line)
   - Imports required (copy-paste ready)
   - Gotchas specific to this project
   - How to verify success (runnable command)

**Output Format for Template**:

````markdown
## STEP-BY-STEP TASKS

### CREATE app/features/x/service.py

- **IMPLEMENT**: Class XService with method do_something()
- **PATTERN**: Follow pattern in app/core/logging.py:45-62
- **IMPORTS**:
  ```python
  from pydantic_ai import Agent
  from app.core.logging import get_logger
  ```
````

- **GOTCHA**: Don't pass system_prompt to agent.run(), already initialized
- **VALIDATE**: `uv run mypy app/features/x/service.py`

````

**Validation**: Every task is atomic. Every task has validation command. No task leaves uncertainty.

---

## PHASE 6: QUALITY VALIDATION

**Goal**: Fill these template sections:
- VALIDATION COMMANDS (all verification steps)
- COMPLETION CHECKLIST (how to know you're done)
- NOTES (risks, trade-offs, decisions)

**Process**:

1. **Validation commands for EVERY phase**
   - Syntax check: ruff format, ruff check
   - Type check: mypy, pyright
   - Unit tests: pytest commands
   - Integration tests: pytest with markers
   - Manual validation: curl/browser/tool commands

2. **Completion checklist**
   - All tasks done?
   - All validations passed?
   - All acceptance criteria met?
   - Code review ready?

3. **Risk assessment**
   - What could go wrong?
   - How to mitigate?
   - Confidence score (1-10)?
   - Reasoning for score?

**Output Format for Template**:
```markdown
## VALIDATION COMMANDS

### Level 1: Syntax & Style
\`\`\`bash
uv run ruff format app/features/x/
uv run ruff check app/features/x/
\`\`\`

### Level 2: Type Checking
\`\`\`bash
uv run mypy app/features/x/
uv run pyright app/features/x/
\`\`\`

...

## ACCEPTANCE CRITERIA

- [ ] Feature implements all specified functionality
- [ ] All validation commands pass
- [ ] Unit test coverage >=80%
- [ ] Integration tests verify end-to-end
- [ ] Code follows project patterns
- [ ] No regressions in existing features

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed
- [ ] Full test suite passes
- [ ] No type checking errors
- [ ] Manual testing confirms feature works
- [ ] Acceptance criteria all met

## NOTES

**Key Design Decisions**:
- Why this approach over alternatives
- Trade-offs made and why
- Risks identified and mitigations

**Confidence Score**: #/10
- Strengths: [What's clear]
- Uncertainties: [What might change]
- Mitigations: [How we'll handle]
````

**Validation**: Every command is copy-paste ready. Acceptance criteria is measurable. Confidence score is justified.

---

## THE COMPLETE FLOW

```
INPUT: Feature request
  ↓
PHASE 1: Clarification
  → Fills: Description, User Story, Problem, Solution, Metadata
  ↓
PHASE 2 & 3: PARALLEL Research
├─ Codebase Analysis
│  → Fills: Codebase Files, New Files, Patterns
└─ External Research
   → Fills: Documentation References
  ↓
PHASE 4: Strategic Synthesis
  → Fills: Implementation Plan, Testing Strategy
  ↓
PHASE 5: Task Generation
  → Fills: Step-by-Step Tasks (with IMPLEMENT, PATTERN, IMPORTS, GOTCHA, VALIDATE)
  ↓
PHASE 6: Quality Validation
  → Fills: Validation Commands, Acceptance Criteria, Checklist, Notes
  ↓
OUTPUT: Comprehensive plan with complete template filled
```

**Every template section is filled. Nothing is missed. Output is standardized.**

---

## WHAT MAKES THIS OPTIMAL

✅ **Template Driven**: Every plan has identical structure

✅ **Nothing Missed**: Template enforces completeness

✅ **Specific**: File paths, line numbers, imports, commands

✅ **Parallel**: Research happens simultaneously

✅ **Validated**: Each phase verifies its output

✅ **Standardized**: Consistent output every time

---

## Success Criteria for Generated Plan

The plan is complete when:

- [ ] Every template section is filled (not generic, specific to this feature)
- [ ] All codebase files identified (with line numbers and WHY)
- [ ] All documentation referenced (with section anchors and WHY)
- [ ] All patterns documented (with code examples from project)
- [ ] Every task is atomic and ordered (can execute top-to-bottom)
- [ ] Every task has validation command (executable verification)
- [ ] All gotchas documented (specific to this project)
- [ ] Testing strategy is clear (unit, integration, edge cases)
- [ ] Validation commands are all executable (not theoretical)
- [ ] Acceptance criteria are measurable (not vague)
- [ ] Confidence score is justified (with reasoning)

---

## Summary

The command executes 6 phases specifically to **fill a standardized template**. The template ensures:

✅ Nothing is missed

✅ Output is consistent

✅ Format is standardized

✅ All critical sections are included

**The template is the control. The phases feed the template.**