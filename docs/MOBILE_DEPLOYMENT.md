# Mobile Deployment Guide

## iOS Deployment

### Prerequisites
- Xcode 15+ installed
- iOS Developer Account
- CocoaPods installed

### Setup
```bash
cd MirrorLingoMobile/ios
pod install
```

### Build Configuration
1. Open `MirrorLingoMobile.xcworkspace` in Xcode
2. Select your development team in signing settings
3. Update bundle identifier: `com.yourcompany.mirrorlingo`
4. Configure app icons and launch screen

### Release Build
```bash
cd MirrorLingoMobile
npx react-native run-ios --configuration Release
```

### App Store Submission
1. Archive in Xcode (Product → Archive)
2. Upload to App Store Connect
3. Configure app metadata and screenshots
4. Submit for review

## Android Deployment

### Prerequisites
- Android Studio installed
- Android SDK 34+
- Java 17+

### Setup
```bash
cd MirrorLingoMobile/android
./gradlew clean
```

### Build Configuration
1. Update `android/app/build.gradle`:
   - Change `applicationId` to your package name
   - Update version codes and names
2. Generate signing key:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

### Release Build
```bash
cd MirrorLingoMobile/android
./gradlew assembleRelease
```

### Google Play Submission
1. Upload APK/AAB to Google Play Console
2. Configure store listing and screenshots
3. Set up app signing
4. Submit for review

## Environment Configuration

### Production API Endpoints
Update `src/services/api.ts`:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';
```

### Push Notifications
Configure Firebase:
1. Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
2. Update notification settings in app config
3. Test notification delivery

## Performance Optimization

### Bundle Size
- Enable Hermes engine (already configured)
- Use ProGuard for Android release builds
- Optimize images and assets

### Native Modules
All required native modules are properly linked:
- `@react-native-voice/voice`
- `react-native-audio-recorder-player`
- `@react-native-async-storage/async-storage`
- `@react-native-community/netinfo`

## Testing

### Device Testing
```bash
# iOS Simulator
npx react-native run-ios --simulator="iPhone 15"

# Android Emulator  
npx react-native run-android
```

### Physical Device Testing
- iOS: Connect device and run from Xcode
- Android: Enable USB debugging and run `npx react-native run-android`

## Troubleshooting

### Common Issues
1. **Metro bundler issues**: `npx react-native start --reset-cache`
2. **iOS build failures**: Clean build folder in Xcode
3. **Android build failures**: `cd android && ./gradlew clean`
4. **Pod install issues**: `cd ios && pod deintegrate && pod install`

### Performance Monitoring
- Enable Flipper for debugging (development only)
- Use React Native Performance Monitor
- Monitor memory usage and bundle size
