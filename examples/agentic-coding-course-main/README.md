## Agentic Coding Course

This repository contains all materials for the [Agentic Coding course](https://community.dynamous.ai) - teaching you how to build reliable and repeatable systems for getting incredible results with AI coding assistants. This course takes you from experimenting with AI coding tools to building the workflows that let you ship production-ready software faster than ever before.

### Course Visual Guide

A comprehensive diagram outlining the entire course structure, the PIV Loop workflow, system evolution principles, and how to start building your AI coding layer for both new and existing codebases:

- **[Excal-Course-Guide.png](Excal-Course-Guide.png)** - View directly in GitHub
- **[Excal-Course-Guide.excalidraw](Excal-Course-Guide.excalidraw)** - Open at [excalidraw.com](https://excalidraw.com)
- **[Excal-Course-Guide.zip](Excal-Course-Guide.zip)** - Import with the Obsidian Excalidraw plugin

### The System Gap

Right now, 90% of developers use AI coding assistants, but most fumble through without a real system. Only about 5% have mastered a systematic approach that produces consistent, reliable results.

This course bridges that gap for you.

You'll learn to build workflows around the **PIV Loop** - a mental model for **Planning**, **Implementing**, and **Validating** code with AI coding assistants. When something goes wrong, you'll fix the system, not just the code. That's the high-leverage skill that separates the top 5% (and beyond!) from everyone else.

### What's In This Repository (In Progress)

This repository includes everything you need to master agentic coding:

- **Exercises** - Hands-on practice for each module to reinforce the concepts
- **Diagrams** - Visual explanations of mental models, workflows, and systems
- **Templates** - Ready-to-use slash commands, prompts, remote coding agent setups, etc.
- **Instructions** - Step-by-step guides for building your own AI coding systems
- **.agents/** - Reference implementation of all commands and context we build together throughout the course. Use these as inspiration to create your own AI coding system tailored to your needs

### What's NOT In This Repository

- **The Main Build (Obsidian AI Agent)** - this has its own [dedicated repository here](https://github.com/dynamous-community/obsidian-ai-agent).
- **The Remote Coding Agent** - this has its own [dedicated repository here](https://github.com/dynamous-community/remote-coding-agent).

### Course Structure

The course is organized into four release blocks:

### Release Block 1: The Fundamentals

**Module 1 - Course Introduction**
- Understanding the system gap and why most developers struggle with AI coding
- Your first exercise: self assessment for your AI coding abilities
- Super basic introduction to the PIV Loop mental model

**Module 2 - The PIV Loop**
- Deep dive into Plan -> Implement -> Validate -> Iterate workflow
- Learning to think in systems rather than one-off fixes
- Exercise #2: applying the PIV Loop to a real implementation

### Release Block 2: Core Implementation + Systems

**Module 3 - Global Rules**
- Defining rules that shape how your AI coding assistant behaves
- Creating constraints and conventions for consistent output
- Exercise #3: building your first rule set

**Module 4 - Reusable Prompts**
- Crafting prompts (slash commands) that work across projects and use cases
- Building a library of go-to commands
- Exercise #4: end-to-end implementation with ONLY commands

**Module 5 - Systems for Planning**
- Layer 1: Project planning (tech stack, architecture, conventions)
- Layer 2: Task planning (codebase analysis, integration points)
- Building context engineering workflows with RAG, memory, prompt engineering, and task management

**Module 6 - Systems for Implementing**
- Executing implementation plans task by task
- Trust but verify: monitoring AI coding assistant behavior
- Delegation strategies that keep you in the driver's seat

**Module 7 - Systems for Validating**
- Human validation: code review and manual testing
- AI-powered validation: automated unit and integration tests
- Iteration workflows when validation fails

### Release Block 3: Advanced Topics + Beyond the Terminal

**Module 8 - Agentic Coding in GitHub**
- Automating your entire development workflow (the whole PIV loop) through GitHub
- AI-powered code review, issue handling, and feature development
- CI/CD strategies with AI coding assistants

**Module 9 - Dynamous Remote Agentic Coding System**
- Building AI coding workflows you can trigger from anywhere
- Integrating with different apps (Telegram, GitHub, Slack, etc.) and coding assistants
- Using your phone to kick off development workflows

**Module 10 - MCP Servers and Skills**
- Integrating Model Context Protocol servers into your workflows
- Extending your AI coding assistant's capabilities
- Connecting to external tools and leveraging skills

**Module 11 - Subagents**
- Decomposing complex research/validation tasks with specialized subagents
- Coordinating multiple AI agents in your workflow
- Considerations for subagents for implementation

**Module 12 - Parallel Agentic Coding**
- Running multiple AI coding workflows simultaneously
- Coordinating parallel development streams
- Strategies for managing complexity at scale

### Release Block 4: Opinionated Tools & Frameworks

**Extra 1 - PRP Framework**
- Rasmus's battle-tested framework for delegating all coding to AI
- How to adapt the framework to your specific use cases
- Real-world examples from production systems

**Extra 2 - BMAD Method**
- An opinionated approach to context engineering
- Out-of-the-box systems you can use immediately
- Understanding the principles so you can build your own

**Extra 3 - GitHub Spec Kit**
- Another opinionated approach to context engineering
- Out-of-the-box systems you can use immediately
- Understanding the principles so you can build your own

### Repository Organization

Each module has its own folder (e.g., `module_1`, `module_2`, etc.) containing:
- **Diagrams** - Visual explanations in Excalidraw format
- **Instructions** - Markdown guides for hands on lessons
- **Templates** - Code, configurations, and prompts you can use immediately
- **Exercises** - Practical challenges to apply what you've learned

As you progress through the course, you'll have the option to build the **Obsidian Second Brain Assistant** with us or apply the same ideas to build your own project in parallel.

### How to Use This Repository

1. **Start with Module 1** - Work through the modules sequentially to build a strong foundation (review is good even if you consider yourself more advanced!)
2. **Complete the exercises** - Each exercise reinforces the concepts and helps you develop your own systems
3. **Reference the templates** - Use the provided templates as starting points for your own workflows
4. **Build the main project** - Follow along with the Obsidian Second Brain Assistant to see everything in action

### Getting Started

To get started with the course materials:

```bash
# Clone the repository
git clone https://github.com/dynamous-community/agentic-coding-course.git

# Navigate to the course directory
cd agentic-coding-course

# Explore the modules
ls (or dir on Windows)
```

### Who This Course Is For

This course is perfect for you if:
- **Engineers** - You want teammates asking "How are you doing that? Teach me!"
- **Entrepreneurs** - You want to ship products that used to require entire teams
- **Technical PMs** - You want to prototype and validate ideas yourself
- **Career switchers** - You want to accelerate your learning curve with AI tools

You should have a semi-technical background (understanding APIs, databases, and the command line at least at a high level) and be ready to invest in building a reliable, reproducible system.

This course is **not** for you if:
- You're skeptical that AI coding works (though the course might convince you)
- You need convincing that AI is "ready"
- You want shortcuts without understanding the underlying principles

### Your Instructors

**Cole Medin** - Software engineer, entrepreneur, and AI agent expert who's been using AI coding assistants daily for over a year to ship production software, automations, and AI agents.

**Rasmus Widing** - Project manager and expert at building AI coding systems, creator of the PRP framework, focused on building systems that fully delegate coding to AI.

We're practitioners, not theorists. Every system, every template, every principle in this course comes from real-world experience building production software.

### Support & Questions

If you have questions about the course materials or encounter any issues:
- Check the dedicated discussions in the [Dynamous community](https://community.dynamous.ai)
- Join live workshops where we dive deeper into specific topics
- Attend live office hour sessions for direct support

### What You'll Achieve

By the end of this course, you'll:
- Ship features faster than you ever thought possible
- Build solo what used to take entire teams
- Have a systematic approach that works across any AI coding tool
- Know how to evolve your system as AI coding tools improve
- Be in the top 5% (and beyond!) of developers who've mastered agentic coding

When something doesn't work, you'll improve your system and retry - not just fix it once and move on. That's the difference between experimenting and mastering.

### License

All code, resources, diagrams, and templates in this repository are governed by the [proprietary Dynamous LICENSE](LICENSE).
