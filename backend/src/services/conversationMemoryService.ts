import { LettaService } from './lettaService';
import { 
  ConversationMemory, 
  PersonalDetail, 
  TopicEngagement, 
  ConversationSummary,
  RelationshipLevel,
  RelationshipStatus,
  MemoryUpdate,
  PersonalCategory,
  TutorPersonality
} from '../types/conversationMemory';

export class ConversationMemoryService {
  private static readonly MEMORY_BLOCK_LABEL = 'conversation_memory';

  static async getConversationMemory(userId: string): Promise<ConversationMemory | null> {
    if (!LettaService.isEnabled()) {
      return null;
    }

    try {
      // In a real implementation, this would query Letta memory blocks
      // For demo, return a basic memory structure
      const memoryData = await LettaService.getMemorySummary();
      
      if (!memoryData) {
        return this.createInitialMemory(userId);
      }

      // Parse memory data (simplified for demo)
      return this.createInitialMemory(userId);
    } catch (error) {
      console.error('Error getting conversation memory:', error);
      return null;
    }
  }

  static async updateConversationMemory(
    userId: string,
    update: MemoryUpdate
  ): Promise<boolean> {
    if (!LettaService.isEnabled()) {
      return false;
    }

    try {
      const existingMemory = await this.getConversationMemory(userId);
      const updatedMemory = this.mergeMemoryUpdate(existingMemory, update);

      // Store updated memory in Letta
      await this.storeMemory(userId, updatedMemory);
      
      return true;
    } catch (error) {
      console.error('Error updating conversation memory:', error);
      return false;
    }
  }

  static async analyzeConversationForMemory(
    userId: string,
    userMessage: string,
    assistantMessage: string,
    topic: string
  ): Promise<MemoryUpdate> {
    // Extract personal details from user message
    const personalDetails = this.extractPersonalDetails(userMessage);
    
    // Calculate engagement score based on message characteristics
    const engagementScore = this.calculateEngagementScore(userMessage);
    
    // Create conversation summary
    const conversationSummary: ConversationSummary = {
      sessionId: `session_${Date.now()}`,
      date: new Date(),
      topic,
      messageCount: 1,
      duration: 0, // Would be calculated in real implementation
      highlights: this.extractHighlights(userMessage, assistantMessage),
      newPersonalDetails: personalDetails.map(pd => pd.detail),
      engagementScore
    };

    return {
      personalDetails,
      topicEngagement: {
        topic,
        engagementScore,
        messageCount: 1,
        averageResponseLength: userMessage.length,
        lastDiscussed: new Date(),
        userInterest: engagementScore > 7 ? 'high' : engagementScore > 4 ? 'medium' : 'low'
      },
      conversationSummary
    };
  }

  static async getRelationshipStatus(userId: string): Promise<RelationshipStatus> {
    const memory = await this.getConversationMemory(userId);
    
    if (!memory) {
      return {
        level: RelationshipLevel.STRANGER,
        progressToNext: 0,
        daysSinceFirstMeeting: 0,
        totalConversations: 0,
        favoriteTopics: [],
        recentMemories: []
      };
    }

    const daysSinceFirst = Math.floor(
      (Date.now() - memory.lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
    );

    const favoriteTopics = memory.topicEngagement
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 3)
      .map(te => te.topic);

    const recentMemories = memory.personalDetails
      .sort((a, b) => b.lastReferenced.getTime() - a.lastReferenced.getTime())
      .slice(0, 5)
      .map(pd => pd.detail);

    return {
      level: memory.relationshipLevel,
      progressToNext: this.calculateRelationshipProgress(memory),
      daysSinceFirstMeeting: daysSinceFirst,
      totalConversations: memory.totalConversations,
      favoriteTopics,
      recentMemories
    };
  }

  private static createInitialMemory(userId: string): ConversationMemory {
    return {
      userId,
      personalDetails: [],
      topicEngagement: [],
      relationshipLevel: RelationshipLevel.STRANGER,
      conversationHistory: [],
      tutorPersonality: {
        name: 'María',
        characteristics: ['friendly', 'patient', 'encouraging'],
        relationshipStyle: 'friendly',
        memoryStrength: 0.8,
        consistencyScore: 0.9
      },
      lastInteraction: new Date(),
      totalConversations: 0
    };
  }

  private static mergeMemoryUpdate(
    existingMemory: ConversationMemory | null,
    update: MemoryUpdate
  ): ConversationMemory {
    const memory = existingMemory || this.createInitialMemory('');

    if (update.personalDetails) {
      memory.personalDetails = this.mergePersonalDetails(
        memory.personalDetails,
        update.personalDetails
      );
    }

    if (update.topicEngagement) {
      memory.topicEngagement = this.mergeTopicEngagement(
        memory.topicEngagement,
        update.topicEngagement
      );
    }

    if (update.conversationSummary) {
      memory.conversationHistory.push(update.conversationSummary);
      memory.totalConversations += 1;
      memory.lastInteraction = new Date();
    }

    // Update relationship level based on interactions
    memory.relationshipLevel = this.calculateRelationshipLevel(memory);

    return memory;
  }

