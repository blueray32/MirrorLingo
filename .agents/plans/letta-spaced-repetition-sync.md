# Feature: Cross-Device Spaced Repetition Sync with Letta

## Feature Description

Enhance the existing spaced repetition system to use Letta for persistent, cross-device learning progress tracking. Users can seamlessly continue their practice sessions across web and mobile platforms with synchronized review schedules, performance history, and mastery levels.

## User Story

As a MirrorLingo user
I want my spaced repetition progress to sync across all my devices
So that I can continue my Spanish learning seamlessly whether I'm on my phone, tablet, or computer

## Problem Statement

Currently, spaced repetition progress is stored locally (localStorage on web, AsyncStorage on mobile), causing:
- Lost progress when switching devices
- Inconsistent review schedules across platforms
- Fragmented learning experience
- No backup of learning achievements

## Solution Statement

Integrate Letta memory blocks to store and sync spaced repetition data across devices, providing unified learning continuity while maintaining offline functionality as fallback.

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: Spaced Repetition System, Letta Service, Frontend/Mobile Storage
**Dependencies**: Existing Letta integration, SpacedRepetitionScheduler

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `frontend/src/utils/spacedRepetition.ts` (lines 1-80) - Why: Core SM-2 algorithm and ReviewItem interface
- `MirrorLingoMobile/src/utils/spacedRepetition.ts` - Why: Mobile spaced repetition implementation
- `backend/src/services/lettaService.ts` (lines 1-150) - Why: Existing Letta integration patterns
- `frontend/src/components/PracticeSession.tsx` (lines 25-50) - Why: Current spaced repetition usage
- `MirrorLingoMobile/src/screens/PracticeScreen.tsx` (lines 90-115) - Why: Mobile practice progress storage
- `MirrorLingoMobile/src/services/offline.ts` (lines 86-100) - Why: Current offline spaced repetition storage

### New Files to Create

