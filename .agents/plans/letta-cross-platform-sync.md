# Feature: Cross-Platform Learning State Sync with Letta

## Feature Description

Implement comprehensive cross-platform learning state synchronization using Letta to enable seamless device switching, unified learning timelines, and synchronized progress across web and mobile platforms.

## User Story

As a MirrorLingo user who uses both web and mobile apps
I want my learning progress to sync seamlessly across all my devices
So that I can continue my Spanish learning journey from any device without losing progress or context

## Problem Statement

Currently, learning state is fragmented across platforms:
- Web uses localStorage, mobile uses AsyncStorage - no synchronization
- Users lose progress when switching between devices
- Practice sessions, pronunciation progress, and conversation history don't sync
- Fragmented learning experience reduces engagement and continuity

## Solution Statement

Create a comprehensive Letta-powered cross-platform sync system that unifies all learning state across devices, providing seamless continuity for practice sessions, pronunciation progress, conversation history, and user preferences.

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: High
**Primary Systems Affected**: All Learning Components, Letta Service, Web/Mobile Storage
**Dependencies**: Existing Letta integration, all learning systems (spaced repetition, pronunciation, conversation)

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `frontend/src/hooks/useConversationApi.ts` (lines 25-60) - Why: Current localStorage conversation state management
- `MirrorLingoMobile/src/services/offline.ts` (lines 1-100) - Why: Current AsyncStorage learning state patterns
- `MirrorLingoMobile/src/screens/PracticeScreen.tsx` (lines 90-115) - Why: Mobile practice progress storage
- `backend/src/services/lettaService.ts` (lines 80-120) - Why: Existing Letta memory block operations
- `frontend/src/utils/spacedRepetition.ts` - Why: Spaced repetition state structure
- `frontend/src/components/PronunciationFeedback.tsx` (lines 1-50) - Why: Pronunciation progress patterns

### New Files to Create

