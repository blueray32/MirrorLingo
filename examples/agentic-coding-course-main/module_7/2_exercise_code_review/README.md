# Exercise: Build Your Code Review Command

The goal: Create a `/code-review` command that finds technical issues in your code.

---

## What is Code Review?

**Code review focuses on technical quality:**

- Logic errors and bugs
- Security vulnerabilities
- Performance issues
- Code smells and anti-patterns

**NOT about:**

- Plan adherence (that's system review)
- Strategic decisions (that's human review)
- Line-by-line nitpicking (that's linting)

---

## Research: How Others Do It

At Anthropic, Claude handles first pass on every PR via `/code-review`. It finds actual bugs humans miss.

**Key insight:** Automated code review should be aggressive about finding issues, not polite. You want it to catch problems before they ship.

**Common patterns:**

- Focus on changed files only (git diff)
- Severity levels (critical/high/medium/low)
- Specific line references
- Suggested fixes, not just complaints

---

## Your Task

Create `.claude/commands/code-review.md`:

Think about:

- What do you want the agent to see? (what context does the agent need to perform a code review?)
- What do you want the agent to do? (what actions does the agent need to take to perform a code review?)
- What do you want the agent to output back to you when the review is done?

Example solution for inspiration:

````markdown
---
description: Technical code review for quality and bugs that runs pre-commit
---

Perform technical code review on recently changed files.

## Core Principles

Review Philosophy:

- Simplicity is the ultimate sophistication - every line should justify its existence
- Code is read far more often than it's written - optimize for readability
- The best code is often the code you don't write
- Elegance emerges from clarity of intent and economy of expression

## What to Review

Start by gathering codebase context to understand the codebase standards and patterns.

Start by examining:

- CLAUDE.md
- README.md
- Key files in the /core module
- Documented standards in the /docs directory

After you have a good understanding

Run these commands:

```bash
git status
git diff HEAD
git diff --stat HEAD
```

Then check the list of new files:

```bash
git ls-files --others --exclude-standard
```

Read each new file in its entirety. Read each changed file in its entirety (not just the diff) to understand full context.

For each changed file or new file, analyze for:

1. **Logic Errors**
   - Off-by-one errors
   - Incorrect conditionals
   - Missing error handling
   - Race conditions

2. **Security Issues**
   - SQL injection vulnerabilities
   - XSS vulnerabilities
   - Insecure data handling
   - Exposed secrets or API keys

3. **Performance Problems**
   - N+1 queries
   - Inefficient algorithms
   - Memory leaks
   - Unnecessary computations

4. **Code Quality**
   - Violations of DRY principle
   - Overly complex functions
   - Poor naming
   - Missing type hints/annotations

5. **Adherence to Codebase Standards and Existing Patterns**
   - Adherence to standards documented in the /docs directory
   - Linting, typing, and formatting standards
   - Logging standards
   - Testing standards

## Verify Issues Are Real

- Run specific tests for issues found
- Confirm type errors are legitimate
- Validate security concerns with context

## Output Format

Save a new file to `.agents/code-reviews/[appropriate-name].md`

**Stats:**

- Files Modified: 0
- Files Added: 0
- Files Deleted: 0
- New lines: 0
- Deleted lines: 0

**For each issue found:**

```
severity: critical|high|medium|low
file: path/to/file.py
line: 42
issue: [one-line description]
detail: [explanation of why this is a problem]
suggestion: [how to fix it]
```

If no issues found: "Code review passed. No technical issues detected."

## Important

- Be specific (line numbers, not vague complaints)
- Focus on real bugs, not style
- Suggest fixes, don't just complain
- Flag security issues as CRITICAL
````

---

## Test Your Command

Try running the command in a new context window on the last piv loop cycle you just did!

If using Claude Code, save the command before you open or restart your session to ensure that you have loaded the new command.

You might also want to add the output folder to .gitignore, .agents/code-reviews as you will likely create a lot of these review files, and committing all of them can be overwhelming.

---

## Common Pitfalls

**Too verbose:** Commenting on every small thing

- **Better:** Focus on issues that could cause bugs

**Too vague:** "This function is bad"

- **Better:** "Line 42: Missing null check will crash on empty input"

**Reviewing entire codebase:** Analyzing files you didn't change

- **Better:** Only review `git diff` files

---

## Next Steps

Once your code review command works:

1. Run it before every commit
2. Refine based on what it misses

**Code review catches bugs. System review (up next) improves your process.**