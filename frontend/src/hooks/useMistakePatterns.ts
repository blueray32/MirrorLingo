import { useState, useEffect, useCallback } from 'react';

interface MistakeCategory {
  type: string;
  totalOccurrences: number;
  improvementRate: number;
  masteryLevel: string;
  focusLevel: string;
  lastPracticed: Date;
  targetAccuracy: number;
  currentAccuracy: number;
}

interface MicroLesson {
  id: string;
  title: string;
  targetMistakes: string[];
  difficulty: number;
  estimatedDuration: number;
  content: {
    explanation: string;
    rule: string;
    commonErrors: string[];
    tips: string[];
  };
  examples: Array<{
    incorrect: string;
    correct: string;
    explanation: string;
    context: string;
  }>;
  completionStatus: string;
}

interface ImprovementTrend {
  mistakeType: string;
  overallTrend: string;
  recentImprovement: boolean;
  plateauDetected: boolean;
}

interface UseMistakePatternsReturn {
  mistakeCategories: MistakeCategory[];
  personalizedLessons: MicroLesson[];
  improvementTrends: ImprovementTrend[];
  isLoading: boolean;
  error: string | null;
  refreshPatterns: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const useMistakePatterns = (userId: string): UseMistakePatternsReturn => {
  const [mistakeCategories, setMistakeCategories] = useState<MistakeCategory[]>([]);
  const [personalizedLessons, setPersonalizedLessons] = useState<MicroLesson[]>([]);
  const [improvementTrends, setImprovementTrends] = useState<ImprovementTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPatterns = useCallback(async (): Promise<void> => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get mistake categories
      const categoriesResponse = await fetch(`${API_BASE_URL}/api/mistake-patterns/categories`, {
        headers: { 'x-user-id': userId }
      });

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setMistakeCategories(categoriesData.mistakeCategories || []);
      }

      // Get personalized lessons
      const lessonsResponse = await fetch(`${API_BASE_URL}/api/mistake-patterns/lessons`, {
        headers: { 'x-user-id': userId }
      });

      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setPersonalizedLessons(lessonsData.personalizedLessons || []);
      }

      // Get improvement trends
      const trendsResponse = await fetch(`${API_BASE_URL}/api/mistake-patterns/trends`, {
        headers: { 'x-user-id': userId }
      });

      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setImprovementTrends(trendsData.improvementTrends || []);
      }

    } catch (err) {
      setError('Failed to load mistake patterns');
      console.error('Mistake patterns error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load patterns on mount and when userId changes
  useEffect(() => {
    refreshPatterns();
  }, [refreshPatterns]);

  return {
    mistakeCategories,
    personalizedLessons,
    improvementTrends,
    isLoading,
    error,
    refreshPatterns
  };
};
