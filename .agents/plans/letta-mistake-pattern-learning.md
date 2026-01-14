# Feature: Intelligent Mistake Pattern Learning with Letta

## Feature Description

Implement persistent error tracking and intelligent mistake coaching using Letta memory to remember recurring grammar mistakes, track improvement on specific error types, and provide targeted micro-lessons based on historical error patterns.

## User Story

As a MirrorLingo user making Spanish grammar mistakes
I want the system to remember my recurring errors and help me improve on them specifically
So that I can overcome my persistent grammar challenges with targeted coaching

## Problem Statement

Currently, mistake correction is session-based with no learning continuity:
- No memory of recurring grammar mistakes across sessions
- Users repeat the same errors without targeted intervention
- No personalized coaching based on individual error patterns
- Missed opportunities for micro-lessons on specific grammar points

## Solution Statement

Create a Letta-powered mistake pattern learning system that tracks recurring errors, analyzes improvement trends, and delivers personalized micro-lessons targeting each user's specific grammar challenges.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Conversation Service, Spanish Translation, Letta Service, Analytics
**Dependencies**: Existing conversation system, Letta integration, Spanish translation service

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/src/services/conversationService.ts` (lines 60-100) - Why: Current conversation and correction patterns
- `backend/src/services/spanishTranslationService.ts` (lines 1-50) - Why: Translation and style analysis patterns
- `frontend/src/components/ConversationPractice.tsx` (lines 1-100) - Why: Current conversation UI and correction display
- `backend/src/services/bedrockService.ts` (lines 1-80) - Why: AI analysis patterns for mistake detection
- `backend/src/services/lettaService.ts` (lines 80-120) - Why: Letta memory block operations

### New Files to Create

- `backend/src/services/mistakePatternService.ts` - Letta-based mistake tracking
- `backend/src/types/mistakePatterns.ts` - Mistake tracking data types
- `frontend/src/hooks/useMistakePatterns.ts` - Frontend mistake tracking hook
- `frontend/src/components/MistakePatternDashboard.tsx` - Mistake analytics visualization
- `frontend/src/components/PersonalizedMicroLessons.tsx` - Targeted grammar coaching
- `backend/src/handlers/mistake-patterns-handler.ts` - API endpoints

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Spanish Grammar Reference](https://www.spanishdict.com/guide/spanish-grammar)
  - Specific section: Common grammar mistakes for English speakers
  - Why: Required for categorizing and coaching on specific error types
- [Letta Memory Blocks Documentation](https://docs.letta.com/memory-blocks)
  - Specific section: Complex data structures and querying
  - Why: Needed for mistake pattern storage and retrieval

### Patterns to Follow

**Conversation Correction Pattern:**
```typescript
// From conversationService.ts
interface ConversationResponse {
  message: string;
  correction?: {
    original: string;
    corrected: string;
    explanation: string;
  };
}
```

**Letta Memory Pattern:**
```typescript
// From lettaService.ts
await this.lettaClient.agents.blocks.update({
  agent_id: this.lettaAgent.id,
  block_label: 'mistake_patterns',
  value: JSON.stringify(mistakeData)
});
```

**AI Analysis Pattern:**
```typescript
// From bedrockService.ts
const response = await BedrockService.invokeModelPublic(analysisPrompt);
```

---

## IMPLEMENTATION PLAN

### Phase 1: Mistake Classification System

Create comprehensive mistake categorization and tracking data structures.

**Tasks:**
- Define Spanish grammar mistake categories and types
- Create mistake pattern tracking data structures
- Design improvement trend calculation algorithms

### Phase 2: Backend Pattern Service

Implement Letta-based mistake pattern tracking with intelligent analysis.

**Tasks:**
- Create mistake pattern service with Letta integration
- Implement mistake categorization using AI analysis
- Add improvement trend calculation and coaching generation

### Phase 3: Frontend Pattern Dashboard

Build comprehensive mistake pattern visualization and micro-lesson interface.

**Tasks:**
- Create mistake pattern dashboard component
- Add improvement trend visualizations
- Implement personalized micro-lesson delivery system

### Phase 4: Integration & Coaching

Integrate mistake tracking into conversation workflow with adaptive coaching.

**Tasks:**
- Update conversation service to track mistakes
- Add real-time mistake pattern analysis
- Implement adaptive micro-lesson recommendations

---

## STEP-BY-STEP TASKS

### CREATE backend/src/types/mistakePatterns.ts

- **IMPLEMENT**: Mistake categorization and pattern tracking data types
- **PATTERN**: Follow existing type patterns from `types/phrases.ts`
- **IMPORTS**: Date utilities, conversation types
- **GOTCHA**: Ensure mistake categories cover common Spanish grammar errors
- **VALIDATE**: `npm run type-check` in backend

### CREATE backend/src/services/mistakePatternService.ts

- **IMPLEMENT**: Letta-based mistake pattern tracking and analysis service
- **PATTERN**: Mirror `lettaService.ts` memory block operations and `bedrockService.ts` AI analysis
- **IMPORTS**: LettaService, BedrockService, mistake types, conversation types
- **GOTCHA**: Handle large mistake histories efficiently
- **VALIDATE**: `npm test -- mistakePatternService`

### CREATE backend/src/handlers/mistake-patterns-handler.ts

- **IMPLEMENT**: API endpoints for mistake tracking and pattern retrieval
- **PATTERN**: Follow existing handler patterns from `letta-handler.ts`
- **IMPORTS**: MistakePatternService, auth utilities
- **GOTCHA**: Maintain proper CORS and user authentication
- **VALIDATE**: `curl -X GET localhost:3001/api/mistake-patterns/user-patterns`

### UPDATE backend/src/services/conversationService.ts

- **IMPLEMENT**: Integrate mistake tracking into conversation workflow
- **PATTERN**: Follow existing service integration patterns in file
- **IMPORTS**: MistakePatternService
- **GOTCHA**: Don't break existing conversation functionality
- **VALIDATE**: Manual test conversation with mistake tracking enabled

### CREATE frontend/src/hooks/useMistakePatterns.ts

- **IMPLEMENT**: Frontend hook for mistake pattern tracking and retrieval
- **PATTERN**: Mirror `useLettaSync.ts` structure and error handling
- **IMPORTS**: Mistake types, API utilities
- **GOTCHA**: Handle offline scenarios and loading states
- **VALIDATE**: `npm test -- useMistakePatterns`

### CREATE frontend/src/components/MistakePatternDashboard.tsx

- **IMPLEMENT**: Comprehensive mistake pattern visualization and analytics
- **PATTERN**: Follow `AnalyticsDashboard.tsx` component structure and styling
- **IMPORTS**: Mistake patterns hook, chart libraries, mistake types
- **GOTCHA**: Ensure charts show improvement trends clearly
- **VALIDATE**: Manual test with mock mistake pattern data

### CREATE frontend/src/components/PersonalizedMicroLessons.tsx

- **IMPLEMENT**: Targeted grammar coaching based on mistake patterns
- **PATTERN**: Follow existing component patterns for educational content
- **IMPORTS**: Mistake patterns hook, Spanish grammar utilities
- **GOTCHA**: Ensure micro-lessons are concise and actionable
- **VALIDATE**: Manual test micro-lesson generation and display

### UPDATE frontend/src/components/ConversationPractice.tsx

- **IMPLEMENT**: Integrate mistake pattern tracking into conversation UI
- **PATTERN**: Follow existing hook integration patterns in component
- **IMPORTS**: useMistakePatterns hook
- **GOTCHA**: Don't disrupt existing conversation flow
- **VALIDATE**: Manual test conversation with mistake tracking UI

### ADD backend/src/services/__tests__/mistakePatternService.test.ts

- **IMPLEMENT**: Comprehensive mistake pattern service tests
- **PATTERN**: Follow existing service test patterns
- **IMPORTS**: Jest, mistake pattern service, mock Letta, mock conversation data
- **GOTCHA**: Test mistake categorization accuracy
- **VALIDATE**: `npm test -- mistakePatternService.test.ts`

### CREATE frontend/src/pages/grammar-coaching.tsx

- **IMPLEMENT**: Dedicated page for mistake patterns and micro-lessons
- **PATTERN**: Follow existing page component patterns
- **IMPORTS**: MistakePatternDashboard, PersonalizedMicroLessons
- **GOTCHA**: Ensure page is accessible and mobile-responsive
- **VALIDATE**: Navigate to /grammar-coaching and verify functionality

---

## TESTING STRATEGY

**Testing Prioritization:**
- **Essential Tests**: Mistake categorization, pattern analysis, Letta integration
- **Demo Tests**: Basic mistake tracking and micro-lesson generation
- **Production Tests**: Long-term pattern accuracy, coaching effectiveness

### Unit Tests

Test mistake categorization algorithms, pattern analysis logic, and micro-lesson generation.

### Integration Tests

Test complete mistake tracking workflow from conversation to Letta storage and coaching generation.

### Pattern Accuracy Tests

Validate that mistake pattern analysis accurately identifies recurring errors and improvement trends.

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
cd backend && npm run type-check
cd frontend && npm run type-check
npm run lint
```

