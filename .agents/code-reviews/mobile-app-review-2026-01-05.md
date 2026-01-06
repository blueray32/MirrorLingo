# Code Review: MirrorLingoMobile App

**Date**: 2026-01-05
**Reviewer**: Kiro CLI

## Stats

- Files Modified: 2 (README.md, package-lock.json)
- Files Added: ~20 source files + dependencies (MirrorLingoMobile/)
- Files Deleted: 0
- New lines: ~12,082
- Deleted lines: ~5,444

---

## Issues Found

### HIGH

```
severity: high
file: MirrorLingoMobile/src/services/api.ts
line: 33
issue: Hardcoded user ID in production code
detail: The userId is hardcoded as 'mobile-user-123' with a comment saying "In production, get from auth". This will cause all users to share the same data, breaking user isolation and creating a security/privacy issue.
suggestion: Implement proper authentication and retrieve userId from auth context or secure storage. At minimum, generate a unique device ID on first launch.
```

```
severity: high
file: MirrorLingoMobile/src/services/api.ts
line: 32
issue: Placeholder API URL will cause runtime failures
detail: The baseUrl defaults to 'https://your-api-gateway-url.amazonaws.com' which is not a valid endpoint. Any API call will fail silently and fall back to mock data without clear indication to users.
suggestion: Either configure a real API endpoint via environment variables or add explicit error handling that informs users when running in demo mode.
```

```
severity: high
file: MirrorLingoMobile/src/services/offline.ts
line: 143
issue: Date comparison bug in markProgressSynced
detail: Comparing Date objects with getTime() after JSON.parse will fail because JSON.parse returns strings, not Date objects. The timestamp comparison `p.timestamp.getTime()` will throw an error.
suggestion: Parse the timestamp string back to Date before comparison: `new Date(p.timestamp).getTime() === new Date(timestamp).getTime()`
```

### MEDIUM

```
severity: medium
file: MirrorLingoMobile/src/services/notifications.ts
line: 56
issue: Unsafe parseInt on phraseId
detail: Using parseInt() on phraseId assumes it's a numeric string. If phraseId is a UUID or non-numeric string, this will return NaN, causing notification scheduling to fail silently.
suggestion: Use a hash function to convert string IDs to numeric notification IDs, or use a separate numeric ID field for notifications.
```

```
severity: medium
file: MirrorLingoMobile/src/services/api.ts
line: 167-168
issue: Missing error handling for JSON.parse
detail: getCachedAnalysis and getCachedPhrases use JSON.parse without try-catch around the parse itself. If stored data is corrupted, this will throw.
suggestion: The outer try-catch handles this, but consider validating the parsed data structure before returning.
```

```
severity: medium
file: MirrorLingoMobile/src/services/offline.ts
line: 28-34
issue: No data validation on savePhraseOffline
detail: The function accepts any OfflinePhraseData without validating required fields. Malformed data could corrupt the offline storage.
suggestion: Add validation for required fields (id, phrase, createdAt) before saving.
```

### LOW

```
severity: low
file: MirrorLingoMobile/src/screens/HomeScreen.tsx
line: 1-120
issue: No loading or error states
detail: The HomeScreen doesn't handle any loading states or potential errors when navigating to other screens. Users have no feedback if something goes wrong.
suggestion: Consider adding a simple loading indicator or error boundary for better UX.
```

```
severity: low
file: MirrorLingoMobile/src/services/api.ts
line: 38-40
issue: Constructor side effect comment is misleading
detail: The comment says "Network listener disabled" but there's no disabled code - it was removed entirely. The comment should be removed or updated.
suggestion: Remove the misleading comment or add a TODO for implementing network detection.
```

```
severity: low
file: MirrorLingoMobile/package.json
line: N/A
issue: Missing react-native-push-notification peer dependency
detail: The notifications.ts imports react-native-push-notification but it's listed in package.json. However, the native linking may not be complete for iOS.
suggestion: Verify pod install completed successfully and native modules are linked.
```

---

## Security Notes

1. **No secrets exposed** - API keys and credentials are not hardcoded in the source files.
2. **User isolation concern** - The hardcoded userId is a significant issue for multi-user scenarios.
3. **Data storage** - AsyncStorage is used for offline data, which is appropriate for non-sensitive data but should not store auth tokens without encryption.

---

## Positive Observations

- Clean TypeScript interfaces for data types
- Good separation of concerns (api, offline, notifications services)
- Proper error handling with fallback to mock data for demo purposes
- Consistent code style and formatting
- Good use of React Native best practices in components

---

## Recommendations

1. **Priority 1**: Fix the Date comparison bug in `markProgressSynced` - this will cause runtime errors
2. **Priority 2**: Implement proper user identification before any production use
3. **Priority 3**: Add data validation for offline storage operations
4. **Priority 4**: Consider adding TypeScript strict mode for better type safety
