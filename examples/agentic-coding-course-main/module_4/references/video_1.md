# Video 1: Why Slash Commands Matter - The Agent Perspective

**Duration**: 12-15 minutes
**Purpose**: Understand WHY slash commands are strategically valuable and learn to think from the agent's perspective

---

## Meta Key Points

**Core Message**: Slash commands eliminate re-prompting and enable strategic context loading. The key to effective commands is thinking from the agent's perspective: what does it see, what should it do, what should it output?

**Connection**: Video 0 explained WHAT slash commands are (the mechanism). Now we learn WHY they matter strategically and HOW to think about designing them.

**Student Outcome**: Students understand the strategic value of slash commands and can apply the agent perspective framework (Input → Process → Output) to design effective commands.

---

## What Students Learn

- Why slash commands matter: Eliminate re-prompting, standardize workflows
- The re-prompting tax: Time wasted typing the same thing repeatedly
- Agent perspective framework: Input → Process → Output
- Thinking about what the agent sees vs what you want it to produce
- Team standardization and knowledge sharing benefits
- How commands enable compound learning and improvement

---

## Content Outline

### [0:00-1:30] Hook & Introduction

**Hook**: "You've re-prompted the same thing 5 times this week. 'Review this code for bugs and suggest improvements.' Type it again. And again. What if you never had to type it again?"

**Setup**:

- Video 0: You know WHAT slash commands are (mechanism)
- Now: WHY they matter strategically and HOW to think about them
- Key insight: It's not just about saving typing - it's about thinking from the agent's perspective
- Strategic value: Eliminate waste, standardize excellence, compound learning

---

### [1:30-4:30] Part 1: The Re-Prompting Tax

**Key Point**: Every time you re-type the same prompt, you're paying a tax - and the cost is higher than you think, i like to create a slash command for everything i find myself typing more than 3 times.

**Content**:

**The Pattern:**

You find yourself typing variations of:

- "Review this code for bugs, security issues, and performance problems"
- "Create a commit following our team's commit message standards"
- "Explain this code in simple terms with examples"
- "Analyze this for test coverage and suggest improvements"

**The Hidden Costs:**

1. **Time waste** (obvious)
   - 30 seconds to type prompt × 5 times/day = 2.5 min/day
   - Over a year: 10+ hours just re-typing

2. **Inconsistency** (subtle)
   - Sometimes you forget parts of the prompt
   - "Review for bugs followed by a specific workflow" vs "Review for bugs and security following a different workflow"
   - Inconsistent results from inconsistent prompts

3. **No improvement (systemize)** (critical)
   - You're not iterating on the prompt
   - Can't compound learning from what works
   - In order to improve your review process, save it and tweak it over time.
   - Every use is a fresh start

4. **Knowledge not shared** (team cost)
   - Your refined prompt lives only in your head
   - Teammates discover patterns independently
   - No team standardization

**The Slash Command Solution:**

Create once, refine continuously, invoke instantly:

```markdown
# .claude/commands/review.md

Review this code with focus on:

- Security vulnerabilities (SQL injection, XSS, auth issues)
- Performance bottlenecks (N+1 queries, unnecessary loops)
- Bug patterns (null checks, error handling, edge cases)
- Code style violations per our team standards

Provide specific line numbers and concrete suggestions.
```

Usage: `/review`

**Benefits:**

- Type 8 characters instead of 200+
- Consistent prompt every time
- Refine once, improve everywhere
- Share with team via git

---

### [4:30-8:30] Part 2: The Agent Perspective

**Key Point**: Effective commands require thinking from the agent's perspective - what does it see, what should it do, what should it output?

**Content**:

**The Core mental model for writing effective slash commands: Input → Process → Output**

Every slash command should be designed by answering at minimum these three questions:

**1. INPUT: What does the agent NEED to see?**

The agent has:

- Your prompt text (the command content)
- Access to codebase files (if you guide it)
- Its training data knowledge
- Web search capabilities
- Any other capability you give it

The agent doesn't have:

- Context about your project (unless you provide it)
- Knowledge of what files matter (unless you specify)
- Understanding of your goals (unless you state them)

**Question to ask yourself:**
"What context is missing that would prevent success?"

**2. PROCESS: What should the agent DO?**

The agent will:

- Follow explicit instructions you provide
- Make reasonable assumptions where ambiguous
- Use tools it's allowed to use

The agent won't:

- Guess at unstated preferences
- Know your team's specific workflow
- Understand implicit context

**Question to ask yourself:**
"What steps should the agent follow to achieve the goal?"
"What would I/an experenced enginener need to know to complete the same task"

**3. OUTPUT: What do you WANT back?**

The agent can produce:

- Analysis and recommendations
- Code implementations
- Structured documents
- Artifacts and files

The agent's default:

- Conversational explanation
- No specific structure unless requested

**Question to ask yourself:**
"What format/structure makes this output useful?"
"Will the output be read by me or another agent?"
"How do i optimize the output for the next agent or my own eyes based on me needs"

**The Framework in Practice:**

**Bad Command (Missing Agent Perspective):**

```markdown
# Bad: No context, vague process, no output structure

Review this code
```

**What happens:**

- Agent doesn't know what to look for (no INPUT context)
- Agent does generic review (vague PROCESS)
- Agent returns unstructured thoughts (no OUTPUT guidance)

**Good Command (Agent Perspective Applied):**

