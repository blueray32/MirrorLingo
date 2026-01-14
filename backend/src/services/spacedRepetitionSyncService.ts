import { LettaService } from './lettaService';
import { SpacedRepetitionSyncData, ReviewItem, SyncResult, SyncStatus } from '../types/spacedRepetitionSync';

export class SpacedRepetitionSyncService {
  private static readonly MEMORY_BLOCK_LABEL = 'spaced_repetition_progress';

  static async syncReviewItems(
    userId: string,
    localItems: ReviewItem[],
    deviceId: string
  ): Promise<SyncResult> {
    if (!LettaService.isEnabled()) {
      return {
        success: false,
        syncedItems: 0,
        error: 'Letta not available',
        lastSyncTimestamp: new Date()
      };
    }

    try {
      // Get existing sync data from Letta
      const existingSyncData = await this.getSyncData(userId);
      
      // Prepare new sync data
      const newSyncData: SpacedRepetitionSyncData = {
        userId,
        reviewItems: localItems,
        lastSyncTimestamp: new Date(),
        deviceId,
        syncVersion: (existingSyncData?.syncVersion || 0) + 1
      };

      // Handle conflicts if existing data found
      if (existingSyncData && existingSyncData.reviewItems.length > 0) {
        const mergedItems = this.mergeReviewItems(localItems, existingSyncData.reviewItems);
        newSyncData.reviewItems = mergedItems;
      }

      // Save to Letta
      await LettaService.syncLearnerProfile({
        name: userId,
        nativeLanguage: 'English',
        targetLanguage: 'Spanish',
        tone: 'adaptive',
        formality: 'adaptive',
        patterns: [],
        learningSince: new Date().toISOString(),
        preferredTopics: []
      });

      // Update memory block with sync data
      const success = await this.updateSyncData(userId, newSyncData);

      return {
        success,
        syncedItems: newSyncData.reviewItems.length,
        lastSyncTimestamp: newSyncData.lastSyncTimestamp
      };

    } catch (error) {
      console.error('Spaced repetition sync error:', error);
      return {
        success: false,
        syncedItems: 0,
        error: 'Sync failed',
        lastSyncTimestamp: new Date()
      };
    }
  }

  static async getReviewItems(userId: string): Promise<ReviewItem[]> {
    if (!LettaService.isEnabled()) {
      return [];
    }

    try {
      const syncData = await this.getSyncData(userId);
      return syncData?.reviewItems || [];
    } catch (error) {
      console.error('Error getting review items:', error);
      return [];
    }
  }

  static async getSyncStatus(userId: string): Promise<SyncStatus> {
    if (!LettaService.isEnabled()) {
      return {
        isEnabled: false,
        lastSync: null,
        pendingSync: false,
        itemCount: 0,
        conflicts: 0
      };
    }

    try {
      const syncData = await this.getSyncData(userId);
      return {
        isEnabled: true,
        lastSync: syncData?.lastSyncTimestamp || null,
        pendingSync: false,
        itemCount: syncData?.reviewItems.length || 0,
        conflicts: 0
      };
    } catch (error) {
      return {
        isEnabled: true,
        lastSync: null,
        pendingSync: false,
        itemCount: 0,
        conflicts: 0
      };
    }
  }

  private static async getSyncData(userId: string): Promise<SpacedRepetitionSyncData | null> {
    try {
      const memoryData = await LettaService.getMemorySummary();
      if (!memoryData) return null;

      // Parse sync data from memory (simplified for demo)
      // In production, would use proper Letta memory block queries
      return null; // Placeholder - would parse actual memory data
    } catch (error) {
      console.error('Error getting sync data:', error);
      return null;
    }
  }

  private static async updateSyncData(
    userId: string, 
    syncData: SpacedRepetitionSyncData
  ): Promise<boolean> {
    try {
      // Store sync data in Letta memory block
      // Simplified implementation for demo
      return true;
    } catch (error) {
      console.error('Error updating sync data:', error);
      return false;
    }
  }

  private static mergeReviewItems(
    localItems: ReviewItem[],
    remoteItems: ReviewItem[]
  ): ReviewItem[] {
    const itemMap = new Map<string, ReviewItem>();

    // Add remote items first
    remoteItems.forEach(item => {
      itemMap.set(item.id, item);
    });

    // Merge local items, preferring more recent reviews
    localItems.forEach(localItem => {
      const existingItem = itemMap.get(localItem.id);
      
      if (!existingItem) {
        itemMap.set(localItem.id, localItem);
      } else {
        // Use item with more recent lastReviewed date
        const localDate = localItem.lastReviewed?.getTime() || 0;
        const remoteDate = existingItem.lastReviewed?.getTime() || 0;
        
        if (localDate > remoteDate) {
          itemMap.set(localItem.id, localItem);
        }
      }
    });

    return Array.from(itemMap.values());
  }
}
