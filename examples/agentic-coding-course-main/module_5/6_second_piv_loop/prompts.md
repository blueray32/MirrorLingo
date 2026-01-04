# Obsidian Copilot Integration Research Prompts

These research prompts are designed to gather comprehensive technical details before implementing OpenAI-compatible endpoints for the Obsidian Copilot plugin integration.

**Purpose**: Guide an LLM to discover critical implementation details that documentation alone won't reveal, including actual message formats, streaming patterns, and source code behavior.

---

## Research Prompt 1: OpenAI API Message Format & Plugin Behavior

**Context**: We need to understand the EXACT message format and API behavior the Obsidian Copilot plugin expects. Documentation often omits critical details that only appear in source code.

**Prompt**:

```
Research the Obsidian Copilot plugin's OpenAI-compatible API integration by examining both documentation AND source code.

Primary sources:
- https://github.com/logancyang/obsidian-copilot (source code)
- https://www.obsidiancopilot.com/en/docs (documentation)

CRITICAL: You must find and analyze the actual SOURCE CODE, not just read documentation.

## Part 1: Message Content Format

Find how the plugin formats message content in requests:

1. **Search for ChatOpenRouter.ts or similar adapter files** in the repository
   - Look for the message construction logic
   - Find examples of how `content` field is structured

2. **Determine content format variations**:
   - Does it send `content: "string"` (simple string)?
   - Does it send `content: [{"type": "text", "text": "..."}]` (structured array)?
   - Can it send both formats? Under what conditions?
   - Look for methods like `extractDeltaContent()` or `toOpenRouterMessages()` that reveal format handling

3. **Find the exact content normalization logic**:
   - How does the plugin handle different content formats?
   - What does it expect back in responses?
   - Look for array iteration, text extraction, or content flattening code

## Part 2: Endpoint Path Construction

Discover how the plugin builds API endpoint URLs:

1. **Find the OpenAI SDK/client initialization**:
   - Search for `new OpenAI({...})` or similar
   - Look for `baseURL` configuration
   - Find where `chat.completions.create()` is called

2. **Determine path construction**:
   - If baseURL is `http://localhost:8123/agent/v1`, what is the FINAL URL?
   - Does the OpenAI SDK append `/chat/completions` automatically?
   - What should users enter in the "Base URL" field in Copilot settings?

3. **Verify with actual examples**:
   - Find issues or discussions showing working configurations
   - Look for error messages with full URLs (404s reveal actual paths tried)

## Part 3: Multi-Modal & Structured Content

Understand why the plugin uses structured content:

1. **Multi-modal support**:
   - Does the plugin support images or other content types?
   - How are different content types represented?
   - Find examples of `{"type": "image_url", ...}` usage

2. **Content part structure**:
   - What fields exist in content array objects?
   - Required vs optional fields
   - How to extract plain text from structured content

## Report Format

Provide findings as:

1. **Message Content Format Discovery**:
   - Code snippet showing actual format sent by plugin
   - Explanation of why this format is used
   - Example requests from source code

2. **Endpoint Path Construction**:
   - Exact URL construction logic
   - Example: baseURL + automatic appending
   - Recommended user configuration

3. **Implementation Requirements**:
   - Pydantic model requirements for accepting messages
   - Content normalization strategy
   - Validator or property method needed

IMPORTANT: Include actual code snippets from the repository. Generic descriptions are not sufficient.
```

---

## Research Prompt 2: Pydantic AI Streaming with OpenAI SSE Format

**Context**: We need to stream responses from Pydantic AI using `agent.iter()` and format them as OpenAI-compatible Server-Sent Events for the Obsidian Copilot plugin.

**Prompt**:

```
Research how to implement OpenAI-compatible streaming responses using Pydantic AI's `agent.iter()` method and FastAPI.

Primary sources:
- https://ai.pydantic.dev/ (Pydantic AI documentation)
- https://github.com/logancyang/obsidian-copilot (plugin source for expected format)
- https://platform.openai.com/docs/api-reference/chat/streaming (OpenAI streaming spec)

