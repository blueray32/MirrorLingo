import { LettaService } from './lettaService';
import { BedrockService } from './bedrockService';
import {
  MistakePattern,
  GrammarMistake,
  MistakeCategory,
  ImprovementTrend,
  MicroLesson,
  MistakeType,
  MistakeSeverity,
  MasteryLevel,
  FocusLevel,
  TrendDirection,
  ExerciseType,
  CompletionStatus,
  COMMON_MISTAKE_PATTERNS,
  MistakeAnalysisResult
} from '../types/mistakePatterns';

export class MistakePatternService {
  private static readonly MEMORY_BLOCK_LABEL = 'mistake_patterns';

  static async getMistakePattern(userId: string): Promise<MistakePattern | null> {
    if (!LettaService.isEnabled()) {
      return null;
    }

    try {
      // In real implementation, would query Letta memory blocks
      const memoryData = await LettaService.getMemorySummary();

      if (!memoryData) {
        return this.createInitialPattern(userId);
      }

      // For demo, return initial pattern
      return this.createInitialPattern(userId);
    } catch (error) {
      console.error('Error getting mistake pattern:', error);
      return null;
    }
  }

  static async analyzeMistakesFromConversation(
    userId: string,
    userMessage: string,
    correction?: { original: string; corrected: string; explanation: string }
  ): Promise<MistakeAnalysisResult> {
    try {
      const existingPattern = await this.getMistakePattern(userId) || this.createInitialPattern(userId);

      if (!correction) {
        return {
          mistakesDetected: [],
          newPatterns: false,
          improvementDetected: false,
          recommendedLessons: [],
          focusAreas: [],
          analysisConfidence: 0
        };
      }

      // Analyze the mistake using AI
      const mistakeAnalysis = await this.classifyMistake(correction);

      // Create grammar mistake record
      const grammarMistake: GrammarMistake = {
        id: `mistake_${Date.now()}`,
        category: mistakeAnalysis.type,
        originalText: correction.original,
        correctedText: correction.corrected,
        explanation: correction.explanation,
        frequency: 1,
        firstOccurrence: new Date(),
        lastOccurrence: new Date(),
        improvementRate: 0,
        severity: mistakeAnalysis.severity,
        context: [userMessage],
        relatedRules: []
      };

      // Update existing pattern
      const updatedPattern = this.updateMistakePattern(existingPattern, grammarMistake);

      // Generate recommendations
      const recommendedLessons = this.generateMicroLessons(updatedPattern);

      // Store updated pattern
      await this.storeMistakePattern(userId, updatedPattern);

      return {
        mistakesDetected: [grammarMistake],
        newPatterns: this.isNewMistakeType(existingPattern, mistakeAnalysis.type),
        improvementDetected: this.detectImprovement(existingPattern, mistakeAnalysis.type),
        recommendedLessons: recommendedLessons.slice(0, 3),
        focusAreas: this.identifyFocusAreas(updatedPattern),
        analysisConfidence: mistakeAnalysis.confidence
      };

    } catch (error) {
      console.error('Error analyzing mistakes:', error);
      return {
        mistakesDetected: [],
        newPatterns: false,
        improvementDetected: false,
        recommendedLessons: [],
        focusAreas: [],
        analysisConfidence: 0
      };
    }
  }

  static async getPersonalizedLessons(userId: string): Promise<MicroLesson[]> {
    const pattern = await this.getMistakePattern(userId);
    return pattern?.personalizedLessons || [];
  }

  static async getMistakeCategories(userId: string): Promise<MistakeCategory[]> {
    const pattern = await this.getMistakePattern(userId);
    return pattern?.mistakeCategories || [];
  }

  static async getImprovementTrends(userId: string): Promise<ImprovementTrend[]> {
    const pattern = await this.getMistakePattern(userId);
    return pattern?.improvementTrends || [];
  }

  private static createInitialPattern(userId: string): MistakePattern {
    return {
      userId,
      grammarMistakes: [],
      mistakeCategories: this.createInitialCategories(),
      improvementTrends: [],
      personalizedLessons: this.createInitialLessons(),
      lastUpdated: new Date(),
      totalCorrections: 0
    };
  }

