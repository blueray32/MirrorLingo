import { useState, useEffect, useCallback } from 'react';
import { ReviewItem } from '../utils/spacedRepetition';

interface SyncResult {
  success: boolean;
  syncedItems: number;
  error?: string;
  lastSyncTimestamp: Date;
}

interface SyncStatus {
  isEnabled: boolean;
  lastSync: Date | null;
  pendingSync: boolean;
  itemCount: number;
  conflicts: number;
}

interface UseSpacedRepetitionSyncReturn {
  isEnabled: boolean;
  isSyncing: boolean;
  syncStatus: SyncStatus | null;
  lastSyncTime: Date | null;
  syncReviewItems: (items: ReviewItem[]) => Promise<SyncResult>;
  getReviewItems: () => Promise<ReviewItem[]>;
  refreshStatus: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const STORAGE_KEY = 'spaced_repetition_items';

export const useSpacedRepetitionSync = (userId: string): UseSpacedRepetitionSyncReturn => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Check sync availability on mount
  useEffect(() => {
    const checkSyncStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/letta/status`);
        if (response.ok) {
          const data = await response.json();
          setIsEnabled(data.enabled);
          
          if (data.enabled) {
            await refreshStatus();
          }
        }
      } catch {
        setIsEnabled(false);
      }
    };
    checkSyncStatus();
  }, [userId]);

  const refreshStatus = useCallback(async (): Promise<void> => {
    if (!isEnabled) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/letta/get-spaced-repetition`, {
        headers: { 'x-user-id': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data.syncStatus);
        setLastSyncTime(data.syncStatus.lastSync ? new Date(data.syncStatus.lastSync) : null);
      }
    } catch (error) {
      console.error('Failed to refresh sync status:', error);
    }
  }, [isEnabled, userId]);

  const syncReviewItems = useCallback(async (items: ReviewItem[]): Promise<SyncResult> => {
    if (!isEnabled) {
      // Fallback to localStorage
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(items));
      return {
        success: false,
        syncedItems: items.length,
        error: 'Sync not available',
        lastSyncTimestamp: new Date()
      };
    }

    setIsSyncing(true);
    try {
      const deviceId = getDeviceId();
      const response = await fetch(`${API_BASE_URL}/api/letta/sync-spaced-repetition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ reviewItems: items, deviceId })
      });

      if (response.ok) {
        const result: SyncResult = await response.json();
        setLastSyncTime(result.lastSyncTimestamp);
        
        // Also save to localStorage as backup
        localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(items));
        
        await refreshStatus();
        return result;
      } else {
        throw new Error('Sync request failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      
      // Fallback to localStorage
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(items));
      
      return {
        success: false,
        syncedItems: items.length,
        error: 'Sync failed, saved locally',
        lastSyncTimestamp: new Date()
      };
    } finally {
      setIsSyncing(false);
    }
  }, [isEnabled, userId, refreshStatus]);

  const getReviewItems = useCallback(async (): Promise<ReviewItem[]> => {
    if (!isEnabled) {
      // Fallback to localStorage
      const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
      if (stored) {
        const items = JSON.parse(stored);
        // Parse dates properly
        return items.map((item: any) => ({
          ...item,
          nextReview: new Date(item.nextReview),
          createdAt: new Date(item.createdAt),
          lastReviewed: item.lastReviewed ? new Date(item.lastReviewed) : null
        }));
      }
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/letta/get-spaced-repetition`, {
        headers: { 'x-user-id': userId }
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.reviewItems || [];
        
        // Parse dates properly
        const parsedItems = items.map((item: any) => ({
          ...item,
          nextReview: new Date(item.nextReview),
          createdAt: new Date(item.createdAt),
          lastReviewed: item.lastReviewed ? new Date(item.lastReviewed) : null
        }));

        // Also cache in localStorage
        localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(parsedItems));
        
        return parsedItems;
      } else {
        throw new Error('Failed to get review items');
      }
    } catch (error) {
      console.error('Failed to get review items:', error);
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
      if (stored) {
        const items = JSON.parse(stored);
        return items.map((item: any) => ({
          ...item,
          nextReview: new Date(item.nextReview),
          createdAt: new Date(item.createdAt),
          lastReviewed: item.lastReviewed ? new Date(item.lastReviewed) : null
        }));
      }
      return [];
    }
  }, [isEnabled, userId]);

  return {
    isEnabled,
    isSyncing,
    syncStatus,
    lastSyncTime,
    syncReviewItems,
    getReviewItems,
    refreshStatus
  };
};

function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}
