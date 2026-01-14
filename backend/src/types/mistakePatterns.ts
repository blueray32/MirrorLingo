// Intelligent Mistake Pattern Learning Types

export interface MistakePattern {
  userId: string;
  grammarMistakes: GrammarMistake[];
  mistakeCategories: MistakeCategory[];
  improvementTrends: ImprovementTrend[];
  personalizedLessons: MicroLesson[];
  lastUpdated: Date;
  totalCorrections: number;
}

export interface GrammarMistake {
  id: string;
  category: MistakeType;
  originalText: string;
  correctedText: string;
  explanation: string;
  frequency: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  improvementRate: number;
  severity: MistakeSeverity;
  context: string[];
  relatedRules: GrammarRule[];
}

export interface MistakeCategory {
  type: MistakeType;
  totalOccurrences: number;
  improvementRate: number;
  masteryLevel: MasteryLevel;
  focusLevel: FocusLevel;
  lastPracticed: Date;
  targetAccuracy: number;
  currentAccuracy: number;
}

export interface ImprovementTrend {
  mistakeType: MistakeType;
  timePoints: TrendPoint[];
  overallTrend: TrendDirection;
  recentImprovement: boolean;
  plateauDetected: boolean;
}

export interface TrendPoint {
  date: Date;
  accuracy: number;
  mistakeCount: number;
  sessionId: string;
}

export interface MicroLesson {
  id: string;
  title: string;
  targetMistakes: MistakeType[];
  difficulty: number;
  estimatedDuration: number;
  content: LessonContent;
  examples: LessonExample[];
  exercises: Exercise[];
  completionStatus: CompletionStatus;
}

export interface LessonContent {
  explanation: string;
  rule: string;
  commonErrors: string[];
  tips: string[];
  mnemonics?: string[];
}

export interface LessonExample {
  incorrect: string;
  correct: string;
  explanation: string;
  context: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
}

export interface GrammarRule {
  id: string;
  title: string;
  category: MistakeType;
  description: string;
  examples: string[];
  exceptions?: string[];
}

export enum MistakeType {
  VERB_CONJUGATION = 'verb_conjugation',
  GENDER_AGREEMENT = 'gender_agreement',
  PLURAL_FORMS = 'plural_forms',
  ARTICLE_USAGE = 'article_usage',
  PREPOSITIONS = 'prepositions',
  SER_VS_ESTAR = 'ser_vs_estar',
  SUBJUNCTIVE = 'subjunctive',
  WORD_ORDER = 'word_order',
  ACCENT_MARKS = 'accent_marks',
  FALSE_FRIENDS = 'false_friends',
  REFLEXIVE_VERBS = 'reflexive_verbs',
  DIRECT_INDIRECT_OBJECTS = 'direct_indirect_objects'
}

export enum MistakeSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MasteryLevel {
  STRUGGLING = 'struggling',
  DEVELOPING = 'developing',
  IMPROVING = 'improving',
  PROFICIENT = 'proficient',
  MASTERED = 'mastered'
}

export enum FocusLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TrendDirection {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining',
  FLUCTUATING = 'fluctuating'
}

export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_IN_BLANK = 'fill_in_blank',
  CORRECTION = 'correction',
  TRANSLATION = 'translation',
  MATCHING = 'matching'
}

export enum CompletionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MASTERED = 'mastered'
}

// Common Spanish grammar mistake patterns for English speakers
export const COMMON_MISTAKE_PATTERNS = {
  [MistakeType.VERB_CONJUGATION]: {
    patterns: ['*yo soy*', '*tú eres*', '*él/ella es*'],
    corrections: ['yo soy', 'tú eres', 'él/ella es'],
    difficulty: 'medium'
  },
  [MistakeType.GENDER_AGREEMENT]: {
    patterns: ['*la problema*', '*el agua*', '*una día*'],
    corrections: ['el problema', 'el agua', 'un día'],
    difficulty: 'hard'
  },
  [MistakeType.SER_VS_ESTAR]: {
    patterns: ['*soy en casa*', '*estoy médico*'],
    corrections: ['estoy en casa', 'soy médico'],
    difficulty: 'very_hard'
  }
};

export interface MistakeAnalysisResult {
  mistakesDetected: GrammarMistake[];
  newPatterns: boolean;
  improvementDetected: boolean;
  recommendedLessons: MicroLesson[];
  focusAreas: MistakeType[];
  analysisConfidence: number;
}
