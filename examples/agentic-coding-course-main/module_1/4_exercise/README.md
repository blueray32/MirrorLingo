# Exercise 1: Baseline Implementation

## Overview

This is the first exercise for the Dynamous Agentic Coding Course. Exercise 1 is designed to establish your personal baseline for AI-assisted coding **before** learning systematic techniques.

You'll implement product filtering capabilities in both the backend API and frontend interface of a very basic e-commerce product catalog (located in `app/`), working exactly as you would in a real project today.

**Important**: This is a baseline assessment, not a test. Use AI coding assistants however you're most comfortable. There are no rules, restrictions, or requirements on how you use AI tools - just work naturally.

## Quick Start

Get the application running in two terminals so you can check it out before the exercise:

**Terminal 1 - Backend**:
```bash
cd app/backend
uv venv --python 3.12
uv sync
uv run python run_api.py
# → http://localhost:8000
```

**Terminal 2 - Frontend**:
```bash
cd app/frontend
npm install -g bun
bun install
bun dev
# → http://localhost:3000
```

## Goals

1. **Implement a complete fullstack feature** from backend to frontend
2. **Establish your baseline** for time, effort, and confidence when using AI assistants
3. **Experience your current workflow** before learning optimization techniques for the next exercises

**Important Note**: Your implementation will likely work, even with simple prompts - AI coding assistants are powerful enough to handle these features. This project is intentionally straightforward because **the goal isn't to struggle with getting code to work**. Instead, pay attention to:
- How smooth does the process feel?
- How much do you understand what's being implemented?
- How much control do you feel you have over the specific implementation details?
- Are you in the driver's seat, or just along for the ride?

## The Task

> Open your AI coding assistant in the `app/` folder for this!

The task really consists of two parts, but you can of course ask it to implement both at once if you want:

### Part 1: Backend API Filtering

Add filtering capabilities to the FastAPI backend:

- **Price filtering**: Support minimum and maximum price filters
- **Category filtering**: Allow filtering by product category
- **Keyword search**: Search product names and descriptions
- **Sorting**: Enable sorting by price or name (both directions)

All filters should be optional and work together when combined.

### Part 2: Frontend Filtering UI

Build a React frontend interface that connects to your backend filtering API:

- **Price range controls**: Allow users to set min/max price filters
- **Category selector**: Enable filtering by product category
- **Search input**: Provide keyword search functionality
- **Sort controls**: Allow users to sort results
- **Filter management**: Ability to apply and clear filters

The interface should handle loading states, empty results, and validation errors appropriately.

### Use AI However You Want

There are **no rules or restrictions** on AI usage:

- **Work exactly as you normally would if you got this task in a real project today**
- Use whatever prompting style feels natural to you
- Ask for help, code generation, debugging - whatever you need

## Project Structure

```
4_exercise/
├── app/
│   ├── backend/      # FastAPI backend application
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── ...
│   │   └── tests/    # Backend tests (make these pass!)
│   └── frontend/     # React frontend application
│       └── src/
│           ├── components/
│           ├── lib/
│           └── types/
```

## What to Track

As you work, please track the following metrics:

### ⏱️ Time Tracking

- **Backend time**: How long did it take to implement the new API endpoint?
- **Frontend time**: How long did it take to build the frontend components?
- **Total time**: Overall exercise duration

### 💬 AI Interaction

- **Number of prompts**: How many times did you prompt your AI assistant?
- **Types of requests**: Were you asking for code generation? Debugging? Explanations?
- **Iteration cycles**: How many back-and-forth exchanges did it take?

### 😊 Confidence Level

After completing both tasks, rate your confidence (1-10):

- How confident are you that the code is **correct**?
- How confident are you that the code follows **best practices**?
- How well do you **understand** the generated code?
- How **maintainable** is the resulting code?

### 🐛 Issues Encountered

- Did the AI make mistakes? What kinds?
- Did you need to debug generated code?
- Were there type errors or test failures?
- How much manual fixing was required?

## Success Criteria

You've completed the exercise when:

- ✅ All backend tests pass (`uv run pytest`)
- ✅ Backend API accepts and processes filter parameters correctly
- ✅ Frontend displays a working filter interface
- ✅ Filters can be applied and results update accordingly
- ✅ You can manually test the full filtering flow in the browser

## Important Notes

### This is Not a Competition

The goal is to establish **your personal baseline**, not to compete with others. Be honest about:

- Time taken (don't rush!)
- Prompts used (track them all)
- Confidence levels (be realistic)
- Issues encountered (document everything)

### Documentation is Key

After completing the exercise, you'll reflect on:

- What worked well in your AI workflow?
- What was frustrating or slow?
- Where did you get stuck?
- What would you want to improve?

This reflection will inform the learning modules that follow.

## After Completion

When you're done, you'll have:

1. A working fullstack filtering feature
2. Baseline metrics for your AI-assisted coding workflow
3. Awareness of your current strengths and pain points
4. Context for the optimization techniques you'll learn next

## Questions?

- Check the main [README.md](./README.md) for project architecture and setup details
- Review existing code patterns in `app/backend/app/` and `app/frontend/src/`
- Run `/health` endpoint to verify backend is running: http://localhost:8000/health
- Check API docs when backend is running: http://localhost:8000/docs

## Ready?

Start implementing and use AI coding assistants however you normally would. Track your time, prompts, and confidence as you go.

Good luck!
