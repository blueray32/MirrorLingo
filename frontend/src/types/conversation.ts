import { IdiolectProfile } from './phrases'

export interface ConversationMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  audioUrl?: string
  isProcessing?: boolean
}

export interface ConversationContext {
  messages: ConversationMessage[]
  userProfile: IdiolectProfile
  conversationId: string
  language: 'spanish' | 'english'
  topic?: string
}

export interface ConversationResponse {
  message: string
  audioUrl?: string
  feedback?: ConversationFeedback
  confidence: number
}

export interface ConversationFeedback {
  grammarCorrections?: GrammarCorrection[]
  pronunciationTips?: string[]
  vocabularySuggestions?: string[]
  culturalNotes?: string[]
}

export interface GrammarCorrection {
  original: string
  corrected: string
  explanation: string
  severity: 'minor' | 'moderate' | 'major'
}

export interface ConversationSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  messageCount: number
  topics: string[]
  learningGoals?: string[]
}

export interface ConversationApiReturn {
  isListening: boolean
  isProcessing: boolean
  currentSession: ConversationSession | null
  messages: ConversationMessage[]
  error: string | null
  
  startConversation: (topic?: string) => Promise<boolean>
  sendMessage: (content: string, audioBlob?: Blob) => Promise<boolean>
  endConversation: () => Promise<boolean>
  clearError: () => void
}

export interface ConversationPracticeProps {
  userProfile: IdiolectProfile
  onSessionComplete: (session: ConversationSession) => void
}

export enum ConversationTopic {
  DAILY_LIFE = 'daily_life',
  WORK = 'work',
  TRAVEL = 'travel',
  FOOD = 'food',
  FAMILY = 'family',
  HOBBIES = 'hobbies',
  SHOPPING = 'shopping',
  WEATHER = 'weather',
  FREE_FORM = 'free_form'
}

export const getTopicDisplayName = (topic: ConversationTopic): string => {
  const names = {
    [ConversationTopic.DAILY_LIFE]: 'Daily Life',
    [ConversationTopic.WORK]: 'Work & Business',
    [ConversationTopic.TRAVEL]: 'Travel & Tourism',
    [ConversationTopic.FOOD]: 'Food & Dining',
    [ConversationTopic.FAMILY]: 'Family & Friends',
    [ConversationTopic.HOBBIES]: 'Hobbies & Interests',
    [ConversationTopic.SHOPPING]: 'Shopping & Services',
    [ConversationTopic.WEATHER]: 'Weather & Small Talk',
    [ConversationTopic.FREE_FORM]: 'Open Conversation'
  }
  return names[topic] || 'Unknown Topic'
}
