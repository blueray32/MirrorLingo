# MirrorLingo Mobile - AWS Backend Integration Guide

## Quick Setup

### 1. Update API URL
Replace the placeholder URL in `.env`:
```bash
# Get your API Gateway URL from AWS Console or deployment output
REACT_APP_API_URL=https://your-actual-api-id.execute-api.us-east-1.amazonaws.com/prod
```

### 2. Test Backend Connection
```bash
# Test if your backend is accessible
curl https://your-api-url/phrases \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json"
```

### 3. Enable Real Backend
In `src/services/api.ts`, the app will automatically use your real backend when:
- `REACT_APP_API_URL` is set correctly
- Network connection is available
- API responds successfully

## Backend Endpoints Expected

The mobile app expects these endpoints from your existing web app backend:

### POST /phrases
```json
{
  "phrases": ["Could you take a look at this?"],
  "transcript": "Could you take a look at this?",
  "audioPath": "optional-s3-path"
}
```

### GET /phrases
```
Headers: x-user-id: user-123
Returns: { "phrases": [PhraseAnalysis[]] }
```

### POST /progress
```json
{
  "phraseId": "phrase-123",
  "rating": 3,
  "timestamp": "2026-01-05T20:17:38.600Z"
}
```

## Offline-First Architecture

The mobile app works offline-first:

1. **Online**: Uses real AWS backend, caches responses
2. **Offline**: Uses cached data and mock responses
3. **Sync**: Automatically syncs when connection returns

## Audio Processing

For voice recordings, the app:
1. Records audio locally using React Native APIs
2. Transcribes using React Native Voice (local)
3. Uploads audio to S3 (when online)
4. Processes with AWS Transcribe (backend)
5. Merges results for enhanced accuracy

## Push Notifications

Spaced repetition notifications are scheduled locally:
- No server-side scheduling needed
- Works offline
- Syncs schedule when online

## Testing Without Backend

The app includes comprehensive mock data:
- Realistic phrase analysis responses
- Spanish translations with style matching
- Progress tracking and spaced repetition
- All features work in demo mode

## Production Deployment

### iOS
1. Configure push notification certificates
2. Set up App Store Connect
3. Build and deploy via Xcode

### Android
1. Configure Firebase for push notifications
2. Set up Google Play Console
3. Build and deploy via Android Studio

## Environment Variables

```bash
# Required
REACT_APP_API_URL=https://your-api-gateway-url

# Optional
REACT_APP_AWS_REGION=us-east-1
REACT_APP_DEMO_MODE=false
REACT_APP_MAX_AUDIO_SIZE_MB=10
```

## Monitoring & Analytics

The app logs key events:
- API calls and responses
- Offline/online state changes
- Notification scheduling
- User interactions

Integrate with your existing AWS CloudWatch setup for production monitoring.
