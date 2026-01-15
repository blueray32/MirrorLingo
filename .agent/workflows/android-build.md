---
description: Build and run the Android app
---

# Android Build Workflow

Run the MirrorLingo mobile app on Android emulator.

## Prerequisites

1. Android SDK installed at `~/Library/Android/sdk`
2. Java 17 installed via Homebrew
3. An Android emulator available (e.g., Medium_Phone_API_36)

## Steps

// turbo-all

1. **Start an Android emulator** (if not already running):
   ```bash
   ~/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36.1 &
   ```

2. **Navigate to the mobile project**:
   ```bash
   cd /Users/ciarancox/dynamous-kiro-hackathon/MirrorLingoMobile
   ```

3. **Run the Android app** with correct environment:
   ```bash
   export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.17/libexec/openjdk.jdk/Contents/Home && export ANDROID_HOME=~/Library/Android/sdk && npm run android
   ```

## Troubleshooting

### Java Version Error
If you see "Unsupported class file major version", ensure Java 17 is being used:
```bash
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.17/libexec/openjdk.jdk/Contents/Home
```

### SDK Not Found
If you see "SDK location not found", ensure `android/local.properties` exists with:
```
sdk.dir=/Users/ciarancox/Library/Android/sdk
```

### Metro Port Conflict
If port 8081 is in use, kill existing processes:
```bash
lsof -ti:8081 | xargs kill -9
```

## Quick One-Liner

```bash
cd /Users/ciarancox/dynamous-kiro-hackathon/MirrorLingoMobile && export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.17/libexec/openjdk.jdk/Contents/Home && export ANDROID_HOME=~/Library/Android/sdk && npm run android
```
