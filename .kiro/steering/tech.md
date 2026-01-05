# Technical Architecture

## Technology Stack
**Frontend**: TypeScript + Next.js (React) + Web Audio API - Modern web framework with voice recording capabilities
**Backend**: AWS Serverless (API Gateway + Lambda) - Scalable, pay-per-use architecture
**AI/ML**: Amazon Bedrock + AWS Transcribe - Managed LLM service and speech-to-text processing
**Database**: Amazon DynamoDB - NoSQL database for user data and phrase storage
**Storage**: Amazon S3 - Audio files and static assets
**Authentication**: AWS Cognito - Managed user authentication and authorization
**Deployment**: AWS SAM - Infrastructure as Code with CloudFormation

## Architecture Overview
**Clean Separation Architecture**:
- **UI Layer**: Next.js React components handling user interactions and voice recording
- **API Layer**: Lambda functions behind API Gateway for business logic
- **Data Layer**: DynamoDB for structured data, S3 for media files
- **AI Layer**: Amazon Bedrock for LLM operations + AWS Transcribe for speech processing

**Core Domain Modules**:
- **IdiolectProfile**: Analyzes and stores user's speaking patterns from text and audio
- **IntentClustering**: Groups phrases by context (work, family, errands)
- **TranslationVariants**: Generates literal vs natural Spanish translations
- **SRScheduler**: Manages spaced repetition scheduling and intervals
- **AudioProcessor**: Handles voice recording, transcription, and speech analysis
- **TranscriptionService**: Advanced AWS Transcribe integration with speech metrics
- **BackgroundRecorder**: Continuous voice activity detection and phrase segmentation
- **SpanishTranslationService**: AI-powered translation with style preservation

## Development Environment
**Required Tools**:
- Node.js 18+ and npm/yarn for package management
- AWS CLI configured with appropriate permissions
- TypeScript for type safety and better development experience
- Next.js development server for local testing
- AWS SAM CLI for serverless deployment (optional)

**Development Setup**:
- Local development with Next.js dev server
- AWS services accessed via SDK during development
- Environment variables for API keys and configuration
- Hot reload for rapid iteration

## Code Standards
**TypeScript Standards**:
- Strict TypeScript configuration with proper typing
- ESLint + Prettier for consistent code formatting
- Functional components with React hooks
- Clear separation of concerns between components

**API Standards**:
- RESTful API design with consistent naming
- Proper HTTP status codes and error handling
- Input validation and sanitization
- Structured JSON responses

## Testing Strategy
**Unit Testing**: Jest + React Testing Library for component and function tests
**Property-Based Testing**: Fast-check for spaced repetition scheduler invariants
**API Contract Testing**: Verify endpoint contracts and data structures
**Integration Testing**: End-to-end user flows with test data
**Coverage Target**: 80%+ coverage for core business logic

**Testing Prioritization**:
- **Essential Tests**: Core business logic, API endpoints, critical user flows
- **Demo Tests**: Basic functionality validation for hackathon demonstrations
- **Production Tests**: Comprehensive edge cases, error handling, performance

## Demo Mode Implementation
**For hackathon and prototype development**:
- **Enhanced Mock APIs**: Realistic responses without external service dependencies
- **AI Service Consistency**: Use Bedrock for all AI operations to maintain architectural patterns
- **Functional Demonstrations**: All features must be user-testable in demo environment
- **Production Readiness Path**: Clear upgrade path from demo to production implementation

## Deployment Process
**AWS-First Deployment**:
- Frontend: AWS Amplify hosting with automatic builds from Git
- Backend: Lambda functions deployed via AWS SAM or Amplify
- Infrastructure as Code: CloudFormation templates for reproducible deployments
- Environment Management: Separate dev/staging/prod environments
- One-click deployment path for easy judge access

## Performance Requirements
**Response Times**:
- Generate practice set: <2 seconds for typical inputs
- Page load times: <1 second for cached content
- API responses: <500ms for data retrieval operations

**Scalability**:
- Serverless auto-scaling for traffic spikes
- DynamoDB on-demand pricing for variable usage
- CloudFront CDN for global content delivery

## Security Considerations
**Data Protection**:
- Encryption at rest (DynamoDB, S3) and in transit (HTTPS)
- AWS Cognito for secure authentication with JWT tokens
- Input validation and sanitization to prevent injection attacks
- Clear data retention policies with user data deletion capabilities

**Privacy Controls**:
- User data isolation through proper partitioning
- No raw audio storage unless explicitly needed
- Text transcripts stored instead of audio when possible
- Transparent data usage policies