### Level 2: Unit Tests

```bash
cd backend && npm test -- mistakePattern
cd frontend && npm test -- useMistakePatterns
cd frontend && npm test -- MistakePatternDashboard
```

### Level 3: Integration Tests

```bash
cd backend && npm test -- mistake-patterns-handler
cd backend && npm test -- conversationService
cd frontend && npm test -- ConversationPractice
```

### Level 4: Manual Validation

```bash
# Start backend
cd backend && npm run dev

# Test mistake pattern endpoints
curl -X GET http://localhost:3001/api/mistake-patterns/user-patterns/test-user
curl -X POST http://localhost:3001/api/mistake-patterns/track -H "Content-Type: application/json" -d '{"mistakes":[]}'

# Test frontend
cd frontend && npm run dev
# Navigate to conversation practice, make intentional grammar mistakes, verify tracking
# Navigate to grammar coaching page, verify mistake patterns and micro-lessons
```

---

## DOCUMENTATION UPDATES

**Required Documentation Changes:**
- Update README.md with mistake pattern learning feature
- Add grammar coaching documentation to user guides
- Document mistake categorization system in API docs

---

## ACCEPTANCE CRITERIA

- [ ] Recurring grammar mistakes tracked across sessions
- [ ] Mistake patterns analyzed and categorized accurately
- [ ] Personalized micro-lessons generated based on individual error patterns
- [ ] Improvement trends calculated and visualized clearly
- [ ] Integration with conversation practice seamless
- [ ] Letta integration handles mistake data efficiently
- [ ] Micro-lessons are concise, actionable, and effective
- [ ] Performance acceptable with extensive mistake history

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)
- [ ] No linting or type checking errors
- [ ] Manual mistake pattern testing confirms functionality
- [ ] Acceptance criteria all met
- [ ] Code reviewed for quality and maintainability

---

## NOTES

**Design Decisions:**
- Focus on common Spanish grammar mistakes for English speakers
- Use AI analysis for mistake categorization and explanation generation
- Implement spaced repetition for micro-lesson delivery

**Trade-offs:**
- Complex mistake analysis for accurate pattern detection
- Balance between detailed tracking and user experience
- Memory considerations for extensive mistake histories