- `backend/src/services/spacedRepetitionSyncService.ts` - Letta-based sync service
- `frontend/src/hooks/useSpacedRepetitionSync.ts` - Web sync hook
- `MirrorLingoMobile/src/hooks/useSpacedRepetitionSync.ts` - Mobile sync hook
- `backend/src/types/spacedRepetitionSync.ts` - Sync data types

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Letta Memory Blocks Documentation](https://docs.letta.com/memory-blocks)
  - Specific section: Persistent data storage patterns
  - Why: Required for implementing cross-device sync
- [SM-2 Algorithm Reference](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
  - Specific section: Interval calculation and ease factors
  - Why: Ensure sync doesn't break spaced repetition logic

### Patterns to Follow

**Letta Service Pattern:**
```typescript
// From lettaService.ts
static async syncLearnerProfile(profile: LearnerProfile): Promise<boolean> {
  await this.lettaClient.agents.blocks.update({
    agent_id: this.lettaAgent.id,
    block_label: 'learner_profile',
    value: JSON.stringify(profile)
  });
}
```

**Offline-First Pattern:**
```typescript
// From offline.ts
async saveSchedule(schedules: SpacedRepetitionSchedule[]): Promise<void> {
  await AsyncStorage.setItem(this.SCHEDULE_KEY, JSON.stringify(schedules));
}
```

**Hook Pattern:**
```typescript
// From useLettaSync.ts
const syncProfile = useCallback(async (profile: IdiolectProfile): Promise<boolean> => {
  if (!isLettaEnabled) return false;
  // Sync logic
}, [isLettaEnabled, userId]);
```

---

## IMPLEMENTATION PLAN

### Phase 1: Backend Sync Service

Create Letta-based spaced repetition sync service with memory block management.

**Tasks:**
- Create sync service with Letta memory block operations
- Add sync endpoints to existing Letta handler
- Implement conflict resolution for concurrent updates

### Phase 2: Frontend Integration

Enhance web spaced repetition to use Letta sync with localStorage fallback.

**Tasks:**
- Create sync hook for web platform
- Update PracticeSession component to use sync
- Add sync status indicators to UI

### Phase 3: Mobile Integration

Integrate mobile spaced repetition with Letta sync while maintaining offline-first approach.

**Tasks:**
- Create mobile sync hook
- Update PracticeScreen to use sync
- Ensure AsyncStorage fallback works seamlessly

### Phase 4: Conflict Resolution & Testing

Implement robust conflict resolution and comprehensive testing.

**Tasks:**
- Add timestamp-based conflict resolution
- Create sync validation tests
- Test cross-device scenarios

---

## STEP-BY-STEP TASKS

### CREATE backend/src/types/spacedRepetitionSync.ts

- **IMPLEMENT**: Sync data types and interfaces
- **PATTERN**: Follow existing type patterns from `types/phrases.ts`
- **IMPORTS**: Import ReviewItem from spaced repetition utils
- **GOTCHA**: Ensure Date serialization compatibility across platforms
- **VALIDATE**: `npm run type-check` in backend

### CREATE backend/src/services/spacedRepetitionSyncService.ts

- **IMPLEMENT**: Letta-based sync service with memory blocks
- **PATTERN**: Mirror `lettaService.ts` patterns for memory block operations
- **IMPORTS**: LettaService, ReviewItem, sync types
- **GOTCHA**: Handle Letta unavailable gracefully
- **VALIDATE**: `npm test -- spacedRepetitionSyncService`

### UPDATE backend/src/handlers/letta-handler.ts

- **IMPLEMENT**: Add sync-progress and get-progress endpoints
- **PATTERN**: Follow existing handler patterns in same file
- **IMPORTS**: SpacedRepetitionSyncService
- **GOTCHA**: Maintain CORS headers and error handling
- **VALIDATE**: `curl -X POST localhost:3001/api/letta/sync-progress`

### CREATE frontend/src/hooks/useSpacedRepetitionSync.ts

- **IMPLEMENT**: Web sync hook with localStorage fallback
- **PATTERN**: Mirror `useLettaSync.ts` structure and patterns
- **IMPORTS**: ReviewItem, API utilities
- **GOTCHA**: Handle network failures gracefully
- **VALIDATE**: `npm test -- useSpacedRepetitionSync`

### UPDATE frontend/src/components/PracticeSession.tsx

- **IMPLEMENT**: Integrate sync hook into practice workflow
- **PATTERN**: Follow existing hook usage patterns in component
- **IMPORTS**: useSpacedRepetitionSync hook
- **GOTCHA**: Don't break existing localStorage functionality
- **VALIDATE**: Manual test practice session with sync enabled/disabled

### CREATE MirrorLingoMobile/src/hooks/useSpacedRepetitionSync.ts

- **IMPLEMENT**: Mobile sync hook with AsyncStorage fallback
- **PATTERN**: Adapt web hook for React Native patterns
- **IMPORTS**: AsyncStorage, ReviewItem, mobile API service
- **GOTCHA**: Handle Date serialization properly for AsyncStorage
- **VALIDATE**: `npm test` in MirrorLingoMobile directory

### UPDATE MirrorLingoMobile/src/screens/PracticeScreen.tsx

- **IMPLEMENT**: Integrate mobile sync into practice screen
- **PATTERN**: Follow existing AsyncStorage patterns in file
- **IMPORTS**: useSpacedRepetitionSync hook
- **GOTCHA**: Maintain offline-first behavior
- **VALIDATE**: Test on iOS simulator with network on/off

### ADD backend/src/services/__tests__/spacedRepetitionSyncService.test.ts

- **IMPLEMENT**: Comprehensive sync service tests
- **PATTERN**: Follow existing service test patterns
- **IMPORTS**: Jest, sync service, mock Letta
- **GOTCHA**: Mock Letta client properly
- **VALIDATE**: `npm test -- spacedRepetitionSyncService.test.ts`

---

## TESTING STRATEGY

**Testing Prioritization:**
- **Essential Tests**: Sync service, conflict resolution, fallback behavior
- **Demo Tests**: Basic sync functionality validation
- **Production Tests**: Cross-device scenarios, network failure handling

### Unit Tests

Test sync service operations, conflict resolution logic, and hook behavior with mocked dependencies.

### Integration Tests

Test complete sync workflow from practice session to Letta storage and retrieval.

### Cross-Device Tests

Manual testing scenarios:
1. Start practice on web, continue on mobile
2. Complete reviews on mobile, verify sync on web
3. Test with Letta disabled (fallback behavior)

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
cd backend && npm run type-check
cd frontend && npm run type-check
cd MirrorLingoMobile && npm run type-check
```

### Level 2: Unit Tests

```bash
cd backend && npm test -- spacedRepetitionSync
cd frontend && npm test -- useSpacedRepetitionSync
cd MirrorLingoMobile && npm test
```

### Level 3: Integration Tests

```bash
cd backend && npm test -- letta-handler
cd frontend && npm test -- PracticeSession
```

### Level 4: Manual Validation

```bash
# Start backend
cd backend && npm run dev

# Test sync endpoints
curl -X GET http://localhost:3001/api/letta/status
curl -X POST http://localhost:3001/api/letta/sync-progress -H "Content-Type: application/json" -d '{"reviews":[]}'

# Test frontend
cd frontend && npm run dev
# Navigate to practice session, complete reviews, verify sync

# Test mobile
cd MirrorLingoMobile && npx react-native run-ios
# Complete practice session, verify sync with web
```

---

## DOCUMENTATION UPDATES

**Required Documentation Changes:**
- Update README.md with cross-device sync feature
- Add sync troubleshooting to mobile documentation
- Document Letta memory block structure for spaced repetition

---

## ACCEPTANCE CRITERIA

- [ ] Spaced repetition progress syncs across web and mobile
- [ ] Offline functionality maintained when Letta unavailable
- [ ] Conflict resolution handles concurrent updates correctly
- [ ] No data loss during sync operations
- [ ] Performance impact minimal (<100ms sync operations)
- [ ] All existing spaced repetition functionality preserved
- [ ] Comprehensive test coverage (80%+)
- [ ] Cross-device manual testing scenarios pass

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)
- [ ] No linting or type checking errors
- [ ] Manual cross-device testing confirms sync works
- [ ] Acceptance criteria all met
- [ ] Code reviewed for quality and maintainability

---

## NOTES

**Design Decisions:**
- Use timestamp-based conflict resolution (last write wins)
- Maintain offline-first approach with Letta as enhancement
- Sync on practice completion rather than real-time for performance

**Trade-offs:**
- Slight complexity increase for significant UX improvement
- Dependency on Letta for optimal experience but graceful degradation
- Memory block size limits may require pagination for heavy users
