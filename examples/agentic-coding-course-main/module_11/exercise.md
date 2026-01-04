# Exercise: Build Your System Review Subagent

**Goal**: Apply the parallelization pattern to Module 7's system review workflow using subagents.

---

## The Challenge

Module 7 introduced the `/system-review` slash command - a sequential workflow that analyzes execution reports against plans.

**Current approach (sequential):**
One agent does all analysis steps in order (~5-8 minutes)

**Your task:**
Create a `@system-reviewer` subagent that can be parallelized (~2-3 minutes)

---

## The Mental Model

Before building, understand the context flow:

```
You → Main Agent → System Review Subagent → Main Agent → You
         ↓                    ↓                   ↓
    Sends prompt        Does analysis       Receives report
    with context        in isolation        decides next action
```

**Critical handoff points:**

1. What does the main agent send TO the subagent?
2. What does the subagent send BACK to the main agent?

You control both through prompt design. This is where context gets lost if you're not careful.

---

## What You'll Build

**File**: `.claude/agents/system-reviewer.md`

A subagent that can be sent on focused missions:

1. **Plan Adherence** - Compare implementation to plan
2. **Divergence Classification** - Categorize as justified/problematic
3. **Root Cause Analysis** - Trace why divergences occurred
4. **Pattern Compliance** - Check against established standards
5. **Recommendations** - Generate improvement suggestions

---

## Step 1: Define the Configuration

Create your agent file with frontmatter configuration.

**Think about:**

- What name clearly identifies this agent's purpose?
- How should the description guide the main agent on when to use it?
- Which tools does an analyst actually need? (Hint: probably read-only)
- Which model balances capability vs speed for this task?

---

## Step 2: Define Role and Core Mission

**Think about:**

- Why does this agent exist? What's its singular purpose?
- How do you prevent it from drifting into code review territory?
- What makes this agent different from a general-purpose agent?

---

## Step 3: Define Context Gathering

**Think about:**

- What files does this agent need to read to do its job?
- What context will the main agent provide vs what must the subagent fetch?
- How do you keep context focused without missing critical information?

---

## Step 4: Define the Analysis Approach

**Think about:**

- What steps should the agent follow for each mission type?
- How should it classify divergences? What makes one "justified" vs "problematic"?
- How deep should root cause analysis go?
- What makes a recommendation actionable vs vague?

---

## Step 5: Define Output Format

This is the most critical part - it controls what the main agent sees and does next.

**Think about:**

- How can you verify the agent understood its mission? (useful for debugging)
- What structure makes findings easy to parse and act on?
- How do you ensure specificity (file paths, line numbers, evidence)?
- What instructions should you give about what the main agent should do with results?
- Should findings be saved to a file or just returned?

---

## Step 6: Test Single Mission First

Before parallelizing, test with a single focused mission.

**Verify:**

- [ ] Reads correct files
- [ ] Produces structured output
- [ ] Findings are specific and evidence-based
- [ ] Output is parsable for downstream use

Refine your prompt based on results.

---

## Step 7: Parallelize

**Option A: Parallel Missions (Same Report)**
Run multiple focused missions on the same execution report simultaneously.

**Option B: Parallel Reports (Multiple Features)**
Run the same analysis across multiple features' reports simultaneously.

---

## Step 8: Compare Results

**Sequential:**
**Parallel:**

Is the speed/cost tradeoff worth it for your workflow?

---

## Common Pitfalls

| Pitfall                    | Fix                                            |
| -------------------------- | ---------------------------------------------- |
| Vague role definition      | Be specific about the agent's singular purpose |
| No output format           | Define explicit structure for findings         |
| No main agent instructions | Tell it what to do (or not do) with results    |
| Too much context           | Specify exact files needed                     |
| Tool overreach             | Analysts don't need write access               |

---

## Success Criteria

- [ ] Created `.claude/agents/system-reviewer.md`
- [ ] Tested single mission successfully
- [ ] Parallelized across multiple missions
- [ ] Observed speed improvement
- [ ] Results are actionable

---

## Extension Challenges

1. **Add Scoring** - Numerical metrics for adherence, compliance, etc.
2. **Priority Recommendations** - P0-P3 with effort/impact estimates
3. **Trend Analysis** - Analyze patterns across multiple reports
4. **Automate with Hooks** - Trigger reviews automatically after execution

---

## The Bigger Picture

**Module 7** → Validation workflows (code review, system review)
**Module 11** → Parallelize those workflows with subagents

**The pattern:**

```
Sequential workflow → Create focused subagent → Split into parallel missions → 60% faster
```

Apply anywhere you see sequential work that can be parallelized.
