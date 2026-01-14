// Pronunciation Evolution Types for Long-term Learning Tracking

export interface PronunciationEvolution {
  userId: string;
  phonemeProgress: PhonemeProgress[];
  accentProfile: AccentProfile;
  evolutionHistory: EvolutionSnapshot[];
  personalizedCoaching: CoachingProgram;
  lastUpdated: Date;
  totalPracticeSessions: number;
}

export interface PhonemeProgress {
  phoneme: string;
  category: PhonemeCategory;
  difficulty: PhonemeDifficulty;
  currentAccuracy: number;
  historicalAccuracy: AccuracyPoint[];
  improvementRate: number;
  masteryLevel: MasteryLevel;
  practiceCount: number;
  lastPracticed: Date;
  targetAccuracy: number;
  personalizedTips: string[];
}

export interface AccuracyPoint {
  date: Date;
  accuracy: number;
  sessionId: string;
  context: string; // word or phrase where phoneme was practiced
}

export interface AccentProfile {
  targetAccent: SpanishAccent;
  nativeLanguageInfluence: string[];
  strongPhonemes: string[];
  challengingPhonemes: string[];
  overallProgress: number;
  accentConsistency: number;
}

export interface EvolutionSnapshot {
  date: Date;
  overallScore: number;
  phonemeScores: Record<string, number>;
  milestone?: Milestone;
  sessionSummary: string;
}

export interface CoachingProgram {
  currentFocus: string[];
  recommendedExercises: Exercise[];
  nextMilestone: Milestone;
  adaptiveSchedule: PracticeSchedule[];
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  targetPhonemes: string[];
  difficulty: number;
  estimatedDuration: number;
  description: string;
  examples: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetPhonemes: string[];
  requiredAccuracy: number;
  achieved: boolean;
  achievedDate?: Date;
}

export interface PracticeSchedule {
  phoneme: string;
  frequency: number; // times per week
  duration: number; // minutes per session
  priority: Priority;
}

export enum PhonemeCategory {
  VOWEL = 'vowel',
  CONSONANT = 'consonant',
  DIPHTHONG = 'diphthong',
  TRILL = 'trill',
  FRICATIVE = 'fricative'
}

export enum PhonemeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  VERY_HARD = 'very_hard'
}

export enum MasteryLevel {
  BEGINNER = 'beginner',
  DEVELOPING = 'developing',
  PROFICIENT = 'proficient',
  ADVANCED = 'advanced',
  MASTERED = 'mastered'
}

export enum SpanishAccent {
  SPAIN = 'spain',
  MEXICO = 'mexico',
  ARGENTINA = 'argentina',
  COLOMBIA = 'colombia',
  NEUTRAL = 'neutral'
}

export enum ExerciseType {
  MINIMAL_PAIRS = 'minimal_pairs',
  REPETITION = 'repetition',
  TONGUE_TWISTERS = 'tongue_twisters',
  WORD_LISTS = 'word_lists',
  SENTENCE_PRACTICE = 'sentence_practice'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Spanish phoneme definitions
export const SPANISH_PHONEMES = {
  VOWELS: ['a', 'e', 'i', 'o', 'u'],
  CONSONANTS: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'ñ', 'p', 'q', 'r', 'rr', 's', 't', 'v', 'w', 'x', 'y', 'z'],
  DIFFICULT_FOR_ENGLISH: ['rr', 'ñ', 'll', 'j', 'x'],
  DIPHTHONGS: ['ai', 'au', 'ei', 'eu', 'oi', 'ou', 'ia', 'ie', 'io', 'iu', 'ua', 'ue', 'ui', 'uo']
};

export interface EvolutionAnalysisResult {
  improvementDetected: boolean;
  regressionDetected: boolean;
  newMilestones: Milestone[];
  updatedCoaching: CoachingProgram;
  evolutionSummary: string;
}
