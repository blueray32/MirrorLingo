import { SpacedRepetitionSyncService } from '../spacedRepetitionSyncService';
import { LettaService } from '../lettaService';
import { ReviewItem } from '../../types/spacedRepetitionSync';

// Mock LettaService
jest.mock('../lettaService');
const mockLettaService = LettaService as jest.Mocked<typeof LettaService>;

describe('SpacedRepetitionSyncService', () => {
  const mockUserId = 'test-user-123';
  const mockDeviceId = 'test-device-456';
  
  const mockReviewItems: ReviewItem[] = [
    {
      id: 'item-1',
      content: 'Hello',
      translation: 'Hola',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      lastReviewed: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncReviewItems', () => {
    it('should return error when Letta is not enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(false);

      const result = await SpacedRepetitionSyncService.syncReviewItems(
        mockUserId,
        mockReviewItems,
        mockDeviceId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Letta not available');
      expect(result.syncedItems).toBe(0);
    });

    it('should sync items successfully when Letta is enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.syncLearnerProfile.mockResolvedValue(true);

      const result = await SpacedRepetitionSyncService.syncReviewItems(
        mockUserId,
        mockReviewItems,
        mockDeviceId
      );

      expect(result.success).toBe(true);
      expect(result.syncedItems).toBe(mockReviewItems.length);
      expect(mockLettaService.syncLearnerProfile).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      mockLettaService.syncLearnerProfile.mockRejectedValue(new Error('Sync failed'));

      const result = await SpacedRepetitionSyncService.syncReviewItems(
        mockUserId,
        mockReviewItems,
        mockDeviceId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync failed');
    });
  });

  describe('getReviewItems', () => {
    it('should return empty array when Letta is not enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(false);

      const result = await SpacedRepetitionSyncService.getReviewItems(mockUserId);

      expect(result).toEqual([]);
    });

    it('should return review items when Letta is enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);
      // Mock would return items from Letta memory

      const result = await SpacedRepetitionSyncService.getReviewItems(mockUserId);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getSyncStatus', () => {
    it('should return disabled status when Letta is not enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(false);

      const result = await SpacedRepetitionSyncService.getSyncStatus(mockUserId);

      expect(result.isEnabled).toBe(false);
      expect(result.lastSync).toBeNull();
      expect(result.itemCount).toBe(0);
    });

    it('should return enabled status when Letta is enabled', async () => {
      mockLettaService.isEnabled.mockReturnValue(true);

      const result = await SpacedRepetitionSyncService.getSyncStatus(mockUserId);

      expect(result.isEnabled).toBe(true);
    });
  });
});
