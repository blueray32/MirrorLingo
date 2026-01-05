# Project Structure

## Directory Layout
```
MirrorLingo/
├── frontend/                    # Next.js React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── PhraseInput.tsx # Text-based phrase input form
│   │   │   ├── VoiceRecorder.tsx # Voice recording component
│   │   │   └── IdiolectAnalysis.tsx # Analysis results display
│   │   ├── pages/             # Next.js pages (routing)
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── usePhrasesApi.ts # Text phrase API integration
│   │   │   └── useAudioApi.ts  # Audio upload and processing
│   │   ├── utils/             # Utility functions
│   │   └── types/             # TypeScript type definitions
│   ├── public/                # Static assets
│   └── package.json           # Frontend dependencies
├── backend/                    # AWS Lambda functions
│   ├── src/
│   │   ├── handlers/          # Lambda function handlers
│   │   │   ├── phrase-handler.ts # Text phrase processing
│   │   │   └── audio-handler.ts  # Voice recording processing
│   │   ├── services/          # Business logic services
│   │   ├── models/            # Data models and types
│   │   └── utils/             # Shared utilities
│   └── package.json           # Backend dependencies
├── infrastructure/             # AWS infrastructure as code
│   ├── template.yaml          # SAM template (includes S3, Transcribe, DynamoDB)
│   └── scripts/               # Deployment scripts
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── property/              # Property-based tests
├── .kiro/                     # Kiro CLI configuration
│   ├── steering/              # Project steering documents
│   └── prompts/               # Custom prompts
└── docs/                      # Additional documentation
```

## File Naming Conventions
**TypeScript/JavaScript**:
- Components: PascalCase (e.g., `PhraseInput.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useSpacedRepetition.ts`)
- Utilities: camelCase (e.g., `translatePhrase.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

**Lambda Functions**:
- Handler files: kebab-case (e.g., `phrase-handler.ts`)
- Service files: camelCase (e.g., `translationService.ts`)

## Module Organization
**Frontend Modules**:
- **Components**: Atomic UI components (buttons, inputs, cards, voice recorder, background recorder, Spanish translations)
- **Pages**: Route-based page components
- **Hooks**: Custom React hooks for state management and API calls (phrases, audio)
- **Services**: API client functions and external service integrations

**Backend Modules**:
- **Handlers**: Lambda entry points for API endpoints (phrases, audio processing, translations)
- **Services**: Core business logic (IdiolectProfile, TranslationVariants, AudioProcessor, TranscriptionService, SpanishTranslationService)
- **Models**: TypeScript interfaces and data validation schemas (including SpeechMetrics)
- **Utils**: Shared utilities for AWS SDK, validation, etc.

## Configuration Files
**Frontend**:
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript compiler options
- `.env.local` - Environment variables for development

**Backend**:
- `template.yaml` - AWS SAM template for infrastructure
- `tsconfig.json` - TypeScript configuration for Lambda functions
- Environment variables managed through AWS Parameter Store

## Documentation Structure
- `README.md` - Project overview and setup instructions
- `docs/api.md` - API endpoint documentation
- `docs/architecture.md` - Detailed architecture diagrams
- `docs/deployment.md` - Deployment and infrastructure guide
- `.kiro/steering/` - Product, technical, and structural specifications

## Asset Organization
**Static Assets**:
- `frontend/public/images/` - UI images and icons
- `frontend/public/audio/` - Sample audio files for development
- S3 bucket structure for production audio files

**Generated Assets**:
- Audio files: `s3://bucket/audio/{userId}/{phraseId}.mp3`
- User uploads: `s3://bucket/uploads/{userId}/`

## Build Artifacts
**Frontend**:
- `.next/` - Next.js build output (gitignored)
- `out/` - Static export output (if using static export)

**Backend**:
- `.aws-sam/` - SAM build artifacts (gitignored)
- `dist/` - Compiled TypeScript output (gitignored)

## Environment-Specific Files
**Development**:
- `.env.local` - Local environment variables
- `docker-compose.yml` - Local DynamoDB and other services (optional)

**Production**:
- Environment variables managed through AWS Systems Manager Parameter Store
- Separate CloudFormation stacks for dev/staging/prod
- Branch-based deployment through AWS Amplify
