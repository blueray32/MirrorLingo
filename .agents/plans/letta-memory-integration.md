# Feature: Letta Memory Integration for MirrorLingo

## Feature Description

Integrate Letta's stateful memory system to provide persistent, cross-session learning memory for MirrorLingo. This enables the AI Spanish tutor to remember user's idiolect patterns, learning progress, and conversation history across sessions and devices.

## User Story

As a Spanish learner
I want my AI tutor to remember my speaking patterns and progress across sessions
So that I get increasingly personalized learning without re-entering my information

## Problem Statement

Current localStorage-based persistence is device-bound and session-limited. Users lose context when switching devices or clearing browser data. The AI tutor cannot build long-term understanding of the learner.

## Solution Statement

Add Letta as an optional memory layer that persists idiolect profiles, conversation history, and learning progress. Gracefully degrade to localStorage when Letta is unavailable.

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: Backend services, ConversationService, Frontend hooks
**Dependencies**: letta-client SDK, Letta server (self-hosted or cloud)
**Scope**: Production roadmap (post-hackathon)

---

## CONTEXT REFERENCES

### Relevant Codebase Files

- `backend/src/services/conversationService.ts` - Current conversation logic, add Letta sync
- `backend/src/services/bedrockService.ts` - AI service pattern to follow
- `frontend/src/hooks/useConversationApi.ts` - localStorage persistence pattern to enhance
- `frontend/src/types/phrases.ts` - IdiolectProfile type for memory blocks
- `examples/big-3-super-agent-main/apps/realtime-poc/big_three_realtime_agents.py` (lines 2014-2331) - Letta setup pattern

### New Files to Create

- `backend/src/services/lettaService.ts` - Letta client wrapper
- `backend/src/types/letta.ts` - Letta-specific types
- `frontend/src/hooks/useLettaSync.ts` - Frontend Letta sync hook

### Patterns to Follow

**From big-3-super-agent Letta integration:**
```python
# Memory block structure
memory_blocks=[
    {"label": "human", "value": human_memory},
    {"label": "persona", "value": orchestrator_persona}
]

# Graceful degradation
if self.use_letta:
    try:
        self.letta_client, self.letta_agent = setup_letta_orchestrator(...)
    except Exception:
        self.use_letta = False  # Fallback
```

---

## IMPLEMENTATION PLAN

### Phase 1: Backend Letta Service

1. Create `lettaService.ts` with Letta client initialization
2. Define memory block structure for learner profile
3. Add sync methods for idiolect profile updates

### Phase 2: Conversation Integration

1. Modify `conversationService.ts` to sync conversations to Letta
2. Load memory summary into conversation context
3. Add graceful fallback when Letta unavailable

### Phase 3: Frontend Sync

1. Create `useLettaSync` hook for memory status
2. Update `useConversationApi` to use Letta when available
3. Add UI indicator for memory sync status

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `backend/src/types/letta.ts`

```typescript
export interface LettaConfig {
  apiKey?: string;
  baseUrl: string;
  agentName: string;
  enabled: boolean;
}

export interface LearnerMemoryBlock {
  label: 'learner_profile';
  value: string; // JSON stringified IdiolectProfile
}

export interface TutorMemoryBlock {
  label: 'tutor_persona';
  value: string;
}
```

**VALIDATE**: `cd backend && npx tsc --noEmit`

### Task 2: CREATE `backend/src/services/lettaService.ts`

- Initialize Letta client with env vars
- Create/retrieve agent with memory blocks
- Methods: `syncIdiolectProfile()`, `getMemorySummary()`, `syncConversation()`
- Graceful error handling with fallback flag

**VALIDATE**: `cd backend && npx tsc --noEmit`

### Task 3: UPDATE `backend/src/services/conversationService.ts`

- Import LettaService
- Inject memory summary into system prompt
- Sync conversation turns to Letta after response

**VALIDATE**: `cd backend && npm test`

### Task 4: CREATE `frontend/src/hooks/useLettaSync.ts`

- Check Letta availability via API
- Expose sync status to UI
- Trigger sync on idiolect profile changes

**VALIDATE**: `cd frontend && npx tsc --noEmit`

### Task 5: UPDATE documentation

- Add Letta setup instructions to README
- Document environment variables
- Add architecture diagram update

**VALIDATE**: Manual review

---

## TESTING STRATEGY

**Essential Tests:**
- LettaService initialization with/without server
- Graceful fallback when Letta unavailable
- Memory block CRUD operations

**Integration Tests:**
- Conversation sync round-trip
- Memory summary injection into prompts

---

## VALIDATION COMMANDS

```bash
# Backend type check
cd backend && npx tsc --noEmit

# Backend tests
cd backend && npm test

# Frontend type check  
cd frontend && npx tsc --noEmit

# Frontend tests
cd frontend && npm test
```

---

## ENVIRONMENT VARIABLES

```bash
# Optional - Letta integration
LETTA_ENABLED=true
LETTA_API_KEY=lk-...  # For hosted Letta
LETTA_BASE_URL=http://localhost:8283  # For self-hosted
LETTA_AGENT_NAME=mirrorlingo_tutor
```

---

## ACCEPTANCE CRITERIA

- [ ] Letta service initializes when configured
- [ ] Graceful fallback to localStorage when Letta unavailable
- [ ] Idiolect profile syncs to Letta memory blocks
- [ ] Conversation history persists across sessions
- [ ] Memory summary injected into AI tutor context
- [ ] No breaking changes to existing demo functionality

---

## NOTES

**Key Design Decisions:**
1. Letta is optional - demo mode continues to work with localStorage
2. Use AWS Bedrock as LLM backend for Letta (consistent with existing architecture)
3. Two memory blocks: `learner_profile` (idiolect) and `tutor_persona` (teaching style)
4. Sync is async and non-blocking to avoid latency impact

**Reference Implementation:**
See `examples/big-3-super-agent-main/apps/realtime-poc/LETA_INTEGRATION_README.md` for proven patterns.
