# Root Cause Analysis: Background Mode Stuck on "READY"

## Issue Summary

- **GitHub Issue ID**: N/A (Local debugging session)
- **Title**: Background Mode shows "READY" but never transitions to "LISTENING"
- **Severity**: High
- **Status**: In Progress

## Problem Description

Background Learning Mode activates (button shows "Stop Learning") but the status indicator remains stuck on "READY" instead of transitioning to "LISTENING". Speech recognition does not detect phrases.

**Expected Behavior:**
1. Click "Start Learning" → Status shows "LISTENING"
2. Audio level bar responds to voice input
3. Phrases are detected and auto-saved

**Actual Behavior:**
1. Click "Start Learning" → Status shows "READY"
2. Audio level bar may or may not respond
3. No phrases detected

**Symptoms:**
- Status orb not pulsing green
- "READY" text instead of "LISTENING"
- No phrase detection occurring

## Reproduction

**Steps to Reproduce:**
1. Navigate to http://localhost:3000
2. Click "Background Mode" tab
3. Click "Start Learning"
4. Observe status remains "READY"

**Reproduction Verified:** Yes

## Root Cause

### Affected Components

- **Files**: 
  - `frontend/src/components/BackgroundRecorder.tsx`
  - `frontend/src/components/HomeContent.tsx`
- **Functions/Classes**: `initSpeechRecognition`, `startListening`, `onAnalysisComplete`
- **Dependencies**: Web Speech API (`webkitSpeechRecognition`)

### Analysis

**Two issues identified:**

#### Issue 1: Stale Closure Capturing `isActive`

The `initSpeechRecognition` callback captures `isActive` prop in its closure, but `isActive` is not in the dependency array. When speech recognition's `onend` event fires, it checks:

```typescript
recognition.onend = () => {
  if (isActive && speechRecognitionRef.current) {  // isActive is STALE here
    try { speechRecognitionRef.current.start(); } catch (e) { }
  }
};
```

The `isActive` value is `false` from when the callback was created, so recognition never restarts.

**Code Location:**
```
frontend/src/components/BackgroundRecorder.tsx:139-142
```

#### Issue 2: `onAnalysisComplete` Stops Recording

In `HomeContent.tsx`, the callback passed to `BackgroundRecorder` stops recording after auto-save:

```typescript
onAnalysisComplete={() => {
  loadPhrases();
  setShowAnalysis(true);
  setBackgroundRecording(false);  // THIS STOPS RECORDING
}}
```

### Related Issues

- React closure stale state is a common pattern issue
- Web Speech API `onend` fires frequently (after each utterance)

## Impact Assessment

**Scope:** Core feature completely broken

**Affected Features:**
- Background Learning Mode
- Automatic phrase detection
- Hands-free learning workflow

**Severity Justification:** High - Key differentiating feature is non-functional

**Data/Security Concerns:** None

## Proposed Fix

### Fix Strategy

1. Use a ref (`isActiveRef`) to track `isActive` prop, keeping it in sync via `useEffect`
2. Update speech recognition handlers to use `isActiveRef.current`
3. Remove `setBackgroundRecording(false)` from `onAnalysisComplete` callback

### Files to Modify

1. **`frontend/src/components/BackgroundRecorder.tsx`**
   - Add `isActiveRef` and sync effect
   - Change `isActive` to `isActiveRef.current` in `onerror` and `onend` handlers

2. **`frontend/src/components/HomeContent.tsx`**
   - Remove `setBackgroundRecording(false)` from `onAnalysisComplete`

### Testing Requirements

**Test Cases Needed:**
1. Click "Start Learning" → Status shows "LISTENING"
2. Speak phrases → Phrases appear in detected list
3. Auto-save triggers → Recording continues (doesn't stop)
4. Click "Stop Learning" → Recording stops properly

**Validation Commands:**
```bash
cd frontend && npm run type-check
cd frontend && npm run dev
# Manual test in browser
```

## Implementation Plan

1. ✅ Add `isActiveRef` to BackgroundRecorder
2. ✅ Add `useEffect` to sync `isActiveRef` with `isActive` prop
3. ✅ Update `recognition.onerror` to use `isActiveRef.current`
4. ✅ Update `recognition.onend` to use `isActiveRef.current`
5. ✅ Update HomeContent `onAnalysisComplete` to not stop recording
6. ⬜ Verify fix in browser

## Next Steps

1. Test the fix in browser
2. If still not working, check browser console for errors
3. Verify Web Speech API is supported in the browser being used
