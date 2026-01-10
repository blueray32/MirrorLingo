import { renderHook, act } from '@testing-library/react';
import { useLettaSync } from '../useLettaSync';
import { IdiolectProfile, ToneLevel, FormalityLevel, PatternType, IntentCategory } from '../../types/phrases';

// Mock fetch
global.fetch = jest.fn();

const API_BASE_URL = '';

const mockProfile: IdiolectProfile = {
  userId: 'test-user',
  overallTone: ToneLevel.CASUAL,
  overallFormality: FormalityLevel.INFORMAL,
  commonPatterns: [
    { type: PatternType.FILLER_WORDS, description: 'Uses filler words', examples: ['you know'], frequency: 0.5 },
    { type: PatternType.CONTRACTIONS, description: 'Uses contractions', examples: ["can't", "won't"], frequency: 0.8 }
  ],
  preferredIntents: [IntentCategory.WORK],
  analysisCount: 5,
  lastUpdated: '2024-01-01T00:00:00Z'
};

describe('useLettaSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useLettaSync('test-user'));

    expect(result.current.isLettaEnabled).toBe(false);
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.lastSyncTime).toBe(null);
  });

  it('should check Letta status on mount', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ enabled: true })
    });

    const { result } = renderHook(() => useLettaSync('test-user'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/letta/status`);
    expect(result.current.isLettaEnabled).toBe(true);
  });

  it('should handle status check failure', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useLettaSync('test-user'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLettaEnabled).toBe(false);
  });

  it('should sync profile successfully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ enabled: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

    const { result } = renderHook(() => useLettaSync('test-user'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let syncResult: boolean;
    await act(async () => {
      syncResult = await result.current.syncProfile(mockProfile);
    });

    expect(syncResult!).toBe(true);
    expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/letta/sync-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'test-user' },
      body: JSON.stringify(mockProfile)
    });
  });

  it('should return false when syncing while disabled', async () => {
    const { result } = renderHook(() => useLettaSync('test-user'));

    let syncResult: boolean;
    await act(async () => {
      syncResult = await result.current.syncProfile(mockProfile);
    });

    expect(syncResult!).toBe(false);
  });

  it('should handle sync failure gracefully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ enabled: true })
      })
      .mockRejectedValueOnce(new Error('Sync failed'));

    const { result } = renderHook(() => useLettaSync('test-user'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let syncResult: boolean;
    await act(async () => {
      syncResult = await result.current.syncProfile(mockProfile);
    });

    expect(syncResult!).toBe(false);
    expect(result.current.isSyncing).toBe(false);
  });
});
