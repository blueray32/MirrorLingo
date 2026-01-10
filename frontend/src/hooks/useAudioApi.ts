import { useState, useCallback } from 'react'

interface UseAudioApiReturn {
  isUploading: boolean
  uploadError: string | null
  transcriptionResult: TranscriptionResult | null
  uploadAudio: (audioBlob: Blob, userId: string, transcript?: string) => Promise<boolean>
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export const useAudioApi = (): UseAudioApiReturn => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null)

  const clearError = useCallback(() => {
    setUploadError(null)
  }, [])

  const uploadAudio = useCallback(async (audioBlob: Blob, userId: string, transcript?: string): Promise<boolean> => {
    setIsUploading(true)
    setUploadError(null)

    try {
      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob)

      const response = await fetch(`${API_BASE_URL}/api/audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          audioData: base64Audio,
          contentType: audioBlob.type,
          transcript: transcript // Send locally generated transcript if available
        })
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      setTranscriptionResult(result.data)
      return true

    } catch (error) {
      setUploadError('Upload failed')
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


