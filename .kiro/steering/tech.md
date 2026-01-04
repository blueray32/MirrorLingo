# Technical Architecture

## Technology Stack
**Frontend**: TypeScript + Next.js (React) - Modern web framework with server-side rendering capabilities
**Backend**: AWS Serverless (API Gateway + Lambda) - Scalable, pay-per-use architecture
**AI/ML**: Amazon Bedrock - Managed LLM service for translation and personalization
**Database**: Amazon DynamoDB - NoSQL database for user data and phrase storage
**Authentication**: AWS Cognito - Managed user authentication and authorization
**Storage**: Amazon S3 - Audio files and static assets
**Deployment**: AWS Amplify - Streamlined deployment and hosting

## Architecture Overview
**Clean Separation Architecture**:
- **UI Layer**: Next.js React components handling user interactions
- **API Layer**: Lambda functions behind API Gateway for business logic
- **Data Layer**: DynamoDB for structured data, S3 for media files
- **AI Layer**: Amazon Bedrock for LLM operations with RAG-style personalization

**Core Domain Modules**:
- **IdiolectProfile**: Analyzes and stores user's speaking patterns
- **IntentClustering**: Groups phrases by context (work, family, errands)
- **TranslationVariants**: Generates literal vs natural Spanish translations
- **SRScheduler**: Manages spaced repetition scheduling and intervals

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
