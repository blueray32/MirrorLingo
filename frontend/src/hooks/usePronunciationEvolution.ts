import { useState, useEffect, useCallback } from 'react';

interface PhonemeProgress {
  phoneme: string;
  category: string;
  difficulty: string;
  currentAccuracy: number;
  improvementRate: number;
  masteryLevel: string;
  practiceCount: number;
  lastPracticed: Date;
  targetAccuracy: number;
  personalizedTips: string[];
}

interface CoachingProgram {
  currentFocus: string[];
  recommendedExercises: Exercise[];
  nextMilestone: Milestone;
  adaptiveSchedule: PracticeSchedule[];
}

interface Exercise {
  id: string;
  type: string;
  targetPhonemes: string[];
  difficulty: number;
  estimatedDuration: number;
  description: string;
  examples: string[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetPhonemes: string[];
  requiredAccuracy: number;
  achieved: boolean;
  achievedDate?: Date;
}

interface PracticeSchedule {
  phoneme: string;
  frequency: number;
  duration: number;
  priority: string;
}

interface EvolutionAnalysisResult {
  improvementDetected: boolean;
  regressionDetected: boolean;
  newMilestones: Milestone[];
  updatedCoaching: CoachingProgram;
  evolutionSummary: string;
}

interface UsePronunciationEvolutionReturn {
  phonemeProgress: PhonemeProgress[];
  coachingProgram: CoachingProgram | null;
  isLoading: boolean;
  error: string | null;
  trackProgress: (phonemeScores: Record<string, number>, context: string) => Promise<EvolutionAnalysisResult | null>;
  refreshEvolution: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const usePronunciationEvolution = (userId: string): UsePronunciationEvolutionReturn => {
  const [phonemeProgress, setPhonemeProgress] = useState<PhonemeProgress[]>([]);
  const [coachingProgram, setCoachingProgram] = useState<CoachingProgram | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshEvolution = useCallback(async (): Promise<void> => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get phoneme progress
      const progressResponse = await fetch(`${API_BASE_URL}/api/pronunciation-evolution/phoneme-progress`, {
        headers: { 'x-user-id': userId }
      });

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setPhonemeProgress(progressData.phonemeProgress || []);
      }

      // Get coaching program
      const coachingResponse = await fetch(`${API_BASE_URL}/api/pronunciation-evolution/coaching`, {
        headers: { 'x-user-id': userId }
      });

      if (coachingResponse.ok) {
        const coachingData = await coachingResponse.json();
        setCoachingProgram(coachingData.coachingProgram);
      }

    } catch (err) {
      setError('Failed to load pronunciation evolution data');
      console.error('Pronunciation evolution error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const trackProgress = useCallback(async (
    phonemeScores: Record<string, number>,
    context: string
  ): Promise<EvolutionAnalysisResult | null> => {
    if (!userId) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/pronunciation-evolution/track-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ phonemeScores, context })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Refresh evolution data after tracking
        await refreshEvolution();
        
        return result.analysisResult;
      } else {
        throw new Error('Failed to track pronunciation progress');
      }
    } catch (err) {
      console.error('Error tracking pronunciation progress:', err);
      return null;
    }
  }, [userId, refreshEvolution]);

  // Load evolution data on mount and when userId changes
  useEffect(() => {
    refreshEvolution();
  }, [refreshEvolution]);

  return {
    phonemeProgress,
    coachingProgram,
    isLoading,
    error,
    trackProgress,
    refreshEvolution
  };
};
