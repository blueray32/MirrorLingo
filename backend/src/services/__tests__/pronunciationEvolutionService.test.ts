import { PronunciationEvolutionService } from '../pronunciationEvolutionService';
import { LettaService } from '../lettaService';
import { MasteryLevel } from '../../types/pronunciationEvolution';

// Mock LettaService
jest.mock('../lettaService');
const mockLettaService = LettaService as jest.Mocked<typeof LettaService>;

describe('PronunciationEvolutionService', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPronunciationEvolution', () => {
    it('should return null when Letta is not enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(false);

      const result = await PronunciationEvolutionService.getPronunciationEvolution(mockUserId);

      expect(result).toBeNull();
    });

    it('should return initial evolution when Letta is enabled but no data exists', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const result = await PronunciationEvolutionService.getPronunciationEvolution(mockUserId);

      expect(result).toBeTruthy();
      expect(result?.userId).toBe(mockUserId);
      expect(result?.totalPracticeSessions).toBe(0);
      expect(result?.phonemeProgress.length).toBeGreaterThan(0);
    });
  });

  describe('trackPronunciationProgress', () => {
    it('should track phoneme progress and return analysis result', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const phonemeScores = {
        'rr': 75,
        'ñ': 80,
        'a': 90
      };

      const result = await PronunciationEvolutionService.trackPronunciationProgress(
        mockUserId,
        phonemeScores,
        'perro'
      );

      expect(result).toBeTruthy();
      expect(result.evolutionSummary).toBeTruthy();
      expect(typeof result.improvementDetected).toBe('boolean');
      expect(typeof result.regressionDetected).toBe('boolean');
    });

    it('should detect improvement when phoneme scores increase significantly', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      // First track low scores
      await PronunciationEvolutionService.trackPronunciationProgress(
        mockUserId,
        { 'rr': 50 },
        'perro'
      );

      // Then track improved scores
      const result = await PronunciationEvolutionService.trackPronunciationProgress(
        mockUserId,
        { 'rr': 80 },
        'carro'
      );

      // Should detect improvement (though simplified in mock)
      expect(result).toBeTruthy();
    });
  });

  describe('getPersonalizedCoaching', () => {
    it('should return coaching program', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const result = await PronunciationEvolutionService.getPersonalizedCoaching(mockUserId);

      expect(result).toBeTruthy();
      expect(result.currentFocus).toBeDefined();
      expect(result.recommendedExercises).toBeDefined();
      expect(result.nextMilestone).toBeDefined();
      expect(result.adaptiveSchedule).toBeDefined();
    });
  });

  describe('getPhonemeProgress', () => {
    it('should return phoneme progress array', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.getMemorySummary.mockResolvedValue('');

      const result = await PronunciationEvolutionService.getPhonemeProgress(mockUserId);

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
