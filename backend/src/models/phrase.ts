// Core data models for MirrorLingo phrase analysis

export interface Phrase {
  userId: string;
  phraseId: string;
  englishText: string;
  intent: IntentCategory;
  createdAt: string;
  updatedAt: string;
  analysis?: IdiolectAnalysis;
  speechMetrics?: SpeechMetrics;
}

export interface SpeechMetrics {
  wordsPerMinute: number;
  fillerWordCount: number;
  fillerWordRate: number;
  averagePauseLength: number;
  longPauseCount: number;
  repetitionCount: number;
  totalDuration: number;
  wordCount: number;
  averageConfidence: number;
}

export interface IdiolectAnalysis {
  tone: ToneLevel;
  formality: FormalityLevel;
  patterns: LanguagePattern[];
  confidence: number;
  analysisDate: string;
}

export interface LanguagePattern {
  type: PatternType;
  description: string;
  examples: string[];
  frequency: number;
}

export interface IdiolectProfile {
  userId: string;
  overallTone: ToneLevel;
  overallFormality: FormalityLevel;
  commonPatterns: LanguagePattern[];
  preferredIntents: IntentCategory[];
  analysisCount: number;
  lastUpdated: string;
}

export interface AnalysisResult {
  success: boolean;
  analysis?: IdiolectAnalysis;
  error?: string;
  processingTime: number;
}

// Enums and Types
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

// API Request/Response Types
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

// Validation helpers
export const validatePhrase = (text: string): boolean => {
  return text.length > 0 && text.length <= 500 && text.trim().length > 0;
};

export const validatePhrases = (phrases: string[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(phrases)) {
    errors.push('Phrases must be an array');
    return { valid: false, errors };
  }
  
  if (phrases.length < 1 || phrases.length > 10) {
    errors.push('Must provide between 1 and 10 phrases');
  }
  
  phrases.forEach((phrase, index) => {
    if (!validatePhrase(phrase)) {
      errors.push(`Phrase ${index + 1} is invalid (empty or too long)`);
    }
  });
  
  return { valid: errors.length === 0, errors };
};
