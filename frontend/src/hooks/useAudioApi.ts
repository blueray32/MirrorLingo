import { useState, useCallback } from 'react'

interface UseAudioApiReturn {
  isUploading: boolean
  uploadError: string | null
  transcriptionResult: TranscriptionResult | null
  uploadAudio: (audioBlob: Blob, userId: string) => Promise<boolean>
  clearError: () => void
}

interface TranscriptionResult {
  transcript: string
  confidence: number
  speechMetrics: SpeechMetrics
  alternatives: Array<{
    transcript: string
    confidence: number
  }>
}

interface SpeechMetrics {
  wordsPerMinute: number
  fillerWordCount: number
  fillerWordRate: number
  averagePauseLength: number
  longPauseCount: number
  repetitionCount: number
  totalDuration: number
  wordCount: number
  averageConfidence: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const useAudioApi = (): UseAudioApiReturn => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null)

  const clearError = useCallback(() => {
    setUploadError(null)
  }, [])

  const uploadAudio = useCallback(async (audioBlob: Blob, userId: string): Promise<boolean> => {
    setIsUploading(true)
    setUploadError(null)

    try {
      // Simulate realistic upload time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Enhanced mock transcription result for demo
      const mockResult: TranscriptionResult = {
        transcript: generateMockTranscript(audioBlob.size),
        confidence: 0.92 + Math.random() * 0.06,
        speechMetrics: generateMockSpeechMetrics(audioBlob.size),
        alternatives: [
          {
            transcript: generateMockTranscript(audioBlob.size),
            confidence: 0.87 + Math.random() * 0.05
          }
        ]
      }

      setTranscriptionResult(mockResult)
      return true

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(errorMessage)
      console.error('Audio upload error:', error)
      return false
    } finally {
      setIsUploading(false)
    }
  }, [])

  return {
    isUploading,
    uploadError,
    transcriptionResult,
    uploadAudio,
    clearError
  }
}

// Utility functions
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // Remove data:audio/webm;base64, prefix
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const getAudioDuration = (blob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.onloadedmetadata = () => {
      resolve(audio.duration)
    }
    audio.onerror = () => {
      resolve(0) // Fallback duration
    }
    audio.src = URL.createObjectURL(blob)
  })
}

const generateMockTranscript = (audioSize: number): string => {
  const phrases = [
    "Could you take a look at this when you have a moment?",
    "No worries, take your time with that.",
    "I'm not entirely sure about this approach.",
    "That sounds like a really great idea to me.",
    "Let me know if you need any help with anything.",
    "I think we should probably discuss this further.",
    "Would it be possible to schedule a quick meeting?",
    "Thanks so much for your help with this project."
  ]
  
  // Simulate longer transcripts for larger audio files
  const numPhrases = Math.min(Math.floor(audioSize / 50000) + 1, phrases.length)
  return phrases.slice(0, numPhrases).join(' ')
}

const generateMockSpeechMetrics = (audioSize: number): SpeechMetrics => {
  const estimatedDuration = Math.max(audioSize / 16000, 1) // Rough estimate
  const wordCount = Math.floor(estimatedDuration * (120 + Math.random() * 60)) // 120-180 WPM
  
  return {
    wordsPerMinute: Math.round(wordCount / (estimatedDuration / 60)),
    fillerWordCount: Math.floor(Math.random() * 3),
    fillerWordRate: Math.random() * 0.05,
    averagePauseLength: 0.3 + Math.random() * 0.4,
    longPauseCount: Math.floor(Math.random() * 2),
    repetitionCount: Math.floor(Math.random() * 2),
    totalDuration: estimatedDuration,
    wordCount,
    averageConfidence: 0.88 + Math.random() * 0.1
  }
}
