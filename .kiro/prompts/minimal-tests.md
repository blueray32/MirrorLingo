# Minimal Tests Command

## Purpose
Create essential test coverage when time is limited, focusing on critical functionality over comprehensive testing.

## Usage
```
@minimal-tests [feature-name]
```

## Testing Prioritization

### Essential Tests (Must Have)
- **Core business logic**: Algorithm correctness, data transformations
- **API endpoints**: Request/response contracts, error handling
- **Critical user flows**: Happy path through main features
- **Integration points**: Component communication, data flow

### Optional Tests (Nice to Have)
- **Edge cases**: Boundary conditions, unusual inputs
- **Error scenarios**: Network failures, invalid data
- **Performance tests**: Load testing, response times
- **UI interactions**: Button clicks, form validation

## Implementation Strategy

### 1. Identify Critical Paths
- Map user journey through feature
- Identify failure points that break core functionality
- Focus on business logic over UI interactions

### 2. Create Test Structure
```typescript
// Essential: Core business logic
describe('SpacedRepetitionScheduler', () => {
  test('calculates next review date correctly', () => {})
  test('adjusts interval based on performance', () => {})
})

// Essential: API contracts
describe('ConversationAPI', () => {
  test('returns valid response format', () => {})
  test('handles authentication errors', () => {})
})

// Optional: UI interactions
describe('ConversationPractice', () => {
  test('displays messages correctly', () => {}) // Skip if time limited
})
```

### 3. Mock External Dependencies
- Use simple mocks for external APIs
- Focus on testing your code, not external services
- Validate data flow, not implementation details

## Output Requirements

Create minimum test files:
- `[feature-name].test.ts` - Core business logic tests
- `[feature-name]-api.test.ts` - API endpoint tests  
- `[feature-name]-integration.test.ts` - Critical user flow test

## Success Criteria
- All essential tests pass
- Core functionality validated
- API contracts verified
- Main user journey tested
- Zero TypeScript errors in test files
