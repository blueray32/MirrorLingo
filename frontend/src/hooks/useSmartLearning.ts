import { useState, useEffect } from 'react';
import { smartLearningService, SmartRecommendation } from '../services/smartLearningService';
import { useConversationMemory } from './useConversationMemory';
import { usePronunciationEvolution } from './usePronunciationEvolution';
import { useMistakePatterns } from './useMistakePatterns';

const DEMO_USER_ID = 'demo-user-123';

export const useSmartLearning = () => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { conversationMemory, isLoading: memoryLoading } = useConversationMemory(DEMO_USER_ID);
  const { phonemeProgress, isLoading: pronunciationLoading } = usePronunciationEvolution(DEMO_USER_ID);
  const { mistakeCategories, isLoading: mistakeLoading } = useMistakePatterns(DEMO_USER_ID);

  useEffect(() => {
    const allDataLoaded = !memoryLoading && !pronunciationLoading && !mistakeLoading;
    
    if (allDataLoaded) {
      try {
        // Convert types to match service expectations
        const adaptedMistakes = mistakeCategories.map(cat => ({
          type: cat.type,
          focusLevel: cat.focusLevel as 'high' | 'medium' | 'low',
          currentAccuracy: cat.currentAccuracy,
          improvementRate: cat.improvementRate,
          recentMistakes: cat.totalOccurrences || 0
        }));

        const adaptedPhonemes = phonemeProgress.map(p => ({
          phoneme: p.phoneme,
          currentAccuracy: p.currentAccuracy,
          improvementRate: p.improvementRate,
          practiceCount: p.practiceCount
        }));

        const adaptedMemory = conversationMemory ? {
          userId: conversationMemory.userId,
          relationshipLevel: conversationMemory.relationshipLevel,
          totalConversations: conversationMemory.totalConversations
        } : null;

        const smartRecs = smartLearningService.generateSmartRecommendations(
          adaptedMistakes,
          adaptedPhonemes,
          adaptedMemory
        );
        setRecommendations(smartRecs);
      } catch (error) {
        console.error('Error generating smart recommendations:', error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [conversationMemory, phonemeProgress, mistakeCategories, memoryLoading, pronunciationLoading, mistakeLoading]);

  return {
    recommendations,
    isLoading: isLoading || memoryLoading || pronunciationLoading || mistakeLoading
  };
};
