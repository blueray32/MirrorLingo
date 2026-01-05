# Feature: Real-time Spanish Conversation Practice with AI

## Feature Description

Implement an AI-powered conversational practice system that allows users to have real-time Spanish conversations with an intelligent chatbot. The system will use GPT-4 to generate contextually appropriate responses while maintaining the user's personal speaking style and providing real-time feedback on grammar, pronunciation, and fluency.

## User Story

As a Spanish learner using MirrorLingo
I want to practice real conversations in Spanish with an AI tutor
So that I can improve my speaking confidence and fluency in a safe, judgment-free environment

## Problem Statement

Current language learning apps lack realistic conversation practice. Users can translate phrases and do spaced repetition, but they struggle with real-time conversation skills, which are essential for practical Spanish usage. There's no safe space to practice without fear of judgment.

## Solution Statement

Create an AI conversation partner that adapts to the user's idiolect, provides contextual responses, and offers real-time feedback. The system will use voice input/output, maintain conversation context, and provide gentle corrections while keeping conversations engaging and natural.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Frontend (new conversation UI), Backend (GPT-4 integration), Voice processing
**Dependencies**: OpenAI GPT-4 API, Enhanced voice synthesis, Real-time audio processing

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `frontend/src/components/VoiceRecorder.tsx` - Voice recording patterns and audio processing
- `frontend/src/hooks/useAudioApi.ts` - Audio API integration patterns
- `backend/src/services/bedrockService.ts` - AI service integration patterns
- `frontend/src/components/PronunciationFeedback.tsx` - Real-time voice feedback UI patterns
- `backend/src/services/transcriptionService.ts` - Speech-to-text processing
- `frontend/src/types/phrases.ts` - Type definitions for language data

### New Files to Create

