import { LettaService } from './lettaService';
import { 
  PronunciationEvolution, 
  PhonemeProgress, 
  AccuracyPoint,
  EvolutionSnapshot,
  CoachingProgram,
  Exercise,
  Milestone,
  MasteryLevel,
  PhonemeCategory,
  PhonemeDifficulty,
  ExerciseType,
  Priority,
  SPANISH_PHONEMES,
  EvolutionAnalysisResult
} from '../types/pronunciationEvolution';

export class PronunciationEvolutionService {
  private static readonly MEMORY_BLOCK_LABEL = 'pronunciation_evolution';

  static async getPronunciationEvolution(userId: string): Promise<PronunciationEvolution | null> {
    if (!LettaService.isEnabled()) {
      return null;
    }

    try {
      // In real implementation, would query Letta memory blocks
      const memoryData = await LettaService.getMemorySummary();
      
      if (!memoryData) {
        return this.createInitialEvolution(userId);
      }

      // For demo, return initial evolution
      return this.createInitialEvolution(userId);
    } catch (error) {
      console.error('Error getting pronunciation evolution:', error);
      return null;
    }
  }

  static async trackPronunciationProgress(
    userId: string,
    phonemeScores: Record<string, number>,
    sessionContext: string
  ): Promise<EvolutionAnalysisResult> {
    try {
      const evolution = await this.getPronunciationEvolution(userId) || this.createInitialEvolution(userId);
      
      // Update phoneme progress
      const updatedPhonemes = this.updatePhonemeProgress(evolution.phonemeProgress, phonemeScores, sessionContext);
      
      // Create evolution snapshot
      const snapshot: EvolutionSnapshot = {
        date: new Date(),
        overallScore: this.calculateOverallScore(phonemeScores),
        phonemeScores,
        sessionSummary: `Practiced ${Object.keys(phonemeScores).length} phonemes`
      };

      // Analyze for improvements and milestones
      const analysisResult = this.analyzeEvolution(evolution, updatedPhonemes, snapshot);
      
      // Update evolution data
      const updatedEvolution: PronunciationEvolution = {
        ...evolution,
        phonemeProgress: updatedPhonemes,
        evolutionHistory: [...evolution.evolutionHistory, snapshot],
        personalizedCoaching: analysisResult.updatedCoaching,
        lastUpdated: new Date(),
        totalPracticeSessions: evolution.totalPracticeSessions + 1
      };

      // Store updated evolution
      await this.storeEvolution(userId, updatedEvolution);

      return analysisResult;
    } catch (error) {
      console.error('Error tracking pronunciation progress:', error);
      return {
        improvementDetected: false,
        regressionDetected: false,
        newMilestones: [],
        updatedCoaching: this.createInitialCoaching(),
        evolutionSummary: 'Error tracking progress'
      };
    }
  }

  static async getPersonalizedCoaching(userId: string): Promise<CoachingProgram> {
    const evolution = await this.getPronunciationEvolution(userId);
    return evolution?.personalizedCoaching || this.createInitialCoaching();
  }

  static async getPhonemeProgress(userId: string): Promise<PhonemeProgress[]> {
    const evolution = await this.getPronunciationEvolution(userId);
    return evolution?.phonemeProgress || [];
  }

  private static createInitialEvolution(userId: string): PronunciationEvolution {
    const initialPhonemes = this.createInitialPhonemeProgress();
    
    return {
      userId,
      phonemeProgress: initialPhonemes,
      accentProfile: {
        targetAccent: 'neutral' as any,
        nativeLanguageInfluence: ['English r-sound', 'Vowel reduction'],
        strongPhonemes: ['a', 'e', 'i'],
        challengingPhonemes: ['rr', 'ñ', 'll'],
        overallProgress: 0,
        accentConsistency: 0
      },
      evolutionHistory: [],
      personalizedCoaching: this.createInitialCoaching(),
      lastUpdated: new Date(),
      totalPracticeSessions: 0
    };
  }

  private static createInitialPhonemeProgress(): PhonemeProgress[] {
    const phonemes = [
      ...SPANISH_PHONEMES.DIFFICULT_FOR_ENGLISH,
      ...SPANISH_PHONEMES.VOWELS.slice(0, 3),
      ...SPANISH_PHONEMES.CONSONANTS.slice(0, 5)
    ];

    return phonemes.map(phoneme => ({
      phoneme,
      category: this.getPhonemeCategory(phoneme),
      difficulty: this.getPhonemeDifficulty(phoneme),
      currentAccuracy: 50, // Starting baseline
      historicalAccuracy: [],
      improvementRate: 0,
      masteryLevel: MasteryLevel.BEGINNER,
      practiceCount: 0,
      lastPracticed: new Date(),
      targetAccuracy: 85,
      personalizedTips: this.getInitialTips(phoneme)
    }));
  }

