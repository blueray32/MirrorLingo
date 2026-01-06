import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpacedRepetitionSchedule, notificationService } from './notifications';

export interface OfflinePhraseData {
  id: string;
  phrase: string;
  transcript: string;
  audioPath?: string;
  analysis?: any;
  translations?: any;
  createdAt: Date;
  synced: boolean;
}

export interface OfflineProgress {
  phraseId: string;
  rating: 1 | 2 | 3 | 4; // Again, Hard, Good, Easy
  timestamp: Date;
  synced: boolean;
}

class OfflineService {
  private readonly PHRASES_KEY = 'offline_phrases';
  private readonly PROGRESS_KEY = 'offline_progress';
  private readonly SCHEDULE_KEY = 'spaced_repetition_schedule';
  private readonly SETTINGS_KEY = 'app_settings';

  // Phrase Management
  async savePhraseOffline(phraseData: OfflinePhraseData): Promise<void> {
    if (!phraseData.id || !phraseData.phrase) {
      console.error('Invalid phrase data: missing required fields');
      return;
    }
    try {
      const existing = await this.getOfflinePhrases();
      const updated = [...existing, { ...phraseData, createdAt: phraseData.createdAt || new Date() }];
      await AsyncStorage.setItem(this.PHRASES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save phrase offline:', error);
    }
  }

  async getOfflinePhrases(): Promise<OfflinePhraseData[]> {
    try {
      const data = await AsyncStorage.getItem(this.PHRASES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get offline phrases:', error);
      return [];
    }
  }

  async markPhraseSynced(phraseId: string): Promise<void> {
    try {
      const phrases = await this.getOfflinePhrases();
      const updated = phrases.map(p => 
        p.id === phraseId ? { ...p, synced: true } : p
      );
      await AsyncStorage.setItem(this.PHRASES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark phrase as synced:', error);
    }
  }

  // Progress Tracking
  async saveProgressOffline(progress: OfflineProgress): Promise<void> {
    try {
      const existing = await this.getOfflineProgress();
      const updated = [...existing, progress];
      await AsyncStorage.setItem(this.PROGRESS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save progress offline:', error);
    }
  }

  async getOfflineProgress(): Promise<OfflineProgress[]> {
    try {
      const data = await AsyncStorage.getItem(this.PROGRESS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get offline progress:', error);
      return [];
    }
  }

  // Spaced Repetition Scheduling
  async saveSchedule(schedules: SpacedRepetitionSchedule[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SCHEDULE_KEY, JSON.stringify(schedules));
      
      // Schedule notifications
      schedules.forEach(schedule => {
        if (new Date(schedule.nextReview) > new Date()) {
          notificationService.scheduleSpacedRepetition(schedule);
        }
      });
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  }

  async getSchedule(): Promise<SpacedRepetitionSchedule[]> {
    try {
      const data = await AsyncStorage.getItem(this.SCHEDULE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get schedule:', error);
      return [];
    }
  }

  async updateScheduleItem(phraseId: string, updates: Partial<SpacedRepetitionSchedule>): Promise<void> {
    try {
      const schedules = await this.getSchedule();
      const updated = schedules.map(s => 
        s.phraseId === phraseId ? { ...s, ...updates } : s
      );
      await this.saveSchedule(updated);
    } catch (error) {
      console.error('Failed to update schedule item:', error);
    }
  }

  // Settings Management
  async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async getSettings(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return data ? JSON.parse(data) : {
        dailyReminderEnabled: true,
        dailyReminderTime: { hour: 19, minute: 0 },
        notificationsEnabled: true,
      };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  }

  // Sync Management
  async getUnsyncedData(): Promise<{
    phrases: OfflinePhraseData[];
    progress: OfflineProgress[];
  }> {
    const phrases = await this.getOfflinePhrases();
    const progress = await this.getOfflineProgress();
    
    return {
      phrases: phrases.filter(p => !p.synced),
      progress: progress.filter(p => !p.synced),
    };
  }

  async markProgressSynced(timestamp: Date): Promise<void> {
    try {
      const progress = await this.getOfflineProgress();
      const targetTime = new Date(timestamp).getTime();
      const updated = progress.map(p => 
        new Date(p.timestamp).getTime() === targetTime ? { ...p, synced: true } : p
      );
      await AsyncStorage.setItem(this.PROGRESS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark progress as synced:', error);
    }
  }

  async clearSyncedData(): Promise<void> {
    try {
      const phrases = await this.getOfflinePhrases();
      const progress = await this.getOfflineProgress();
      
      const unsyncedPhrases = phrases.filter(p => !p.synced);
      const unsyncedProgress = progress.filter(p => !p.synced);
      
      await AsyncStorage.setItem(this.PHRASES_KEY, JSON.stringify(unsyncedPhrases));
      await AsyncStorage.setItem(this.PROGRESS_KEY, JSON.stringify(unsyncedProgress));
    } catch (error) {
      console.error('Failed to clear synced data:', error);
    }
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.PHRASES_KEY,
        this.PROGRESS_KEY,
        this.SCHEDULE_KEY,
        this.SETTINGS_KEY,
      ]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  async getStorageInfo(): Promise<{
    phrasesCount: number;
    progressCount: number;
    scheduleCount: number;
    unsyncedPhrases: number;
    unsyncedProgress: number;
  }> {
    const phrases = await this.getOfflinePhrases();
    const progress = await this.getOfflineProgress();
    const schedule = await this.getSchedule();
    
    return {
      phrasesCount: phrases.length,
      progressCount: progress.length,
      scheduleCount: schedule.length,
      unsyncedPhrases: phrases.filter(p => !p.synced).length,
      unsyncedProgress: progress.filter(p => !p.synced).length,
    };
  }
}

export const offlineService = new OfflineService();