  private static createInitialCategories(): MistakeCategory[] {
    const commonTypes = [
      MistakeType.VERB_CONJUGATION,
      MistakeType.GENDER_AGREEMENT,
      MistakeType.SER_VS_ESTAR,
      MistakeType.ARTICLE_USAGE,
      MistakeType.PREPOSITIONS
    ];

    return commonTypes.map(type => ({
      type,
      totalOccurrences: 0,
      improvementRate: 0,
      masteryLevel: MasteryLevel.DEVELOPING,
      focusLevel: FocusLevel.MEDIUM,
      lastPracticed: new Date(),
      targetAccuracy: 80,
      currentAccuracy: 50
    }));
  }

  private static createInitialLessons(): MicroLesson[] {
    return [
      {
        id: 'ser_vs_estar_basics',
        title: 'Ser vs Estar: The Fundamentals',
        targetMistakes: [MistakeType.SER_VS_ESTAR],
        difficulty: 3,
        estimatedDuration: 5,
        content: {
          explanation: 'Ser is for permanent characteristics, Estar is for temporary states and locations.',
          rule: 'Use SER for identity, characteristics, time, origin. Use ESTAR for location, emotions, ongoing actions.',
          commonErrors: ['Soy en casa', 'Estoy médico', 'Es en el parque'],
          tips: ['Remember: SER = permanent, ESTAR = temporary', 'Location always uses ESTAR']
        },
        examples: [
          {
            incorrect: 'Soy en casa',
            correct: 'Estoy en casa',
            explanation: 'Location requires ESTAR',
            context: 'Talking about where you are'
          },
          {
            incorrect: 'Estoy médico',
            correct: 'Soy médico',
            explanation: 'Profession is a permanent characteristic',
            context: 'Describing your job'
          }
        ],
        exercises: [
          {
            id: 'ser_estar_1',
            type: ExerciseType.MULTIPLE_CHOICE,
            question: 'Mi hermana ___ muy inteligente.',
            options: ['es', 'está'],
            correctAnswer: 'es',
            explanation: 'Intelligence is a permanent characteristic, so we use SER.',
            difficulty: 2
          }
        ],
        completionStatus: CompletionStatus.NOT_STARTED
      },
      {
        id: 'gender_agreement_basics',
        title: 'Gender Agreement: Nouns and Adjectives',
        targetMistakes: [MistakeType.GENDER_AGREEMENT],
        difficulty: 2,
        estimatedDuration: 4,
        content: {
          explanation: 'Spanish nouns have gender (masculine/feminine) and adjectives must agree.',
          rule: 'Masculine nouns typically end in -o, feminine in -a. Adjectives change to match.',
          commonErrors: ['La problema', 'Un casa grande', 'El agua fría'],
          tips: ['Learn noun gender with the article', 'Some words are exceptions (el problema, la mano)']
        },
        examples: [
          {
            incorrect: 'La problema',
            correct: 'El problema',
            explanation: 'Problema is masculine despite ending in -a',
            context: 'Common exception to gender rules'
          }
        ],
        exercises: [
          {
            id: 'gender_1',
            type: ExerciseType.MULTIPLE_CHOICE,
            question: '___ casa es muy bonita.',
            options: ['El', 'La'],
            correctAnswer: 'La',
            explanation: 'Casa is feminine, so we use LA.',
            difficulty: 1
          }
        ],
        completionStatus: CompletionStatus.NOT_STARTED
      }
    ];
  }

  private static async classifyMistake(correction: { original: string; corrected: string; explanation: string }) {
    // Simplified mistake classification for demo
    const original = correction.original.toLowerCase();
    const corrected = correction.corrected.toLowerCase();

    // Check for common patterns
    if (original.includes('soy') && corrected.includes('estoy') ||
      original.includes('estoy') && corrected.includes('soy')) {
      return {
        type: MistakeType.SER_VS_ESTAR,
        severity: MistakeSeverity.HIGH,
        confidence: 0.9
      };
    }

    if (original.includes('la') && corrected.includes('el') ||
      original.includes('el') && corrected.includes('la')) {
      return {
        type: MistakeType.GENDER_AGREEMENT,
        severity: MistakeSeverity.MEDIUM,
        confidence: 0.8
      };
    }

    if (original.includes('conjugation') || correction.explanation.toLowerCase().includes('verb')) {
      return {
        type: MistakeType.VERB_CONJUGATION,
        severity: MistakeSeverity.MEDIUM,
        confidence: 0.7
      };
    }

    // Default classification
    return {
      type: MistakeType.WORD_ORDER,
      severity: MistakeSeverity.LOW,
      confidence: 0.5
    };
  }

