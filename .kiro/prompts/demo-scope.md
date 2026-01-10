---
description: "Analyze feature requirements and classify demo vs production scope"
---

# Demo Scope Analysis

## Feature: $ARGUMENTS

Analyze the requested feature and provide clear scope classification.

## Analysis Template

### Demo Scope (Hackathon)
- localStorage for state persistence
- Enhanced mock APIs where external services aren't critical
- Basic error handling (try/catch with user-friendly messages)
- Standard HTTP request/response (no WebSockets/streaming)
- Inline component rendering (avoid over-engineering)

### Production Scope (Post-Hackathon)
- Database persistence (DynamoDB)
- Full external service integration
- Comprehensive error handling (retry logic, rate limiting)
- Real-time features (WebSockets, streaming)
- Extracted reusable components

## Output Format

```markdown
## Feature: {feature-name}

### Demo Requirements
- [ ] {requirement 1}
- [ ] {requirement 2}

### Production Enhancements (Future)
- [ ] {enhancement 1}
- [ ] {enhancement 2}

### State Persistence
- **Demo**: localStorage with auto-save/restore
- **Production**: DynamoDB with user isolation

### External Services
- **Demo**: {mock/real service decision}
- **Production**: {full integration plan}
```
