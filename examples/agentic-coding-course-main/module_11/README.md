# Subagents: Parallel AI Execution & Context Isolation

This module covers how to build and leverage subagents in Claude Code to parallelize work, isolate context, and create specialized AI assistants for specific tasks within your agentic coding system.

## What You'll Learn

### 11.1 - The Fundamentals of Subagents

Understanding what subagents are, how they work, and the critical mental model for context flow.

**Core Concepts:**

- Subagents as isolated context windows with custom system prompts
- The Task tool and how main agents delegate to subagents
- Context handoff mechanics (User → Main → Sub → Main → User)
- Key benefits: parallelization, context compression, and isolation

**Critical Insight:** The real power of subagents isn't just context isolation - it's the ability to run up to 10 agents in parallel for simultaneous research and exploration.

---

### 11.2 - Subagents in Action

Practical demonstrations of creating, configuring, and using subagents in real workflows.

**What's Covered:**

- Built-in agents: Explore, Plan, and General Purpose
- Creating custom subagents via `/agents` command or manual markdown files
- Parallel research workflows (5+ agents exploring different aspects simultaneously)
- Code review agents with controlled output formats
- Preventing unwanted automation (controlling what the main agent does after subagent completion)

**Key Learning:** The **output format** in your subagent's system prompt is the most critical part - it controls what your main agent sees and how it responds to the subagent's findings.

---

### 11.3 - Build Your Own Subagents

Hands-on exercise creating a system review agent with proper role definition, context gathering, and structured outputs.

**Exercise Goal:** Build a subagent that analyzes execution reports against plans to check for:

- Plan adherence
- Divergence classification (good vs bad)
- Root cause analysis
- System improvement recommendations

**Critical Components:**

1. **Role Definition** - Clear mission and purpose
2. **Context Gathering** - What files and info does it need?
3. **Approach/Steps** - Specific instructions for accomplishing the mission
4. **Output Format** - Structured, parsable results for downstream use

---

## When to Use Subagents

**✅ Great For:**

- Parallel research before implementation (5-10 simultaneous explorations)
- Code review with controlled feedback loops
- System compliance checks across multiple modules
- Plan vs execution analysis
- Context-heavy tasks that would pollute main thread

**❌ Not Ideal For:**

- Simple sequential tasks
- Priming your main agent (context gets lost in handoff)
- Tasks requiring ALL context, not summaries

---

## The Context Handoff Problem

```
You → Main Agent → Subagent → Main Agent → You
         ↓              ↓
    Handoff #1     Handoff #2
   (Can lose       (Can lose
    context)        context)
```

**Solution:** Obsessively control output formats. Make them:

- Structured and parsable
- Include metadata (files reviewed, line numbers, severity)
- Explicit about what main agent should do next
- Easy to combine with other agents/commands downstream

---

## File Structure

Subagents live in `.claude/agents/*.md` with front matter configuration:

```markdown
---
name: Your Agent Name
description: Clear description of when to use this agent
model: haiku | sonnet | opus
tools: ["*"] # or specific tool list
---

# Your agent's system prompt goes here

Define its role, approach, and output format
```

---

## Best Practices

1. **Parallelize Research** - Don't use subagents sequentially when you can run 5-10 simultaneously
2. **Control Output Format** - This is your primary lever for reliable workflows
3. **Include Metadata** - Files analyzed, line numbers, severity levels make results actionable
4. **Test the Handoffs** - Verify what the main agent receives matches what you expect
5. **Make Outputs Parsable** - Structure findings so other commands/agents can consume them

---

## Advanced: Meta Agents

Consider creating a "meta agent" - your own version of `/agents` that generates new subagents following YOUR standards and patterns. This creates consistency across all your subagents and encodes your preferences into the agent creation process itself.

---

## What's Next

After mastering subagents, you'll have the building blocks to create complex, parallel workflows that can:

- Research 10 different aspects of a problem simultaneously
- Run specialized reviews across your entire codebase in parallel
- Maintain focused, unpolluted context in your main conversation
- Build reusable expert agents for recurring tasks

The combination of subagents + slash commands + validation creates a powerful, reliable AI coding system where you control the quality and flow of work.
