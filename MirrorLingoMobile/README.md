# MirrorLingo Mobile App

React Native version of MirrorLingo - Your Personal Spanish Learning Coach.

## Quick Start

### Prerequisites
- Node.js 18+
- React Native development environment
- iOS Simulator (Mac) or Android Emulator

### Installation
```bash
cd MirrorLingoMobile
npm install

# iOS (Mac only)
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## Features

### ✅ Core Mobile Features
- **Native Voice Recording**: High-quality audio capture with permissions
- **Speech Recognition**: Real-time transcription using React Native Voice
- **Touch-Optimized UI**: Mobile-first design with gesture support
- **Offline Caching**: AsyncStorage for offline phrase practice
- **Native Navigation**: Stack navigation between screens

### ✅ Migrated from Web App
- **Phrase Analysis**: AI-powered idiolect detection
- **Spanish Translations**: Dual literal/natural translations
- **Style Matching**: Personality preservation in Spanish
- **Progress Tracking**: Learning statistics and achievements

## Architecture

### Mobile-Specific Components
- **VoiceRecorder**: Native audio recording with speech recognition
- **HomeScreen**: Main navigation hub
- **RecordScreen**: Voice recording and phrase collection
- **PracticeScreen**: Spanish translation practice
- **ProgressScreen**: Learning analytics dashboard

### Shared Services
- **API Service**: Connects to existing AWS backend
- **Offline Storage**: AsyncStorage for cached phrases
- **Mock Data**: Demo functionality without backend dependency

## Development Status

### ✅ Completed
- Project structure and navigation
- Voice recording with speech recognition
- API integration with offline fallback
- Core practice workflow
- Progress tracking UI

### 🔄 Next Steps
- Push notifications for spaced repetition
- Background audio processing
- Enhanced offline mode
- App store deployment
- Performance optimization

## Technical Stack
- **React Native 0.73**: Cross-platform mobile framework
- **TypeScript**: Type safety and better development experience
- **React Navigation**: Native navigation patterns
- **AsyncStorage**: Offline data persistence
- **React Native Voice**: Speech recognition
- **Audio Recorder Player**: High-quality audio recording

## Key Advantages Over Web App
- **Better Audio Quality**: Native recording APIs
- **Always Available**: Mobile device accessibility
- **Push Notifications**: Spaced repetition reminders
- **Offline Practice**: No internet required for cached phrases
- **Touch Optimized**: Mobile-first user experience

## Demo Flow
1. **Home Screen**: Choose to record phrases or practice
2. **Record Screen**: Voice recording with real-time transcription
3. **Practice Screen**: Spanish translations with style matching
4. **Progress Screen**: Learning statistics and achievements

This mobile app maintains the core MirrorLingo value proposition while leveraging native mobile capabilities for an enhanced learning experience.
