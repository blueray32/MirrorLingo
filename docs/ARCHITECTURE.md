# Architecture Documentation

## System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Device   │    │   AWS Cloud     │    │   AI Services   │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │ Next.js   │  │    │  │    API    │  │    │  │  Bedrock  │  │
│  │ Frontend  │◄─┼────┼─►│  Gateway  │◄─┼────┼─►│  (Claude) │  │
│  │           │  │    │  │           │  │    │  │           │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │         │       │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │   PWA     │  │    │  │  Lambda   │  │    │  │Transcribe │  │
│  │ Service   │  │    │  │ Functions │  │    │  │           │  │
│  │  Worker   │  │    │  │           │  │    │  │           │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    │         │       │    └─────────────────┘
                       │  ┌───────────┐  │
                       │  │ DynamoDB  │  │
                       │  │           │  │
                       │  └───────────┘  │
                       │         │       │
                       │  ┌───────────┐  │
                       │  │    S3     │  │
                       │  │  Storage  │  │
                       │  └───────────┘  │
                       └─────────────────┘
```

## Data Flow Architecture

### 1. Phrase Analysis Flow
```
User Input → Frontend Validation → API Gateway → Lambda Handler
     ↓
Phrase Validation → Bedrock Analysis → DynamoDB Storage
     ↓
Response Generation → Frontend Update → UI Display
```

### 2. Voice Processing Flow
```
Audio Recording → Frontend Processing → S3 Upload
     ↓
Transcribe Job → Speech Analysis → Enhanced Patterns
     ↓
Phrase Extraction → Standard Analysis Flow
```

### 3. Spanish Translation Flow
```
Phrase Selection → Translation Request → Bedrock Processing
     ↓
Dual Translation → Style Matching → Cultural Context
     ↓
Response Formatting → Frontend Display
```

## Component Architecture

### Frontend (Next.js)
```
pages/
├── index.tsx                 # Main application page
└── api/
    └── translations.ts       # Client-side API routes

components/
├── PhraseInput.tsx          # Text input form
├── VoiceRecorder.tsx        # Audio recording
├── IdiolectAnalysis.tsx     # Analysis display
├── SpanishTranslations.tsx  # Translation results
├── PracticeSession.tsx      # Spaced repetition
└── ConversationPractice.tsx # AI chat

hooks/
├── usePhrasesApi.ts         # Phrase management
├── useAudioApi.ts           # Audio processing
└── useConversationApi.ts    # Chat integration
```

### Backend (AWS Lambda)
```
handlers/
├── phrase-handler.ts        # Phrase CRUD operations
├── audio-handler.ts         # Audio processing
├── translation-handler.ts   # Spanish translations
└── conversation-handler.ts  # AI chat

services/
├── idiolectAnalyzer.ts      # Core analysis logic
├── bedrockService.ts        # AI service integration
├── transcriptionService.ts  # Speech processing
└── spanishTranslationService.ts # Translation logic

models/
└── phrase.ts                # Data models & validation
```

## Database Schema

### DynamoDB Tables

#### UserPhrases Table
```
Partition Key: userId (String)
Sort Key: phraseId (String)

Attributes:
- englishText: String
- intent: String (work|family|social|etc)
- createdAt: String (ISO timestamp)
- analysis: Object (idiolect patterns)
- speechMetrics: Object (optional)
```

#### UserProfiles Table
```
Partition Key: userId (String)
Sort Key: "profile" (String)

Attributes:
- overallTone: String
- overallFormality: String
- commonPatterns: Array
- preferredIntents: Array
- analysisCount: Number
- lastUpdated: String
```

#### SpacedRepetition Table
```
Partition Key: userId (String)
Sort Key: phraseId (String)

Attributes:
- interval: Number (days)
- repetitions: Number
- easeFactor: Number
- nextReview: String (ISO timestamp)
- quality: Number (last rating)
```

## Security Architecture

### Authentication Flow
```
User Login → AWS Cognito → JWT Token → API Gateway
     ↓
Lambda Authorizer → User Context → Handler Execution
```

### Data Protection
- **Encryption at Rest**: DynamoDB & S3 encryption
- **Encryption in Transit**: HTTPS/TLS everywhere
- **User Isolation**: Partition key-based data separation
- **Input Validation**: Schema validation at API layer

## Deployment Architecture

### Development
```
Local Development → Next.js Dev Server → Mock APIs
```

### Production
```
GitHub → AWS Amplify → CloudFront CDN
    ↓
AWS SAM → CloudFormation → Lambda Deployment
    ↓
Infrastructure as Code → Automated Scaling
```

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Route-based chunks
- **Image Optimization**: Next.js automatic optimization
- **Caching**: Service Worker for offline capability
- **Bundle Size**: Tree shaking and minification

### Backend Optimization
- **Cold Start Mitigation**: Provisioned concurrency
- **Database Optimization**: Single-table design patterns
- **Caching**: API Gateway caching for static responses
- **Monitoring**: CloudWatch metrics and alarms

## Scalability Patterns

### Horizontal Scaling
- **Lambda Auto-scaling**: Automatic concurrency management
- **DynamoDB On-demand**: Pay-per-request scaling
- **CloudFront**: Global edge caching

### Vertical Scaling
- **Memory Optimization**: Right-sized Lambda functions
- **Connection Pooling**: Efficient database connections
- **Batch Processing**: Bulk operations where possible

## Monitoring & Observability

### Metrics
- **Application**: Response times, error rates
- **Infrastructure**: Lambda duration, DynamoDB throttling
- **Business**: User engagement, feature adoption

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Aggregation**: CloudWatch Logs centralization
- **Error Tracking**: Automatic error alerting
