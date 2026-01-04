# The 5-Level Validation Pyramid

Each level gates the next. Don't proceed if a level fails.

```
        Level 5: Human Review
              (Alignment with intent)
                    |
        Level 4: Integration Tests
              (System behavior)
                    |
        Level 3: Unit Tests
              (Isolated logic)
                    |
        Level 2: Type Safety
              (Type checking)
                    |
        Level 1: Syntax & Style
              (Linting, formatting)
```

---

## Level 1: Syntax & Style

**What:** Code format and linting rules

**Why:** Catch obvious errors fast

**Tools:** ruff, black, prettier, eslint

**Example commands:**

```bash
# Python
ruff check . && black --check .

# TypeScript
npm run lint && npm run format:check
```

**AI Integration:** Run automatically after file writes

---

## Level 2: Type Safety

**What:** Type checking and static analysis

**Why:** Catch type errors before runtime

**Tools:** mypy, pyright, tsc

**Example commands:**

```bash
# Python
mypy app/

# TypeScript
tsc --noEmit
```

**AI Integration:** Run before running tests

---

## Level 3: Unit Tests

**What:** Test isolated functions and classes

**Why:** Verify logic correctness

**Tools:** pytest, jest, vitest

**Example commands:**

```bash
# Python
pytest tests/unit/ -v

# TypeScript
npm test -- --run
```

**AI Integration:** AI writes tests alongside implementation

**Common Pitfall:** AI mocking tests to pass
**Solution:** Require real test coverage, reject mocks without justification

---

## Level 4: Integration Tests

**What:** Test system interactions

**Why:** Verify components work together

**Tools:** pytest, curl, playwright

**Example commands:**

```bash
# API integration
curl -X POST http://localhost:8000/api/endpoint

# E2E tests
pytest tests/integration/ -v
```

**AI Integration:** Use curl for API testing (not interactive tools)

**Common Pitfall:** Tests depend on external state
**Solution:** Use fixtures, mock external services

---

## Level 5: Human Review

**What:** Strategic alignment check

**Why:** AI can't judge intent alignment

**Focus:**

- Does it match the plan?
- Are patterns followed?
- Is the approach sound?
- What would you change?

**Not:** Line-by-line code review (AI handles that at levels 1-4)

---

## Embedding in Plans

The plan template already includes these levels. There are many ways to prompt it, but it should look something like this.

This is the instruction the AI follows when it is creating the plan.
We can make AI self-validate and loop back the output in many ways. Here are the most obvious ones.

But AI can also use a CLI tool, any MCP server, or you can also build your custom validation tools that you can give your agent to help with this step. Designing these validation methods for your AI coding agent I believe is the future of reliable AI coding.

> But also sometimes you want to run just the validation outside of in an embedded plan, that is what the `validate.md` command is for!

## Validation as Feedback

When validation fails, it reveals:

- Missing context in the plan
- Unclear requirements
- Patterns to document
- Commands to improve

**Don't just fix the bug. Fix the system that allowed the bug.**

**When you see the same validation failures repeatedly, that's a signal to improve your system - not just your code.** We'll learn exactly how to do this in the System Review exercise (Module 7.4), where you'll build the tools to analyze patterns and improve your AI coding system.