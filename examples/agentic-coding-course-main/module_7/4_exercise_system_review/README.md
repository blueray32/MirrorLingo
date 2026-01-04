# Exercise - System Review: Process Improvement

Code review finds bugs in the current implementation. System review finds bugs in your AI coding workflow.

---

## The Distinction

**Code Review**:

- Technical quality check
- Finds logic errors, security issues, performance problems, code quality issues
- Input: Changed files and new files
- Output: Bug report with fixes

**System Review**:

- Process alignment check
- Analyzes plan adherence, pattern compliance, divergence
- Input: Implementation report + Plan file
- Output: System improvements

**Different purposes. Different commands.**

---

## Divergence Analysis

System review analyzes why implementation diverged from plan.

**Not all divergence is bad.** Analyze the reasoning:

**Good Divergence:**

- Plan assumed something that didn't exist
- Better pattern found during implementation
- Performance optimization needed
- Security issue discovered

**Bad Divergence:**

- Ignored constraints in plan
- Created new architecture vs following existing
- Shortcuts that introduce tech debt
- Misunderstood requirements

**Document both types.** Good divergence improves your plans. Bad divergence reveals unclear requirements.

---

## Prerequisites: The Execution Report

Before you can do system review, you need execution reports. Here's what that command looks like.

**For this exercise, we've already created this command for you.** Review it to understand what data the system review will analyze.

The execution report command (`.claude/commands/execution-report.md`):

```markdown
---
description: Generate implementation report for system review
---

# Execution Report

Review and deeply analyze the implementation you just completed.

## Context

You have just finished implementing a feature. Before moving on, reflect on:

- What you implemented
- How it aligns with the plan
- What challenges you encountered
- What diverged and why

## Generate Report

Save to: `.agents/execution-reports/[feature-name].md`

### Meta Information

- Plan file: [path to plan that guided this implementation]
- Files added: [list with paths]
- Files modified: [list with paths]
- Lines changed: +X -Y

### Validation Results

- Syntax & Linting: ✓/✗ [details if failed]
- Type Checking: ✓/✗ [details if failed]
- Unit Tests: ✓/✗ [X passed, Y failed]
- Integration Tests: ✓/✗ [X passed, Y failed]

### What Went Well

List specific things that worked smoothly:

- [concrete examples]

### Challenges Encountered

List specific difficulties:

- [what was difficult and why]

### Divergences from Plan

For each divergence, document:

**[Divergence Title]**

- Planned: [what the plan specified]
- Actual: [what was implemented instead]
- Reason: [why this divergence occurred]
- Type: [Better approach found | Plan assumption wrong | Security concern | Performance issue | Other]

### Skipped Items

List anything from the plan that was not implemented:

- [what was skipped]
- Reason: [why it was skipped]

### Recommendations

Based on this implementation, what should change for next time?

- Plan command improvements: [suggestions]
- Execute command improvements: [suggestions]
- CLAUDE.md additions: [suggestions]
```

This command captures what the agent actually did during implementation, including divergences, challenges, and recommendations.

---

# Exercise: Build Your System Review Command

Now that you understand execution reports, you'll create a command to analyze them.

### Your Task

Create `.claude/commands/system-review.md` that analyzes an execution report against the original plan.

**Think about:**

- What context does the agent need? (plan command, plan output, execute command, execution report)
- What analysis should it perform? (divergence classification, root cause analysis)
- What should it output? (alignment score, improvement actions)

### Key Requirements

Your command should:

- Classify divergences as justified vs problematic
- Trace root causes for problematic divergences
- Suggest specific Layer 1 asset updates
- Generate actionable improvement recommendations

### Example Solution

See `SOLUTION.md` for a complete example that follows the **Context → Instructions → Workflow → Output** pattern.

**Key features of the example:**

- Clear purpose and philosophy section
- Explicit workflow (5 analysis steps)
- Divergence classification criteria
- Structured output format with scoring rubric
- Action-oriented recommendations

---

## Test Your Command

Once you've created your system review command, test it:

**1. Generate an execution report:**

Run this in the context where you completed tool 3 implementation:

```
/execution-report
```

Save to: `.agents/execution-reports/implementation-obsidian-manage-folder.md` (or your feature name)

**2. Run your system review:**

```
/system-review [path-to-plan] [path-to-execution-report]
```

**3. Review the output:**

- What was the alignment score?
- Were divergences classified correctly?
- Are the improvement suggestions actionable?

**4. Act on findings:**

- Update CLAUDE.md with patterns discovered
- Improve plan command based on gaps found
- Create new commands for repeated manual steps

---

## Success Criteria

Your system review exercise is complete when:

- [ ] You've created `/system-review` command
- [ ] You've run it on a real implementation
- [ ] You've identified at least 3 process improvements
- [ ] You've updated at least 1 Layer 1 asset based on findings

---

## Beyond This Exercise: Apply System Review Everywhere

Once you understand system review, realize it can be applied anywhere:

**System Review Opportunities:**

- Review code-review output against the plan (Did it catch what matters?)
- Review the plan against execution (Was the plan realistic?)
- Review the `/validate` command against project documentation (Are we validating the right things?)
- Review your command library against actual usage patterns (Are commands being used as intended?)

**The pattern:** Any process with inputs and outputs can be system-reviewed for improvement.

---

## From Review to System Updates

After analyzing divergence, update the right assets:

**Update CLAUDE.md when:**

- Universal pattern discovered
- Anti-pattern identified
- Technology constraint found

**Update plan template when:**

- Missing validation step
- Unclear instruction repeated
- Clarification needed 2+ times

**Create command when:**

- Manual step done 3+ times
- Complex validation sequence
- Common debugging pattern

**Act immediately.** Don't collect learnings—update assets now, version control it and test in the next run.

---

## The Flow

```
Plan → Commit → Execute (with report) → System Review → Update Assets → Commit
  ^                                                                       |
  |_______________________________________________________________________|
```

1. Create plan
2. Execute with `/execute` → generates report
3. Review with `/system-review [report] [plan]`
4. Update assets based on review
5. Next plan benefits from updates

---

## Why This Matters

**Without system review:** You fix bugs but repeat process mistakes

**With system review:** Every implementation improves your system

**Example:**

- First time: Plan missing env vars → Implementation fails
- System review: Add "Environment Setup" to plan template
- Next time: Plan includes env vars → Implementation succeeds

**This is how you build a system that gets better with every use.**

---

## The Meta Point

**You're not just reviewing code. You're building a system that improves itself.**

Every PIV loop cycle should now include:

1. Plan → Execute → Code Review (technical quality)
2. Generate Report → System Review (process quality)
3. Update Assets (compound improvements)

This is how your AI coding system evolves from tool to partner.

---

## Decision Framework: What to Fix When Validation Fails

You now have two powerful review tools:
- `/code-review` - Finds technical issues in code
- `/system-review` - Finds process issues in your workflow

**But which one matters for each validation failure?**

### The Decision Tree

When validation fails, ask:

**Is this the first time?**
- ✅ Yes → Fix the code, move on
- ❌ No, I've seen this before → Continue below

**Does this happen across MANY features?**
- ✅ Yes → Fix Layer 1 (CLAUDE.md)
- ❌ No, just certain types → Continue below

**Does this happen for a CLASS of features?**
- ✅ Yes → Fix Layer 1 (On-Demand Context) or Fix Commands/Templates
- ❌ No, just this feature → Fix the code

**Have I done this manually 3+ times?**
- ✅ Yes → Create automation (new command)
- ❌ No → Note it, wait for pattern