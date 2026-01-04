# Exercise 2 Solution: Planning Command Output Structure

**Purpose**: Reference solution demonstrating best practices for the planning command output exercise

---

## Important Note

This is an **example solution**, not the "correct" answer. Your solution may differ based on your preferences and use cases. The key is applying the pattern correctly: **output optimized for agents**.

---

## Solution: Planning Command Output Structure (for Python Projects)

**File**: `planning-output-structure.md`

```markdown
# Feature Implementation Plan

Use this structure when creating implementation plans for the coding agent for Python projects.

---

# Feature: [Feature Name]

## Feature Description

[2-3 paragraph description of what this feature does and the problem it solves. Be specific about user-facing behavior and system impact.]

## User Story

As a [specific type of user]
I want to [specific action/capability]
So that [specific benefit/outcome]

## Problem Statement

[1-2 paragraphs clearly defining the specific problem or opportunity this feature addresses. Include:
- Current pain point or limitation
- Why existing solutions don't work
- Impact of not solving this]

## Solution Statement

[2-3 paragraphs describing:
- The technical approach we're taking
- Why we chose this approach over alternatives
- Key technical decisions and trade-offs
- How this integrates with existing architecture]

**Approach Decision:**
We chose [approach name] because:
- [Reason 1]
- [Reason 2]
- [Reason 3]

**Alternatives Considered:**
- [Alternative 1]: Rejected because [reason]
- [Alternative 2]: Rejected because [reason]

---

## Relevant Files

The executing agent MUST read these files to understand existing patterns.

### Core Project Files
- `CLAUDE.md` - Project principles, logging rules, testing requirements, docstring style
- `[file-path]` - [why relevant, what pattern/convention to learn]

### Similar Features (Examples to Follow)
- `[file-path]` (lines X-Y) - [specific pattern demonstrated]
- `[file-path]` - [example of similar implementation]

### Architecture Context
- `[file-path]` - [structural pattern to follow]

---

## Research Documentation

Use these resources for implementation guidance.

### Library Documentation
- [Library Name - Specific Feature](https://docs.example.com/path#anchor)
  - Section: [Specific section name]
  - Summary: [What to learn from this - 1-2 sentences]
  - Use for: [When to reference this during implementation]

### API References
- [API Name - Endpoint Docs](https://api.example.com/reference#endpoint)
  - Endpoint: [Specific endpoint details]
  - Parameters: [Key parameters to understand]
  - Use for: [Which implementation step needs this]

### Implementation Examples
- [Example Title](https://github.com/repo/file.py#L10-L50)
  - Pattern shown: [What pattern this demonstrates]
  - Adapt for: [How to adapt to our use case]

---

## Implementation Plan

### Phase 1: Foundation
[What foundational work must happen first?]
- Schemas/types to define
- Shared utilities to create
- Dependencies to add (`uv add [package]`)

### Phase 2: Core Implementation
[What's the main feature implementation?]
- Core functionality to build
- Integration points to implement
- Business logic to add

### Phase 3: Integration & Validation
[How does this integrate and how do we validate?]
- Integration with existing features
- Testing strategy
- Validation approach

---

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom. Do not skip steps.

### Task 1: [Foundational Task Name]
**File**: `[exact/path/to/file.py]` (create new)

Create the [schema/type/utility]:
- Define [Specific model/class name] with:
  - `field_name: Type` - [purpose and validation rules]
  - `field_name: Type` - [purpose and validation rules]
- Include Google-style docstring
- Add type hints for all fields
- Follow pattern from: `[reference-file.py]` lines [X-Y]

**Validation**:
- `uv run mypy [file]` passes with 0 errors

---

### Task 2: [Implementation Task Name]
**File**: `[exact/path/to/file.py]` (create new OR modify existing)

Implement [Specific function/class]:
- Function signature: `async def function_name(param: Type) -> ReturnType:`
- Use [Specific model] from Task 1 for [purpose]
- Add structured logging:
  - Log entry: `logger.info("operation_started", [context])`
  - Log success: `logger.info("operation_completed", [metrics])`
  - Log errors: `logger.exception("operation_failed", fix_suggestion="[guidance]")`
- Follow pattern from: `[reference-file.py]`

**Validation**:
- `uv run ruff check [file]` passes
- `uv run mypy [file]` passes

---

### Task 3: [Testing Task Name]
**File**: `tests/[path]/test_[module].py` (create new)

Create unit tests marked with `@pytest.mark.unit`:

**Test 1: Happy path**
@pytest.mark.unit
async def test_[feature]_success():
    # Test successful execution with valid input
    # Assert expected behavior
    # Verify logging output

**Test 2: Edge case - [Specific case]**
@pytest.mark.unit
async def test_[feature]_[edge_case]():
    # Test [specific edge case]
    # Assert proper handling

**Test 3: Error case - [Specific error]**
@pytest.mark.unit
async def test_[feature]_[error_case]():
    # Test error handling for [specific error]
    # Assert proper exception raised
    # Verify error logging

**Validation**:
- `uv run pytest tests/[path] -v` - all tests pass

---

### Task 4: [Integration Task Name]
**File**: `[exact/path/to/file.py]`

Integrate with [existing feature]:
- Register [component] with [system]
- Add [integration point] in [location]
- Update [configuration] to include [settings]
- Follow integration pattern from: `[reference-file.py]`

**Validation**:
- Feature accessible through [entry point]
- No breaking changes to existing features

---

### Task 5: Final Validation
Run all validation commands in order:

# 1. Lint check (must pass)
uv run ruff check src/

# 2. Type check (must pass)
uv run mypy src/

# 3. Unit tests (must pass)
uv run pytest tests/ -m unit -v

# 4. Integration tests (if applicable)
uv run pytest tests/ -m integration -v

# 5. Full test suite (must pass)
uv run pytest tests/ -v

All commands must complete with 0 errors and all tests passing.

---

## Testing Strategy

### Unit Tests
**Location**: `tests/[module]/test_[file].py`
**Mark with**: `@pytest.mark.unit`

Test in isolation:
- [Component 1] - [what to test]
- [Component 2] - [what to test]
- Each function's happy path
- Each function's error cases

### Integration Tests (if applicable)
**Location**: `tests/integration/test_[feature].py`
**Mark with**: `@pytest.mark.integration`

Test component interaction:
- [Integration point 1] - [what to test]
- [Integration point 2] - [what to test]
- End-to-end workflows
- External system interactions

### Edge Cases
Must test:
- [Edge case 1: Description] - [Expected behavior]
- [Edge case 2: Description] - [Expected behavior]
- [Edge case 3: Description] - [Expected behavior]
- Empty/null inputs - [Expected behavior]
- Maximum limits - [Expected behavior]

---

## Acceptance Criteria

This feature is complete when:

- [ ] [Specific criterion 1 - measurable]
- [ ] [Specific criterion 2 - measurable]
- [ ] All linters pass (ruff + mypy)
- [ ] All tests pass (unit + integration)
- [ ] Feature works as described in User Story
- [ ] No regressions in existing features
- [ ] Documentation updated (if applicable)
- [ ] Logging includes structured context

---

## Validation Commands

Execute these exact commands to validate success:

# Linting (MUST pass with 0 errors)
uv run ruff check src/

# Type checking (MUST pass with 0 errors)
uv run mypy src/

# Unit tests (MUST pass - all tests)
uv run pytest tests/ -m unit -v

# Integration tests (if applicable - MUST pass)
uv run pytest tests/ -m integration -v

# Full test suite (MUST pass - 100% success rate)
uv run pytest tests/ -v

# Manual testing (if applicable)
# [Specific manual test steps if needed]

**Success definition**: All commands complete with exit code 0, all tests pass, no errors or warnings.

---

## Notes

[Include any additional context such as:
- Future considerations or planned improvements
- Known limitations of this approach
- Deployment considerations
- Performance implications
- Security considerations
- Breaking change warnings]

---

## Checklist Before Starting Implementation

The executing agent should verify:
- [ ] Read all files in "Relevant Files" section
- [ ] Reviewed all research documentation
- [ ] Understood the solution approach
- [ ] Clear on step-by-step task order
- [ ] Validation commands are executable in this environment
- [ ] Ready to execute tasks in sequence

If any checklist item is unclear, ask for clarification before starting.
```

