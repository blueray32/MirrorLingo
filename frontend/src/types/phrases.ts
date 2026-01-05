// Frontend TypeScript types matching backend models

export interface Phrase {
  id: string;
  text: string;
  intent: string;
  confidence: number;
  createdAt: string;
}

export interface IdiolectProfile {
  userId: string;
  tone: string;
  formality: string;
  patterns: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

// Enums
export enum IntentCategory {
  WORK = 'work',
  FAMILY = 'family',
  ERRANDS = 'errands',
  SOCIAL = 'social',
  CASUAL = 'casual',
  FORMAL = 'formal',
  OTHER = 'other'
}

export enum ToneLevel {
  VERY_CASUAL = 'very_casual',
  CASUAL = 'casual',
  NEUTRAL = 'neutral',
  POLITE = 'polite',
  FORMAL = 'formal',
  VERY_FORMAL = 'very_formal'
}

export enum FormalityLevel {
  INFORMAL = 'informal',
  SEMI_FORMAL = 'semi_formal',
  FORMAL = 'formal'
}

export enum PatternType {
  FILLER_WORDS = 'filler_words',
  CONTRACTIONS = 'contractions',
  POLITENESS_MARKERS = 'politeness_markers',
  QUESTION_STYLE = 'question_style',
  SENTENCE_LENGTH = 'sentence_length',
  VOCABULARY_LEVEL = 'vocabulary_level',
  SLANG_USAGE = 'slang_usage'
}

// API Types
export interface CreatePhrasesRequest {
  phrases: string[];
}

export interface CreatePhrasesResponse {
  success: boolean;
  data?: {
    phrases: Phrase[];
    profile: IdiolectProfile;
  };
  error?: string;
  message?: string;
}

export interface GetPhrasesResponse {
  success: boolean;
  data?: {
    phrases: Phrase[];
    profile?: IdiolectProfile;
  };
  error?: string;
}

// UI State Types
export interface PhraseInputState {
  phrases: string[];
  isLoading: boolean;
  error: string | null;
  isSubmitted: boolean;
}

export interface AnalysisDisplayState {
  phrases: Phrase[];
  profile: IdiolectProfile | null;
  isLoading: boolean;
  error: string | null;
}

// Utility Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Display helpers
export const getToneDisplayName = (tone: ToneLevel): string => {
  const names = {
    [ToneLevel.VERY_CASUAL]: 'Very Casual',
    [ToneLevel.CASUAL]: 'Casual',
    [ToneLevel.NEUTRAL]: 'Neutral',
    [ToneLevel.POLITE]: 'Polite',
    [ToneLevel.FORMAL]: 'Formal',
    [ToneLevel.VERY_FORMAL]: 'Very Formal'
  };
  return names[tone] || 'Unknown';
};

export const getFormalityDisplayName = (formality: FormalityLevel): string => {
  const names = {
    [FormalityLevel.INFORMAL]: 'Informal',
    [FormalityLevel.SEMI_FORMAL]: 'Semi-Formal',
    [FormalityLevel.FORMAL]: 'Formal'
  };
  return names[formality] || 'Unknown';
};

export const getIntentDisplayName = (intent: IntentCategory): string => {
  const names = {
    [IntentCategory.WORK]: 'Work',
    [IntentCategory.FAMILY]: 'Family',
    [IntentCategory.ERRANDS]: 'Errands',
    [IntentCategory.SOCIAL]: 'Social',
    [IntentCategory.CASUAL]: 'Casual',
    [IntentCategory.FORMAL]: 'Formal',
    [IntentCategory.OTHER]: 'Other'
  };
  return names[intent] || 'Unknown';
};

export const getPatternDisplayName = (type: PatternType): string => {
  const names = {
    [PatternType.FILLER_WORDS]: 'Filler Words',
    [PatternType.CONTRACTIONS]: 'Contractions',
    [PatternType.POLITENESS_MARKERS]: 'Politeness Markers',
    [PatternType.QUESTION_STYLE]: 'Question Style',
    [PatternType.SENTENCE_LENGTH]: 'Sentence Length',
    [PatternType.VOCABULARY_LEVEL]: 'Vocabulary Level',
    [PatternType.SLANG_USAGE]: 'Slang Usage'
  };
  return names[type] || 'Unknown Pattern';
};
