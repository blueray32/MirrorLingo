import { mirrorLingoAPI } from '../services/api';
import { offlineService } from '../services/offline';
import { notificationService } from '../services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock push notifications
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  createChannel: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelLocalNotification: jest.fn(),
  requestPermissions: jest.fn(),
  checkPermissions: jest.fn(),
}));

describe('Mobile App Code Review Fixes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User ID Generation', () => {
    it('generates unique user ID on first launch', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Create new API instance to trigger user ID generation
      const api = new (mirrorLingoAPI.constructor as any)();
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_id',
        expect.stringMatching(/^mobile-[a-z0-9]+$/)
      );
    });

    it('reuses existing user ID', async () => {
      const existingId = 'mobile-existing-123';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(existingId);

      const api = new (mirrorLingoAPI.constructor as any)();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Date Handling', () => {
    it('handles JSON-parsed dates correctly in markProgressSynced', async () => {
      const mockProgress = [
        { timestamp: '2026-01-08T15:00:00.000Z', synced: false },
        { timestamp: '2026-01-08T16:00:00.000Z', synced: false }
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockProgress));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const targetDate = new Date('2026-01-08T15:00:00.000Z');
      await offlineService.markProgressSynced(targetDate);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'offline_progress',
        expect.stringContaining('"synced":true')
      );
    });
  });

  describe('Notification ID Handling', () => {
    it('converts string phrase IDs to numeric notification IDs', () => {
      const schedule = {
        phraseId: 'phrase-uuid-123',
        phrase: 'Test phrase',
        nextReview: new Date(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0
      };

      notificationService.scheduleSpacedRepetition(schedule);

      // Should not throw error and should call with numeric ID
      expect(require('react-native-push-notification').localNotificationSchedule)
        .toHaveBeenCalledWith(expect.objectContaining({
          id: expect.any(Number)
        }));
    });
  });

  describe('Data Validation', () => {
    it('validates required fields in savePhraseOffline', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Test missing required fields
      await offlineService.savePhraseOffline({ id: '', phrase: 'test' } as any);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid phrase data: missing required fields'
      );
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