---

## Why This Solution Works

**For Exercise 2 (Document Creation for Agents):**

✅ **Complete context loading**
- Feature description, user story, problem/solution statements
- No assumptions about prior knowledge

✅ **Explicit file references**
- Exact paths to read
- Line numbers where helpful
- Clear purpose for each file

✅ **Structured research**
- Direct links with anchors
- Summaries of what to learn
- When to use each resource

✅ **Unambiguous tasks**
- Exact file paths
- Specific models/functions to create
- Field-level details
- Reference patterns to follow

✅ **Built-in validation**
- After each task
- Final comprehensive validation
- Exact commands to run
- Clear success criteria

✅ **Agent-optimized structure**
- No ambiguity in instructions
- Step-by-step ordering enforced
- All information provided upfront
- Checklist before starting

**What makes it work for agents:**
- Explicit file paths
- Specific field names
- Exact commands
- Clear ordering
- Validation checkpoints
- Complete context
- No assumptions

---

## Using This Solution

**Don't copy blindly!** Instead:

1. **Understand the pattern** - Why each section exists
2. **Adapt to your needs** - Your tech stack, your workflows
3. **Test with real use** - Does it actually work for your agents?
4. **Iterate and improve** - Refine based on experience

The best command is the one that works for YOUR workflow and YOUR agents.

---

## Reflection: Pattern Recognition

This exercise applied the Input → Process → Output framework optimized for agent consumption:

- **Input**: Research and planning work
- **Process**: Structure for execution
- **Output**: Agent-readable plan for implementation

**Key insight:** When the output consumer is an agent, optimize for explicitness, specificity, and complete context.

---

## Key Differences from Exercise 1

| Aspect | Exercise 1 (Human) | Exercise 2 (Agent) |
|--------|-------------------|-------------------|
| **Output length** | Concise (scannable) | Detailed (explicit) |
| **Structure** | Bullets and headers | Step-by-step tasks |
| **Specificity** | Highlights and summaries | Exact paths and commands |
| **Validation** | Quick confirmation | Comprehensive checkpoints |
| **Tone** | Conversational | Instructional |
| **Goal** | Verify understanding | Enable execution |

**Same framework (Input → Process → Output), different optimization.** That's the power of thinking in patterns!
