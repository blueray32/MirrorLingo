# Code Review: MirrorLingoMobile Pre-Commit Review

**Date**: 2026-01-06
**Reviewer**: Kiro CLI
**Scope**: New MirrorLingoMobile React Native app + README updates

---

## Stats

- Files Modified: 2 (README.md, package-lock.json)
- Files Added: ~15 source files in MirrorLingoMobile/
- Files Deleted: 0
- New lines: ~12,000+ (mostly package-lock.json)
- Deleted lines: ~5,400 (package-lock.json updates)

---

## Issues Found

### HIGH

```
severity: high
file: MirrorLingoMobile/src/services/api.ts
line: 38-40
issue: userId regenerated on every app instantiation
detail: getOrCreateUserId() generates a new random ID every time the class is instantiated. This means the user loses all their data association on app restart since the ID is never persisted to AsyncStorage.
suggestion: Store the generated userId in AsyncStorage on first creation and retrieve it on subsequent launches:
  private async getOrCreateUserId(): Promise<string> {
    const stored = await AsyncStorage.getItem('user_id');
    if (stored) return stored;
    const newId = `mobile-${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    await AsyncStorage.setItem('user_id', newId);
    return newId;
  }
```

```
severity: high
file: MirrorLingoMobile/src/services/offline.ts
line: 87-93
issue: saveSchedule compares Date objects incorrectly
detail: The condition `schedule.nextReview > new Date()` compares a Date that was deserialized from JSON (which is a string) against a Date object. JSON.parse returns strings for Date fields, not Date objects.
suggestion: Parse the date before comparison:
  if (new Date(schedule.nextReview) > new Date()) {
```

```
severity: high
file: MirrorLingoMobile/src/components/VoiceRecorder.tsx
line: 88-91
issue: Voice.stop() returns undefined, not speech results
detail: The @react-native-voice/voice library's stop() method returns a Promise<void>, not the speech results. The transcript will always be empty string because speechResults is undefined.
suggestion: Store speech results from the onSpeechResults callback in state and use that value when stopping:
  const [transcript, setTranscript] = useState('');
  Voice.onSpeechResults = (e) => {
    if (e.value?.[0]) setTranscript(e.value[0]);
  };
  // In stopRecording:
  onRecordingComplete(result, transcript);
```

### MEDIUM

```
severity: medium
file: MirrorLingoMobile/src/services/api.ts
line: 31
issue: Placeholder API URL will cause all API calls to fail
detail: The baseUrl defaults to 'https://your-api-gateway-url.amazonaws.com' which is not a valid endpoint. All API calls will fail in production.
suggestion: Either configure a real API endpoint or ensure the mock fallback is always used for demo mode. Consider adding a clear error message when the placeholder URL is detected.
```

```
severity: medium
file: MirrorLingoMobile/src/services/notifications.ts
line: 53-58
issue: Hash function can produce negative numbers
detail: The bitwise operations in the hash function can produce negative numbers due to JavaScript's 32-bit signed integer handling. While Math.abs() is used, the modulo operation should come after to ensure consistent positive IDs.
suggestion: The current implementation is correct but could be clearer:
  const hash = phraseId.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
  const notificationId = Math.abs(hash % 2147483647);
```

```
severity: medium
file: MirrorLingoMobile/src/screens/ProgressScreen.tsx
line: 1-180
issue: Progress data is hardcoded, not fetched from storage
detail: The ProgressScreen displays static mock data (12 phrases, 8 mastered, 92% match) instead of reading actual user progress from offlineService.
suggestion: Fetch real data from offlineService.getStorageInfo() and offlineService.getSchedule() in useEffect.
```

```
severity: medium
file: MirrorLingoMobile/App.tsx
line: 1-50
issue: Settings and AudioTest screens not registered in navigator
detail: SettingsScreen and AudioTestScreen exist but are not added to the navigation stack, making them inaccessible to users.
suggestion: Add Settings and AudioTest to RootStackParamList and Stack.Navigator.
```

### LOW

```
severity: low
file: MirrorLingoMobile/src/services/api.ts
line: 33
issue: isOnline always true, never updated
detail: The isOnline property is set to true in constructor but never updated based on actual network state. The NetInfo removal was intentional but the property is now misleading.
suggestion: Either remove the isOnline property entirely or add a comment explaining it's always true for demo mode.
```

```
severity: low
file: MirrorLingoMobile/src/components/VoiceRecorder.tsx
line: 44-60
issue: Android permissions request includes deprecated storage permissions
detail: WRITE_EXTERNAL_STORAGE and READ_EXTERNAL_STORAGE are deprecated on Android 10+ and not needed for audio recording to app-specific storage.
suggestion: Only request RECORD_AUDIO permission. For Android 10+, scoped storage handles file access automatically.
```

```
severity: low
file: MirrorLingoMobile/src/screens/RecordScreen.tsx
line: 38-39
issue: Potential stale closure in Alert callback
detail: The Alert callback captures `recordings` state at the time of recording, but uses spread operator with newRecording. If multiple recordings happen quickly, state could be stale.
suggestion: Use functional update pattern: setRecordings(prev => [...prev, newRecording]) which is already done correctly, but the Alert callback should also use the updated state.
```

---

## Summary

The MirrorLingoMobile app is a well-structured React Native application with good separation of concerns. However, there are **3 high-severity issues** that should be addressed before commit:

1. **User ID persistence** - Critical for data continuity across app restarts
2. **Date comparison bug** - Will cause spaced repetition scheduling to fail
3. **Voice transcript capture** - Speech recognition results are not being captured correctly

The medium and low severity issues are acceptable for a demo/hackathon context but should be addressed before production deployment.

---

## Verification Commands

```bash
# Check TypeScript compilation
cd MirrorLingoMobile && npx tsc --noEmit

# Verify iOS build
cd ios && xcodebuild -workspace MirrorLingoMobile.xcworkspace -scheme MirrorLingoMobile -configuration Debug -sdk iphonesimulator -arch arm64 build
```
