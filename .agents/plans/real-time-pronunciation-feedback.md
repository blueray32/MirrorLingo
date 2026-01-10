# Feature: Real-time Pronunciation Feedback System

## Feature Description

Implement a comprehensive real-time pronunciation feedback system that analyzes user's Spanish pronunciation using Web Speech API and provides detailed scoring, visual feedback, and improvement suggestions. The system will compare user pronunciation against native Spanish patterns and provide instant feedback on accuracy, fluency, and pronunciation quality.

## User Story

As a Spanish learner using MirrorLingo
I want to receive real-time feedback on my Spanish pronunciation
So that I can improve my accent, fluency, and speaking confidence through targeted practice

## Problem Statement

Current pronunciation practice in MirrorLingo is limited to basic text-to-speech playback without assessment. Users cannot get objective feedback on their pronunciation quality, making it difficult to identify specific areas for improvement. There's no systematic way to track pronunciation progress or receive targeted coaching.

## Solution Statement

Create an advanced pronunciation assessment system using Web Speech API for real-time speech recognition, combined with Amazon Bedrock for intelligent analysis. The system will provide detailed scoring across multiple dimensions (accuracy, fluency, pronunciation), visual feedback with waveform analysis, and personalized improvement suggestions based on detected patterns.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Frontend (new pronunciation components), Backend (pronunciation analysis service), Web Speech API integration
**Dependencies**: Web Speech API, Amazon Bedrock, existing audio infrastructure

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `frontend/src/components/PronunciationFeedback.tsx` - Existing pronunciation component with basic mock feedback
- `backend/src/services/bedrockService.ts` - AI service integration patterns for analysis
- `frontend/src/components/VoiceRecorder.tsx` - Voice recording patterns and Web Audio API usage
- `backend/src/services/transcriptionService.ts` - Speech processing and metrics analysis
- `frontend/src/hooks/useAudioApi.ts` - Audio API integration patterns
- `frontend/src/types/phrases.ts` - Type definitions for speech metrics and analysis
- `backend/src/models/phrase.ts` - Backend type definitions for speech data

### New Files to Create

- `backend/src/services/pronunciationAnalysisService.ts` - Core pronunciation analysis logic
- `frontend/src/components/RealTimePronunciationFeedback.tsx` - Enhanced real-time feedback component
- `frontend/src/hooks/usePronunciationAnalysis.ts` - Pronunciation analysis hook
- `backend/src/handlers/pronunciation-handler.ts` - API endpoints for pronunciation analysis
- `frontend/src/components/PronunciationWaveform.tsx` - Audio waveform visualization
- `backend/src/types/pronunciation.ts` - Pronunciation-specific type definitions
- `frontend/src/utils/speechRecognitionUtils.ts` - Web Speech API utilities
- `tests/pronunciation-analysis.test.ts` - Comprehensive pronunciation tests

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
  - Specific section: SpeechRecognition interface and confidence scoring
  - Why: Required for implementing real-time speech recognition and analysis
