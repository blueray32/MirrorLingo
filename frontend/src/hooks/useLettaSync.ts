import { useState, useEffect, useCallback } from 'react';
import { IdiolectProfile } from '../types/phrases';

interface UseLettaSyncReturn {
  isLettaEnabled: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncProfile: (profile: IdiolectProfile) => Promise<boolean>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const useLettaSync = (userId: string): UseLettaSyncReturn => {
  const [isLettaEnabled, setIsLettaEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Check Letta availability on mount
  useEffect(() => {
    const checkLetta = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/letta/status`);
        if (response.ok) {
          const data = await response.json();
          setIsLettaEnabled(data.enabled);
        }
      } catch {
        setIsLettaEnabled(false);
      }
    };
    checkLetta();
  }, []);

  const syncProfile = useCallback(async (profile: IdiolectProfile): Promise<boolean> => {
    if (!isLettaEnabled) return false;

    setIsSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/letta/sync-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setLastSyncTime(new Date());
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isLettaEnabled, userId]);

  return { isLettaEnabled, isSyncing, lastSyncTime, syncProfile };
};