## Part 1: Pydantic AI agent.iter() Deep Dive

Understand how `agent.iter()` works:

1. **Core mechanism**:
   - What does `agent.iter()` return? (context manager? async iterator?)
   - What are execution "nodes"? What types exist?
   - Which nodes contain text that should be streamed?
   - How do you extract text from nodes?

2. **Usage pattern**:
   - Find code examples of `agent.iter()` usage
   - How to iterate: `async for node in agent_run:`?
   - When to yield text chunks vs skip nodes
   - How to handle tool execution nodes

3. **Message history handling**:
   - How to pass conversation history to `agent.iter()`?
   - Does it accept OpenAI format messages directly?
   - How to convert OpenAI messages to Pydantic AI format?

4. **Token usage tracking**:
   - How to get token counts during/after streaming?
   - Where does usage information appear?
   - Can you get partial usage during the stream?

## Part 2: OpenAI Streaming Chunk Format

Understand the exact SSE format the plugin expects:

1. **Chunk structure**:
   - Find the TypeScript interface for OpenAI streaming chunks
   - Look in ChatOpenRouter.ts for `OpenRouterChatChunk` or similar
   - What fields are REQUIRED vs optional?

2. **SSE format**:
   - How are chunks wrapped? (`data: {json}\n\n`)
   - What is the termination signal? (`data: [DONE]`)
   - Verify exact formatting with examples

3. **Delta progression**:
   - First chunk: Does it include `role: "assistant"`?
   - Middle chunks: Only `content` deltas?
   - Last chunk: Include `finish_reason` and `usage`?

4. **Analyze plugin's chunk processing**:
   - Find `_streamResponseChunks` or similar method
   - How does plugin iterate: `for await (const chunk of stream)`?
   - What does plugin extract from each chunk?
   - Look for `choice?.delta?.content` extraction logic

## Part 3: FastAPI Streaming Implementation

Understand how to implement SSE streaming in FastAPI:

1. **StreamingResponse usage**:
   - How to create async generator for SSE?
   - Correct content type: `text/event-stream`
   - Headers needed for SSE streaming

2. **Error handling in streams**:
   - What happens if exception occurs mid-stream?
   - How to log errors without breaking the stream?
   - Graceful degradation strategies

3. **Connection management**:
   - Detecting client disconnection
   - Cleanup after stream completes
   - Timeout handling

## Part 4: Integration Pattern

Map the full flow:

1. **Request → Agent**:
   - OpenAI messages array → Extract text for agent
   - System messages → How to handle?
   - Message history → How to pass to agent.iter()?

2. **Agent → Chunks**:
   - agent.iter() nodes → Text extraction
   - Text deltas → OpenAI chunk formatting
   - Token metadata → Usage chunk at end

3. **Chunks → SSE**:
   - Python dict → JSON serialization
   - JSON → SSE format with `data: ` prefix
   - Stream → FastAPI StreamingResponse

## Report Format

Provide findings as:

1. **agent.iter() Usage Pattern**:
   - Complete code example showing iteration
   - Node type filtering
   - Text extraction logic

2. **OpenAI Chunk Format Spec**:
   - TypeScript interface from plugin (if found)
   - Required fields per chunk
   - Example progression (first → middle → last chunk)

3. **FastAPI Implementation Blueprint**:
   - Async generator signature
   - Chunk formatting helper
   - StreamingResponse setup
   - Error handling strategy

4. **Complete Flow Example**:
   - Pseudocode showing request → agent → chunks → SSE
   - Type annotations for clarity
   - Error boundaries