```markdown
# Good: Clear INPUT, explicit PROCESS, structured OUTPUT

## Context (INPUT)

You are reviewing code for a FastAPI application using:

- Python 3.12 with strict type hints
- Pydantic for validation
- pytest for testing

## Process (PROCESS)

Analyze the code for:

1. Type safety issues (missing hints, incorrect types)
2. Pydantic validation errors (missing validators)
3. Testing gaps (uncovered edge cases)
4. FastAPI patterns (proper dependency injection, route structure)

## Output Format (OUTPUT)

For each issue found:

- **File:Line**: Specific location
- **Issue**: What's wrong
- **Suggestion**: Concrete fix with code example
- **Priority**: Critical/High/Medium/Low
```

**What happens:**

- Agent knows the tech stack and standards (clear INPUT)
- Agent follows systematic review process (explicit PROCESS)
- Agent returns structured, actionable feedback (guided OUTPUT)

**The Mental Model:**

Every command is a contract with the agent:

- "Here's what you know" (INPUT)
- "Here's what you do" (PROCESS)
- "Here's what I want" (OUTPUT)

**Show/Demo**:

- Side-by-side comparison: Bad vs Good command
- Show actual agent output from each
- Highlight where good command produced better results
- Walkthrough: Applying framework to design new command

---

### [8:30-11:30] Part 3: Strategic Benefits

**Key Point**: Slash commands enable compound learning, team standardization, and knowledge capture

**Content**:

**Benefit 1: Compound Learning**

Without commands:

- Discover what works
- Forget specifics next week
- Rediscover same insights
- No progress accumulated

With commands:

- Discover what works
- Update command with improvement
- Every future use benefits from learning
- Continuous refinement compounds

**Example evolution:**

```markdown
# Version 1 (basic)

Review this code

# Version 2 (learned to be specific)

Review this code for bugs and security issues

# Version 3 (learned project context matters)

Review this FastAPI code for bugs, security, and type safety

# Version 4 (learned output structure helps)

[Full structured command with INPUT/PROCESS/OUTPUT]
```

Each version captures learning. Future you benefits from past discovery.

**Benefit 2: Team Standardization**

Project commands in `.claude/commands/` = team knowledge:

**Example: Code Review Standards**

```markdown
# .claude/commands/review-pr.md

Team's agreed-upon code review checklist becomes reusable command
Everyone reviews with same thoroughness
New team members get instant access to standards
Command evolves as team learns
```

**Benefits:**

- New team members: Instant access to team standards
- Consistency: Everyone follows same process
- Evolution: Team improves command together
- Documentation: Implicit knowledge becomes explicit

**Benefit 3: Context Reusability**

Good commands load relevant context on-demand:

**Example: API Patterns Command**

```markdown
# .claude/commands/api-patterns.md

When building APIs, read our patterns:
@docs/api-conventions.md
@examples/api-endpoints/user-routes.py

Follow these patterns for:

- Route structure
- Dependency injection
- Error handling
- Response models
```

**Benefits:**

- Can load Layer 1 constants when needed (applying Module 3 strategy)
- No manual "please read these files" every time
- Patterns always accessible, never forgotten
- Team patterns centralized and versioned

**Benefit 4: Workflow Automation**

Commands can orchestrate multi-step workflows:

**Example: Commit Command**

```markdown
# .claude/commands/commit.md

1. Check git status
2. Review diff
3. Analyze changes for logical grouping
4. Create conventional commit message
5. Stage files and commit

Report back:
Added lines:
Removed lines:
Modified lines:
files changed:
```

**Benefits:**

- Reduce multi-step workflows to one command
- Never skip steps (automated checklist)
- Consistent execution every time
- Capture best practices as code

**Show/Demo**:

- Show command evolution over time (git history)
- Demonstrate team using shared command
- Show context loading command with file references
- Execute workflow command showing multi-step process

---

### [11:30-13:00] Part 4: Building Your Command Mindset

**Key Point**: Start simple, iterate based on use, think from agent's perspective

**Content**:

**The Command Development Process:**

**Step 1: Notice Re-Prompting**

- "I've typed this 3 times this week"
- Candidate for command

**Step 2: Extract to Command**

- Create simple version
- Basic prompt as starting point

**Step 3: Use and Observe**

- What works well?
- What's missing?
- Where does the agent struggle?

**Step 4: Apply Agent Perspective**

- INPUT: What context is missing?
- PROCESS: What steps are unclear?
- OUTPUT: What structure would help?

**Step 5: Refine and Iterate**

- Update command with improvements
- Every use is a chance to improve
- Compound learning over time

**Don't Aim for Perfect Immediately:**

Start: `Review this code for bugs`

Refine: Add security checks, performance checks

Refine: Add project context (tech stack, patterns)

Refine: Add output structure (specific format)

Refine: Add examples of what good looks like

Each refinement makes command more valuable.

**The Habit to Build:**

Every time you re-prompt, ask:

- "Will I need this again?"
- If yes → Create command
- If command exists → Refine it

**Show/Demo**:

- Live refinement of a command
- Show git diff of command improvements
- Demonstrate the thought process of applying agent perspective

---

### [13:00-15:00] Closing - The Agent Perspective Mindset

**Key Takeaway**:

"Slash commands eliminate re-prompting and enable strategic context loading. The key to effective commands is the agent perspective framework:

1. **INPUT**: What does the agent need to see?
2. **PROCESS**: What should the agent do?
3. **OUTPUT**: What format do you want back?

Strategic benefits:

- Compound learning (refine once, improve forever)
- Team standardization (shared excellence)
- Context reusability (load on-demand)
- Workflow automation (multi-step processes)

Next: Layer 1 vs Layer 2 commands and real patterns from the workshop project."

**Bridge to Next**:

"You understand WHY commands matter and HOW to think about them from the agent's perspective.

Next: The distinction between Layer 1 commands (reusable patterns for task types) and Layer 2 commands (task-specific intelligence). You'll see real examples and learn when to use each pattern."

---
