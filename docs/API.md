# API Documentation

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-api-gateway-url.amazonaws.com`

## Authentication
All endpoints require user authentication via AWS Cognito:
```
Headers:
  Authorization: Bearer <jwt-token>
  x-user-id: <user-id>
```

## Endpoints

### POST /phrases
Analyze user phrases and generate idiolect profile.

**Request:**
```json
{
  "phrases": [
    "Could you take a look at this?",
    "No worries, take your time"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phrases": [
      {
        "phraseId": "phrase-123",
        "englishText": "Could you take a look at this?",
        "intent": "work",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "profile": {
      "userId": "user-123",
      "overallTone": "casual",
      "overallFormality": "semi_formal",
      "commonPatterns": [
        {
          "type": "contractions",
          "description": "Uses contractions frequently",
          "examples": ["could you", "no worries"],
          "frequency": 0.8
        }
      ]
    }
  }
}
```

### GET /phrases
Retrieve user's phrases and profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "phrases": [...],
    "profile": {...}
  }
}
```

### POST /translations
Generate Spanish translations for phrases.

**Request:**
```json
{
  "phraseIds": ["phrase-123", "phrase-456"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "translations": [
      {
        "phraseId": "phrase-123",
        "englishText": "Could you take a look at this?",
        "literal": "¿Podrías echar un vistazo a esto?",
        "natural": "¿Le echas un ojo a esto?",
        "explanation": "Natural version uses 'echar un ojo' (colloquial)",
        "styleMatch": 0.85
      }
    ]
  }
}
```

### POST /audio
Process audio recording for transcription and analysis.

**Request:**
```
Content-Type: multipart/form-data
audio: <audio-file>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcriptionJobId": "job-123",
    "status": "processing"
  }
}
```

### GET /audio/{jobId}
Get transcription results.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "transcript": "Could you take a look at this",
    "speechMetrics": {
      "wordsPerMinute": 150,
      "fillerWordRate": 0.02,
      "averagePauseLength": 0.3
    }
  }
}
```

### POST /conversation
Interactive Spanish conversation practice with personalized AI tutor.

**Request:**
```json
{
  "message": "Hola, ¿cómo estás?",
  "topic": "daily_life|work|travel|food|family|hobbies|shopping|health|weather",
  "userProfile": {
    "tone": "polite|casual|direct|formal",
    "formality": "very_casual|casual|neutral|formal|very_formal",
    "patterns": ["Uses contractions", "Prefers indirect language"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "¡Hola! Estoy muy bien, gracias. ¿Y tú qué tal?",
    "audioUrl": "https://s3.../response.mp3",
    "corrections": [
      {
        "original": "como estas",
        "corrected": "cómo estás", 
        "explanation": "Don't forget the accent marks"
      }
    ],
    "vocabulary": [
      {
        "spanish": "¿qué tal?",
        "english": "how's it going?",
        "context": "Casual greeting, matches your informal style"
      }
    ],
    "conversationId": "conv-123"
  }
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401) - Invalid or missing authentication
- `VALIDATION_ERROR` (400) - Invalid request data
- `RATE_LIMITED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error
