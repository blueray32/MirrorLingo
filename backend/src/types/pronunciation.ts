// Pronunciation analysis types for real-time feedback system

import { SpeechMetrics } from '../models/phrase';

export interface PronunciationAnalysis {
  overallScore: number; // 0-100
  accuracy: number; // 0-100
  fluency: number; // 0-100
  pronunciation: number; // 0-100
  transcription: string;
  targetPhrase: string;
  confidence: number; // 0-1
  analysisDate: string;
  targetAccent: SpanishAccent;
  detailedFeedback: PronunciationFeedback;
  speechMetrics?: SpeechMetrics;
}

export interface PronunciationFeedback {
  strengths: string[];
  improvements: string[];
  specificTips: string[];
  accentFeedback: string[];
  phonemeAnalysis: PhonemeAnalysis[];
  rhythmFeedback: RhythmFeedback;
}

export interface PhonemeAnalysis {
  phoneme: string;
  expected: string;
  actual: string;
  accuracy: number; // 0-100
  difficulty: PhonemeDifficulty;
  feedback: string;
  accentVariation?: string;
}

export enum PhonemeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum SpanishAccent {
  SPAIN = 'spain',
  MEXICO = 'mexico',
  ARGENTINA = 'argentina',
  COLOMBIA = 'colombia',
  NEUTRAL = 'neutral'
}

export interface AccentProfile {
  accent: SpanishAccent;
  name: string;
  region: string;
  characteristics: string[];
  phonemeVariations: Record<string, string>;
  commonWords: Record<string, string>;
}

export interface RhythmFeedback {
  syllableStress: SyllableStress[];
  intonationPattern: string;
  pacing: PacingFeedback;
}

export interface SyllableStress {
  syllable: string;
  expectedStress: boolean;
  actualStress: boolean;
  accuracy: number; // 0-100
}

export interface PacingFeedback {
  wordsPerMinute: number;
  optimalRange: { min: number; max: number };
  feedback: string;
}

export interface PronunciationRequest {
  audioData?: string; // Base64 encoded audio
  transcription?: string; // From Web Speech API
  targetPhrase: string;
  userId: string;
  confidence?: number;
  alternatives?: SpeechAlternative[];
}

export interface SpeechAlternative {
  transcript: string;
  confidence: number;
}

export interface PronunciationResponse {
  success: boolean;
  analysis?: PronunciationAnalysis;
  error?: string;
  processingTime: number;
}

export interface RealTimePronunciationState {
  isRecording: boolean;
  isAnalyzing: boolean;
  currentAnalysis: PronunciationAnalysis | null;
  error: string | null;
  audioLevel: number;
  waveformData: number[];
}

// Web Speech API types for browser compatibility
export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: SpeechAlternative[];
}

// Pronunciation scoring weights
export const PRONUNCIATION_WEIGHTS = {
  accuracy: 0.4,
  fluency: 0.3,
  pronunciation: 0.3
} as const;

// Spanish phoneme mappings for analysis
export const SPANISH_PHONEMES = {
  vowels: ['a', 'e', 'i', 'o', 'u'],
  consonants: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'ñ', 'p', 'q', 'r', 'rr', 's', 't', 'v', 'w', 'x', 'y', 'z'],
  diphthongs: ['ai', 'au', 'ei', 'eu', 'oi', 'ou', 'ia', 'ie', 'io', 'iu', 'ua', 'ue', 'ui', 'uo']
} as const;

// Validation helpers
export const validatePronunciationRequest = (request: PronunciationRequest): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!request.targetPhrase || request.targetPhrase.trim().length === 0) {
    errors.push('Target phrase is required');
  }
  
  if (!request.userId || request.userId.trim().length === 0) {
    errors.push('User ID is required');
  }
  
  if (!request.audioData && !request.transcription) {
    errors.push('Either audio data or transcription is required');
  }
  
  if (request.confidence !== undefined && (request.confidence < 0 || request.confidence > 1)) {
    errors.push('Confidence must be between 0 and 1');
  }
  
  return { valid: errors.length === 0, errors };
};