- [SpeechRecognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
  - Specific section: Event handling and result processing
  - Why: Needed for capturing and processing speech recognition results
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
  - Specific section: Audio analysis and visualization
  - Why: Required for real-time audio level monitoring and waveform display

### Patterns to Follow

**AI Service Integration Pattern:**
```typescript
// Mirror pattern from bedrockService.ts
export class PronunciationAnalysisService {
  static async analyzePronunciation(audioData: string, targetPhrase: string): Promise<PronunciationAnalysis>
}
```

**Voice Processing Pattern:**
```typescript
// Follow VoiceRecorder.tsx pattern
const usePronunciationAnalysis = (): PronunciationAnalysisReturn => {
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
}
```

**Component Structure Pattern:**
```typescript
// Follow existing component patterns
export const RealTimePronunciationFeedback: React.FC<PronunciationFeedbackProps> = ({
  targetPhrase,
  onAnalysisComplete
}) => {
```

**Error Handling Pattern:**
```typescript
// Follow bedrockService.ts error handling
try {
  const result = await this.processAnalysis(data);
  return result;
} catch (error) {
  console.error('Pronunciation analysis error:', error);
  throw new Error('Failed to analyze pronunciation');
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

Set up core pronunciation analysis infrastructure and Web Speech API integration

**Tasks:**
- Create pronunciation analysis service with Bedrock integration
- Set up Web Speech API utilities for real-time recognition
- Define comprehensive type definitions for pronunciation data
- Create basic pronunciation analysis API endpoints

### Phase 2: Core Implementation

Implement main pronunciation feedback functionality with real-time analysis

**Tasks:**
- Build enhanced pronunciation feedback component with real-time processing
- Implement pronunciation analysis hook with Web Speech API
- Create audio waveform visualization component
- Add detailed scoring algorithms for accuracy, fluency, and pronunciation

### Phase 3: Integration

Connect pronunciation system with existing MirrorLingo features

**Tasks:**
- Integrate with existing Spanish translation system
- Connect to user's idiolect profile for personalized feedback
- Add pronunciation practice to main navigation and practice sessions
- Implement pronunciation progress tracking and analytics

### Phase 4: Testing & Validation

Comprehensive testing of pronunciation functionality and user experience

**Tasks:**
- Unit tests for pronunciation analysis service and algorithms
- Integration tests for Web Speech API and real-time processing
- User experience testing for feedback accuracy and usefulness
- Performance testing for real-time analysis response times

---

## STEP-BY-STEP TASKS

### CREATE backend/src/types/pronunciation.ts

- **IMPLEMENT**: Comprehensive type definitions for pronunciation analysis
- **PATTERN**: Mirror phrase.ts structure for consistency
- **IMPORTS**: Base types from existing type files
- **GOTCHA**: Ensure compatibility with existing SpeechMetrics interface
- **VALIDATE**: `cd backend && npx tsc --noEmit`

### CREATE backend/src/services/pronunciationAnalysisService.ts

- **IMPLEMENT**: Core pronunciation analysis using Bedrock and speech processing
- **PATTERN**: Mirror bedrockService.ts structure for AI integration
- **IMPORTS**: BedrockService, pronunciation types, transcription service
- **GOTCHA**: Handle Web Speech API confidence scores and alternative results
- **VALIDATE**: `cd backend && npm test -- pronunciationAnalysisService.test.ts`

### CREATE frontend/src/utils/speechRecognitionUtils.ts

- **IMPLEMENT**: Web Speech API utilities for real-time recognition
- **PATTERN**: Follow existing utils structure and error handling
- **IMPORTS**: Web Speech API types, pronunciation types
- **GOTCHA**: Handle browser compatibility and permission requirements
- **VALIDATE**: `cd frontend && npx tsc --noEmit`

### CREATE frontend/src/hooks/usePronunciationAnalysis.ts

- **IMPLEMENT**: React hook for pronunciation analysis with Web Speech API
- **PATTERN**: Mirror useAudioApi.ts structure and state management
- **IMPORTS**: React hooks, pronunciation types, speech recognition utils
- **GOTCHA**: Manage real-time state updates and cleanup on unmount
- **VALIDATE**: Test hook with mock pronunciation data

### CREATE frontend/src/components/PronunciationWaveform.tsx

- **IMPLEMENT**: Real-time audio waveform visualization component
- **PATTERN**: Follow existing component structure with Web Audio API
- **IMPORTS**: React hooks, Web Audio API, visualization utilities
- **GOTCHA**: Handle audio context lifecycle and performance optimization
- **VALIDATE**: Render component and test waveform display

### UPDATE frontend/src/components/PronunciationFeedback.tsx

- **IMPLEMENT**: Enhance existing component with real-time analysis capabilities
- **PATTERN**: Maintain existing component structure while adding new features
- **IMPORTS**: New pronunciation analysis hook, waveform component
- **GOTCHA**: Preserve backward compatibility with existing usage
- **VALIDATE**: Test enhanced component with real pronunciation data

### CREATE backend/src/handlers/pronunciation-handler.ts

- **IMPLEMENT**: API endpoints for pronunciation analysis and feedback
- **PATTERN**: Mirror phrase-handler.ts structure and error handling
- **IMPORTS**: Pronunciation analysis service, AWS Lambda types, CORS headers
- **GOTCHA**: Handle streaming audio data and real-time processing
- **VALIDATE**: `curl -X POST /pronunciation/analyze -H "x-user-id: test"`

### UPDATE frontend/src/pages/index.tsx

- **IMPLEMENT**: Add pronunciation practice to main navigation
- **PATTERN**: Follow existing navigation pattern for practice sessions
- **IMPORTS**: Enhanced PronunciationFeedback component
- **GOTCHA**: Ensure proper state management between features
- **VALIDATE**: Navigate to pronunciation practice from main page

### CREATE frontend/src/components/RealTimePronunciationFeedback.tsx

- **IMPLEMENT**: Advanced real-time pronunciation feedback with live analysis
- **PATTERN**: Follow ConversationPractice.tsx for real-time interactions
- **IMPORTS**: Pronunciation analysis hook, waveform component, Web Speech API utils
- **GOTCHA**: Handle real-time audio processing without blocking UI
- **VALIDATE**: Test real-time feedback with various Spanish phrases

---

## TESTING STRATEGY

**Testing Prioritization:**
- **Essential Tests**: Core pronunciation analysis, Web Speech API integration, real-time processing
- **Demo Tests**: Basic functionality validation with mock speech recognition
- **Production Tests**: Comprehensive accuracy testing, performance optimization, browser compatibility

### Unit Tests

- PronunciationAnalysisService with mock Bedrock responses
- usePronunciationAnalysis hook state management
- speechRecognitionUtils browser compatibility handling
- Pronunciation scoring algorithms accuracy and edge cases

### Integration Tests

- End-to-end pronunciation analysis from speech input to feedback
- Web Speech API integration with real audio data
- Real-time waveform visualization performance
- Pronunciation feedback accuracy across different Spanish phrases

### Edge Cases

- Network interruption during real-time analysis
- Web Speech API permission denied scenarios
- Unsupported browser fallback behavior
- Audio quality variations and noise handling
- Long pronunciation sessions and memory management

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
cd frontend && npm run type-check
cd backend && npm run type-check
cd frontend && npm run lint
cd backend && npm run lint
```

### Level 2: Unit Tests

```bash
cd frontend && npm test -- pronunciation
cd backend && npm test -- pronunciation
```

### Level 3: Integration Tests

```bash
cd frontend && npm run test:integration
# Test pronunciation analysis endpoints
curl -X POST localhost:3001/pronunciation/analyze -d '{"audioData":"base64data","targetPhrase":"Hola","userId":"test"}'
```

### Level 4: Manual Validation

- Start pronunciation practice from main page
- Record Spanish phrase and verify real-time waveform display
- Confirm detailed pronunciation feedback with scoring
- Test Web Speech API integration across different browsers
- Validate pronunciation progress tracking and analytics

---

## ACCEPTANCE CRITERIA

- [ ] Users can record Spanish phrases and receive real-time pronunciation feedback
- [ ] System provides detailed scoring for accuracy, fluency, and pronunciation quality
- [ ] Real-time waveform visualization displays during recording
- [ ] Web Speech API integration works across major browsers (Chrome, Firefox, Safari)
- [ ] Pronunciation analysis integrates with existing idiolect profile system
- [ ] Feedback includes specific improvement suggestions based on detected patterns
- [ ] Performance meets real-time requirements (<2s analysis time)
- [ ] All validation commands pass with zero errors
- [ ] Mobile pronunciation interface works on PWA
- [ ] Pronunciation progress tracking integrates with analytics dashboard

---

## COMPLETION CHECKLIST

- [ ] Web Speech API integration implemented and tested
- [ ] Real-time pronunciation analysis functional
- [ ] Enhanced UI components created and integrated
- [ ] API endpoints created and validated
- [ ] Integration with existing systems complete
- [ ] Comprehensive test coverage achieved
- [ ] Performance requirements met
- [ ] Browser compatibility validated
- [ ] User experience tested and optimized

---

## NOTES

**Design Decisions:**
- Use Web Speech API for real-time recognition over AWS Transcribe for lower latency
- Implement client-side audio processing with server-side analysis for optimal performance
- Maintain compatibility with existing PronunciationFeedback component
- Focus on Spanish pronunciation patterns and phonetic analysis

**Performance Considerations:**
- Implement audio processing throttling to prevent UI blocking
- Use Web Workers for intensive audio analysis when possible
- Cache pronunciation analysis results for repeated phrases
- Optimize waveform rendering for smooth real-time display

**Security Considerations:**
- Validate all audio input before processing
- Implement rate limiting for pronunciation analysis API
- Ensure proper cleanup of audio resources and permissions
- Handle microphone permissions gracefully across browsers

**Browser Compatibility:**
- Provide fallback for browsers without Web Speech API support
- Test across Chrome (full support), Firefox (limited), Safari (partial)
- Implement progressive enhancement for advanced features
- Clear user messaging for unsupported browsers