  private static extractPersonalDetails(message: string): PersonalDetail[] {
    const details: PersonalDetail[] = [];
    const now = new Date();

    // Simple pattern matching for demo
    if (message.toLowerCase().includes('trabajo') || message.toLowerCase().includes('work')) {
      details.push({
        id: `detail_${Date.now()}`,
        category: PersonalCategory.WORK,
        detail: 'User mentioned work',
        confidence: 0.8,
        firstMentioned: now,
        lastReferenced: now,
        importance: 'medium'
      });
    }

    if (message.toLowerCase().includes('familia') || message.toLowerCase().includes('family')) {
      details.push({
        id: `detail_${Date.now()}_2`,
        category: PersonalCategory.FAMILY,
        detail: 'User mentioned family',
        confidence: 0.8,
        firstMentioned: now,
        lastReferenced: now,
        importance: 'high'
      });
    }

    return details;
  }

  private static calculateEngagementScore(message: string): number {
    let score = 5; // Base score

    // Longer messages indicate higher engagement
    if (message.length > 50) score += 1;
    if (message.length > 100) score += 1;

    // Questions indicate engagement
    if (message.includes('?')) score += 1;

    // Emotional words indicate engagement
    const emotionalWords = ['me gusta', 'me encanta', 'odio', 'amo', 'feliz', 'triste'];
    if (emotionalWords.some(word => message.toLowerCase().includes(word))) {
      score += 2;
    }

    return Math.min(10, Math.max(1, score));
  }

  private static extractHighlights(userMessage: string, assistantMessage: string): string[] {
    const highlights: string[] = [];

    // Extract key phrases or topics discussed
    if (userMessage.length > 30) {
      highlights.push(`User shared: "${userMessage.substring(0, 50)}..."`);
    }

    return highlights;
  }

  private static mergePersonalDetails(
    existing: PersonalDetail[],
    newDetails: PersonalDetail[]
  ): PersonalDetail[] {
    const merged = [...existing];

    newDetails.forEach(newDetail => {
      const existingIndex = merged.findIndex(
        detail => detail.category === newDetail.category && 
                 detail.detail.toLowerCase().includes(newDetail.detail.toLowerCase())
      );

      if (existingIndex >= 0) {
        // Update existing detail
        merged[existingIndex].lastReferenced = newDetail.lastReferenced;
        merged[existingIndex].confidence = Math.max(
          merged[existingIndex].confidence,
          newDetail.confidence
        );
      } else {
        // Add new detail
        merged.push(newDetail);
      }
    });

    return merged;
  }

  private static mergeTopicEngagement(
    existing: TopicEngagement[],
    newEngagement: Partial<TopicEngagement>
  ): TopicEngagement[] {
    if (!newEngagement.topic) return existing;

    const existingIndex = existing.findIndex(te => te.topic === newEngagement.topic);

    if (existingIndex >= 0) {
      // Update existing engagement
      const current = existing[existingIndex];
      existing[existingIndex] = {
        ...current,
        engagementScore: (current.engagementScore + (newEngagement.engagementScore || 0)) / 2,
        messageCount: current.messageCount + (newEngagement.messageCount || 0),
        lastDiscussed: newEngagement.lastDiscussed || current.lastDiscussed,
        userInterest: newEngagement.userInterest || current.userInterest
      };
    } else {
      // Add new topic engagement
      existing.push({
        topic: newEngagement.topic,
        engagementScore: newEngagement.engagementScore || 5,
        messageCount: newEngagement.messageCount || 1,
        averageResponseLength: newEngagement.averageResponseLength || 50,
        lastDiscussed: newEngagement.lastDiscussed || new Date(),
        userInterest: newEngagement.userInterest || 'medium'
      });
    }

    return existing;
  }

  private static calculateRelationshipLevel(memory: ConversationMemory): RelationshipLevel {
    const { totalConversations, personalDetails } = memory;

    if (totalConversations < 3) return RelationshipLevel.STRANGER;
    if (totalConversations < 10 || personalDetails.length < 3) return RelationshipLevel.ACQUAINTANCE;
    if (totalConversations < 25 || personalDetails.length < 8) return RelationshipLevel.FRIEND;
    if (totalConversations < 50 || personalDetails.length < 15) return RelationshipLevel.CLOSE_FRIEND;
    
    return RelationshipLevel.FAMILY_LIKE;
  }

  private static calculateRelationshipProgress(memory: ConversationMemory): number {
    const { totalConversations, personalDetails, relationshipLevel } = memory;

    switch (relationshipLevel) {
      case RelationshipLevel.STRANGER:
        return Math.min(100, (totalConversations / 3) * 100);
      case RelationshipLevel.ACQUAINTANCE:
        return Math.min(100, ((totalConversations - 3) / 7) * 100);
      case RelationshipLevel.FRIEND:
        return Math.min(100, ((totalConversations - 10) / 15) * 100);
      case RelationshipLevel.CLOSE_FRIEND:
        return Math.min(100, ((totalConversations - 25) / 25) * 100);
      default:
        return 100;
    }
  }

  private static async storeMemory(userId: string, memory: ConversationMemory): Promise<void> {
    // In real implementation, would store in Letta memory blocks
    // For demo, we'll just log the memory update
    console.log(`Storing conversation memory for user ${userId}:`, {
      relationshipLevel: memory.relationshipLevel,
      totalConversations: memory.totalConversations,
      personalDetailsCount: memory.personalDetails.length
    });
  }
}
