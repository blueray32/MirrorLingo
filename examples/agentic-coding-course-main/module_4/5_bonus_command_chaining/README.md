# Bonus: Command Chaining for End-to-End Automation

This folder introduces **command chaining** - the practice of combining multiple commands into a single autonomous workflow. This is the natural progression in working with AI coding assistants and building repeatable systems.

---

## More on Command Chaining and Automation

This is just an introduction to command chaining. **Much more is coming in later modules.**

---

## The Progression of Building Our System

Throughout this course, we're progressing through levels of autonomy and control given to the AI coding assistant:

```
Manual Prompts
      ↓
   Trust & Verify
      ↓
Reusable Commands (Individual)
      ↓
   Trust & Verify
      ↓
Chained Commands (Autonomous Workflows)
```

### Stage 1: Manual Prompts

**What it looks like:**
- You write custom prompts for each task
- You experiment and iterate
- You learn what works and what doesn't

**When to use:**
- Learning a new domain or pattern
- Exploring how to instruct the coding assistant
- Not yet confident in a repeatable process

**Example:**
```
"Create an authentication system using JWT tokens. Include login and logout endpoints..."
```

### Stage 2: Reusable Commands (Individual)

**What it looks like:**
- You've identified repeatable patterns
- You codify them as commands (regardless of the coding assistant)
- You run each command individually and verify output

**When to use:**
- You know how to instruct the coding agent for specific tasks
- You want consistency across similar work
- You want to verify each step before proceeding

**Example:**
```
/prime                                                # Verify understanding
/planning "Add user authentication with JWT tokens"   # Review the plan
/execute plans/user-authentication.md                 # Watch implementation
/commit                                               # Verify commit message
```

### Stage 3: Chained Commands (Autonomous Workflows)

**What it looks like:**
- You trust your individual commands completely
- You chain them together for end-to-end execution
- You let the AI run the full workflow autonomously

**When to use:**
- Your individual commands work reliably
- You trust the entire workflow
- You want maximum efficiency

**Example:**
```
/end-to-end-feature "Add user authentication with JWT tokens"
# Runs: prime → planning → execute → commit
# No intervention needed (but you can add it still, more on this later)
```

---

## When to Progress to the Next Stage

**CRITICAL RULE:** Only move to the next stage when you **fully trust** the previous stage.

### Before Creating Reusable Commands:
- ✅ You've manually prompted similar tasks 3+ times successfully
- ✅ You know exactly what instructions work
- ✅ You can predict the coding agent's output
- ✅ The pattern is stable and repeatable

### Before Chaining Commands:
- ✅ Each individual command works reliably
- ✅ You've run the full workflow manually 10+ times successfully
- ✅ You trust each step's output without needing to check
- ✅ The workflow is stable across different features

**Don't skip stages!** Prematurely chaining commands before trusting individual commands leads to:
- Unpredictable results
- Difficult debugging
- Lost confidence in the system
- Wasted time fixing issues

---

## Command Chaining in This Folder

This folder contains a single command that demonstrates end-to-end autonomous feature development:

### `end-to-end-feature.md`

**Purpose**: Autonomously develop a complete feature from start to finish

**What it chains**:
1. `/prime` - Load codebase context
2. `/planning [feature]` - Research and create implementation plan
3. `/execute plans/[feature].md` - Implement the feature
4. `/commit` - Create git commit

**Usage**: `/end-to-end-feature "Add user authentication with JWT tokens, including login and logout endpoints, password hashing, and token refresh functionality"`

**Result**: A fully implemented, tested, and committed feature with zero manual intervention

**Warning**: Only use this command if you:
- Trust each individual command in the chain
- Have tested this workflow manually multiple times
- Are confident in the autonomous execution

---

## The Philosophy: Trust, Then Automate

The key insight of this progression:

**Manual prompts teach you the pattern.**
**Reusable commands codify the pattern.**
**Chained commands scale the pattern.**

But each stage requires **trust built through repetition**:

1. **Manual prompting** until you know what works
2. **Individual commands** until they're reliable
3. **Chained commands** only when the full workflow is stable

**Rushing to automation without trust is a recipe for frustration.**

---

## Try It Out (When You're Ready)

If you've completed this module and trust the core 4 commands:

1. Pick a simple, well-defined feature
2. Run `/end-to-end-feature "Your detailed feature description here"`
3. Watch the autonomous execution
4. Review the result

If anything goes wrong:
- Go back to running commands individually
- Find what needs improvement
- Update the individual commands (evolve your system)
- Try chaining again when ready

---

## Key Takeaway

**Command chaining is powerful, but only when built on a foundation of trust.**

- Manual prompts = Learning
- Individual commands = Reliability
- Chained commands = Efficiency

Progress through these stages deliberately, not hastily. The goal isn't to automate as fast as possible - it's to automate what you trust completely.