IMPORTANT: Find actual implementation examples, not just theoretical descriptions. Code speaks louder than docs.
```

---

## Why These Prompts Work Better

### Original Prompt Issues

The original prompt:

- Was too vague: "Research the obsidian plugin"
- Didn't specify WHERE to look (docs vs source code)
- Didn't ask for SPECIFIC artifacts (code snippets, interfaces)
- Listed generic tasks without concrete deliverables

### Improved Prompt Benefits

**Explicit Source Code Directive**:

- "You must find and analyze the actual SOURCE CODE"
- "Search for ChatOpenRouter.ts"
- "Look for methods like extractDeltaContent()"

**Concrete Deliverables**:

- "Code snippet showing actual format"
- "TypeScript interface from plugin"
- "Complete code example showing iteration"

**Structured Investigation**:

- Part 1, Part 2, Part 3 break down the research
- Each part has specific questions to answer
- Report format specifies exact output structure

**Context for WHY**:

- Explains the problem being solved
- Highlights critical details to find
- Warns about common pitfalls

**Cross-Reference Strategy**:

- Multiple sources (docs + source + issues)
- Validation through different angles
- Real-world examples from issues

---

## Usage Instructions

### For Course Students

1. **Use Prompt 1 BEFORE planning** the endpoint implementation
2. **Use Prompt 2 BEFORE planning** the streaming logic
3. **Review research outputs** critically - did it find source code?
4. **Create implementation plan** only after both research prompts complete

### For Coding Agents

Run these prompts in **separate contexts** from implementation:

- Research context: Exploration and discovery
- Planning context: Create detailed plan from research
- Implementation context: Execute the plan

### Success Criteria

Research is complete when you have:

**From Prompt 1**:

- ✅ Actual code snippet from plugin showing message format
- ✅ Clear understanding of structured vs string content
- ✅ Exact endpoint path construction logic
- ✅ User configuration recommendation

**From Prompt 2**:

- ✅ Working example of agent.iter() usage
- ✅ Complete OpenAI chunk format specification
- ✅ FastAPI streaming implementation pattern
- ✅ Error handling strategy

---

## Lessons Learned

**What Went Wrong in Original Implementation**:

1. Didn't examine plugin source code → missed structured content format
2. Didn't find ChatOpenRouter.ts → missed extractDeltaContent() pattern
3. Didn't verify chunk format → guessed SSE structure
4. Implemented based on documentation alone → failed on real-world usage

**How These Prompts Fix It**:

1. Explicit directive to find and read source code
2. Specific file names and method names to search for
3. Request for TypeScript interfaces and code examples
4. Emphasis on "actual" over "theoretical"

**General Principle**:

> **Documentation tells you WHAT. Source code shows you HOW.**
>
> Always verify documentation claims against actual implementation, especially for integrations.

---

## Next Steps After Research

Once both research prompts complete:

1. **Validate findings**: Do the code examples make sense?
2. **Create types**: Design Pydantic models based on actual formats found
3. **Plan implementation**: Use `/plan-template` with research context
4. **Execute plan**: Run `/execute` with the detailed plan
5. **Test integration**: Connect to actual Obsidian Copilot plugin
6. **Debug iteratively**: Use research findings to diagnose issues

Remember: **Good research → better plans → fewer implementation bugs.**

---

Alt 2

### Obsidian Integration Research

**Context**: We need to understand the EXACT message format and API behavior the Obsidian Copilot plugin expects. Documentation often omits critical details that only appear in source code.

When the priming is done we can send this prompt.

Lets include more detail around the questions we have that will also help steer the agent right in its research

```
Research the Obsidian Copilot plugin's OpenAI-compatible API integration by examining both documentation AND source code.

Research the obsidian plugin we are using and the pydantic ai framework as needed
https://www.obsidiancopilot.com/en/docs
https://github.com/logancyang/obsidian-copilot (source code)

CRITICAL: You must find and analyze the actual SOURCE CODE, not just read documentation.

Message Content Format

1. **Search for ChatOpenRouter.ts or similar adapter files** in the repository

- FETCH: https://github.com/logancyang/obsidian-copilot/blob/master/src/LLMProviders/ChatOpenRouter.ts
- Look for the message construction logic
- Find examples of how `content` field is structured

2. **Determine content format variations**:

- Determine exactly what content format is expected by the Obsidian plugin
- Is it using structured arrays or strings?
- Does it support both, under what conditions?

3. **Find the exact content normalization logic**:

- How does the plugin handle different content formats?
- What does it expect back in responses?
- Look for array iteration, text extraction, or content flattening code