- `frontend/src/components/ConversationPractice.tsx` - Main conversation interface
- `frontend/src/hooks/useConversationApi.ts` - Conversation API management
- `backend/src/services/conversationService.ts` - GPT-4 conversation logic
- `backend/src/handlers/conversation-handler.ts` - API endpoints for conversations
- `frontend/src/components/ConversationBubble.tsx` - Chat message display
- `tests/conversation-practice.test.tsx` - Component tests

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [OpenAI GPT-4 API Documentation](https://platform.openai.com/docs/api-reference/chat)
  - Specific section: Chat completions with system messages
  - Why: Required for implementing contextual AI conversations
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
  - Specific section: SpeechSynthesis for text-to-speech
  - Why: Needed for AI voice responses
- [React Hooks Best Practices](https://react.dev/reference/react)
  - Specific section: useEffect and useCallback patterns
  - Why: Managing real-time conversation state

### Patterns to Follow

**API Integration Pattern:**
```typescript
// Mirror pattern from bedrockService.ts
export class ConversationService {
  static async generateResponse(message: string, context: ConversationContext): Promise<ConversationResponse>
}
```

**Voice Processing Pattern:**
```typescript
// Follow useAudioApi.ts pattern
const useConversationApi = (): ConversationApiReturn => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
}
```

**Component Structure Pattern:**
```typescript
// Follow VoiceRecorder.tsx pattern
export const ConversationPractice: React.FC<ConversationPracticeProps> = ({
  userProfile,
  onSessionComplete
}) => {
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

Set up conversation infrastructure and basic AI integration

**Tasks:**
- Configure OpenAI GPT-4 API credentials and rate limiting
- Create conversation data models and TypeScript interfaces
- Set up real-time audio processing pipeline
- Design conversation UI component structure

### Phase 2: Core Implementation

Implement main conversation functionality

**Tasks:**
- Build conversation service with GPT-4 integration
- Create conversation practice UI component
- Implement voice-to-voice conversation flow
- Add conversation context management and memory

### Phase 3: Integration

Connect conversation system with existing MirrorLingo features

**Tasks:**
- Integrate with user's idiolect profile for personalized responses
- Connect to existing voice recording and transcription systems
- Add conversation practice to main navigation
- Implement conversation history and progress tracking

### Phase 4: Testing & Validation

Comprehensive testing of conversation functionality

**Tasks:**
- Unit tests for conversation service and API integration
- Integration tests for voice-to-voice workflow
- User experience testing for conversation flow
- Performance testing for real-time response times

---

## STEP-BY-STEP TASKS

### CREATE backend/src/services/conversationService.ts

- **IMPLEMENT**: GPT-4 conversation service with system prompts
- **PATTERN**: Mirror bedrockService.ts structure for AI integration
- **IMPORTS**: OpenAI SDK, conversation types, user profile types
- **GOTCHA**: Rate limiting and token management for GPT-4 API
- **VALIDATE**: `curl -X POST localhost:3001/conversation/chat -d '{"message":"Hola"}'`

### CREATE frontend/src/types/conversation.ts

- **IMPLEMENT**: TypeScript interfaces for conversation data
- **PATTERN**: Follow phrases.ts type definition patterns
- **IMPORTS**: Base types from existing type files
- **GOTCHA**: Ensure compatibility with existing idiolect types
- **VALIDATE**: `npm run type-check`

### CREATE frontend/src/hooks/useConversationApi.ts

- **IMPLEMENT**: React hook for conversation API management
- **PATTERN**: Mirror useAudioApi.ts structure and state management
- **IMPORTS**: React hooks, conversation types, API utilities
- **GOTCHA**: Handle real-time state updates and audio processing
- **VALIDATE**: Test hook with mock conversation data

### CREATE frontend/src/components/ConversationPractice.tsx

- **IMPLEMENT**: Main conversation interface with voice input/output
- **PATTERN**: Follow VoiceRecorder.tsx component structure
- **IMPORTS**: Conversation hooks, audio components, UI components
- **GOTCHA**: Manage conversation state and audio conflicts
- **VALIDATE**: Render component and test basic conversation flow

### UPDATE frontend/pages/index.tsx

- **IMPLEMENT**: Add conversation practice to main navigation
- **PATTERN**: Follow existing navigation pattern for practice sessions
- **IMPORTS**: ConversationPractice component
- **GOTCHA**: Ensure proper state management between features
- **VALIDATE**: Navigate to conversation practice from main page

### CREATE backend/src/handlers/conversation-handler.ts

- **IMPLEMENT**: API endpoints for conversation management
- **PATTERN**: Mirror phrase-handler.ts structure and error handling
- **IMPORTS**: Conversation service, AWS Lambda types, CORS headers
- **GOTCHA**: Handle streaming responses for real-time conversation
- **VALIDATE**: `curl -X POST /conversation/start -H "x-user-id: test"`

---

## TESTING STRATEGY

### Unit Tests

- ConversationService GPT-4 integration with mock responses
- useConversationApi hook state management
- ConversationPractice component rendering and interactions
- API handler request/response validation

### Integration Tests

- End-to-end conversation flow from voice input to AI response
- Integration with existing idiolect profile system
- Voice recording and playback in conversation context
- Real-time conversation state synchronization

### Edge Cases

- Network interruption during conversation
- GPT-4 API rate limiting and error handling
- Audio permission denied scenarios
- Long conversation context management

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
cd frontend && npm run type-check
cd backend && npm run type-check
cd frontend && npm run lint
```

### Level 2: Unit Tests

```bash
cd frontend && npm test -- conversation
cd backend && npm test -- conversation
```

### Level 3: Integration Tests

```bash
cd frontend && npm run test:integration
# Test conversation API endpoints
curl -X POST localhost:3001/conversation/chat -d '{"message":"Hola","userId":"test"}'
```

### Level 4: Manual Validation

- Start conversation practice from main page
- Record voice message in Spanish
- Verify AI responds appropriately in Spanish
- Test conversation context retention across multiple exchanges
- Validate voice synthesis of AI responses

---

## ACCEPTANCE CRITERIA

- [ ] Users can start voice conversations with AI in Spanish
- [ ] AI responses are contextually appropriate and maintain user's style
- [ ] Real-time voice-to-voice conversation flow works smoothly
- [ ] Conversation integrates with existing idiolect profile
- [ ] AI provides gentle corrections and learning feedback
- [ ] Conversation history is saved and accessible
- [ ] Performance meets real-time requirements (<2s response time)
- [ ] All validation commands pass with zero errors
- [ ] Mobile conversation interface works on PWA

---

## COMPLETION CHECKLIST

- [ ] GPT-4 integration implemented and tested
- [ ] Voice-to-voice conversation flow functional
- [ ] UI components created and integrated
- [ ] API endpoints created and validated
- [ ] Integration with existing systems complete
- [ ] Comprehensive test coverage achieved
- [ ] Performance requirements met
- [ ] User experience validated through testing

---

## NOTES

**Design Decisions:**
- Use GPT-4 for superior conversation quality over GPT-3.5
- Implement streaming responses for better real-time feel
- Maintain conversation context for up to 10 exchanges
- Integrate with existing idiolect system for personalization

**Performance Considerations:**
- Implement response caching for common conversation patterns
- Use WebSocket connections for real-time communication
- Optimize audio processing pipeline for minimal latency

**Security Considerations:**
- Sanitize all user inputs before sending to GPT-4
- Implement rate limiting to prevent API abuse
- Store conversation history with proper user isolation
