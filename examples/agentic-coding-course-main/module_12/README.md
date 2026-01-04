# Parallel Agentic Coding: From Research to Implementation

This module goes beyond subagent parallelization to cover parallel implementation workflows - running multiple coding agents simultaneously on the same codebase using git worktrees and remote execution tools.

## What You'll Learn

### 12.1 - Strategies and Considerations for Parallel Agentic Coding

Understanding the landscape of parallelization options and when to use each.

**Parallelization Patterns:**

1. **Subagents** - Easiest, covered in Module 11
2. **Terminal per agent** - Multiple Claude Code instances in separate terminals
3. **Git worktrees** - Isolated working directories for parallel implementation
4. **Containers/VMs** - Dev containers, Docker, Dagger, cloud environments

**What's Easy to Parallelize:**

- Context gathering and research
- Web scraping and searches
- Competitor/feasibility analysis
- Multi-source code exploration

**What's Harder (but possible):**

- Implementation work - agents writing code simultaneously
- Requires proper architecture (vertical slice) to minimize conflicts
- The more capable agents become, the more this matters

**Key Insight:** Vertical slice architecture enables parallel implementation by isolating features into independent modules. One agent works on feature A, another on feature B - minimal risk of stepping on each other's toes.

---

### 12.2 - Parallel Agentic Coding with Git Worktrees

Hands-on demonstration of implementing multiple features simultaneously using git worktrees.

**What's Covered:**

- Setting up worktrees with custom `/new-work-trees` command
- Running Claude Code instances in separate worktrees
- Executing plans in parallel (`/execute` in each worktree)
- Merging completed work back with `/merge-work-trees`
- Managing conflicts and keeping commits clean

**The Demonstration:**

- Rolled back codebase to single-tool state
- Created two worktrees: `manage-notes` and `manage-folders`
- Ran implementation in parallel (2 Claude Code instances)
- Both completed in ~30 minutes vs ~1 hour sequentially

**Scalability Insight:** With proper patterns established (good first feature, documented standards, vertical slices), you could theoretically run 10+ parallel implementations - getting 90-100% of the way there on each.

**Best Practices:**

- Keep commits separate for easy review (by humans AND agents)
- Test features in isolation before merging
- Trust validation, but verify manually for critical paths
- Small bug fixes can run on same branch; large features need worktrees

---

### 12.3 - Out of the Box Remote Coding Solutions

Overview of cloud-based parallel coding tools from major providers.

**Tools Covered:**

- **Google Jules** - `jules.google.com`, connects to GitHub repos
- **OpenAI Codex** - Similar cloud-based agent execution
- **Claude Code Web** - Remote Claude Code with configurable environments
- **Cursor Agent Mode** - Cursor 2's agent-first interface
- **Archon** - Open source with agent work orders

**How They Work:**

1. Connect to your GitHub repository
2. Send a task/prompt
3. Tool spins up isolated environment
4. Agent clones repo, does work
5. Creates PR with changes

**Current Limitation:**

These tools don't use YOUR custom commands, system prompts, or workflows. They use their default patterns, not your carefully crafted `/plan`, `/execute`, `/code-review` commands.

**The Future:**

More control over remote agent workflows is coming. The goal is to mirror YOUR exact environment - commands, MCP servers, patterns - in the remote execution context.

---

## The Architecture That Enables This

Parallel implementation works because of proper codebase structure:

```
project/
├── app/
│   ├── agent/          # Agent configuration
│   ├── core/           # Shared infrastructure
│   ├── features/       # Vertical slices (tools/endpoints)
│   │   ├── tool_a/     # Agent 1 works here
│   │   ├── tool_b/     # Agent 2 works here
│   │   └── tool_c/     # Agent 3 works here
│   └── shared/         # Shared utilities
```

**Why it works:**

- Each feature is isolated in its own directory
- Agents rarely touch the same files
- Merge conflicts are minor (usually just `main.py` registrations)
- Patterns established in one feature guide all others

---

## Parallelization Comparison

| Approach | Setup Complexity | Isolation | Speed Gain | Use Case |
|----------|------------------|-----------|------------|----------|
| Subagents | Low | Context only | 2-5x | Research, analysis |
| Multiple terminals | Low | None | 2x | Quick parallel tasks |
| Git worktrees | Medium | Full | 2-10x | Feature implementation |
| Containers/Cloud | High | Complete | Unlimited | Large-scale parallel work |

---

## Key Commands for Worktree Workflow

**Setup:**
```
/new-work-trees [branch-1] [branch-2]
```

**Execute in each worktree:**
```
cd worktrees/[branch-name]
claude
/execute .agents/plans/[feature-plan].md
```

**Merge back:**
```
/merge-work-trees [branch-1] [branch-2]
```

---

## Industry Direction

The transcript emphasizes a major shift in how we'll code:

> "The IDE will, if not get replaced, at least look very different. The AI will write more and more of our code, and we will engineer the systems, patterns, and workflows that we want the AI to follow."

**Evidence:**

- Cursor 2 puts agent mode BEFORE the editor
- All major providers (Google, OpenAI, Anthropic) building remote agent execution
- Open source tools (Archon) enabling custom workflows in parallel execution

---

## What Unlocks True Parallel Power

1. **Good patterns first** - Build one feature really well
2. **Document everything** - Typing, logging, testing standards
3. **Vertical slice architecture** - Features don't step on each other
4. **Reusable plans** - Agents follow established patterns
5. **Validation automation** - Trust but verify at scale

---

## The Bigger Picture

**Module 11** → Parallel research with subagents (context isolation)
**Module 12** → Parallel implementation with worktrees (code isolation)

**The progression:**
```
Single agent → Subagents (research) → Worktrees (implementation) → Cloud agents (unlimited scale)
```

The future is engineering workflows and patterns, not writing every line of code yourself.