  private static updateMistakePattern(pattern: MistakePattern, newMistake: GrammarMistake): MistakePattern {
    // Update grammar mistakes
    const existingMistakeIndex = pattern.grammarMistakes.findIndex(
      m => m.category === newMistake.category &&
        m.originalText.toLowerCase() === newMistake.originalText.toLowerCase()
    );

    if (existingMistakeIndex >= 0) {
      // Update existing mistake
      pattern.grammarMistakes[existingMistakeIndex].frequency += 1;
      pattern.grammarMistakes[existingMistakeIndex].lastOccurrence = new Date();
    } else {
      // Add new mistake
      pattern.grammarMistakes.push(newMistake);
    }

    // Update mistake categories
    const categoryIndex = pattern.mistakeCategories.findIndex(c => c.type === newMistake.category);
    if (categoryIndex >= 0) {
      pattern.mistakeCategories[categoryIndex].totalOccurrences += 1;
      pattern.mistakeCategories[categoryIndex].lastPracticed = new Date();

      // Update focus level based on frequency
      if (pattern.mistakeCategories[categoryIndex].totalOccurrences > 5) {
        pattern.mistakeCategories[categoryIndex].focusLevel = FocusLevel.HIGH;
      }
    }

    pattern.totalCorrections += 1;
    pattern.lastUpdated = new Date();

    return pattern;
  }

  private static generateMicroLessons(pattern: MistakePattern): MicroLesson[] {
    const lessons: MicroLesson[] = [];

    // Get top mistake categories
    const topMistakes = pattern.mistakeCategories
      .sort((a, b) => b.totalOccurrences - a.totalOccurrences)
      .slice(0, 3);

    topMistakes.forEach(category => {
      const existingLesson = pattern.personalizedLessons.find(
        l => l.targetMistakes.includes(category.type)
      );

      if (!existingLesson) {
        lessons.push(this.createLessonForMistakeType(category.type));
      }
    });

    return lessons;
  }

  private static createLessonForMistakeType(mistakeType: MistakeType): MicroLesson {
    const lessonTemplates: Record<string, any> = {
      [MistakeType.SER_VS_ESTAR]: {
        title: 'Master Ser vs Estar',
        content: {
          explanation: 'The key difference: SER for permanent, ESTAR for temporary.',
          rule: 'SER: identity, characteristics, time. ESTAR: location, emotions, conditions.',
          commonErrors: ['Soy en casa', 'Estoy médico'],
          tips: ['Think: Is this permanent or temporary?']
        }
      },
      [MistakeType.GENDER_AGREEMENT]: {
        title: 'Gender Agreement Mastery',
        content: {
          explanation: 'Nouns have gender, adjectives must match.',
          rule: 'Masculine: -o endings, Feminine: -a endings (with exceptions).',
          commonErrors: ['La problema', 'Un casa'],
          tips: ['Learn nouns with their articles']
        }
      }
    };

    const template = lessonTemplates[mistakeType] || lessonTemplates[MistakeType.SER_VS_ESTAR];

    return {
      id: `lesson_${mistakeType}_${Date.now()}`,
      title: template.title,
      targetMistakes: [mistakeType],
      difficulty: 2,
      estimatedDuration: 3,
      content: template.content,
      examples: [],
      exercises: [],
      completionStatus: CompletionStatus.NOT_STARTED
    };
  }

  private static isNewMistakeType(pattern: MistakePattern, mistakeType: MistakeType): boolean {
    return !pattern.mistakeCategories.some(c => c.type === mistakeType);
  }

  private static detectImprovement(pattern: MistakePattern, mistakeType: MistakeType): boolean {
    const category = pattern.mistakeCategories.find(c => c.type === mistakeType);
    return category ? category.improvementRate > 0 : false;
  }

  private static identifyFocusAreas(pattern: MistakePattern): MistakeType[] {
    return pattern.mistakeCategories
      .filter(c => c.focusLevel === FocusLevel.HIGH || c.totalOccurrences > 3)
      .sort((a, b) => b.totalOccurrences - a.totalOccurrences)
      .slice(0, 3)
      .map(c => c.type);
  }

  private static async storeMistakePattern(userId: string, pattern: MistakePattern): Promise<void> {
    // In real implementation, would store in Letta memory blocks
    console.log(`Storing mistake pattern for user ${userId}:`, {
      totalCorrections: pattern.totalCorrections,
      mistakeTypes: pattern.mistakeCategories.length,
      personalizedLessons: pattern.personalizedLessons.length
    });
  }
}