Endpoint Path Construction

Discover how the plugin builds API endpoint URLs:

1. **Find the OpenAI SDK/client initialization**:

- Search for `new OpenAI({...})` or similar
- Look for `baseURL` configuration
- Find where `chat.completions.create()` is called

2. **Determine path construction**:

- If baseURL is `http://localhost:8123/agent/v1`, what is the FINAL URL?
- Does the OpenAI SDK append `/chat/completions` automatically?
- What should users enter in the "Base URL" field in Copilot settings?

## Report Format

Provide findings as:

1. **Message Content Format Discovery**:
   - Code snippet showing actual format sent by plugin
   - Explanation of why this format is used
   - Example requests from source code

2. **Endpoint Path Construction**:
   - Exact URL construction logic
   - Example: baseURL + automatic appending
   - Recommended user configuration

3. **Implementation Requirements**:
   - Pydantic model requirements for accepting messages
   - Content normalization strategy
   - Validator or property method needed

IMPORTANT: Include actual code snippets from the repository. Generic descriptions are not sufficient.
Save it as .agents/report/research-report-[apropriate-name].md
```

Excellent! The agent found all the critical information it needs for the copilot plugin integration. Let's steer it right again on another research quest.

## Research Prompt 2: Pydantic AI Streaming with OpenAI SSE Format

**Context**: We need to stream responses from Pydantic AI using `agent.iter()` and format them as OpenAI-compatible Server-Sent Events for the Obsidian Copilot plugin.

**Prompt**:

```
Research how to implement OpenAI-compatible streaming responses using Pydantic AI's `agent.iter()` method and FastAPI.

Primary sources:
- https://ai.pydantic.dev/ (Pydantic AI documentation)
- https://ai.pydantic.dev/agents/
- https://github.com/logancyang/obsidian-copilot (plugin source for expected format)
- https://platform.openai.com/docs/api-reference/chat/streaming (OpenAI streaming spec)

## Part 1: Pydantic AI agent.iter() Deep Dive

Understand how `agent.iter()` works:

1. **Core mechanism**:
   - What does `agent.iter()` return? (context manager? async iterator?)
   - What are execution "nodes"? What types exist?
   - Which nodes contain text that should be streamed?
   - How do you extract text from nodes?

2. **Usage pattern**:
   - Find code examples of `agent.iter()` usage
   - Find how to iterate?
   - When to yield text chunks vs skip nodes
   - How to handle tool execution

3. **Message history handling**:
   - How to pass conversation history to `agent.iter()`?
   - Does it accept OpenAI format messages directly?
   - How to convert OpenAI messages to Pydantic AI format?

## Part 2: OpenAI Streaming Chunk Format

Understand the exact SSE format the plugin expects:

- Find the TypeScript interface for OpenAI streaming chunks
- FETCH: https://github.com/logancyang/obsidian-copilot/blob/master/src/LLMProviders/ChatOpenRouter.ts
- What fields are REQUIRED vs optional?
- How are chunks wrapped?
- What is the termination signal?
- Identify the delta progression
- Find the response chunk method and identify how it works

Map the full flow:

1. **Request → Agent**:
2. **Agent → Chunks**:
3. **Chunks → SSE**:

## Report Format

Provide findings as:

1. **agent.iter() Usage Pattern**:
   - Complete code example showing iteration
   - Node type filtering
   - Text extraction logic

2. **OpenAI Chunk Format Spec**:
   - TypeScript interface from plugin (if found)
   - Required fields per chunk
   - Example progression (first → middle → last chunk)

3. **FastAPI Implementation Blueprint**:
   - Async generator signature
   - Chunk formatting helper
   - StreamingResponse setup
   - Error handling strategy

4. **Complete Flow Example**:
   - Pseudocode showing request → agent → chunks → SSE
   - Type annotations for clarity
   - Error boundaries

IMPORTANT: Find actual implementation examples, not just theoretical descriptions. Code speaks louder than docs.
Save it as .agents/report/research-report-[apropriate-name].md

```