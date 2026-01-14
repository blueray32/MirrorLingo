import { MistakePatternService } from '../mistakePatternService';
import { LettaService } from '../lettaService';
import { MistakeType, MistakeSeverity } from '../../types/mistakePatterns';

// Mock LettaService
jest.mock('../lettaService');
const mockLettaService = LettaService as jest.Mocked<typeof LettaService>;

describe('MistakePatternService', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMistakePattern', () => {
    it('should return null when Letta is not enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(false);

      const result = await MistakePatternService.getMistakePattern(mockUserId);

      expect(result).toBeNull();
    });

    it('should return initial pattern when Letta is enabled but no data exists', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const result = await MistakePatternService.getMistakePattern(mockUserId);

      expect(result).toBeTruthy();
      expect(result?.userId).toBe(mockUserId);
      expect(result?.totalCorrections).toBe(0);
      expect(result?.mistakeCategories.length).toBeGreaterThan(0);
      expect(result?.personalizedLessons.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeMistakesFromConversation', () => {
    it('should return empty analysis when no correction provided', async () => {
      const result = await MistakePatternService.analyzeMistakesFromConversation(
        mockUserId,
        'Hola, ¿cómo estás?',
        undefined
      );

      expect(result.mistakesDetected).toHaveLength(0);
      expect(result.newPatterns).toBe(false);
      expect(result.improvementDetected).toBe(false);
    });

    it('should analyze ser vs estar mistakes correctly', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const correction = {
        original: 'Soy en casa',
        corrected: 'Estoy en casa',
        explanation: 'Use ESTAR for location'
      };

      const result = await MistakePatternService.analyzeMistakesFromConversation(
        mockUserId,
        'Soy en casa ahora',
        correction
      );

      expect(result.mistakesDetected).toHaveLength(1);
      expect(result.mistakesDetected[0].category).toBe(MistakeType.SER_VS_ESTAR);
      expect(result.mistakesDetected[0].originalText).toBe('Soy en casa');
      expect(result.mistakesDetected[0].correctedText).toBe('Estoy en casa');
    });

    it('should analyze gender agreement mistakes correctly', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const correction = {
        original: 'La problema',
        corrected: 'El problema',
        explanation: 'Problema is masculine'
      };

      const result = await MistakePatternService.analyzeMistakesFromConversation(
        mockUserId,
        'Tengo la problema',
        correction
      );

      expect(result.mistakesDetected).toHaveLength(1);
      expect(result.mistakesDetected[0].category).toBe(MistakeType.GENDER_AGREEMENT);
    });

    it('should generate personalized lessons based on mistakes', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const correction = {
        original: 'Soy en casa',
        corrected: 'Estoy en casa',
        explanation: 'Use ESTAR for location'
      };

      const result = await MistakePatternService.analyzeMistakesFromConversation(
        mockUserId,
        'Soy en casa',
        correction
      );

      expect(result.recommendedLessons.length).toBeGreaterThan(0);
      // focusAreas only populated when totalOccurrences > 3 or focusLevel is HIGH
      expect(result.mistakesDetected.some(m => m.category === MistakeType.SER_VS_ESTAR)).toBe(true);
    });
  });

  describe('getPersonalizedLessons', () => {
    it('should return personalized lessons', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const result = await MistakePatternService.getPersonalizedLessons(mockUserId);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getMistakeCategories', () => {
    it('should return mistake categories', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const result = await MistakePatternService.getMistakeCategories(mockUserId);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getImprovementTrends', () => {
    it('should return improvement trends', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const result = await MistakePatternService.getImprovementTrends(mockUserId);

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
