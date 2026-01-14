import { useState, useEffect, useCallback } from 'react';

interface RelationshipStatus {
  level: string;
  progressToNext: number;
  daysSinceFirstMeeting: number;
  totalConversations: number;
  favoriteTopics: string[];
  recentMemories: string[];
}

interface ConversationMemory {
  userId: string;
  personalDetails: any[];
  topicEngagement: any[];
  relationshipLevel: string;
  conversationHistory: any[];
  tutorPersonality: {
    name: string;
    characteristics: string[];
    relationshipStyle: string;
  };
  lastInteraction: Date;
  totalConversations: number;
}

interface UseConversationMemoryReturn {
  relationshipStatus: RelationshipStatus | null;
  conversationMemory: ConversationMemory | null;
  isLoading: boolean;
  error: string | null;
  refreshMemory: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const useConversationMemory = (userId: string): UseConversationMemoryReturn => {
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus | null>(null);
  const [conversationMemory, setConversationMemory] = useState<ConversationMemory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMemory = useCallback(async (): Promise<void> => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get relationship status
      const statusResponse = await fetch(`${API_BASE_URL}/api/conversation-memory/relationship-status`, {
        headers: { 'x-user-id': userId }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setRelationshipStatus(statusData.relationshipStatus);
      }

      // Get conversation memory
      const memoryResponse = await fetch(`${API_BASE_URL}/api/conversation-memory/conversation-memory`, {
        headers: { 'x-user-id': userId }
      });

      if (memoryResponse.ok) {
        const memoryData = await memoryResponse.json();
        setConversationMemory(memoryData.conversationMemory);
      }

    } catch (err) {
      setError('Failed to load conversation memory');
      console.error('Conversation memory error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load memory on mount and when userId changes
  useEffect(() => {
    refreshMemory();
  }, [refreshMemory]);

  return {
    relationshipStatus,
    conversationMemory,
    isLoading,
    error,
    refreshMemory
  };
};
