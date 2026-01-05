# Demo Mode Planning Command

## Purpose
Convert production feature plans to demo-friendly implementations for hackathons and prototypes.

## Usage
```
@demo-mode [feature-plan-file]
```

## Process

### 1. Analyze Production Plan
- Read the original feature plan
- Identify external service dependencies
- Note complex integrations and real-time requirements
- Extract core user-facing functionality

### 2. Create Demo Alternatives
For each production component, specify demo alternative:

**External APIs** → Enhanced mock responses with realistic data
**Real-time features** → Polling or simplified state management  
**Complex integrations** → Simplified workflows with same user experience
**Production databases** → Local state or simplified data structures

### 3. Maintain User Experience
- All user-facing functionality must work in demo mode
- Visual feedback and loading states preserved
- Error handling simplified but present
- Performance targets adjusted for demo environment

### 4. Document Upgrade Path
- Clear mapping from demo to production implementation
- List of external services needed for production
- Configuration changes required
- Testing strategy differences

## Output Format
Create `[feature-name]-demo-plan.md` with:

- **Demo Scope**: What works in demo vs production
- **Mock Implementations**: Detailed mock API responses
- **User Flow**: Complete demo user experience
- **Upgrade Tasks**: Steps to convert to production
- **Testing**: Demo-specific validation requirements

## Example Transformations

**Production**: Real-time WebSocket chat with GPT-4
**Demo**: Request-response with enhanced mock AI responses

**Production**: AWS Transcribe with S3 audio storage  
**Demo**: Web Audio API with client-side processing

**Production**: DynamoDB with user authentication
**Demo**: Local state management with session storage
