# Exercise: Clean Up a Bloated CLAUDE.md

**Duration**: 20-30 minutes

**Purpose**: Split up a bloated CLAUDE.md into global rules and on-demand context

---

## The Challenge

You've been given a CLAUDE.md file from the **Obsidian CoPilot Agent** project (the project we'll build in this course).

**The problem:** It's bloated. It auto-loads 600+ lines every session, including detailed information that's only relevant for specific types of tasks.

**Your job:** Decide what stays, what should be loaded on-demand, and what might be redundant. Apply the two-question framework below to determine what is in your global rules, what is in your "on-demand" layer 1 (*task type* specific), and what goes into layer 2 (*task* specific).

---

## The Two-Question Framework

**Question 1:** Is this constant (stable, reusable) or task-specific (just for one task)?
- Constant → Layer 1, go to Q2
- Task-specific → Layer 2 (doesn't belong in CLAUDE.md at all)

**Question 2 (Layer 1 only):** Needed every session?
- YES → Auto-load in CLAUDE.md
- NO → Load on-demand

---

## The File

Open and read: `CLAUDE.md` in this directory

This is the actual (but not optimal) CLAUDE.md from the Obsidian CoPilot project. It contains:
- Core principles and architecture
- Documentation style guidelines
- Best practices for tool docstrings
- Logging rules
- Development workflow commands
- Testing patterns
- Feature addition process
- Debugging notes

---

## Your Task

### Step 1: Categorize Each Section (spend 10-15 min)

Go through the file section by section and categorize using the framework:

For each section, ask:

**Q1: Is this constant or task-specific?**
- All sections are constants (stable project knowledge)
- Nothing here is task-specific (one-time intelligence)

**Q2: Needed every session?**

Create three categories:

#### ✅ **AUTO-LOAD (Keep in CLAUDE.md)**
"Needed in EVERY session"

Criteria:
- Used across all file types
- Applies to all coding tasks
- Would break conventions if AI didn't know

#### 🔄 **ON-DEMAND (Load when needed)**
"Constants for SPECIFIC task types"

Criteria:
- Only relevant when doing specific type of work
- Stable pattern, but not always applicable
- Task-type specific (e.g., only when creating agent tools)

#### ❌ **REDUNDANT (Remove or consolidate)**
"Duplicate, obvious, or better documented elsewhere"

Criteria:
- Repeats information from elsewhere
- Universal knowledge AI already has
- Better suited to README or separate docs

---

### Step 2: Apply Your Analysis (spend 10-15 min)

Create three lists in a new file called `your-analysis.md` (tip: use an AI coding assistant to help!):

```markdown
# My CLAUDE.md Analysis

## ✅ AUTO-LOAD (Keep in CLAUDE.md)

**Sections to keep:**
- [Section name]: [Why it's needed every session]
- [Section name]: [Why it's needed every session]

**Reasoning:**
[Explain your thinking]

## 🔄 ON-DEMAND (Load when needed)

**Sections to load on-demand:**
- [Section name]: [When you'd load this / what triggers it]
- [Section name]: [When you'd load this / what triggers it]

**Reasoning:**
[Explain your thinking]

**How I'd load these:**
[Slash command? Reusable prompt? Direct instruction?]

## ❌ REDUNDANT (Remove or consolidate)

**Sections to remove:**
- [Section name]: [Why it's redundant / where it belongs instead]

**Reasoning:**
[Explain your thinking]

## Summary

**Original:** 600+ lines auto-loaded every session
**After cleanup:** [X] lines auto-loaded, [Y] lines on-demand, [Z] lines removed
**Context savings:** [Calculate rough percentage]
```

---

## Hints & Thinking Prompts

### Core Principles Section
**Think:** Do all files need TYPE SAFETY, KISS, YAGNI reminders?
- These are project-wide non-negotiables
- Used in every file, every function
- Q2 answer: ?

### Architecture Overview
**Think:** Does every task need to know vertical slice structure?
- Every feature follows this pattern
- New files must be placed correctly
- Q2 answer: ?

### Tool Docstrings for Agents (400+ lines!)
**Think:** Is this needed EVERY session?
- Very detailed guidelines with examples
- Only relevant when creating or modifying agent tools
- Not relevant for bug fixes, config changes, or non-tool work
- Q2 answer: ?

**If on-demand, when would you load it?**
- Creating new agent tool
- Modifying existing agent tool docstrings
- Reviewing tool descriptions

### Documentation Style (Google-style docstrings)
**Think:** Does every task need docstring format examples?
- Should be followed in all code
- But is it needed auto-loaded, or just when writing docs?
- Q2 answer: ?

### Logging Rules
**Think:** Are logs used in every file?
- Every function should include structured logging
- Conventions must be followed universally
- Q2 answer: ?

### Development Workflow Commands
**Think:** Do you need to know uvicorn/ruff/mypy commands every session?
- Used frequently
- But are they needed auto-loaded or can you just run them?
- Could be in README instead?
- Q2 answer: ?

### Testing Patterns
**Think:** Is test structure needed every session?
- Tests must mirror source structure
- Important pattern to follow
- But only relevant when writing tests?
- Q2 answer: ?

### Adding Features Process
**Think:** Do you need the feature addition workflow auto-loaded?
- Step-by-step process
- Only relevant when adding features (not bugs, refactors, etc.)
- Q2 answer: ?

### AI Agent Notes (Debugging)
**Think:** Compare with Logging Rules section
- Is this duplicate information?
- Does it add new value or repeat earlier content?
- Redundant check: ?

---

## Key Takeaway

**Not everything in CLAUDE.md needs to be there.**

The two-question framework helps you:
- Identify what's truly "always-needed"
- Recognize task-type specific constants (on-demand)
- Spot redundancy and bloat

**Result:** Clean context window, faster AI processing, strategic loading.