  private static createInitialCoaching(): CoachingProgram {
    return {
      currentFocus: ['rr', 'ñ'],
      recommendedExercises: [
        {
          id: 'rr_practice_1',
          type: ExerciseType.REPETITION,
          targetPhonemes: ['rr'],
          difficulty: 3,
          estimatedDuration: 5,
          description: 'Practice rolling R with "perro", "carro", "ferrocarril"',
          examples: ['perro', 'carro', 'ferrocarril']
        },
        {
          id: 'n_practice_1',
          type: ExerciseType.MINIMAL_PAIRS,
          targetPhonemes: ['ñ'],
          difficulty: 2,
          estimatedDuration: 3,
          description: 'Distinguish ñ from n: "año/ano", "niño/nino"',
          examples: ['año - ano', 'niño - nino', 'señor - senor']
        }
      ],
      nextMilestone: {
        id: 'first_rr',
        title: 'First Rolling R',
        description: 'Successfully pronounce "rr" with 70% accuracy',
        targetPhonemes: ['rr'],
        requiredAccuracy: 70,
        achieved: false
      },
      adaptiveSchedule: [
        {
          phoneme: 'rr',
          frequency: 3,
          duration: 5,
          priority: Priority.HIGH
        },
        {
          phoneme: 'ñ',
          frequency: 2,
          duration: 3,
          priority: Priority.MEDIUM
        }
      ]
    };
  }

  private static updatePhonemeProgress(
    existingProgress: PhonemeProgress[],
    phonemeScores: Record<string, number>,
    sessionContext: string
  ): PhonemeProgress[] {
    const updated = [...existingProgress];

    Object.entries(phonemeScores).forEach(([phoneme, accuracy]) => {
      const existingIndex = updated.findIndex(p => p.phoneme === phoneme);
      
      if (existingIndex >= 0) {
        const existing = updated[existingIndex];
        const newAccuracyPoint: AccuracyPoint = {
          date: new Date(),
          accuracy,
          sessionId: `session_${Date.now()}`,
          context: sessionContext
        };

        updated[existingIndex] = {
          ...existing,
          currentAccuracy: accuracy,
          historicalAccuracy: [...existing.historicalAccuracy, newAccuracyPoint],
          improvementRate: this.calculateImprovementRate(existing.historicalAccuracy, accuracy),
          masteryLevel: this.calculateMasteryLevel(accuracy),
          practiceCount: existing.practiceCount + 1,
          lastPracticed: new Date()
        };
      } else {
        // Add new phoneme
        updated.push({
          phoneme,
          category: this.getPhonemeCategory(phoneme),
          difficulty: this.getPhonemeDifficulty(phoneme),
          currentAccuracy: accuracy,
          historicalAccuracy: [{
            date: new Date(),
            accuracy,
            sessionId: `session_${Date.now()}`,
            context: sessionContext
          }],
          improvementRate: 0,
          masteryLevel: this.calculateMasteryLevel(accuracy),
          practiceCount: 1,
          lastPracticed: new Date(),
          targetAccuracy: 85,
          personalizedTips: this.getInitialTips(phoneme)
        });
      }
    });

    return updated;
  }

  private static analyzeEvolution(
    evolution: PronunciationEvolution,
    updatedPhonemes: PhonemeProgress[],
    snapshot: EvolutionSnapshot
  ): EvolutionAnalysisResult {
    const improvementDetected = this.detectImprovement(evolution.phonemeProgress, updatedPhonemes);
    const regressionDetected = this.detectRegression(evolution.phonemeProgress, updatedPhonemes);
    const newMilestones = this.checkMilestones(updatedPhonemes, evolution.personalizedCoaching);
    const updatedCoaching = this.updateCoaching(evolution.personalizedCoaching, updatedPhonemes);

    return {
      improvementDetected,
      regressionDetected,
      newMilestones,
      updatedCoaching,
      evolutionSummary: this.generateEvolutionSummary(improvementDetected, regressionDetected, newMilestones)
    };
  }

  private static getPhonemeCategory(phoneme: string): PhonemeCategory {
    if (SPANISH_PHONEMES.VOWELS.includes(phoneme)) return PhonemeCategory.VOWEL;
    if (phoneme === 'rr') return PhonemeCategory.TRILL;
    if (SPANISH_PHONEMES.DIPHTHONGS.includes(phoneme)) return PhonemeCategory.DIPHTHONG;
    return PhonemeCategory.CONSONANT;
  }

