# Mobile Development Standards

## Technology Stack
**Framework**: React Native 0.73+ with New Architecture (Hermes engine)
**Navigation**: @react-navigation/stack with typed routes
**State Management**: React hooks + AsyncStorage for persistence
**Audio**: react-native-audio-recorder-player + @react-native-voice/voice
**Notifications**: react-native-push-notification for spaced repetition reminders
**Platforms**: iOS (primary), Android (secondary)

## Architecture Overview
**Cross-Platform Architecture**:
- **Screens**: React Native components following mobile UX patterns
- **Services**: Shared API client with offline fallback
- **Storage**: AsyncStorage for offline-first data persistence
- **Native Modules**: Audio recording and speech recognition via native bridges

**Core Mobile Modules**:
- **VoiceRecorder**: Native audio recording with quality settings
- **OfflineService**: AsyncStorage-based data persistence and sync
- **NotificationService**: Push notification scheduling for practice reminders
- **ApiService**: HTTP client with offline fallback to mock data

## Required iOS Permissions
**Info.plist Configuration**:
```xml
<!-- Required for API calls during development -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

<!-- Required for voice recording -->
<key>NSMicrophoneUsageDescription</key>
<string>MirrorLingo needs microphone access to record your voice for pronunciation practice.</string>

<!-- Required for speech recognition -->
<key>NSSpeechRecognitionUsageDescription</key>
<string>MirrorLingo uses speech recognition to transcribe your voice recordings.</string>
```

## Required Android Permissions
**AndroidManifest.xml Configuration**:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## React Native Version Constraints
**Current Version**: 0.73.x with New Architecture enabled
**Hermes Engine**: Required for performance and bundle size
**Metro Bundler**: Use embedded bundles for iOS Simulator demo reliability

**Known Issues**:
- Metro bundler localhost resolution can fail on iOS Simulator
- Solution: Embed pre-built JS bundle for demos using `npx react-native bundle`
- Boost library CDN (JFrog) may be unreliable
- Solution: Use archives.boost.io mirror in boost.podspec if needed

## Recommended Packages
**Audio & Voice**:
- `react-native-audio-recorder-player` - Native audio recording
- `@react-native-voice/voice` - Speech recognition

**Storage & State**:
- `@react-native-async-storage/async-storage` - Offline data persistence

**Notifications**:
- `react-native-push-notification` - Local push notifications

**Navigation**:
- `@react-navigation/native` - Navigation container
- `@react-navigation/stack` - Stack-based navigation

## Packages to Avoid
**Deprecated or Problematic**:
- `@react-native-netinfo` - Does not exist; use `@react-native-community/netinfo` or assume-online fallback
- `react-native-device-info` - Adds complexity; use random UUID for demo scope

**Network Detection Alternative**:
```typescript
// Instead of NetInfo, use try/catch with API calls
const isOnline = async (): Promise<boolean> => {
  try {
    await fetch(API_BASE_URL + '/health', { method: 'HEAD' });
    return true;
  } catch {
    return false;
  }
};
```

## Offline-First Patterns
**AsyncStorage Data Structure**:
```typescript
// User identification
await AsyncStorage.setItem('userId', generateUUID());

// Phrase storage
await AsyncStorage.setItem('phrases', JSON.stringify(phrases));

// Practice progress
await AsyncStorage.setItem('practiceProgress', JSON.stringify(progress));

// Settings
await AsyncStorage.setItem('settings', JSON.stringify(settings));
```

**Date Serialization Warning**:
```typescript
// WRONG: JSON.parse returns string dates, not Date objects
const data = JSON.parse(await AsyncStorage.getItem('data'));
if (data.createdAt > new Date()) { } // String comparison fails!

// CORRECT: Parse dates after JSON.parse
const data = JSON.parse(await AsyncStorage.getItem('data'));
data.createdAt = new Date(data.createdAt);
if (data.createdAt > new Date()) { } // Date comparison works
```

## Voice Recording Patterns
**Callback State Capture**:
```typescript
// WRONG: Stale closure captures initial state
voice.onSpeechResults = (e) => {
  setTranscript(e.value[0]); // May use stale state
};

// CORRECT: Use functional updates or refs
voice.onSpeechResults = (e) => {
  setTranscript(prev => e.value[0]); // Always current
};

// BEST: Use ref for real-time access
const transcriptRef = useRef('');
voice.onSpeechResults = (e) => {
  transcriptRef.current = e.value[0];
  setTranscript(e.value[0]);
};
```

## Metro Bundler Configuration
**Embedded Bundle for Demo**:
```bash
# Generate iOS bundle
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios

# Update AppDelegate to use local bundle
# In AppDelegate.swift, ensure bundleURL returns local bundle path
```

**metro.config.js**:
```javascript
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

## Testing Strategy
**Mobile-Specific Tests**:
- AsyncStorage mock for unit tests
- Navigation testing with @react-navigation/native testing utilities
- Native module mocks for audio/voice components

**Jest Configuration**:
```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
  },
};
```

## Code Review Checklist
**Mobile-Specific Items**:
- [ ] Date objects properly parsed after JSON.parse
- [ ] Async initialization handles race conditions
- [ ] Callback closures don't capture stale state
- [ ] AsyncStorage keys are namespaced to avoid collisions
- [ ] Native permissions documented in Info.plist/AndroidManifest
- [ ] Offline fallback implemented for all API calls
- [ ] Loading states shown during async operations
- [ ] Error states handled gracefully with user feedback

## Demo vs Production Scope
**Demo Mode** (Hackathon):
- Random UUID for user identification (stored in AsyncStorage)
- Mock API responses when backend unavailable
- iOS Simulator only (Android deferred)
- Embedded JS bundle (no Metro dependency)
- Basic error handling (console.log)

**Production Mode** (Post-Hackathon):
- Device-specific unique ID via react-native-device-info
- Real API integration with retry logic
- Both iOS and Android builds
- Live Metro bundler with hot reload
- Comprehensive error handling with crash reporting
- Network state detection with offline queue

## Build Commands
**iOS Development**:
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

**iOS Demo Bundle**:
```bash
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios
cd ios && xcodebuild -workspace MirrorLingoMobile.xcworkspace -scheme MirrorLingoMobile -configuration Release -sdk iphonesimulator
```

**Android Development**:
```bash
npx react-native run-android
```

## Troubleshooting
**Common Issues**:

1. **Boost library download fails**
   - Cause: JFrog CDN unreliable
   - Fix: Edit `ios/Pods/boost.podspec` to use `https://archives.boost.io/release/` mirror

2. **Metro bundler won't connect to iOS Simulator**
   - Cause: localhost resolution issues in RN 0.73
   - Fix: Use embedded JS bundle instead of Metro server

3. **AsyncStorage returns null unexpectedly**
   - Cause: Async initialization race condition
   - Fix: Add loading state and await AsyncStorage before rendering

4. **Speech recognition not working**
   - Cause: Missing permissions
   - Fix: Add NSMicrophoneUsageDescription and NSSpeechRecognitionUsageDescription to Info.plist
