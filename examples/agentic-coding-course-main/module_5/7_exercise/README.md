# Exercise: Template Your Planning Cycle

## Objective

Transform the manual feature planning workflow from this module and module 3 into a reusable slash command that combines research and template filling.

**Learning Goals:**

- Recognize patterns in your manual workflows
- Extract reusable processes from ad-hoc prompting
- Combine multi-phase workflows into cohesive commands
- Balance thoroughness with simplicity based on your needs

---

## Background

In the last couple of videos, we manually planned features using a multi-step process:

1. **Initial Exploration**
2. **Steering the Direction**
3. **Research and Scoping**
4. **Constraint-Driven Planning**
5. **Plan Review and Refinement**

This works well, but it's **manual and repetitive**. Every time you plan a new feature, you repeat this cycle.

---

## The Pattern You've Used

Looking at the guide, here's what you did manually:

```
/prime                                    # Understand codebase
↓
"Read PRD, what's next?"                  # Initial exploration
↓
"I disagree, let's do X instead"          # Engineering judgment
↓
"Research Pydantic AI docs..."            # Deep research
↓
"Also read vsa-patterns.md..."            # Context layering
↓
/plan-new "Specific constraints..."       # Generate plan
↓
Manual review and refinement              # Critical review
```

**The question:** Can you template this workflow into a single command?

---

## Current State

### What You Already Have

**plan-template.md** - A simple template with the plan structure:

```
/plan-template

Creates a plan structure but NO research guidance
Just fills in the template sections
```

---

## The Exercise

**Create your own planning slash command that combines research + template filling.**

### Your Mission

1. **Think about the manual workflow**
   - What research steps did you take?
   - What context did you provide?
   - What constraints guided the AI?

2. **Analyze existing commands:**
   - `commands/plan-template.md` - Simple template only
   - `commands/*` - Check other commands we ahve created for patterns we can use
3. **Design your own workflow:**
   - How much research should be templated?
   - What should always happen vs. what's optional?
   - What level of detail matches YOUR working style?

4. **Create your command:**
   - File: `.claude/commands/plan-feature.md` (or name of your choice)
   - Combine research cycle + template filling
   - Test it on a real feature

---

## Design Considerations

### Minimum Viable Command

At minimum, your command should:

- Understand the feature request
- Do codebase analysis
- Do feature research
- Fill the plan template

## There's No Single Right Answer

Your command should match **YOUR workflow preferences:**

**If you prefer speed:**

- Keep it minimal
- Focus on essential research
- Quick template filling

**If you prefer thoroughness:**

- Deep codebase analysis
- Extensive external research
- Multiple validation checkpoints

**If you prefer flexibility:**

- Modular phases with human in the loop
- Optional research sections
- User prompts for decisions

---

## Success Criteria

Your planning command should:

✅ **Be reusable** - Works for multiple features without modification

✅ **Save time** - Faster than manual prompting each time

✅ **Maintain quality** - Produces plans as good as or better than manual

✅ **Match your style** - Feels natural for your workflow

---

## Testing Your Command

1. **Create the command file:**

   ```
   .claude/commands/plan-feature.md
   ```

2. **Restart Claude Code** to load the command

3. **Test on a real feature:**

   ```
   /plan-feature Add another LLM provider to our application using pydantic AI (specify which provider to add and default model)
   ```

4. **Evaluate the output:**
   - Does it gather enough context?
   - Is the plan actionable?
   - What's missing?
   - What's excessive?

5. **Iterate and refine:**
   - Add missing research steps
   - Remove unnecessary verbosity
   - Adjust to your preferences

---

## Reflection Questions

After creating your command, consider:

1. **What research steps did you keep from the manual workflow?**
   - Why were these essential?

2. **What did you simplify or remove?**
   - What made you choose to cut it?

3. **What did you add that wasn't in the manual workflow?**
   - What gaps did you discover?

4. **How does it compare to `planning-command.md`?**
   - Is yours simpler? More thorough? Different focus?

5. **Would you use this command in real projects?**
   - If not, what would need to change?

---

## Hints

**Start simple, iterate:**

- Begin with minimal viable command
- Use it on 2-3 features
- Notice what's missing
- Add incrementally

**Think about phases:**

- What ALWAYS needs to happen?
- What's OPTIONAL based on feature type?
- What can be PARALLELIZED?

**Consider your context:**

- Greenfield vs brownfield projects
- Solo vs team development
- Simple vs complex features

---

## Bonus Challenges

**Level 1:** Create a basic command that works

**Level 2:** Add feature-type branching (New/Enhancement/Refactor/Bug)

**Level 3:** Include parallel subagent research for speed

**Level 4:** Create multiple commands for different planning depths

- `/plan-quick` - Minimal research
- `/plan-standard` - Balanced approach
- `/plan-deep` - Comprehensive analysis

**Level 5:** Add validation and quality checks to the planning process

---

## Next Steps

After completing this exercise:

1. **Use your command** for the next 3-5 features
2. **Track what works** and what doesn't
3. **Iterate based on experience**

Remember: The best planning command is the one **you'll actually use consistently**.

---