  private static getPhonemeDifficulty(phoneme: string): PhonemeDifficulty {
    if (SPANISH_PHONEMES.DIFFICULT_FOR_ENGLISH.includes(phoneme)) {
      return phoneme === 'rr' ? PhonemeDifficulty.VERY_HARD : PhonemeDifficulty.HARD;
    }
    if (SPANISH_PHONEMES.VOWELS.includes(phoneme)) return PhonemeDifficulty.EASY;
    return PhonemeDifficulty.MEDIUM;
  }

  private static getInitialTips(phoneme: string): string[] {
    const tips: Record<string, string[]> = {
      'rr': ['Relax your tongue', 'Start with single R', 'Practice "erre" sound'],
      'ñ': ['Touch tongue to roof of mouth', 'Like "ny" in canyon', 'Practice "niño"'],
      'll': ['Soft "y" sound in most regions', 'Practice "llamar"', 'Regional variations exist'],
      'j': ['Stronger than English H', 'From back of throat', 'Practice "jota"']
    };
    return tips[phoneme] || ['Practice regularly', 'Listen to native speakers', 'Record yourself'];
  }

  private static calculateOverallScore(phonemeScores: Record<string, number>): number {
    const scores = Object.values(phonemeScores);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private static calculateImprovementRate(history: AccuracyPoint[], currentAccuracy: number): number {
    if (history.length < 2) return 0;
    
    const recent = history.slice(-5); // Last 5 sessions
    const trend = recent.reduce((sum, point, index) => {
      if (index === 0) return 0;
      return sum + (point.accuracy - recent[index - 1].accuracy);
    }, 0) / (recent.length - 1);

    return Math.round(trend * 100) / 100;
  }

  private static calculateMasteryLevel(accuracy: number): MasteryLevel {
    if (accuracy >= 90) return MasteryLevel.MASTERED;
    if (accuracy >= 80) return MasteryLevel.ADVANCED;
    if (accuracy >= 70) return MasteryLevel.PROFICIENT;
    if (accuracy >= 60) return MasteryLevel.DEVELOPING;
    return MasteryLevel.BEGINNER;
  }

  private static detectImprovement(old: PhonemeProgress[], updated: PhonemeProgress[]): boolean {
    return updated.some(phoneme => {
      const oldPhoneme = old.find(p => p.phoneme === phoneme.phoneme);
      return oldPhoneme && phoneme.currentAccuracy > oldPhoneme.currentAccuracy + 5;
    });
  }

  private static detectRegression(old: PhonemeProgress[], updated: PhonemeProgress[]): boolean {
    return updated.some(phoneme => {
      const oldPhoneme = old.find(p => p.phoneme === phoneme.phoneme);
      return oldPhoneme && phoneme.currentAccuracy < oldPhoneme.currentAccuracy - 10;
    });
  }

  private static checkMilestones(phonemes: PhonemeProgress[], coaching: CoachingProgram): Milestone[] {
    const newMilestones: Milestone[] = [];
    
    if (!coaching.nextMilestone.achieved) {
      const targetPhonemes = coaching.nextMilestone.targetPhonemes;
      const allTargetsMet = targetPhonemes.every(phoneme => {
        const progress = phonemes.find(p => p.phoneme === phoneme);
        return progress && progress.currentAccuracy >= coaching.nextMilestone.requiredAccuracy;
      });

      if (allTargetsMet) {
        newMilestones.push({
          ...coaching.nextMilestone,
          achieved: true,
          achievedDate: new Date()
        });
      }
    }

    return newMilestones;
  }

  private static updateCoaching(current: CoachingProgram, phonemes: PhonemeProgress[]): CoachingProgram {
    // Identify phonemes that need most attention
    const strugglingPhonemes = phonemes
      .filter(p => p.currentAccuracy < 70)
      .sort((a, b) => a.currentAccuracy - b.currentAccuracy)
      .slice(0, 3)
      .map(p => p.phoneme);

    return {
      ...current,
      currentFocus: strugglingPhonemes.length > 0 ? strugglingPhonemes : current.currentFocus
    };
  }

  private static generateEvolutionSummary(
    improvement: boolean, 
    regression: boolean, 
    milestones: Milestone[]
  ): string {
    if (milestones.length > 0) {
      return `🎉 Milestone achieved: ${milestones[0].title}!`;
    }
    if (improvement) {
      return '📈 Great improvement detected in pronunciation!';
    }
    if (regression) {
      return '📉 Some pronunciation challenges detected - keep practicing!';
    }
    return '🔄 Steady progress in pronunciation practice';
  }

  private static async storeEvolution(userId: string, evolution: PronunciationEvolution): Promise<void> {
    // In real implementation, would store in Letta memory blocks
    console.log(`Storing pronunciation evolution for user ${userId}:`, {
      totalSessions: evolution.totalPracticeSessions,
      phonemeCount: evolution.phonemeProgress.length,
      overallProgress: evolution.accentProfile.overallProgress
    });
  }
}
