# Component Documentation

## Core Components

### PhraseInput
Text-based phrase input form with validation.

**Props:**
```typescript
interface PhraseInputProps {
  onSubmit: (phrases: string[]) => void;
  isLoading?: boolean;
  maxPhrases?: number; // default: 10
}
```

**Usage:**
```tsx
<PhraseInput 
  onSubmit={handlePhrases}
  isLoading={isAnalyzing}
  maxPhrases={5}
/>
```

### VoiceRecorder
Single voice recording with real-time visualization.

**Props:**
```typescript
interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  maxDuration?: number; // seconds, default: 60
  showVisualization?: boolean; // default: true
}
```

**Features:**
- Real-time audio level visualization
- Automatic silence detection
- Recording controls (start/stop/pause)

### BackgroundRecorder
Continuous background recording with phrase segmentation.

**Props:**
```typescript
interface BackgroundRecorderProps {
  onPhraseDetected: (audioBlob: Blob, transcript: string) => void;
  isActive: boolean;
  silenceThreshold?: number; // default: 0.01
}
```

**Features:**
- Voice activity detection
- Automatic phrase segmentation
- Background processing

### IdiolectAnalysis
Display analysis results with visual patterns.

**Props:**
```typescript
interface IdiolectAnalysisProps {
  profile: IdiolectProfile;
  phrases: Phrase[];
  showDetails?: boolean; // default: false
}
```

**Displays:**
- Tone and formality levels
- Common language patterns
- Intent distribution
- Confidence metrics

### SpanishTranslations
Dual translation display with style matching.

**Props:**
```typescript
interface SpanishTranslationsProps {
  translations: Translation[];
  onPracticeSelect: (translation: Translation) => void;
  showExplanations?: boolean; // default: true
}
```

**Features:**
- Literal vs natural translations
- Style preservation indicators
- Cultural context notes
- Practice session integration

### PracticeSession
Spaced repetition practice interface.

**Props:**
```typescript
interface PracticeSessionProps {
  phrases: Phrase[];
  onComplete: (results: PracticeResult[]) => void;
  algorithm?: 'SM2' | 'custom'; // default: 'SM2'
}
```

**Features:**
- SM-2 spaced repetition algorithm
- 4-level difficulty rating
- Progress tracking
- Adaptive scheduling

### ConversationPractice
AI-powered Spanish conversation interface.

**Props:**
```typescript
interface ConversationPracticeProps {
  topic: ConversationTopic;
  userProfile: IdiolectProfile;
  onMessageSent: (message: string, isVoice: boolean) => void;
}
```

**Features:**
- Real-time chat interface
- Voice message support
- Personalized AI responses
- Grammar corrections

### AnalyticsDashboard
Progress tracking and insights visualization.

**Props:**
```typescript
interface AnalyticsDashboardProps {
  userData: UserData;
  timeRange?: 'week' | 'month' | 'all'; // default: 'week'
  showPatterns?: boolean; // default: true
}
```

**Displays:**
- Learning progress charts
- Pattern analysis
- Milestone tracking
- Performance metrics

## Hooks

### usePhrasesApi
Phrase management and analysis API integration.

```typescript
const {
  phrases,
  profile,
  isLoading,
  error,
  submitPhrases,
  loadPhrases
} = usePhrasesApi();
```

### useAudioApi
Audio recording and transcription integration.

```typescript
const {
  isRecording,
  isProcessing,
  transcriptionResult,
  startRecording,
  stopRecording,
  uploadAudio
} = useAudioApi();
```

### useConversationApi
AI conversation practice integration.

```typescript
const {
  messages,
  isTyping,
  sendMessage,
  startVoiceMessage,
  clearConversation
} = useConversationApi(topic, userProfile);
```

## Utility Functions

### spacedRepetition.ts
SM-2 algorithm implementation for optimal learning intervals.

```typescript
// Calculate next review date
const nextReview = calculateNextReview(
  currentInterval: number,
  quality: number, // 0-5 rating
  repetitions: number
);

// Update card difficulty
const newEaseFactor = updateEaseFactor(
  currentEase: number,
  quality: number
);
```

## Styling Guidelines

### CSS Classes
- `.mirror-*` - Component-specific styles
- `.loading-*` - Loading state styles  
- `.error-*` - Error state styles
- `.success-*` - Success state styles

### Responsive Breakpoints
- Mobile: `max-width: 768px`
- Tablet: `768px - 1024px`
- Desktop: `min-width: 1024px`

### Color Scheme
- Primary: `#2563eb` (blue)
- Secondary: `#7c3aed` (purple)
- Success: `#059669` (green)
- Warning: `#d97706` (orange)
- Error: `#dc2626` (red)