- `backend/src/services/crossPlatformSyncService.ts` - Letta-based unified sync service
- `backend/src/types/crossPlatformSync.ts` - Cross-platform sync data types
- `frontend/src/hooks/useCrossPlatformSync.ts` - Web sync hook
- `MirrorLingoMobile/src/hooks/useCrossPlatformSync.ts` - Mobile sync hook
- `backend/src/handlers/cross-platform-sync-handler.ts` - Sync API endpoints
- `shared/src/types/syncState.ts` - Shared sync state types

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Letta Memory Blocks Documentation](https://docs.letta.com/memory-blocks)
  - Specific section: Large data structures and efficient querying
  - Why: Required for storing comprehensive learning state
- [React Native AsyncStorage Best Practices](https://react-native-async-storage.github.io/async-storage/docs/usage)
  - Specific section: Data synchronization patterns
  - Why: Needed for mobile sync implementation

### Patterns to Follow

**Mobile Offline Storage Pattern:**
```typescript
// From offline.ts
async savePhraseOffline(phraseData: OfflinePhraseData): Promise<void> {
  const existing = await this.getOfflinePhrases();
  const updated = [...existing, phraseData];
  await AsyncStorage.setItem(this.PHRASES_KEY, JSON.stringify(updated));
}
```

**Web localStorage Pattern:**
```typescript
// From useConversationApi.ts
const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
if (stored) {
  const data = JSON.parse(stored);
  setMessages(data.messages || []);
}
```

**Letta Memory Pattern:**
```typescript
// From lettaService.ts
await this.lettaClient.agents.blocks.update({
  agent_id: this.lettaAgent.id,
  block_label: 'cross_platform_state',
  value: JSON.stringify(syncState)
});
```

---

## IMPLEMENTATION PLAN

### Phase 1: Unified Sync Data Model

Create comprehensive data structures for cross-platform learning state synchronization.

**Tasks:**
- Define unified learning state structure covering all platforms
- Create sync conflict resolution algorithms
- Design efficient data serialization for Letta storage

### Phase 2: Backend Sync Service

Implement Letta-based cross-platform sync service with conflict resolution.

**Tasks:**
- Create unified sync service with Letta integration
- Implement intelligent conflict resolution for concurrent updates
- Add efficient data compression and storage optimization

### Phase 3: Frontend Sync Integration

Integrate cross-platform sync into web application with seamless fallback.

**Tasks:**
- Create web sync hook with localStorage fallback
- Update all learning components to use unified sync
- Add sync status indicators and conflict resolution UI

### Phase 4: Mobile Sync Integration

Integrate cross-platform sync into mobile application with offline-first approach.

**Tasks:**
- Create mobile sync hook with AsyncStorage fallback
- Update all mobile learning components to use unified sync
- Ensure offline-first behavior with background sync

---

## STEP-BY-STEP TASKS

### CREATE shared/src/types/syncState.ts

- **IMPLEMENT**: Unified learning state types for cross-platform synchronization
- **PATTERN**: Combine patterns from existing web and mobile state types
- **IMPORTS**: All learning state types (spaced repetition, conversation, pronunciation)
- **GOTCHA**: Ensure Date serialization works across platforms
- **VALIDATE**: `npm run type-check` in both frontend and MirrorLingoMobile

### CREATE backend/src/types/crossPlatformSync.ts

- **IMPLEMENT**: Cross-platform sync metadata and conflict resolution types
- **PATTERN**: Follow existing type patterns from `types/phrases.ts`
- **IMPORTS**: Shared sync state types, Date utilities
- **GOTCHA**: Handle timezone differences and device identification
- **VALIDATE**: `npm run type-check` in backend

### CREATE backend/src/services/crossPlatformSyncService.ts

- **IMPLEMENT**: Letta-based unified sync service with intelligent conflict resolution
- **PATTERN**: Extend `lettaService.ts` patterns with comprehensive state management
- **IMPORTS**: LettaService, cross-platform sync types, compression utilities
- **GOTCHA**: Handle large learning state efficiently with compression
- **VALIDATE**: `npm test -- crossPlatformSyncService`

### CREATE backend/src/handlers/cross-platform-sync-handler.ts

- **IMPLEMENT**: API endpoints for cross-platform sync operations
- **PATTERN**: Follow existing handler patterns from `letta-handler.ts`
- **IMPORTS**: CrossPlatformSyncService, auth utilities
- **GOTCHA**: Handle large payloads and implement proper rate limiting
- **VALIDATE**: `curl -X POST localhost:3001/api/cross-platform-sync/upload-state`

### CREATE frontend/src/hooks/useCrossPlatformSync.ts

- **IMPLEMENT**: Web sync hook with localStorage fallback and conflict resolution
- **PATTERN**: Extend `useConversationApi.ts` patterns for comprehensive state sync
- **IMPORTS**: Cross-platform sync types, API utilities, localStorage utilities
- **GOTCHA**: Handle sync conflicts gracefully with user choice
- **VALIDATE**: `npm test -- useCrossPlatformSync`

### CREATE MirrorLingoMobile/src/hooks/useCrossPlatformSync.ts

- **IMPLEMENT**: Mobile sync hook with AsyncStorage fallback and offline-first approach
- **PATTERN**: Adapt web sync hook for React Native with offline considerations
- **IMPORTS**: Cross-platform sync types, AsyncStorage, mobile API service
- **GOTCHA**: Ensure Date objects serialize/deserialize correctly
- **VALIDATE**: `npm test` in MirrorLingoMobile directory

### UPDATE frontend/src/hooks/useConversationApi.ts

- **IMPLEMENT**: Integrate cross-platform sync into conversation state management
- **PATTERN**: Follow existing hook patterns in file
- **IMPORTS**: useCrossPlatformSync hook
- **GOTCHA**: Maintain existing localStorage fallback behavior
- **VALIDATE**: Manual test conversation sync between devices

### UPDATE MirrorLingoMobile/src/screens/PracticeScreen.tsx

- **IMPLEMENT**: Integrate cross-platform sync into mobile practice screen
- **PATTERN**: Follow existing AsyncStorage patterns in file
- **IMPORTS**: useCrossPlatformSync hook
- **GOTCHA**: Maintain offline-first behavior with background sync
- **VALIDATE**: Test practice session sync between mobile and web

### UPDATE frontend/src/components/PracticeSession.tsx

- **IMPLEMENT**: Integrate cross-platform sync into web practice session
- **PATTERN**: Follow existing component patterns for state management
- **IMPORTS**: useCrossPlatformSync hook
- **GOTCHA**: Don't break existing spaced repetition functionality
- **VALIDATE**: Manual test practice session sync across platforms

### CREATE frontend/src/components/SyncStatusIndicator.tsx

- **IMPLEMENT**: Visual indicator for cross-platform sync status and conflicts
- **PATTERN**: Follow existing component patterns for status indicators
- **IMPORTS**: Cross-platform sync hook, sync status utilities
- **GOTCHA**: Ensure sync status is clear and actionable
- **VALIDATE**: Manual test sync status with various sync states

### ADD backend/src/services/__tests__/crossPlatformSyncService.test.ts

- **IMPLEMENT**: Comprehensive cross-platform sync service tests
- **PATTERN**: Follow existing service test patterns
- **IMPORTS**: Jest, cross-platform sync service, mock Letta, mock learning data
- **GOTCHA**: Test conflict resolution accuracy and data integrity
- **VALIDATE**: `npm test -- crossPlatformSyncService.test.ts`

### CREATE integration-tests/cross-platform-sync.test.ts

- **IMPLEMENT**: End-to-end cross-platform sync integration tests
- **PATTERN**: Create new integration test patterns for cross-platform scenarios
- **IMPORTS**: Web and mobile sync utilities, test data generators
- **GOTCHA**: Test actual cross-platform scenarios with realistic data
- **VALIDATE**: `npm run test:integration -- cross-platform-sync`

---

## TESTING STRATEGY

**Testing Prioritization:**
- **Essential Tests**: Sync service, conflict resolution, data integrity across platforms
- **Demo Tests**: Basic sync functionality between web and mobile
- **Production Tests**: Large dataset sync, network failure scenarios, concurrent updates

### Unit Tests

Test sync service operations, conflict resolution algorithms, and platform-specific sync hooks.

### Integration Tests

Test complete sync workflow from web to Letta to mobile and vice versa.

### Cross-Platform Tests

Manual testing scenarios:
1. Start learning on web, continue on mobile
2. Complete practice on mobile, verify sync on web
3. Test with network interruptions and offline scenarios
4. Test concurrent updates from multiple devices

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
cd backend && npm run type-check
cd frontend && npm run type-check
cd MirrorLingoMobile && npm run type-check
npm run lint
```

### Level 2: Unit Tests

```bash
cd backend && npm test -- crossPlatformSync
cd frontend && npm test -- useCrossPlatformSync
cd MirrorLingoMobile && npm test
```

### Level 3: Integration Tests

```bash
cd backend && npm test -- cross-platform-sync-handler
npm run test:integration -- cross-platform-sync
```

### Level 4: Manual Cross-Platform Validation

```bash
# Start backend
cd backend && npm run dev

# Test sync endpoints
curl -X GET http://localhost:3001/api/cross-platform-sync/state/test-user
curl -X POST http://localhost:3001/api/cross-platform-sync/upload-state -H "Content-Type: application/json" -d '{"learningState":{}}'

# Test web
cd frontend && npm run dev
# Complete learning activities, verify sync status

# Test mobile
cd MirrorLingoMobile && npx react-native run-ios
# Complete learning activities, verify sync with web
```

### Level 5: Conflict Resolution Testing

```bash
# Simulate concurrent updates from multiple devices
# Verify conflict resolution works correctly
# Test data integrity after conflict resolution
```

---

## DOCUMENTATION UPDATES

**Required Documentation Changes:**
- Update README.md with cross-platform sync feature
- Add sync troubleshooting guide to documentation
- Document conflict resolution behavior for users

---

## ACCEPTANCE CRITERIA

- [ ] Learning state syncs seamlessly between web and mobile platforms
- [ ] Offline functionality maintained with background sync when online
- [ ] Conflict resolution handles concurrent updates without data loss
- [ ] Sync performance acceptable with large learning datasets
- [ ] All learning components (practice, conversation, pronunciation) sync correctly
- [ ] Sync status clearly communicated to users
- [ ] Fallback to local storage works when Letta unavailable
- [ ] No regressions in existing platform-specific functionality

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)
- [ ] No linting or type checking errors
- [ ] Manual cross-platform testing confirms sync works
- [ ] Conflict resolution testing passes
- [ ] Acceptance criteria all met
- [ ] Code reviewed for quality and maintainability

---

## NOTES

**Design Decisions:**
- Use timestamp-based conflict resolution with user override option
- Implement compression for large learning state data
- Maintain offline-first approach with sync as enhancement

**Trade-offs:**
- Increased complexity for significantly improved user experience
- Dependency on Letta for optimal sync but graceful degradation
- Performance considerations with large learning datasets
