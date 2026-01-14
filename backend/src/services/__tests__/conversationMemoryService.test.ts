import { ConversationMemoryService } from '../conversationMemoryService';
import { LettaService } from '../lettaService';
import { RelationshipLevel } from '../../types/conversationMemory';

// Mock LettaService
jest.mock('../lettaService');
const mockLettaService = LettaService as jest.Mocked<typeof LettaService>;

describe('ConversationMemoryService', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversationMemory', () => {
    it('should return null when Letta is not enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(false);

      const result = await ConversationMemoryService.getConversationMemory(mockUserId);

      expect(result).toBeNull();
    });

    it('should return initial memory when Letta is enabled but no memory exists', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const result = await ConversationMemoryService.getConversationMemory(mockUserId);

      expect(result).toBeTruthy();
      expect(result?.userId).toBe(mockUserId);
      expect(result?.relationshipLevel).toBe(RelationshipLevel.STRANGER);
      expect(result?.totalConversations).toBe(0);
    });
  });

  describe('analyzeConversationForMemory', () => {
    it('should extract personal details from user message', async () => {
      const userMessage = 'Hola, trabajo en tecnología y me gusta el café';
      const assistantMessage = '¡Qué interesante! ¿Qué tipo de tecnología?';
      const topic = 'work';

      const result = await ConversationMemoryService.analyzeConversationForMemory(
        mockUserId,
        userMessage,
        assistantMessage,
        topic
      );

      expect(result.personalDetails).toBeDefined();
      expect(result.personalDetails?.length).toBeGreaterThan(0);
      expect(result.topicEngagement).toBeDefined();
      expect(result.conversationSummary).toBeDefined();
    });

    it('should calculate engagement score based on message characteristics', async () => {
      const longMessage = 'Me encanta trabajar en tecnología porque es muy emocionante y siempre hay cosas nuevas que aprender. ¿Qué opinas sobre la inteligencia artificial?';
      const assistantMessage = 'Es fascinante el mundo de la tecnología';
      const topic = 'work';

      const result = await ConversationMemoryService.analyzeConversationForMemory(
        mockUserId,
        longMessage,
        assistantMessage,
        topic
      );

      expect(result.topicEngagement?.engagementScore).toBeGreaterThan(5);
    });
  });

  describe('getRelationshipStatus', () => {
    it('should return stranger status for new users', async () => {
      mockLettaService.isEnabled.mockReturnValue(false);

      const result = await ConversationMemoryService.getRelationshipStatus(mockUserId);

      expect(result.level).toBe(RelationshipLevel.STRANGER);
      expect(result.totalConversations).toBe(0);
      expect(result.favoriteTopics).toEqual([]);
    });
  });

  describe('updateConversationMemory', () => {
    it('should return false when Letta is not enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(false);

      const result = await ConversationMemoryService.updateConversationMemory(mockUserId, {});

      expect(result).toBe(false);
    });

    it('should update memory when Letta is enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const result = await ConversationMemoryService.updateConversationMemory(mockUserId, {
        personalDetails: [],
        conversationSummary: {
          sessionId: 'test-session',
          date: new Date(),
          topic: 'daily_life',
          messageCount: 1,
          duration: 60,
          highlights: [],
          newPersonalDetails: [],
          engagementScore: 7
        }
      });

      expect(result).toBe(true);
    });
  });
});
