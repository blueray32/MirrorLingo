import { useState, useCallback } from 'react'
import { 
  ConversationApiReturn, 
  ConversationMessage, 
  ConversationSession,
  ConversationResponse 
} from '../types/conversation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const useConversationApi = (): ConversationApiReturn => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const startConversation = useCallback(async (topic?: string): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)

    try {
      // For demo mode, create mock session and AI greeting
      const sessionId = `session-${Date.now()}`
      const session: ConversationSession = {
        id: sessionId,
        userId: 'test-user-123',
        startTime: new Date(),
        messageCount: 0,
        topics: topic ? [topic] : ['free_form']
      }

      setCurrentSession(session)

      // Generate AI greeting based on topic
      const greetingMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        content: generateGreeting(topic),
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages([greetingMessage])
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation'
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const sendMessage = useCallback(async (content: string, audioBlob?: Blob): Promise<boolean> => {
    if (!currentSession) {
      setError('No active conversation session')
      return false
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Add user message
      const userMessage: ConversationMessage = {
        id: `msg-${Date.now()}-user`,
        content,
        sender: 'user',
        timestamp: new Date(),
        audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : undefined
      }

      setMessages(prev => [...prev, userMessage])

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Generate AI response (mock for demo)
      const aiResponse = generateAIResponse(content, messages)
      
      const aiMessage: ConversationMessage = {
        id: `msg-${Date.now()}-ai`,
        content: aiResponse.message,
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

      // Update session
      setCurrentSession(prev => prev ? {
        ...prev,
        messageCount: prev.messageCount + 2
      } : null)

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [currentSession, messages])

  const endConversation = useCallback(async (): Promise<boolean> => {
    if (!currentSession) return true

    try {
      setCurrentSession(prev => prev ? {
        ...prev,
        endTime: new Date()
      } : null)

      // Clear conversation state
      setTimeout(() => {
        setMessages([])
        setCurrentSession(null)
      }, 1000)

      return true
    } catch (err) {
      setError('Failed to end conversation')
      return false
    }
  }, [currentSession])

  return {
    isListening,
    isProcessing,
    currentSession,
    messages,
    error,
    startConversation,
    sendMessage,
    endConversation,
    clearError
  }
}

// Helper functions for demo mode
function generateGreeting(topic?: string): string {
  const greetings = {
    daily_life: '¡Hola! ¿Cómo ha sido tu día? Me encantaría escuchar sobre tu rutina diaria.',
    work: '¡Buenos días! ¿Cómo va todo en el trabajo? ¿Hay algo interesante en lo que estés trabajando?',
    travel: '¡Qué emocionante hablar de viajes! ¿Has visitado algún lugar interesante recientemente?',
    food: '¡Me encanta hablar de comida! ¿Cuál es tu plato favorito? ¿Sabes cocinar algo especial?',
    family: '¡Hola! Me gustaría conocer un poco sobre tu familia. ¿Tienes hermanos o hermanas?',
    default: '¡Hola! ¿Cómo estás hoy? ¿De qué te gustaría hablar en español?'
  }

  return greetings[topic as keyof typeof greetings] || greetings.default
}

function generateAIResponse(userMessage: string, conversationHistory: ConversationMessage[]): ConversationResponse {
  // Simple response generation for demo
  const responses = [
    '¡Qué interesante! Cuéntame más sobre eso.',
    'Me parece muy bien. ¿Y qué piensas hacer después?',
    'Entiendo perfectamente. ¿Has tenido experiencias similares antes?',
    '¡Excelente! Me gusta mucho tu forma de expresarte.',
    'Esa es una perspectiva muy buena. ¿Podrías explicarme un poco más?'
  ]

  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  
  return {
    message: randomResponse,
    confidence: 0.85 + Math.random() * 0.1,
    feedback: {
      pronunciationTips: ['Recuerda pronunciar la "rr" con más fuerza'],
      vocabularySuggestions: ['Podrías usar "fantástico" en lugar de "muy bueno"'],
      culturalNotes: ['En España, es común usar "vale" para expresar acuerdo']
    }
  }
}
