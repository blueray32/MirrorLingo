---
description: Pre-implementation audit for React Native mobile features
---

# Mobile Audit: Pre-Implementation Checks

Run this audit BEFORE implementing any React Native mobile feature to prevent common issues.

## Purpose

This audit surfaces platform-specific issues, dependency problems, and configuration requirements BEFORE implementation begins. It converts reactive debugging into proactive research.

## Audit Process

### 1. React Native Version Check

```bash
# Check current RN version
cat MirrorLingoMobile/package.json | grep '"react-native"'

# Check for New Architecture
cat MirrorLingoMobile/package.json | grep -E '"(hermes|newArchEnabled)"'
```

**Document**:
- Current React Native version
- New Architecture status (enabled/disabled)
- Hermes engine status

### 2. Native Dependency Audit

For each native dependency the feature requires:

```bash
# Check if package exists on npm
npm view <package-name> version

# Check React Native compatibility
npm view <package-name> peerDependencies
```

**Known Problematic Packages** (from mobile.md):
- `@react-native-netinfo` - Does NOT exist (use `@react-native-community/netinfo` or fallback)
- `react-native-device-info` - Adds complexity; consider alternatives for demo scope

**Verify Before Adding**:
- [ ] Package exists on npm registry
- [ ] Compatible with current RN version
- [ ] No known issues in GitHub issues
- [ ] Alternative exists if package fails

### 3. iOS Configuration Check

**Permissions Required** (check Info.plist):
```bash
# View current iOS permissions
cat MirrorLingoMobile/ios/*/Info.plist | grep -A1 "NS.*UsageDescription"
```

**For voice/audio features, verify**:
- [ ] `NSMicrophoneUsageDescription` - Microphone access
- [ ] `NSSpeechRecognitionUsageDescription` - Speech recognition
- [ ] `NSAppTransportSecurity` - For development API calls

**For notifications**:
- [ ] Background modes configured
- [ ] Push notification entitlements

### 4. Android Configuration Check

**Permissions Required** (check AndroidManifest.xml):
```bash
# View current Android permissions
cat MirrorLingoMobile/android/app/src/main/AndroidManifest.xml | grep "uses-permission"
```

**For voice/audio features, verify**:
- [ ] `RECORD_AUDIO` permission
- [ ] `INTERNET` permission

**For notifications**:
- [ ] `RECEIVE_BOOT_COMPLETED` permission
- [ ] `VIBRATE` permission
- [ ] `WAKE_LOCK` permission

### 5. Metro Bundler Assessment

**Check for known issues**:
- [ ] iOS Simulator localhost resolution (RN 0.73 known issue)
- [ ] Boost library CDN availability

**Mitigation Strategy**:
- Plan for embedded bundle if Metro fails
- Document fallback build commands

```bash
# Test Metro bundler connection
npx react-native start --reset-cache
```

### 6. Offline Capability Assessment

**For features requiring offline support**:
- [ ] AsyncStorage patterns documented
- [ ] Data serialization strategy (dates, objects)
- [ ] Sync strategy when online

**Reference**: `.kiro/steering/mobile.md` for offline-first patterns

### 7. Build Verification

**Verify builds work BEFORE feature implementation**:

```bash
# iOS build test
cd MirrorLingoMobile/ios && pod install && cd ..
npx react-native run-ios

# Android build test (if targeting Android)
npx react-native run-android
```

**Document any build issues encountered**.

## Output Report

Save to: `.agents/audits/mobile-audit-[feature-name].md`

### Report Structure

```markdown
# Mobile Audit: [Feature Name]

**Date**: [current date]
**Target**: [brief feature description]

## Environment
- React Native Version: X.X.X
- New Architecture: enabled/disabled
- Hermes: enabled/disabled

## Dependencies
| Package | Status | Compatible | Notes |
|---------|--------|------------|-------|
| package-name | exists/missing | yes/no | notes |

## iOS Configuration
- [ ] Required permissions documented
- [ ] Info.plist updates identified
- [ ] Build tested successfully

## Android Configuration
- [ ] Required permissions documented
- [ ] Manifest updates identified
- [ ] Build tested successfully

## Risk Assessment
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Metro bundler issues | medium | Use embedded bundle |
| CDN failures | low | Use mirror URLs |

## Ready for Implementation
- [ ] All dependencies verified
- [ ] Permissions documented
- [ ] Builds passing
- [ ] Fallback strategies defined

## Blockers
- [List any blockers that must be resolved first]
```

## When to Run This Audit

**Always run before**:
- Adding new native modules
- Implementing voice/audio features
- Adding push notifications
- Implementing offline functionality
- Upgrading React Native version

**Can skip for**:
- Pure JavaScript/TypeScript changes
- UI-only updates (no native bridges)
- Bug fixes in existing features

## Reference

See `.kiro/steering/mobile.md` for:
- Recommended packages
- Packages to avoid
- Offline-first patterns
- Troubleshooting guide
