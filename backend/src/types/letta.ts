export interface LettaConfig {
  apiKey?: string;
  baseUrl: string;
  agentName: string;
  enabled: boolean;
}

export interface MemoryBlock {
  label: string;
  value: string;
}

export interface LearnerProfile {
  name?: string;
  nativeLanguage: string;
  targetLanguage: string;
  tone: string;
  formality: string;
  patterns: string[];
  learningSince: string;
  preferredTopics: string[];
}

export interface ConversationSync {
  userMessage: string;
  assistantMessage: string;
  topic: string;
  timestamp: string;
}
